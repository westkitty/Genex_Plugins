import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, chmod, rm, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { activate as activateXState } from '../plugins/xstate-rulebook/backend.mjs';
import { activate as activateInk } from '../plugins/ink-narrative/backend.mjs';
import {activate as activatePlaywright} from '../plugins/playwright-game-tester/backend.mjs';
import {activate as activateSpector} from '../plugins/spector-frame-inspector/backend.mjs';

function game(settings={}) {
  const files=new Map();const calls=[];
  const ctx={project:'test-game',directory:'/fake/game',async host(method,args){
    calls.push([method,args]);
    if(method==='settings.read')return settings;
    if(method==='project.read') {if(!files.has(args.path))throw new Error('ENOENT: '+args.path);return files.get(args.path);}
    if(method==='project.write') {files.set(args.path,args.text);return {file:args.path};}
    throw new Error('Unexpected host call '+method);
  }};
  return {ctx,files,calls};
}
const machine=JSON.stringify({id:'gate',initial:'closed',states:{closed:{on:{OPEN:'open'}},open:{on:{CLOSE:'closed',LOCK:'locked'}},locked:{type:'final'},unused:{}}});
const story=JSON.stringify({title:'Station',start:'entry',variables:{trust:0},knots:[{id:'entry',paragraphs:['A signal repeats from below the deck.'],choices:[{text:'Investigate',target:'signal'},{text:'Leave',target:'END'}]},{id:'signal',paragraphs:['The wall answers.'],choices:[]},{id:'unused',paragraphs:['Unused witness.'],choices:[]}]});

