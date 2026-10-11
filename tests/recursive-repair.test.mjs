import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, readFile, rm, access} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawn, execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createInterface} from 'node:readline';
import {activate as xstate} from '../plugins/xstate-rulebook/backend.mjs';
import {activate as playwright} from '../plugins/playwright-game-tester/backend.mjs';
import {activate as spector} from '../plugins/spector-frame-inspector/backend.mjs';

const spec=JSON.stringify({id:'game',initial:'start',states:{start:{on:{GO:'end'}},end:{type:'final'}}});
function game(){const files=new Map();return {files,ctx:{project:'game',directory:'/tmp/game',async host(method,arg){if(method==='project.read'){if(!files.has(arg.path))throw new Error('ENOENT: '+arg.path);return files.get(arg.path);}if(method==='project.write'){files.set(arg.path,arg.text);return {file:arg.path};}throw new Error('Unexpected '+method);}}};}

test('XState emits parseable exports for every slug allowed by the manifest, including repeated and trailing dashes',async()=>{
 const api=await xstate(); const g=game();const temp=await mkdtemp(join(tmpdir(),'genex-recursive-x-'));
 try {for(const slug of ['a-b','a--b','a-','a---']){
  const result=await api.tool('emit',{spec,slug},g.ctx);
  const file=join(temp,result.path);await writeFile(file,g.files.get(result.path));
  assert.equal(execFileSync(process.execPath,['--check',file],{encoding:'utf8'}),'');
 }} finally {await rm(temp,{recursive:true,force:true})}
});

async function withUpstream(mode,source,fn){
 const dir=await mkdtemp(join(tmpdir(),'genex-recursive-mcp-'));
 const path=mode==='playwright'?join(dir,'playwright-mcp'):join(dir,'mcp','dist','index.js');
 await mkdir(join(path,'..'),{recursive:true});await writeFile(path,source);
 const digest=createHash('sha256').update(await readFile(path)).digest('hex');
 try {return await fn({path,digest,dir});} finally {await rm(dir,{recursive:true,force:true})}
}
const mockProtocol=(version)=>String.raw`const rl=require('node:readline').createInterface({input:process.stdin});rl.on('line',s=>{const m=JSON.parse(s);if(m.id===undefined)return;let result={};if(m.method==='initialize')result={protocolVersion:VERSION,capabilities:{tools:{}},serverInfo:{name:'fixture',version:'1'}};else if(m.method==='tools/list')result={tools:[{name:'browser_navigate'},{name:'browser_snapshot'},{name:'load_url'},{name:'capture_frame'}]};process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:m.id,result})+'\n');});`.replace('VERSION',JSON.stringify(version));
for (const [mode,activate,required] of [['playwright',playwright,'browser_snapshot'],['spector',spector,'capture_frame']]) {
 test(`${mode} probe accepts known compatible legacy MCP 2025-11-25 response`,async()=>{
  await withUpstream(mode,mockProtocol('2025-11-25'),async({path,digest})=>{
   const ctx={signal:new AbortController().signal,host:async method=>{assert.equal(method,'settings.read');return {'upstream-path':path,'upstream-sha256':digest,'allowed-origin':'http://127.0.0.1:5173'}}};
   const api=await activate();const result=await api.tool('probe',{},ctx);
   assert.equal(result.ready,true); assert.equal(result.negotiatedProtocol,'2025-11-25');assert.ok(result.exposedTools.includes(required));
  });
 });
 test(`${mode} bridge never forwards tools/call as notification without a request ID`,async()=>{
  await withUpstream(mode,`const fs=require('node:fs');const rl=require('node:readline').createInterface({input:process.stdin});rl.on('line',s=>{const m=JSON.parse(s);if(m.method==='tools/call')fs.writeFileSync(${JSON.stringify('MARKER')},'called');if(m.id!==undefined)process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:m.id,result:{}})+'\\n');});`,async({path,digest,dir})=>{
   const marker=join(dir,'marked');const source=(await readFile(path,'utf8')).replace('MARKER',marker);
   await writeFile(path,source);const hash=createHash('sha256').update(source).digest('hex');
   const proxy=new URL(`../plugins/${mode==='playwright'?'playwright-game-tester':'spector-frame-inspector'}/proxy.mjs`,import.meta.url);
   const child=spawn(process.execPath,[proxy.pathname],{stdio:['pipe','pipe','pipe'],env:{...process.env,GENEX_UPSTREAM_PATH:path,GENEX_UPSTREAM_SHA256:hash,GENEX_ALLOWED_ORIGIN:'http://127.0.0.1:5173'}});
   let stderr='';child.stderr.on('data',b=>{stderr+=b});child.stdout.resume();
   try {
    child.stdin.write(JSON.stringify({jsonrpc:'2.0',method:'tools/call',params:{name:mode==='playwright'?'browser_navigate':'load_url',arguments:{url:'http://127.0.0.1:5173/'}}})+'\n');
    await new Promise(r=>setTimeout(r,210));
    let called=false;try{await access(marker);called=true;}catch{}
    assert.equal(called,false,'Bridge forwarded unaccounted tools/call notification: '+stderr);
   }finally{child.kill('SIGTERM');await new Promise(r=>{let t=setTimeout(r,500);child.once('close',()=>{clearTimeout(t);r()})})}
  });
 });
}

