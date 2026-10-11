import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { createInterface } from 'node:readline';
import { performance } from 'node:perf_hooks';
const root = resolve(process.argv[2] || '.');
const mode=process.argv[3] === 'spector' ? 'spector' : 'playwright';
const upstream=`const rl = require('node:readline').createInterface({input:process.stdin});
rl.on('line',line=>{let r=JSON.parse(line);if(r.id==null)return;const size=r.params?.arguments?.size||0;
const result=r.method==='tools/call'?{content:[{type:'text',text:'X'.repeat(size)}]}:{protocolVersion:'2025-06-18',capabilities:{tools:{}}};
process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:r.id,result})+'\\n');});`;
const td=await mkdtemp(join(tmpdir(),'genex-perf-'));
const file=mode==='spector' ? join(td,'mcp','dist','index.js') : join(td,'playwright-mcp');
await mkdir(join(file,'..'),{recursive:true}); await writeFile(file,upstream);
const digest=createHash('sha256').update(await readFile(file)).digest('hex');
const proxy=join(root,mode==='spector'?'plugins/spector-frame-inspector/proxy.mjs':'plugins/playwright-game-tester/proxy.mjs');
const outcomes={node:process.version,platform:process.platform,root,mode,measurements:{}};
async function runScenario(name,size,count){
 const child=spawn(process.execPath,[proxy],{stdio:['pipe','pipe','pipe'],env:{...process.env,GENEX_UPSTREAM_PATH:file,GENEX_UPSTREAM_SHA256:digest,GENEX_ALLOWED_ORIGIN:'http://127.0.0.1:5173'}});
 let sequence=0, stderr='',peakRss=0;
 child.stderr.on('data',d=>stderr+=String(d).slice(-3000));
 const waiting=new Map(),lines=createInterface({input:child.stdout});
 lines.on('line',str=>{let message;try{message=JSON.parse(str)}catch{return;}const found=waiting.get(message.id);if(found){waiting.delete(message.id);found(message);}});
 function call(method,params={}){const id=++sequence;return new Promise((resolve,reject)=>{waiting.set(id,resolve);child.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');});}
 const tick=setInterval(async()=>{try {const text=await readFile(`/proc/${child.pid}/status`,'utf8');const m=text.match(/^VmRSS:\s+(\d+)/m);if(m)peakRss=Math.max(peakRss,Number(m[1])*1024);}catch{}},12);
 const start=performance.now();const init=await call('initialize');const initMs=performance.now()-start;
 if(!init.result)throw Error('initialize failure '+stderr);
 const durations=[];let bytes=0;
 try {
   for(let i=0;i<count;i++){
    const t=performance.now();
    const res=await call('tools/call',{name:mode==='spector'?'get_shaders':'browser_snapshot',arguments:{size}});
    if(!res.result)throw Error('call failure '+JSON.stringify(res).slice(0,500));
    bytes+=res.result.content[0].text.length;
    durations.push(performance.now()-t);
   }
 } finally {clearInterval(tick);lines.close();child.kill('SIGTERM'); await new Promise(resolve=>{if(child.exitCode!==null)resolve();else {child.once('close',resolve);setTimeout(resolve,1500).unref()}});}
 const sorted=durations.toSorted((a,b)=>a-b);
 return {payload_bytes:size,calls:count,bytes_forwarded:bytes,init_ms:+initMs.toFixed(2),median_ms:+sorted[Math.floor(count/2)].toFixed(2),p95_ms:+sorted[Math.floor(count*.95)].toFixed(2),total_call_ms:+durations.reduce((a,b)=>a+b,0).toFixed(2),peak_bridge_rss_bytes:peakRss};
}
try{
 outcomes.measurements['snapshot-256k']=await runScenario('snapshot-256k',256*1024,16);
 outcomes.measurements['snapshot-2m']=await runScenario('snapshot-2m',2*1024*1024,12);
 outcomes.measurements['snapshot-6m']=await runScenario('snapshot-6m',6*1024*1024,8);
 console.log(JSON.stringify(outcomes,null,2));
}finally{await rm(td,{recursive:true,force:true})}
