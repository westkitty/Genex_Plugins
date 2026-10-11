import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, readFile, chmod, rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
import {activate as xstate} from '../plugins/xstate-rulebook/backend.mjs';
import {activate as ink} from '../plugins/ink-narrative/backend.mjs';

const machine={id:'sample',initial:'idle',states:{idle:{on:{GO:'active'}},active:{type:'final'}}};
const story={start:'entry',knots:[{id:'entry',paragraphs:['Hello.'],choices:[{text:'Continue',target:'END'}]}]};
function ctx(files=new Map()){
 const calls=[];return {files,calls,project:'test',directory:'/temp/game',signal:new AbortController().signal,async host(method,args){calls.push([method,args]);if(method==='project.read'){if(!files.has(args.path))throw new Error('ENOENT '+args.path);return files.get(args.path);}if(method==='project.write'){files.set(args.path,args.text);return {file:args.path};}if(method==='settings.read')return{};throw new Error(method)}};
}
test('XState rejects unsupported machine semantics rather than deleting them',async()=>{
 const a=await xstate(); const bad={...machine,guards:{CAN_GO:'has item'}};
 const result=await a.tool('inspect',{spec:JSON.stringify(bad)},ctx());
 assert.equal(result.ok,false);assert.match(result.errors.join(' '),/unsupported|unknown|guards/i);
});
test('Ink rejects unsupported choice conditions rather than silently unconditionalizing them',async()=>{
 const a=await ink(); const bad=structuredClone(story);bad.knots[0].choices[0].condition='trust > 0';
 const result=await a.tool('inspect',{story:JSON.stringify(bad)},ctx());
 assert.equal(result.ok,false);assert.match(result.errors.join(' '),/condition|unsupported|unknown/i);
});
test('Ink rejects text that would be compiled as directives/comments/tags instead of dialogue',async()=>{
 const a=await ink();for(const candidate of ['// silently disappears','A note #hiddenTag','A {variable} is evaluated']){
   const bad=structuredClone(story);bad.knots[0].paragraphs=[candidate];
   await assert.rejects(a.tool('preview',{story:JSON.stringify(bad)},ctx()),/Invalid|directive|syntax|plain/i,candidate);
 }
});
test('GENEX cancellation prevents XState and Ink project writes',async()=>{
 const controller=new AbortController();controller.abort(); const x=await xstate(), i=await ink(),g=ctx();g.signal=controller.signal;
 await assert.rejects(x.tool('emit',{spec:JSON.stringify(machine),slug:'abort'},g),/abort|cancel|stop/i);
 await assert.rejects(i.tool('write',{story:JSON.stringify(story),slug:'abort'},g),/abort|cancel|stop/i);
 assert.equal(g.files.size,0);
});
test('MCP proxy refuses to forward non-JSON upstream stdout that would break host protocol',async()=>{
 const temp=await mkdtemp(join(tmpdir(),'genex-malformed-proxy-'));
 const fake=join(temp,'playwright-mcp');
 await writeFile(fake,`#!/usr/bin/env node\nprocess.stdout.write('bad stdout warning\\n'); process.stdin.on('data',c=>{try{const s=String(c).trim().split('\\n');for(const q of s){const m=JSON.parse(q);if(m.id!==undefined)process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:m.id,result:{protocolVersion:'2025-06-18',capabilities:{tools:{}}}})+'\\n')}}catch{}});`);
 await chmod(fake,0o755);
 const script=new URL('../plugins/playwright-game-tester/proxy.mjs',import.meta.url).pathname;
 const digest=createHash('sha256').update(await readFile(fake)).digest('hex');
 const child=spawn(process.execPath,[script],{env:{...process.env,GENEX_UPSTREAM_PATH:fake,GENEX_UPSTREAM_SHA256:digest},stdio:['pipe','pipe','pipe']});
 try{
   child.stdin.write(JSON.stringify({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'fixture',version:'1'}}})+'\n');
   const lines=[];
   await new Promise((resolve,reject)=>{
     let buf='';const timer=setTimeout(()=>reject(new Error('timeout waiting for MCP reply')),1500);
     child.stdout.on('data',c=>{buf+=c.toString();while(buf.includes('\n')){const n=buf.indexOf('\n'),line=buf.slice(0,n);buf=buf.slice(n+1);lines.push(line);if(lines.length>=1){setTimeout(()=>{clearTimeout(timer);resolve();},80);return;}}});
     child.on('exit',()=>{clearTimeout(timer);resolve()});
   });
   assert.ok(lines.length>0,'server did not reply');
   for(const line of lines) assert.doesNotThrow(()=>JSON.parse(line),'MCP stdout must be JSON only');
 }finally {child.kill('SIGTERM');await new Promise(r=>{child.once('close',r);setTimeout(r,200).unref()});await rm(temp,{recursive:true,force:true});}
});