test('XState: validate and report unreachable states',async()=>{
  const x=await activateXState();const r=await x.tool('inspect',{spec:machine},game().ctx);
  assert.equal(r.ok,true);assert.deepEqual(r.unreachable,['unused']);assert.deepEqual(r.events,['CLOSE','LOCK','OPEN']);
});
test('XState: invalid target is rejected without writes',async()=>{
  const x=await activateXState();const g=game();const bad=JSON.stringify({id:'bad',initial:'a',states:{a:{on:{GO:'missing'}}}});
  assert.equal((await x.tool('inspect',{spec:bad},g.ctx)).ok,false);
  await assert.rejects(x.tool('emit',{spec:bad,slug:'test'},g.ctx),/Invalid machine/);
  assert.equal(g.files.size,0);
});
test('XState: simulation and terminal behavior',async()=>{
  const x=await activateXState(); const r=await x.tool('simulate',{spec:machine,events:JSON.stringify(['OPEN','LOCK','CLOSE'])},game().ctx);
  assert.equal(r.final,'locked');assert.equal(r.done,true);assert.equal(r.trace.at(-1).accepted,false);
});
test('XState: emit real JS module, refuse overwrite',async()=>{
  const x=await activateXState();const g=game();const r=await x.tool('emit',{spec:machine,slug:'gate-a'},g.ctx);
  assert.equal(r.path,'genex-xstate-gate-a.generated.mjs');assert.match(g.files.get(r.path),/import \{ createMachine \} from 'xstate'/);
  await assert.rejects(x.tool('emit',{spec:machine,slug:'gate-a'},g.ctx),/Refusing to overwrite/);
  assert.equal(g.files.size,1);
});
test('XState: host permission error must not count as missing',async()=>{
  const x=await activateXState();const g=game();g.ctx.host=async(method)=>{if(method==='project.read')throw new Error('Permission denied');return{file:'written'}};
  await assert.rejects(x.tool('emit',{spec:machine,slug:'hello'},g.ctx),/Cannot prove destination absent/);
});
test('Ink: inspect and produce branching source',async()=>{
  const ink=await activateInk();const g=game(); const r=await ink.tool('inspect',{story},g.ctx);
  assert.equal(r.ok,true);assert.deepEqual(r.unreachable,['unused']);
  const p=await ink.tool('preview',{story},g.ctx);
  assert.match(p.ink,/VAR trust = 0/);assert.match(p.ink,/=== entry ===/);assert.match(p.ink,/\+ \[Investigate\] -> signal/);
});
test('Ink: deterministic route simulation',async()=>{
  const ink=await activateInk();const r=await ink.tool('simulate',{story,choices:'[0]'},game().ctx);
  assert.equal(r.finished,true);assert.deepEqual(r.visited.map(x=>x.knot),['entry','signal']);
  await assert.rejects(ink.tool('simulate',{story,choices:'[8]'},game().ctx),/out of range/);
});
test('Ink: reject dangling branches',async()=>{
  const ink=await activateInk();const bad=JSON.stringify({start:'a',knots:[{id:'a',paragraphs:['Hi'],choices:[{text:'Offsite',target:'missing'}]}]});
  assert.equal((await ink.tool('inspect',{story:bad},game().ctx)).ok,false);
});
test('Ink: create source and protect existing file',async()=>{
  const ink=await activateInk();const g=game();
  const r=await ink.tool('write',{story,slug:'station'},g.ctx);assert.match(g.files.get(r.path),/-> entry/);
  await assert.rejects(ink.tool('write',{story,slug:'station'},g.ctx),/Refusing to overwrite/);
});
test('Ink: use local inklecate compiler, no remote install, refuse overwrite',async()=>{
  const tmp=await mkdtemp(join(tmpdir(),'genex-ink-test-'));
  try{
    const exe=join(tmp,'inklecate');
    await writeFile(exe,`#!/usr/bin/env node\nconst fs=require('node:fs');const a=process.argv.slice(2);if(a[0]!=='-o'||a.length!==3)process.exit(22);const s=fs.readFileSync(a[2],'utf8');fs.writeFileSync(a[1],JSON.stringify({compiled:true,sourceLength:s.length}));\n`);
    await chmod(exe,0o755);
    const ink=await activateInk();const g=game({'inklecate-path':exe});g.files.set('station.ink','=== start ===\nA room.\n-> END\n');
    const r=await ink.tool('compile',{source:'station.ink'},g.ctx);assert.equal(r.compiled,'station.ink.json');
    assert.equal(JSON.parse(g.files.get(r.compiled)).compiled,true);
    await assert.rejects(ink.tool('compile',{source:'station.ink'},g.ctx),/Refusing to overwrite/);
    const newer=await ink.tool('compile',{source:'station.ink',overwrite:true},g.ctx); assert.equal(newer.overwritten,true);
    await assert.rejects(ink.tool('compile',{source:'../outside.ink'},g.ctx),/root-level/);
    g.files.set('bad.ink','INCLUDE ../../secret.ink');
    await assert.rejects(ink.tool('compile',{source:'bad.ink'},g.ctx),/INCLUDE and EXTERNAL/);
  } finally {await rm(tmp,{recursive:true,force:true});}
});
test('MCP status tools are non-mutating',async()=>{
  const p=await activatePlaywright();const s=await activateSpector();
  assert.equal((await p.tool('status',{},game().ctx)).ready,false);
  assert.equal((await s.tool('status',{},game().ctx)).ready,false);
});
test('XState: racing same-name plugin writes cannot both succeed',async()=>{
  const x=await activateXState();const g=game();
  const r=await Promise.allSettled([x.tool('emit',{spec:machine,slug:'race'},g.ctx),x.tool('emit',{spec:machine,slug:'race'},g.ctx)]);
  assert.equal(r.filter(x=>x.status==='fulfilled').length,1);
  assert.equal(r.filter(x=>x.status==='rejected').length,1);
});
test('Ink: racing same-name source writes cannot both succeed',async()=>{
  const ink=await activateInk();const g=game();
  const r=await Promise.allSettled([ink.tool('write',{story,slug:'race'},g.ctx),ink.tool('write',{story,slug:'race'},g.ctx)]);
  assert.equal(r.filter(x=>x.status==='fulfilled').length,1);
  assert.equal(r.filter(x=>x.status==='rejected').length,1);
});
test('XState: emitted module parses as JavaScript (dependency import remains external)',async()=>{
  const x=await activateXState(); const g=game(); const out=await x.tool('emit',{spec:machine,slug:'syntax'},g.ctx);
  const dir=await mkdtemp(join(tmpdir(),'genex-xstate-test-'));
  try {
    const {execFileSync}=await import('node:child_process');
    const p=join(dir,out.path);await writeFile(p,g.files.get(out.path));
    assert.equal(execFileSync(process.execPath,['--check',p],{encoding:'utf8'}),'');
  } finally {await rm(dir,{recursive:true,force:true})}
});


