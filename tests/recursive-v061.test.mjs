import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdtemp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createInterface} from 'node:readline';

const BIG_REPLY = String.raw`const rl=require('node:readline').createInterface({input:process.stdin});rl.on('line',line=>{const m=JSON.parse(line);if(m.id===undefined)return;const result=m.method==='tools/call'?{data:'X'.repeat(20*1024*1024+256)}:{protocolVersion:'2025-06-18'};process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:m.id,result})+'\n');});`;
async function withBridge(mode,source,run){
 const d=await mkdtemp(join(tmpdir(),'genex-recursion-test-'));
 const entry=mode==='playwright'?join(d,'playwright-mcp'):join(d,'mcp','dist','index.js');
 await mkdir(join(entry,'..'),{recursive:true});await writeFile(entry,source);
 const sha=createHash('sha256').update(await readFile(entry)).digest('hex');
 const proxy=new URL(`../plugins/${mode==='playwright'?'playwright-game-tester':'spector-frame-inspector'}/proxy.mjs`,import.meta.url);
 const child=spawn(process.execPath,[proxy.pathname],{stdio:['pipe','pipe','pipe'],env:{...process.env,GENEX_UPSTREAM_PATH:entry,GENEX_UPSTREAM_SHA256:sha,GENEX_ALLOWED_ORIGIN:'http://127.0.0.1:5173'}});
 let stderr='';child.stderr.on('data',b=>{stderr=(stderr+String(b)).slice(-3000)});
 const lines=createInterface({input:child.stdout}), pending=new Map();
 lines.on('line',text=>{try{const x=JSON.parse(text);const p=pending.get(x.id);if(p){clearTimeout(p.timer);pending.delete(x.id);p.resolve(x)}}catch{}});
 const send=(id,method,params={},timeout=3000)=>new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{pending.delete(id);reject(new Error('No correlated response for '+id+' '+stderr))},timeout);
  pending.set(id,{timer,resolve});child.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');
 });
 try{await run({send,child,stderr:()=>stderr});}finally{
  for(const p of pending.values())clearTimeout(p.timer);
  lines.close();child.kill('SIGTERM');await new Promise(r=>{if(child.exitCode!==null)return r();const t=setTimeout(r,1000);child.once('close',()=>{clearTimeout(t);r()})});await rm(d,{recursive:true,force:true});
 }
}
for(const mode of ['playwright','spector']){
 test(`${mode}: oversized complete JSON-RPC responses fail outstanding requests promptly`,async()=>{
  await withBridge(mode,BIG_REPLY,async({send,child})=>{
   const ok=await send(1,'initialize');assert.ok(ok.result);
   const name=mode==='playwright'?'browser_snapshot':'get_shaders';
   const result=await send(2,'tools/call',{name,arguments:{}},3500);
   assert.match(result.error?.message||'',/too large|exceed|limit|upstream.*(ended|exited)|closed/i);
   if (child.exitCode === null) await new Promise((resolve, reject) => {
     const timer = setTimeout(() => reject(new Error('Proxy did not exit after oversized frame')), 2600);
     child.once('close', () => { clearTimeout(timer); resolve(); });
   });
  });
 });
}

// Independent model-oracle fixtures: these do not derive expectations from the
// plugin's own test-planning implementation.
import {simulateMachine,transitionTestPlan} from '../plugins/xstate-rulebook/backend.mjs';
import {simulate as simulateInk,routePlan as planInk} from '../plugins/ink-narrative/backend.mjs';
let seed = 0x51ccaff;
const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
const pick=n=>Math.floor(rand()*n);
test('XState randomized graph plans exercise precisely the transitions they claim',()=>{
  for(let sample=0;sample<90;sample++){
    const n=2+pick(12), names=Array.from({length:n},(_,i)=>'s'+i), states={};
    for(let i=0;i<n;i++){
      if(rand()<0.17){states[names[i]]={type:'final'};continue;}
      const on={};for(let j=0,limit=pick(6);j<limit;j++)on['E'+j]=names[pick(n)];
      states[names[i]]={on};
    }
    const raw=JSON.stringify({id:'fixture',initial:'s0',states});
    const plan=transitionTestPlan(raw);
    for(const tc of plan.testCases){
      let model='s0';
      for(const event of tc.events) if(states[model].type!=='final') model=states[model].on?.[event]??model;
      assert.equal(model,tc.expectedState,'Independent FSM model disagreed');
      const r=simulateMachine(raw,JSON.stringify(tc.events));
      assert.equal(r.final,model,`Sample ${sample} plan replay wrong`);
      assert.equal(r.trace.at(-1).accepted,true,'Test plan must end on a permitted event');
    }
    assert.equal(plan.testCases.length,plan.coveredByPlan);
  }
});
test('Ink randomized shortest story routes replay to their advertised targets',()=>{
  for(let sample=0;sample<90;sample++){
    const n=2+pick(16),names=Array.from({length:n},(_,i)=>'k'+i);
    const knots=names.map(id=>({id,paragraphs:['Scene '+id+'.'],choices:Array.from({length:pick(5)},(_,i)=>({text:'Choice '+i,target:rand()<0.15?'END':names[pick(n)]}))}));
    const story=JSON.stringify({start:'k0',knots});
    const plan=planInk(story);
    for(const tc of plan.testCases){
      const r=simulateInk(story,JSON.stringify(tc.choices));
      if(tc.target==='END')assert.equal(r.finished,true);
      else assert.equal(r.visited.at(-1).knot,tc.target);
      assert.equal(r.visited.at(tc.target==='END'?-1:-2)?.chosen,tc.text,'Advertised edge not taken');
    }
    for(const tc of plan.terminalRoutes){
      const r=simulateInk(story,JSON.stringify(tc.choices));
      assert.equal(r.finished,true,'Planned terminal route should complete');
    }
  }
});
