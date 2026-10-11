/** Recursive repair: real process-lifecycle and protocol-edge evidence for both MCP bridges. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdtemp, mkdir, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createInterface} from 'node:readline';

const serverCode = String.raw`
const readline=require('node:readline');
const input=readline.createInterface({input:process.stdin});
// Deliberately stays running when stdin reaches EOF, like an upstream server
// retaining browser or WebGL resources after its MCP client disconnects.
setInterval(()=>{},1000);
input.on('line', line=>{
 let request;try{request=JSON.parse(line)}catch{return;}
 if(!Object.hasOwn(request,'id'))return;
 const reply={jsonrpc:'2.0',id:request.id,result:{pid:process.pid}};
 process.stdout.write(JSON.stringify(reply)+'\n');
});
`;
async function bridgeFixture(mode, operation, source=serverCode) {
 const dir=await mkdtemp(join(tmpdir(),'genex-lifecycle-'));
 const file=mode==='playwright'?join(dir,'playwright-mcp'):join(dir,'mcp','dist','index.js');
 const bridge=new URL(`../plugins/${mode==='playwright'?'playwright-game-tester':'spector-frame-inspector'}/proxy.mjs`, import.meta.url);
 await mkdir(join(file,'..'),{recursive:true});
 await writeFile(file,source);
 const digest=createHash('sha256').update(source).digest('hex');
 const child=spawn(process.execPath,[bridge.pathname],{stdio:['pipe','pipe','pipe'],env:{...process.env,
   GENEX_UPSTREAM_PATH:file,GENEX_UPSTREAM_SHA256:digest,GENEX_ALLOWED_ORIGIN:'http://127.0.0.1:5173'}});
 let stderr='';child.stderr.on('data',chunk=>{stderr+=String(chunk).slice(0,1500);});
 const lineReader=createInterface({input:child.stdout});
 const reply=new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(new Error('No upstream reply: '+stderr)),2000);
   lineReader.once('line',line=>{clearTimeout(timer);try{resolve(JSON.parse(line))}catch(e){reject(e)}});
 });
 const closed=new Promise(resolve=>child.once('close',(code,signal)=>resolve({code,signal})));
 try{await operation({child,reply,closed,stderr:()=>stderr});}
 finally{
   lineReader.close();
   if(child.exitCode===null){child.kill('SIGTERM');await Promise.race([closed,new Promise(r=>setTimeout(r,2300))]);}
   await rm(dir,{recursive:true,force:true});
 }
}
for(const mode of ['playwright','spector']) {
 test(`${mode} bridge releases native server and terminates when GENEX disconnects its input`,async()=>{
   await bridgeFixture(mode,async({child,reply,closed,stderr})=>{
     child.stdin.write(JSON.stringify({jsonrpc:'2.0',id:100,method:'ping',params:{}})+'\n');
     const answer=await reply;
     assert.equal(answer.id,100);
     const upstreamPid=answer.result?.pid;
     assert.ok(Number.isInteger(upstreamPid), 'Upstream did not identify its process');
     child.stdin.end();
     const outcome=await Promise.race([closed,new Promise(r=>setTimeout(()=>r('TIMEOUT'),1700))]);
     assert.notEqual(outcome,'TIMEOUT','Bridge retained upstream and did not exit after host disconnected: '+stderr());
     assert.equal(outcome.code,0,'Graceful client EOF should close bridge without an error exit status');
     // The nested upstream must not remain as a detached process after the bridge exits.
     await new Promise(r=>setTimeout(r,65));
     let live=true;try{process.kill(upstreamPid,0);}catch(e){if(e.code==='ESRCH')live=false;}
     assert.equal(live,false,'Orphan upstream remained after GENEX client disconnected');
   });
 });
}

const outputDiesCode = String.raw`
const readline=require('node:readline');
const input=readline.createInterface({input:process.stdin});
setInterval(()=>{},1000); // Native process remains alive when its stdout closes.
input.on('line',line=>{
 let req;try{req=JSON.parse(line)}catch{return;}
 if(!Object.hasOwn(req,'id'))return;
 if(req.method==='tools/call'){process.stdout.end();return;}
 process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:req.id,result:{ready:true}})+'\n');
});
`;
for(const mode of ['playwright','spector']) {
 test(`${mode} bridge rejects pending request promptly if live upstream closes MCP output`,async()=>{
   await bridgeFixture(mode,async({child,reply,closed,stderr})=>{
     const name=mode==='playwright'?'browser_snapshot':'get_shaders';
     child.stdin.write(JSON.stringify({jsonrpc:'2.0',id:201,method:'tools/call',params:{name,arguments:{}}})+'\n');
     const result=await reply;
     assert.equal(result.id,201);
     assert.match(result.error?.message||'',/output|stdout|upstream|closed|ended/i,
       'GENEX must receive a correlated error when upstream output closes');
     const outcome=await Promise.race([closed,new Promise(r=>setTimeout(()=>r('TIMEOUT'),1600))]);
     assert.notEqual(outcome,'TIMEOUT','Bridge retained upstream after its output pipe closed: '+stderr());
   },outputDiesCode);
 });
}

// Worst-case cleanup: real browser helpers may ignore SIGTERM while resources drain.
const ignoresTerm = serverCode.replace('setInterval(()=>{},1000);',
  "process.on('SIGTERM',()=>{});setInterval(()=>{},1000);");
for (const mode of ['playwright','spector']) {
 test(`${mode} disconnected client force-cleans an upstream that ignores SIGTERM`,async()=>{
   await bridgeFixture(mode,async({child,reply,closed})=>{
     child.stdin.write(JSON.stringify({jsonrpc:'2.0',id:301,method:'ping'})+'\n');
     const message=await reply;
     assert.equal(message.id,301);
     const pid=message.result.pid;
     child.stdin.end();
     const outcome=await Promise.race([closed,new Promise(r=>setTimeout(()=>r('TIMEOUT'),2900))]);
     assert.notEqual(outcome,'TIMEOUT','Bridge did not enforce SIGKILL fallback');
     assert.equal(outcome.code,0);
     let live=true;try{process.kill(pid,0);}catch(e){if(e.code==='ESRCH')live=false;}
     assert.equal(live,false,'SIGTERM-resistant native child was orphaned');
   },ignoresTerm);
 });
}