// MCP tools/list is paginated; a valid tool set need not arrive on the first page.
const mockPaged=String.raw`const rl=require('node:readline').createInterface({input:process.stdin});rl.on('line',s=>{const m=JSON.parse(s);if(m.id===undefined)return;let result;if(m.method==='initialize')result={protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:'paged',version:'1'}};else if(m.method==='tools/list')result=m.params?.cursor==='page2'?{tools:[{name:'browser_snapshot'},{name:'capture_frame'}]}:{tools:[{name:'browser_navigate'},{name:'load_url'}],nextCursor:'page2'};else result={};process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:m.id,result})+'\n');});`;
for (const [mode,activate] of [['playwright',playwright],['spector',spector]]) {
 test(`${mode} probe discovers essential tools across paginated tools/list`,async()=>{
  await withUpstream(mode,mockPaged,async({path,digest})=>{
   const ctx={signal:new AbortController().signal,host:async()=>({'upstream-path':path,'upstream-sha256':digest,'allowed-origin':'http://127.0.0.1:5173'})};
   const result=await (await activate()).tool('probe',{},ctx);
   assert.equal(result.ready,true);assert.equal(result.exposedCount,2);
  });
 });
}

const loopingPages=String.raw`const rl=require('node:readline').createInterface({input:process.stdin});rl.on('line',s=>{const m=JSON.parse(s);if(m.id===undefined)return;const result=m.method==='initialize'?{protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:'loop',version:'1'}}:{tools:[],nextCursor:'repeat'};process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:m.id,result})+'\n');});`;
for (const [mode,activate] of [['playwright',playwright],['spector',spector]]) {
 test(`${mode} bounded MCP tools/list pagination refuses repeated cursors`,async()=>{
  await withUpstream(mode,loopingPages,async({path,digest})=>{
   const ctx={signal:new AbortController().signal,host:async()=>({'upstream-path':path,'upstream-sha256':digest,'allowed-origin':'http://127.0.0.1:5173'})};
   await assert.rejects((await activate()).tool('probe',{},ctx),/pagination|looping/i);
  });
 });
 test(`${mode} relays all requests after slow upstream starts consuming its pipe`,async()=>{
  const delayed=String.raw`setTimeout(()=>{const rl=require('node:readline').createInterface({input:process.stdin});rl.on('line',s=>{const m=JSON.parse(s);if(m.id===undefined)return;process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:m.id,result:{received:m.params?.arguments?.payload?.length||0}})+'\n');});},320);`;
  await withUpstream(mode,delayed,async({path,digest})=>{
   const proxy=new URL(`../plugins/${mode==='playwright'?'playwright-game-tester':'spector-frame-inspector'}/proxy.mjs`,import.meta.url);
   const child=spawn(process.execPath,[proxy.pathname],{stdio:['pipe','pipe','pipe'],env:{...process.env,GENEX_UPSTREAM_PATH:path,GENEX_UPSTREAM_SHA256:digest,GENEX_ALLOWED_ORIGIN:'http://127.0.0.1:5173'}});
   let stderr='';child.stderr.on('data',d=>stderr+=String(d));
   const messages=new Map(),rl=createInterface({input:child.stdout});rl.on('line',s=>{try{const m=JSON.parse(s);messages.set(m.id,m);}catch{}});
   try{
    const payload='A'.repeat(1024*1024);
    for(let i=1;i<=4;i++) child.stdin.write(JSON.stringify({jsonrpc:'2.0',id:i,method:'tools/call',params:{name:mode==='playwright'?'browser_type':'get_shaders',arguments:{payload}}})+'\n');
    const deadline=Date.now()+4500;
    while(messages.size!==4 && Date.now()<deadline) await new Promise(r=>setTimeout(r,40));
    assert.equal(messages.size,4,'Lost requests while consumer was stalled: '+stderr);
    for(let i=1;i<=4;i++) assert.equal(messages.get(i)?.result?.received,payload.length);
   }finally{rl.close();child.kill('SIGTERM');await new Promise(r=>{if(child.exitCode!==null)r();else{const timer=setTimeout(r,900);child.once('close',()=>{clearTimeout(timer);r()});}})}
  });
 });
}