test('Both narrative panel load actions read only a valid root game spec, with size/name limits', async () => {
  const x=(await import('../plugins/xstate-rulebook/backend.mjs')).activate;
  const ink=(await import('../plugins/ink-narrative/backend.mjs')).activate;
  const files={'level.json': JSON.stringify({id:'level',initial:'idle',states:{idle:{type:'final'}}}), 'story.json': JSON.stringify({start:'first',knots:[{id:'first',paragraphs:['Here.'],choices:[]}]})};
  const ctx={project:'test',directory:'/test/game', signal:new AbortController().signal,
    host: async (method,args)=>{assert.equal(method,'project.read');if(!Object.hasOwn(files,args.path))throw new Error('ENOENT');return files[args.path];}};
  for(const [activate,name,file,field] of [[x,'machine','level.json','spec'],[ink,'story','story.json','story']]){
    const plugin=await activate();
    const r=await plugin.action('load',{file},ctx);
    assert.equal(r[field],files[file]);
    assert.equal(r.file,file);
    for(const bad of ['../private.json','a/b.json','.hidden.json','a..json','game.js','/tmp/secret.json']){
      await assert.rejects(plugin.action('load',{file:bad},ctx),/filename|root|path/i,`${name} refused ${bad}`);
    }
  }
});


test('Narrative panel game loading rejects missing project, cancellations, bad JSON and oversized text', async()=>{
 const xs=await (await import('../plugins/xstate-rulebook/backend.mjs')).activate();
 const ink=await (await import('../plugins/ink-narrative/backend.mjs')).activate();
 const file='game-rules.json';
 for(const module of [xs,ink]){
  const reads=[];const bound={project:'test',signal:new AbortController().signal,host:async(method,args)=>{reads.push(args.path);return 'not valid JSON';}};
  await assert.rejects(module.action('load',{file},bound),/JSON|spec|story/i);
  assert.deepEqual(reads,[file]);
  const unbound={...bound,project:null,directory:null};
  reads.length=0;await assert.rejects(module.action('load',{file},unbound),/bound|game/i);assert.equal(reads.length,0);
  const cancelled=new AbortController();cancelled.abort();
  reads.length=0;await assert.rejects(module.action('load',{file},{...bound,signal:cancelled.signal}),/cancel/i);assert.equal(reads.length,0);
  await assert.rejects(module.action('load',{file},{...bound,host:async()=> 'A'.repeat(120001)}),/120 KB|limit/i);
 }
});

test('Narrative file loader checks cancellation after the host read',async()=>{
  const ink=await (await import('../plugins/ink-narrative/backend.mjs')).activate();
  const controller=new AbortController();
  const ctx={project:'game',signal:controller.signal,host:async(method,args)=>{
   assert.equal(method,'project.read');controller.abort();
   return JSON.stringify({start:'a',knots:[{id:'a',paragraphs:['Hello.'],choices:[]}]});
  }};
  await assert.rejects(ink.action('load',{file:'story.json'},ctx),/cancel/i);
});

test('Ink plain-text story validation forbids mid-sentence diverts and leading stitch/gather syntax',async()=>{
 const {storyInfo,inkSource}=await import('../plugins/ink-narrative/backend.mjs');
 const examples=[
  {paragraphs:['You step inside -> vault'],choices:[]},
  {paragraphs:['= hidden_stitch'],choices:[]},
  {paragraphs:['- (unsafe_gather)'],choices:[]},
  {paragraphs:['CONST SAVE = 1'],choices:[]},
  {paragraphs:['LIST stations = A, B'],choices:[]},
  {paragraphs:['Welcome here.'],choices:[{text:'Go -> END',target:'END'}]},
 ];
 for(const invalid of examples){
  const raw=JSON.stringify({start:'entry',knots:[{id:'entry',paragraphs:invalid.paragraphs,choices:invalid.choices}]});
  const info=storyInfo(raw);
  assert.ok(info.errors.length>0,'Unsafe Ink control syntax must not be accepted as plain text '+raw);
  assert.ok(!info.errors.some(x=>!x.includes('Invalid plain')),'Errors must identify unsupported Ink syntax');
 }
 const valid=storyInfo(JSON.stringify({start:'entry',knots:[{id:'entry',paragraphs:['The path points toward an open door.'],choices:[{text:'Continue',target:'END'}]}]}));
 assert.equal(valid.errors.length,0);
 assert.match(inkSource(valid.story),/Continue/);
});
