/** Exact pinned MIT GENEX SDK bootstrap integration fixture. No installed GENEX app implied. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {fork} from 'node:child_process';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
const root=fileURLToPath(new URL('../',import.meta.url));
const sdk=join(root,'tests/vendor/genex-backend-sdk.mjs');
test('Bundled SDK bootstrap and MIT license match pinned GENEX Git blobs',async()=>{
  const check=async(file,sha)=>{const b=await readFile(join(root,file));const got=createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex');assert.equal(got,sha);};
  await check('tests/vendor/genex-backend-sdk.mjs','9e9c2d50f8983a6ad02058df10b7457a54dd718b');
  await check('tests/vendor/LICENSE.genex-sdk','922f731f8c3177717b545613d87a02e5204d5ba0');
});
function launch(slug,settings={},projectFiles={}) {
 const path=join(root,'plugins',slug,'backend.mjs');
 const proc=fork(sdk,[path],{stdio:['ignore','pipe','pipe','ipc'],execArgv:[]});
 const waiting=new Map();let next=1;let readyResolve,readyReject;
 const ready=new Promise((resolve,reject)=>{readyResolve=resolve;readyReject=reject;});
 proc.on('message',m=>{
   if(m.kind==='ready'){readyResolve();return;}
   if(m.kind==='host'){
     if(m.method==='settings.read')proc.send({kind:'host-result',id:m.id,result:settings});
     else if(m.method==='project.read')proc.send(Object.hasOwn(projectFiles,m.args.path)
       ? {kind:'host-result',id:m.id,result:projectFiles[m.args.path]}
       : {kind:'host-result',id:m.id,error:'ENOENT: project file does not exist'});
     else proc.send({kind:'host-result',id:m.id,error:'Host service not permitted in SDK smoke test: '+m.method});
   }
   if(m.kind==='result'){
     const p=waiting.get(m.id);if(p){clearTimeout(p.timeout);waiting.delete(m.id);m.error?p.reject(new Error(m.error)):p.resolve(m.result)}
   }
 });
 proc.on('error',readyReject);
 proc.on('exit',code=>{for(const p of waiting.values()){clearTimeout(p.timeout);p.reject(new Error('GENEX SDK bootstrap exited early: '+code))}waiting.clear()});
 const ask=async(method,name,args={})=>{
   await ready;const id=next++;
   return new Promise((resolve,reject)=>{
     const timeout=setTimeout(()=>{waiting.delete(id);reject(new Error('GENEX SDK bootstrap timeout'))},3000);
     waiting.set(id,{timeout,resolve,reject});proc.send({kind:'call',id,method,name,args,context:{project:'fixture',directory:'/tmp/disposable-genex-game'}});
   });
 };
 const close=async()=>{
   for(const p of waiting.values())clearTimeout(p.timeout);
   proc.kill('SIGTERM');await new Promise(resolve=>{if(proc.exitCode!==null)resolve();else {const timer=setTimeout(()=>{proc.kill('SIGKILL');resolve()},1800);proc.once('exit',()=>{clearTimeout(timer);resolve()})}});
 };
 return {ask,close};
}
for(const [slug,tool,arg] of [
 ['ink-narrative','inspect',{story:JSON.stringify({start:'entry',knots:[{id:'entry',paragraphs:['Hello world'],choices:[]}]})}],
 ['xstate-rulebook','inspect',{spec:JSON.stringify({id:'testMachine',initial:'idle',states:{idle:{on:{GO:'done'}},done:{type:'final'}}})}],
]){
 test('GENEX pinned SDK bootstrap dispatches '+slug+' tool and ping',async()=>{
  const host=launch(slug);
  try{assert.deepEqual(await host.ask('ping','',{}),{ready:true});const r=await host.ask('tool',tool,arg);assert.equal(r.ok,true);}
  finally{await host.close()}
 });
}
const fake=String.raw`const rl=require('node:readline').createInterface({input:process.stdin});rl.on('line',s=>{const m=JSON.parse(s);if(m.id===undefined)return;const result=m.method==='initialize'?{protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:'fixture',version:'1'}}:m.method==='tools/list'?{tools:[{name:'browser_navigate'},{name:'browser_snapshot'},{name:'load_url'},{name:'capture_frame'}]}:{};process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:m.id,result})+'\n');});`;
for(const slug of ['playwright-game-tester','spector-frame-inspector']){
 test('GENEX pinned SDK dispatches '+slug+' confirmed QA action to proxy/MCP fixture',async()=>{
  const tmp=await mkdtemp(join(tmpdir(),'genex-sdk-smoke-'));
  const file=slug==='playwright-game-tester'?join(tmp,'playwright-mcp'):join(tmp,'mcp','dist','index.js');
  await mkdir(join(file,'..'),{recursive:true});await writeFile(file,fake);
  const sha=createHash('sha256').update(await readFile(file)).digest('hex');
  const host=launch(slug,{'upstream-path':file,'upstream-sha256':sha,'allowed-origin':'http://127.0.0.1:5173'});
  try{assert.deepEqual(await host.ask('ping','',{}),{ready:true});const r=await host.ask('action','probe',{});assert.equal(r.ready,true);assert.equal(r.handshake,true);assert.equal(r.negotiatedProtocol,'2025-06-18');}
  finally{await host.close();await rm(tmp,{recursive:true,force:true})}
 });
}

for(const [slug,field,sample] of [
 ['xstate-rulebook','spec',JSON.stringify({id:'game',initial:'wait',states:{wait:{on:{BEGIN:'active'}},active:{type:'final'}}})],
 ['ink-narrative','story',JSON.stringify({start:'entry',knots:[{id:'entry',paragraphs:['The first room.'],choices:[]}]})],
]){
 test('GENEX pinned SDK loads bound project JSON read-only via '+slug+' panel action',async()=>{
  const file='current-game.json';const host=launch(slug,{}, {[file]:sample});
  try{
   const loaded=await host.ask('action','load',{file});
   assert.equal(loaded[field],sample);
   assert.equal(loaded.file,file);
   const failure=host.ask('action','load',{file:'../private.json'});
   await assert.rejects(failure,/filename|root-level|directory/i);
  }finally{await host.close()}
 });
}

/** Opt-in mode must survive the pinned GENEX SDK dispatch -> probe -> MCP bridge -> upstream process. */
test('GENEX pinned SDK dispatches canvas-enabled Playwright probe across the full three-process path',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'genex-sdk-canvas-'));
 const file=join(dir,'node_modules','@playwright','mcp','cli.js');
 const upstream=String.raw`const rl=require('node:readline').createInterface({input:process.stdin});const vision=process.argv.includes('--caps=vision');rl.on('line',s=>{const m=JSON.parse(s);if(m.id===undefined)return;const base=['browser_navigate','browser_snapshot'];const names=base.concat(vision?['browser_mouse_move_xy','browser_mouse_click_xy','browser_mouse_drag_xy']:[]);const result=m.method==='initialize'?{protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:'fixture',version:'1'}}:m.method==='tools/list'?{tools:names.map(name=>({name}))}:{};process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:m.id,result})+'\n');});`;
 await mkdir(join(file,'..'),{recursive:true});await writeFile(file,upstream);
 const sha=createHash('sha256').update(upstream).digest('hex');
 const host=launch('playwright-game-tester',{'upstream-path':file,'upstream-sha256':sha,
   'allowed-origin':'http://127.0.0.1:5173','canvas-pointer-input':true});
 try{
   assert.deepEqual(await host.ask('ping','',{}),{ready:true});
   const result=await host.ask('action','probe',{});
   assert.equal(result.handshake,true);
   assert.equal(result.ready,true);
   assert.equal(result.canvasPointerRequested,true);
   assert.ok(result.exposedTools.includes('browser_mouse_drag_xy'));
 }finally{await host.close();await rm(dir,{recursive:true,force:true});}
});
