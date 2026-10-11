import test from 'node:test';
import assert from 'node:assert/strict';
import { activate as activateInk } from '../plugins/ink-narrative/backend.mjs';
import { activate as activateXState } from '../plugins/xstate-rulebook/backend.mjs';

const machine = JSON.stringify({id:'systems',initial:'on',states:{on:{on:{FAIL:'emergency',SAFE:'off'}},emergency:{on:{RESET:'on',EVAC:'off'}},off:{type:'final'},orphan:{on:{JUMP:'off'}}}});
const story = JSON.stringify({start:'entry',knots:[{id:'entry',paragraphs:['The clock repeats.'],choices:[{text:'Wait and listen',target:'entry'},{text:'Leave',target:'END'}]},{id:'isolated',paragraphs:['No one arrives.'],choices:[]}]});
const terminal = JSON.stringify({start:'intro',knots:[{id:'intro',paragraphs:['Nothing else is here.'],choices:[]}]});
const trapped = JSON.stringify({start:'hall',knots:[{id:'hall',paragraphs:['Corridor.'],choices:[{text:'Loop',target:'hall'},{text:'Visit trap',target:'trap'}]},{id:'trap',paragraphs:['A second dead loop.'],choices:[{text:'Remain',target:'trap'}]}]});
const ctx={};

test('Ink looping choices remain available on revisits, matching simulator',async()=>{
 const api=await activateInk();const p=await api.tool('preview',{story},ctx);
 assert.match(p.ink,/\+ \[Wait and listen\] -> entry/);
 assert.doesNotMatch(p.ink,/\* \[Wait and listen\]/);
 const simulation=await api.tool('simulate',{story,choices:'[0,0,1]'},ctx);
 assert.equal(simulation.finished,true);
 assert.deepEqual(simulation.visited.map(x=>x.knot),['entry','entry','entry']);
});
test('Ink simulator rejects surplus choices at a knot with no options',async()=>{
 const api=await activateInk();await assert.rejects(api.tool('simulate',{story:terminal,choices:'[0]'},ctx),/unused|surplus|extra/i);
});
test('Ink story route plan contains reproducible choice traces and loop risks',async()=>{
 const api=await activateInk();const out=await api.tool('routes',{story},ctx);
 assert.equal(out.coverage.reachableChoices,2);
 assert.deepEqual(out.unreachable,['isolated']);
 assert.deepEqual(out.testCases.find(x=>x.target==='END').choices,[1]);
 assert.equal(out.terminalRoutes[0].choices.join(','),'1');
 assert.ok(out.cycleKnots.includes('entry'));
 assert.deepEqual(out.trapKnots,[]);
});
test('Ink route analysis reports inescapable cycles accurately',async()=>{
 const api=await activateInk();const out=await api.tool('routes',{story:trapped},ctx);
 assert.deepEqual(out.trapKnots.sort(),['hall','trap']);
 assert.equal(out.terminalRoutes.length,0);
});
test('XState test plan supplies minimal event traces per reachable transition',async()=>{
 const api=await activateXState();const out=await api.tool('testplan',{spec:machine},ctx);
 assert.equal(out.reachableTransitions,4);
 assert.equal(out.unreachableTransitions.length,1);
 const e=out.testCases.find(x=>x.from==='emergency'&&x.event==='EVAC');
 assert.deepEqual(e.events,['FAIL','EVAC']);
 assert.equal(e.expectedState,'off');
});

import {mkdtemp,writeFile,chmod,readFile,rm,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {activate as activatePlaywright} from '../plugins/playwright-game-tester/backend.mjs';
import {activate as activateSpector} from '../plugins/spector-frame-inspector/backend.mjs';
const mcpFake=`#!/usr/bin/env node
const rl=require('node:readline').createInterface({input:process.stdin});rl.on('line',line=>{const m=JSON.parse(line);if(m.id===undefined)return;let r;if(m.method==='initialize')r={protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:'fake',version:'1'}};else if(m.method==='tools/list')r={tools:[{name:'browser_navigate'},{name:'browser_snapshot'},{name:'load_url'},{name:'capture_frame'}]};else r={};process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:m.id,result:r})+'\\n')});
`;
test('Playwright and Spector connection probes prove actual MCP handshake, not file presence',async()=>{
 for(const [mode,api] of [['playwright',await activatePlaywright()],['spector',await activateSpector()]]){
  const dir=await mkdtemp(join(tmpdir(),'genex-probe-'));
  try{
   const file=mode==='playwright'?join(dir,'playwright-mcp'):join(dir,'mcp','dist','index.js');
   await mkdir(join(file,'..'),{recursive:true});await writeFile(file,mcpFake);await chmod(file,0o755);
   const digest=createHash('sha256').update(await readFile(file)).digest('hex');
   const g={signal:new AbortController().signal,host:async method=>{assert.equal(method,'settings.read');return{'upstream-path':file,'upstream-sha256':digest}}};
   const result=await api.tool('probe',{},g);
   assert.equal(result.handshake,true,mode);assert.equal(result.ready,true,mode);
   assert.ok(result.exposedTools.includes(mode==='playwright'?'browser_snapshot':'capture_frame'));
  }finally{await rm(dir,{recursive:true,force:true});}
 }
});
test('MCP connection probe fails closed when SHA-256 is wrong and emits no readiness claim',async()=>{
 const api=await activatePlaywright();const dir=await mkdtemp(join(tmpdir(),'genex-bad-probe-'));
 try{
  const file=join(dir,'playwright-mcp');await writeFile(file,mcpFake);
  const g={signal:new AbortController().signal,host:async()=>({'upstream-path':file,'upstream-sha256':'0'.repeat(64)})};
  await assert.rejects(api.tool('probe',{},g),/sha-256|mismatch/i);
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('Ink route analysis caps large plans without suppressing total coverage counts',async()=>{
 const api=await activateInk();
 const many={start:'k0',knots:Array.from({length:80},(_,i)=>({id:`k${i}`,paragraphs:[`Node ${i}`],choices:[...Array.from({length:11},(_,j)=>({text:`Exit option ${j}`,target:'END'})),{text:'Next scene',target:`k${(i+1)%80}`}]}))};
 const result=await api.tool('routes',{story:JSON.stringify(many)},ctx);
 assert.equal(result.coverage.reachableChoices,960);
 assert.equal(result.testCases.length,160);assert.equal(result.coverage.truncated,true);
 assert.equal(result.terminalRouteCount,880);assert.equal(result.terminalRoutesTruncated,true);
 assert.equal(result.terminalRoutes.length,160);
});
test('MCP connection probe returns not-ready when critical tools are missing',async()=>{
 const api=await activatePlaywright(),dir=await mkdtemp(join(tmpdir(),'genex-missing-tools-'));
 try{
   const file=join(dir,'playwright-mcp');
   const fake=mcpFake.replace("{name:'browser_snapshot'},",'');
   await writeFile(file,fake);await chmod(file,0o755);
   const digest=createHash('sha256').update(await readFile(file)).digest('hex');
   const g={signal:new AbortController().signal,host:async()=>({'upstream-path':file,'upstream-sha256':digest})};
   const out=await api.tool('probe',{},g);
   assert.equal(out.handshake,true);assert.equal(out.ready,false);
   assert.ok(out.missingTools.includes('browser_snapshot'));
 }finally{await rm(dir,{recursive:true,force:true});}
});
