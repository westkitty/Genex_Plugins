import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdtemp, mkdir, writeFile, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createInterface} from 'node:readline';

const root=new URL('../plugins/',import.meta.url);
async function withBridge(mode, script, fn, setting={}) {
 const temp=await mkdtemp(join(tmpdir(),'genex-v040-'));
 const file=mode==='playwright'?join(temp,'playwright-mcp'):join(temp,'mcp','dist','index.js');
 await mkdir(join(file,'..'),{recursive:true});await writeFile(file,script);
 const digest=createHash('sha256').update(await readFile(file)).digest('hex');
 const sub=mode==='playwright'?'playwright-game-tester/':'spector-frame-inspector/';
 const bridge=new URL(sub+'proxy.mjs',root);
 const child=spawn(process.execPath,[bridge.pathname],{stdio:['pipe','pipe','pipe'],env:{...process.env,GENEX_UPSTREAM_PATH:file,GENEX_UPSTREAM_SHA256:digest,GENEX_ALLOWED_ORIGIN:setting.allowedOrigin||'http://127.0.0.1:5173'}});
 const pending=new Map();let seq=0,stderr='';
 child.stderr.on('data',buf=>{stderr+=buf.toString()});
 const rl=createInterface({input:child.stdout});
 rl.on('line',line=>{let m;try{m=JSON.parse(line)}catch{return;}const p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timer);p.resolve(m)}});
 const send=(method,params={},timeoutMs=800)=>new Promise((resolve,reject)=>{
  const id=++seq;const timer=setTimeout(()=>{pending.delete(id);reject(new Error('Missing response for '+method+'; '+stderr.slice(-600)))},timeoutMs);
  pending.set(id,{timer,resolve});child.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');
 });
 try{await fn({send,child,file,digest});}finally{child.kill('SIGTERM');await new Promise(resolve=>{if(child.exitCode!==null)resolve();else{const timer=setTimeout(resolve,800);child.once('close',()=>{clearTimeout(timer);resolve()})}});for(const v of pending.values())clearTimeout(v.timer);rl.close();await rm(temp,{recursive:true,force:true});}
}
const fake = String.raw`const rl=require('node:readline').createInterface({input:process.stdin});rl.on('line',s=>{const m=JSON.parse(s);if(m.id===undefined)return;let result;if(m.method==='initialize')result={protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:'fake',version:'1'}};else if(m.method==='tools/list')result={tools:[{name:'browser_navigate'},{name:'load_url'}]};else if(m.method==='tools/call')result={called:m.params.name,url:m.params.arguments?.url};else result={};process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:m.id,result})+'\n');});`;
for(const mode of ['playwright','spector']){
 test(mode+' locks direct navigation to a configured game origin (not other local services)',async()=>{
  await withBridge(mode,fake,async({send})=>{
   await send('initialize');
   const name=mode==='playwright'?'browser_navigate':'load_url';
   const good=await send('tools/call',{name,arguments:{url:'http://127.0.0.1:5173/room'}});
   assert.equal(good.result?.called,name);
   for(const url of ['http://127.0.0.1:11435/api/tags','http://localhost:5173','http://127.0.0.1:8096/','https://127.0.0.1:5173/']){
    const denied=await send('tools/call',{name,arguments:{url}});
    assert.ok(denied.error?.message?.includes('configured game origin'),url);
   }
  });
 });
 test(mode+' returns an immediate correlated error when upstream dies mid-request',async()=>{
  const code=String.raw`const rl=require('node:readline').createInterface({input:process.stdin});rl.on('line',s=>{const m=JSON.parse(s);if(m.method==='tools/call')process.exit(19);if(m.id!==undefined)process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:m.id,result:{protocolVersion:'2025-06-18'}})+'\n')});`;
  await withBridge(mode,code,async({send})=>{
   await send('initialize');
   const name=mode==='playwright'?'browser_navigate':'load_url';
   const response=await send('tools/call',{name,arguments:{url:'http://127.0.0.1:5173/'}},900);
   assert.ok(response.error?.message?.includes('upstream exited'),JSON.stringify(response));
  });
 });
 test(mode+' exposes a confirmation-gated QA action and toolbar',async()=>{
  const path=new URL(`../plugins/${mode==='playwright'?'playwright-game-tester':'spector-frame-inspector'}/plugin.json`,import.meta.url);
  const manifest=JSON.parse(await readFile(path));
  assert.ok(manifest.actions.some(x=>x.name==='probe' && x.confirmation), 'missing confirmation-gated action');
  assert.ok(manifest.toolbar.some(x=>x.target?.kind==='action'&&x.target?.name==='probe'), 'missing QA toolbar');
 });
}
for(const mode of ['playwright','spector']){
 test(mode+' probe rejects an unsupported negotiated protocol version',async()=>{
  const path=new URL(`../plugins/${mode==='playwright'?'playwright-game-tester':'spector-frame-inspector'}/backend.mjs`,import.meta.url);
  const {activate}=await import(path);const api=await activate();
  const bad=fake.replaceAll('2025-06-18','2099-01-01');
  const temp=await mkdtemp(join(tmpdir(),'genex-protocol-v040-'));
  try{const file=mode==='playwright'?join(temp,'playwright-mcp'):join(temp,'mcp','dist','index.js');await mkdir(join(file,'..'),{recursive:true});await writeFile(file,bad);
   const digest=createHash('sha256').update(await readFile(file)).digest('hex');
   const ctx={signal:new AbortController().signal,host:async()=>({'upstream-path':file,'upstream-sha256':digest,'allowed-origin':'http://127.0.0.1:5173'})};
   await assert.rejects(api.tool('probe',{},ctx),/unsupported|negotiat|protocol/i);
  }finally{await rm(temp,{recursive:true,force:true})}
 });
}
for(const mode of ['playwright','spector']){
 test(mode+' accepts a valid game origin pasted with trailing slash',async()=>{
  await withBridge(mode,fake,async({send})=>{
   assert.ok((await send('initialize')).result);
   const name=mode==='playwright'?'browser_navigate':'load_url';
   const result=await send('tools/call',{name,arguments:{url:'http://127.0.0.1:5173/station'}});
   assert.equal(result.result?.called,name,JSON.stringify(result));
  },{allowedOrigin:'http://127.0.0.1:5173/'});
 });
}
test('Playwright screenshot tool refuses output filename traversal while preserving ordinary PNGs',async()=>{
 await withBridge('playwright',fake,async({send})=>{
  await send('initialize');
  const denied=await send('tools/call',{name:'browser_take_screenshot',arguments:{filename:'../../other-project/secret.png'}});
  assert.match(denied.error?.message||'',/safe screenshot filename/i);
  const ok=await send('tools/call',{name:'browser_take_screenshot',arguments:{filename:'evidence-frame-01.png'}});
  assert.equal(ok.result?.called,'browser_take_screenshot');
 });
});