test('XState inspect exposes dead ends and simulation reports exact untested transitions',async()=>{
  const api=await xstate(); const sample={id:'paths',initial:'entry',states:{entry:{on:{LEFT:'left',RIGHT:'right'}},left:{type:'final'},right:{},unreachable:{}}};
  const inspected=await api.tool('inspect',{spec:JSON.stringify(sample)},ctx());
  assert.equal(inspected.ok,true);assert.deepEqual(inspected.deadEnds,['right','unreachable']);
  assert.deepEqual(inspected.unreachable,['unreachable']);assert.equal(inspected.transitions.length,2);
  const simulated=await api.tool('simulate',{spec:JSON.stringify(sample),events:JSON.stringify(['LEFT'])},ctx());
  assert.equal(simulated.coverage.exercisedTransitions,1);
  assert.equal(simulated.coverage.totalTransitions,2);
  assert.equal(simulated.coverage.transitionPercent,50);
  assert.deepEqual(simulated.coverage.missedTransitions,[{from:'entry',event:'RIGHT',to:'right'}]);
});
test('XState refuses unsupported state guards and entry actions instead of dropping them',async()=>{
  const api=await xstate();for(const unsupported of [{entry:['score']},{guard:'has-key'}, {always:'done'}]){
    const bad=structuredClone(machine);Object.assign(bad.states.idle,unsupported);
    const out=await api.tool('inspect',{spec:JSON.stringify(bad)},ctx());assert.equal(out.ok,false);
  }
});
test('Ink rejects unsupported knot fields and invalid story titles',async()=>{
  const api=await ink();
  const withRule=structuredClone(story);withRule.knots[0].onEnter=['grant_item'];
  assert.equal((await api.tool('inspect',{story:JSON.stringify(withRule)},ctx())).ok,false);
  const withTitle=structuredClone(story);withTitle.title='line1\nline2';
  assert.equal((await api.tool('inspect',{story:JSON.stringify(withTitle)},ctx())).ok,false);
});
test('Ink inspect marks variables as declarations-only and counts branches',async()=>{
  const api=await ink(); const withVars={...story,variables:{trust:0}};
  const out=await api.tool('inspect',{story:JSON.stringify(withVars)},ctx());
  assert.equal(out.ok,true);assert.equal(out.metrics.totalKnots,1);assert.equal(out.metrics.choiceCount,1);
  assert.match(out.warnings[0],/declarations only/);
});
test('Ink simulation rejects trailing decisions after END',async()=>{
  const api=await ink();
  await assert.rejects(api.tool('simulate',{story:JSON.stringify(story),choices:'[0,0]'},ctx()),/unused decisions/);
});
test('Ink compiler rejects stale source changed after start before writing output',async()=>{
  const tmp=await mkdtemp(join(tmpdir(),'genex-stale-source-'));
  try{
    const exe=join(tmp,'inklecate');
    await writeFile(exe,`#!/usr/bin/env node\nconst fs=require('node:fs');const a=process.argv.slice(2);fs.writeFileSync(a[1],JSON.stringify({inkVersion:21,root:[]}));`);await chmod(exe,0o755);
    const api=await ink(),g=ctx(new Map([['story.ink','=== entry ===\nHello\n-> END\n']]));
    let settingsCalls=0;
    const host=g.host.bind(g);
    g.host=async(method,args)=>{
      if(method==='settings.read'){settingsCalls++;g.files.set('story.ink','=== entry ===\nCHANGED\n-> END\n');return {'inklecate-path':exe};}
      return host(method,args);
    };
    await assert.rejects(api.tool('compile',{source:'story.ink'},g),/Source changed/);
    assert.equal(settingsCalls,1);assert.equal(g.files.has('story.ink.json'),false);
  }finally{await rm(tmp,{recursive:true,force:true});}
});
test('Ink compiler honors mid-compile cancellation and does not write',async()=>{
  const tmp=await mkdtemp(join(tmpdir(),'genex-cancel-compile-'));
  try{
    const exe=join(tmp,'inklecate');
    await writeFile(exe,`#!/usr/bin/env node\nsetTimeout(()=>{require('node:fs').writeFileSync(process.argv[3],JSON.stringify({inkVersion:21,root:[]}));},5000);`);await chmod(exe,0o755);
    const api=await ink(),g=ctx(new Map([['story.ink','=== entry ===\nHello\n-> END\n']]));
    const controller=new AbortController();g.signal=controller.signal;
    const baseHost=g.host.bind(g);g.host=async(method,args)=>method==='settings.read'?{'inklecate-path':exe}:baseHost(method,args);
    const task=api.tool('compile',{source:'story.ink'},g);
    setTimeout(()=>controller.abort(),100);
    await assert.rejects(task,/abort|cancel/i);
    assert.equal(g.files.has('story.ink.json'),false);
  }finally{await rm(tmp,{recursive:true,force:true});}
});
test('MCP status distinguishes CLI file presence from verified functional readiness',async()=>{
  const {activate:playwright}=await import('../plugins/playwright-game-tester/backend.mjs');
  const {activate:spector}=await import('../plugins/spector-frame-inspector/backend.mjs');
  const tmp=await mkdtemp(join(tmpdir(),'genex-readiness-'));
  try{
    const pw=join(tmp,'playwright-mcp');await writeFile(pw,'#!/usr/bin/env node');
    const spec=join(tmp,'mcp','dist','index.js');await mkdir(join(tmp,'mcp','dist'),{recursive:true});await writeFile(spec,'');
    for(const [api,path] of [[await playwright(),pw],[await spector(),spec]]){
      const g=ctx();g.host=async method=>method==='settings.read'?{'upstream-path':path}:{};
      const status=await api.tool('status',{},g);
      assert.equal(status.fileFound,true);assert.equal(status.ready,false);
    }
  }finally{await rm(tmp,{recursive:true,force:true});}
});

