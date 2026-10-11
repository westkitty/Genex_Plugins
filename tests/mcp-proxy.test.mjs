import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { writeFile, readFile, mkdir, mkdtemp, chmod, rm } from 'node:fs/promises';
import {createHash} from 'node:crypto';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createInterface } from 'node:readline';

const upstream=`#!/usr/bin/env node\nconst rl=require('node:readline').createInterface({input:process.stdin});rl.on('line',line=>{let m=JSON.parse(line);if(m.method==='tools/list')process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:'server-injected',method:'sampling/createMessage',params:{messages:[]}})+'\\n');let result;if(m.method==='tools/list')result={tools:[{name:'browser_navigate'},{name:'browser_evaluate'},{name:'browser_take_screenshot'},{name:'load_url'},{name:'get_shaders'},{name:'load_playground'}]};else if(m.method==='tools/call')result={called:m.params.name,url:m.params.arguments?.url||null};else result={protocolVersion:'2025-06-18',capabilities:{tools:{}}};if(m.id!==undefined)process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:m.id,result})+'\\n')});\n`;

async function scenario(mode){
  const temp=await mkdtemp(join(tmpdir(),'genex-proxy-test-'));
  const path=mode==='playwright'?join(temp,'playwright-mcp'):join(temp,'mcp','dist','index.js');
  await mkdir(join(path,'..'),{recursive:true});await writeFile(path,upstream);await chmod(path,0o755);
  const script= new URL(`../plugins/${mode==='playwright'?'playwright-game-tester':'spector-frame-inspector'}/proxy.mjs`,import.meta.url).pathname;
  const digest=createHash('sha256').update(await readFile(path)).digest('hex');
  const child=spawn(process.execPath,[script],{env:{...process.env,GENEX_UPSTREAM_PATH:path,GENEX_UPSTREAM_SHA256:digest},stdio:['pipe','pipe','pipe']});
  const pending=new Map(),unsolicited=[];const lines=createInterface({input:child.stdout});
  lines.on('line',line=>{const m=JSON.parse(line);if(m.method)unsolicited.push(m);let p=pending.get(m.id);if(p){pending.delete(m.id);p.resolve(m)}});
  let sequence=0;
  function send(method,params={}) {let id=++sequence;let promise=new Promise((resolve,reject)=>{const t=setTimeout(()=>{pending.delete(id);reject(new Error('Timed out waiting for MCP result'))},2000);pending.set(id,{resolve:x=>{clearTimeout(t);resolve(x)}})});child.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');return promise;}
  try {
    assert.ok((await send('initialize')).result);
    const listed=await send('tools/list');
    assert.equal(listed.result.tools.some(t=>['browser_evaluate','load_playground'].includes(t.name)),false);
    const good=mode==='playwright'?'browser_navigate':'load_url';
    assert.equal((await send('tools/call',{name:good,arguments:{url:'http://127.0.0.1:5173/'}})).result.called,good);
    assert.match((await send('tools/call',{name:good,arguments:{url:'https://example.com'}})).error.message,/configured game origin/);
    assert.match((await send('tools/call',{name:mode==='playwright'?'browser_evaluate':'load_playground',arguments:{}})).error.message,/not permitted/);
    assert.match((await send('resources/read',{uri:'file:///private.txt'})).error.message,/not permitted/i);
    assert.deepEqual(unsolicited,[], 'upstream-initiated MCP requests must not reach GENEX');
  }finally{
    child.kill('SIGTERM');await new Promise(resolve=>{if(child.exitCode!==null)resolve();else {child.once('close',resolve);setTimeout(resolve,1500)}});
    await rm(temp,{recursive:true,force:true});
  }
}
test('Playwright proxy MCP forwarding, tool filtering and loopback guard',async()=>{await scenario('playwright')});
test('Spector proxy MCP forwarding, tool filtering and loopback guard',async()=>{await scenario('spector')});
