import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline';

const UPSTREAM=String.raw`
const rl=require('node:readline').createInterface({input:process.stdin});
rl.on('line',line=>{
  const m=JSON.parse(line);
  if(m.id===undefined)return;
  let result;
  if(m.method==='tools/list')result={tools:[{name:'browser_snapshot'},{name:'get_shaders'},{name:'browser_evaluate'},{name:'load_playground'}]};
  else if(m.method==='tools/call')result={content:[{type:'text',text:'🔥🐾🌌'+ 'Z'.repeat(m.params?.arguments?.size||0)}]};
  else result={protocolVersion:'2025-06-18',capabilities:{tools:{}}};
  process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:m.id,result})+'\n');
});`;

async function scenario(mode, callback){
  const directory=await mkdtemp(join(tmpdir(),'genex-performance-relay-'));
  const binary=mode==='playwright' ? join(directory,'playwright-mcp') : join(directory,'mcp','dist','index.js');
  await mkdir(join(binary,'..'),{recursive:true});await writeFile(binary,UPSTREAM);
  const digest=createHash('sha256').update(await readFile(binary)).digest('hex');
  const plugin=mode==='playwright'?'playwright-game-tester':'spector-frame-inspector';
  const proxy=new URL(`../plugins/${plugin}/proxy.mjs`,import.meta.url).pathname;
  const child=spawn(process.execPath,[proxy],{stdio:['pipe','pipe','pipe'],env:{...process.env,GENEX_UPSTREAM_PATH:binary,GENEX_UPSTREAM_SHA256:digest}});
  let stderr='';child.stderr.on('data',x=>stderr+=String(x));
  const rl=createInterface({input:child.stdout});
  let id=0;const waiting=new Map();
  rl.on('line',line=>{
    const msg=JSON.parse(line);const done=waiting.get(msg.id);
    if(done){waiting.delete(msg.id);done.resolve(msg)}
  });
  function call(method,params={}){
    const identifier=++id;
    return new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>{waiting.delete(identifier);reject(new Error(`Timed out (${method}): ${stderr.slice(-250)}`));},9000);
      waiting.set(identifier,{resolve:msg=>{clearTimeout(timeout);resolve(msg)}});
      child.stdin.write(JSON.stringify({jsonrpc:'2.0',id:identifier,method,params})+'\n');
    });
  }
  try{
    const initialized=await call('initialize');assert.ok(initialized.result);
    await callback({call,rl,child});
  }finally{
    for(const p of waiting.values())p.resolve({error:{message:'test closing'}});
    waiting.clear();rl.close();child.kill('SIGTERM');
    await new Promise(resolve=>{if(child.exitCode!==null)resolve();else{const timer=setTimeout(resolve,1200);child.once('close',()=>{clearTimeout(timer);resolve()})}});
    await rm(directory,{recursive:true,force:true});
  }
}
for(const mode of ['playwright','spector']){
  const nativeTool=mode==='playwright'?'browser_snapshot':'get_shaders';
  test(`${mode} relays a multi-MiB UTF-8 message with exact content`,async()=>scenario(mode,async({call})=>{
    const length=4*1024*1024;
    const reply=await call('tools/call',{name:nativeTool,arguments:{size:length}});
    assert.equal(reply.result.content[0].text,'🔥🐾🌌'+'Z'.repeat(length));
    const tools=await call('tools/list');
    assert.equal(tools.result.tools.some(t=>['browser_evaluate','load_playground'].includes(t.name)),false,
      'allowed-tool filtering must remain active');
  }));
  test(`${mode} resumes after slow-consumer backpressure without reply loss`,async()=>scenario(mode,async({call,rl})=>{
    // Pausing readline creates a real pipe backpressure boundary for the plugin process.
    rl.pause();
    const count=14, length=1024*1024;
    const pending=Array.from({length:count},()=>call('tools/call',{name:nativeTool,arguments:{size:length}}));
    await new Promise(resolve=>setTimeout(resolve,100));
    rl.resume();
    const replies=await Promise.all(pending);
    assert.equal(replies.length,count);
    for(const reply of replies)assert.equal(reply.result.content[0].text.length,length+'🔥🐾🌌'.length);
  }));
}