test('Playwright and Spector upstream SHA-256 locks refuse modified binaries without execution',async()=>{
  for(const mode of ['playwright','spector']){
    const temp=await mkdtemp(join(tmpdir(),'genex-digest-denial-'));
    try{
      const script=mode==='playwright'?join(temp,'playwright-mcp'):join(temp,'mcp','dist','index.js');
      await mkdir(join(script,'..'),{recursive:true});
      await writeFile(script,`#!/usr/bin/env node\nrequire('node:fs').writeFileSync(${JSON.stringify(join(temp,'executed'))},'YES');`);
      await chmod(script,0o755);
      const expected=createHash('sha256').update(await readFile(script)).digest('hex');
      await writeFile(script,`#!/usr/bin/env node\nrequire('node:fs').writeFileSync(${JSON.stringify(join(temp,'executed'))},'CHANGED');`);
      const bridge=new URL(`../plugins/${mode==='playwright'?'playwright-game-tester':'spector-frame-inspector'}/proxy.mjs`,import.meta.url).pathname;
      const child=spawn(process.execPath,[bridge],{env:{...process.env,GENEX_UPSTREAM_PATH:script,GENEX_UPSTREAM_SHA256:expected},stdio:['pipe','pipe','pipe']});
      let stderr='';child.stderr.on('data',chunk=>stderr+=chunk.toString());
      const code=await new Promise(resolve=>child.on('close',resolve));
      assert.equal(code,78,mode);
      assert.match(stderr,/SHA-256 mismatch/i);
      await assert.rejects(readFile(join(temp,'executed')),/ENOENT/);
    }finally{await rm(temp,{recursive:true,force:true});}
  }
});
