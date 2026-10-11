/** Playwright DOM + optional canvas-input functionality through the real MCP proxy and SDK probe. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';
import {mkdtemp, mkdir, writeFile, rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {activate} from '../plugins/playwright-game-tester/backend.mjs';

const CORE = ['browser_navigate','browser_snapshot','browser_hover','browser_drag','browser_find','browser_fill_form','browser_select_option'];
const POINTER = ['browser_mouse_move_xy','browser_mouse_click_xy','browser_mouse_drag_xy'];
const script = (missingPointer=false) => `const {createInterface}=require('node:readline');
const supportsVision=process.argv.includes('--caps=vision');
const available=${JSON.stringify(CORE)}.concat(supportsVision?${JSON.stringify(missingPointer?POINTER.slice(1):POINTER)}:[]);
const rl=createInterface({input:process.stdin});
rl.on('line',line=>{let m;try{m=JSON.parse(line)}catch{return}if(m.id===undefined)return;
 let result;if(m.method==='initialize')result={protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:'test',version:'1'}};
 else if(m.method==='tools/list')result={tools:available.map(name=>({name}))};
 else if(m.method==='tools/call')result={name:m.params.name,parameters:m.params.arguments||{},visionArg:supportsVision};
 else result={};
 process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:m.id,result})+'\\n');});\n`;
async function fakeEntry(missingPointer=false){
 const dir=await mkdtemp(join(tmpdir(),'genex-canvas-fixture-'));
 const file=join(dir,'node_modules','@playwright','mcp','cli.js');
 await mkdir(join(file,'..'),{recursive:true});const code=script(missingPointer);
 await writeFile(file,code,'utf8');return{dir,file,digest:createHash('sha256').update(code).digest('hex')};
}
async function proxySession(entry,enabled){
 const child=spawn(process.execPath,[new URL('../plugins/playwright-game-tester/proxy.mjs',import.meta.url).pathname],{
   env:{...process.env,GENEX_UPSTREAM_PATH:entry.file,GENEX_UPSTREAM_SHA256:entry.digest,
     GENEX_ALLOWED_ORIGIN:'http://127.0.0.1:5173',GENEX_CANVAS_POINTER_INPUT:String(enabled)},stdio:['pipe','pipe','pipe']
 });
 const pending=new Map();let id=0;const lines=createInterface({input:child.stdout});let stderr='';
 child.stderr.on('data',d=>stderr+=String(d).slice(0,2000));
 lines.on('line',line=>{let message;try{message=JSON.parse(line)}catch{return}
   const value=pending.get(message.id);if(value){pending.delete(message.id);value(message)}});
 function send(method,params={}){
   return new Promise((resolve,reject)=>{const request=++id;
     const timer=setTimeout(()=>{pending.delete(request);reject(new Error('Proxy request timed out: '+method+'; '+stderr))},3000);
     pending.set(request,message=>{clearTimeout(timer);resolve(message)});
     child.stdin.write(JSON.stringify({jsonrpc:'2.0',id:request,method,params})+'\n');});
 }
 const close=async()=>{child.kill('SIGTERM');await Promise.race([new Promise(r=>child.once('close',r)),new Promise(r=>setTimeout(r,1400))]);lines.close()};
 return{send,close};
}

test('Playwright proxy exposes reviewed core DOM tools but not unsafe browser evaluation or WebMCP',async()=>{
 const entry=await fakeEntry(),p=await proxySession(entry,false);
 try{
   assert.ok((await p.send('initialize')).result);
   const list=(await p.send('tools/list')).result.tools.map(t=>t.name);
   for(const name of CORE)assert.ok(list.includes(name),name+' missing');
   for(const name of POINTER)assert.ok(!list.includes(name),name+' should remain opt-in');
   assert.ok(!list.includes('browser_evaluate'));
   const hovered=await p.send('tools/call',{name:'browser_hover',arguments:{target:'button-1'}});
   assert.equal(hovered.result.name,'browser_hover');
   const drag=await p.send('tools/call',{name:'browser_drag',arguments:{startTarget:'start',endTarget:'finish'}});
   assert.equal(drag.result.name,'browser_drag');
   assert.match((await p.send('tools/call',{name:'browser_mouse_move_xy',arguments:{x:10,y:20}})).error.message,/not permitted/i);
   assert.match((await p.send('tools/call',{name:'browser_evaluate',arguments:{function:'() => 1'}})).error.message,/not permitted/i);
 }finally{await p.close();await rm(entry.dir,{recursive:true,force:true});}
});

test('opt-in canvas mode requests upstream vision tools and forwards page pointer gestures',async()=>{
 const entry=await fakeEntry(),p=await proxySession(entry,true);
 try{
   assert.ok((await p.send('initialize')).result);
   const names=(await p.send('tools/list')).result.tools.map(t=>t.name);
   for(const name of POINTER)assert.ok(names.includes(name),name+' missing');
   for(const name of POINTER){
     const r=await p.send('tools/call',{name,arguments:{x:52,y:91}});
     assert.equal(r.result.name,name);assert.equal(r.result.visionArg,true);
   }
   assert.match((await p.send('tools/call',{name:'browser_navigate',arguments:{url:'https://example.org/'}})).error.message,/configured game origin/i);
 }finally{await p.close();await rm(entry.dir,{recursive:true,force:true});}
});

test('GENEX manifest exposes optional canvas setting and enough host tool-policy slots',async()=>{
 const {readFile}=await import('node:fs/promises');const file=new URL('../plugins/playwright-game-tester/plugin.json',import.meta.url);
 const m=JSON.parse(await readFile(file,'utf8'));const setting=m.settings.find(s=>s.key==='canvas-pointer-input');
 assert.ok(setting);assert.equal(setting.type,'boolean');assert.equal(setting.default,false);
 const srv=m.mcpServers[0];assert.equal(srv.env.GENEX_CANVAS_POINTER_INPUT,'setting:canvas-pointer-input');
 for(const name of CORE.concat(POINTER))assert.ok(srv.toolPolicy.allow.includes(name),'GENEX host policy omits '+name);
 assert.ok(srv.maxTools>=srv.toolPolicy.allow.length,'GENEX cap should cover every reviewed tool');
});

test('handshake readiness requires coordinate tools only if optional canvas mode is enabled',async()=>{
 const api=await activate();
 for(const [enabled,missing,expected] of [[false,false,true],[true,false,true],[true,true,false]]){
   const entry=await fakeEntry(missing);
   try{
     const ctx={signal:new AbortController().signal,host:async(name)=>{
       assert.equal(name,'settings.read');return{'upstream-path':entry.file,'upstream-sha256':entry.digest,
         'allowed-origin':'http://127.0.0.1:5173','canvas-pointer-input':enabled};}};
     const result=await api.tool('probe',{},ctx);
     assert.equal(result.handshake,true);
     assert.equal(result.ready,expected,'enabled '+enabled+', upstream missing '+missing);
     if(enabled&&missing)assert.ok(result.missingTools.includes('browser_mouse_move_xy'));
   }finally{await rm(entry.dir,{recursive:true,force:true});}
 }
});
