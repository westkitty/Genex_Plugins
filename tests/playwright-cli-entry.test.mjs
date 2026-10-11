import test from 'node:test';
import assert from 'node:assert/strict';
import {activate} from '../plugins/playwright-game-tester/backend.mjs';
import {mkdtemp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const server=String.raw`const rl=require('node:readline').createInterface({input:process.stdin});rl.on('line',t=>{const m=JSON.parse(t);if(m.id===undefined)return;const result=m.method==='initialize'?{protocolVersion:'2025-06-18',capabilities:{tools:{}}}:m.method==='tools/list'?{tools:[{name:'browser_navigate'},{name:'browser_snapshot'}]}:{};process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:m.id,result})+'\n');});`;
test('official @playwright/mcp package cli.js entry passes digest and handshake',async()=>{
 const base=await mkdtemp(join(tmpdir(),'genex-playwright-official-cli-'));
 const path=join(base,'node_modules','@playwright','mcp','cli.js');
 await mkdir(join(path,'..'),{recursive:true});await writeFile(path,server);
 const digest=createHash('sha256').update(await readFile(path)).digest('hex');
 const ctx={signal:new AbortController().signal,host:async name=>{
  assert.equal(name,'settings.read');return {'upstream-path':path,'upstream-sha256':digest,'allowed-origin':'http://127.0.0.1:5173'};
 }};
 try{
  const backend=await activate();
  const status=await backend.tool('status',{},ctx);
  assert.equal(status.hashMatched,true,'official package entry should be allowed');
  const probe=await backend.action('probe',{},ctx);
  assert.equal(probe.handshake,true);assert.equal(probe.ready,true);
 }finally{await rm(base,{recursive:true,force:true});}
});
test('arbitrary cli.js files are not accepted as a Playwright package entry',async()=>{
 const base=await mkdtemp(join(tmpdir(),'genex-fake-cli-'));const path=join(base,'cli.js');
 try{
  await writeFile(path,server);const digest=createHash('sha256').update(server).digest('hex');
  const ctx={host:async()=>({'upstream-path':path,'upstream-sha256':digest})};
  const status=await (await activate()).tool('status',{},ctx);
  assert.equal(status.configured,false);assert.equal(status.ready,false);
  assert.match(status.reason,/official|reviewed/i);
 }finally{await rm(base,{recursive:true,force:true});}
});

test('Playwright rejects a lookalike node_modules directory boundary', async () => {
 const base=await mkdtemp(join(tmpdir(),'genex-lookalike-playwright-'));
 const path=join(base,'fake_node_modules','@playwright','mcp','cli.js');
 try {
  await mkdir(join(path,'..'),{recursive:true});await writeFile(path,server);
  const digest=createHash('sha256').update(server).digest('hex');
  const ctx={host:async()=>({'upstream-path':path,'upstream-sha256':digest})};
  const result=await (await activate()).tool('status',{},ctx);
  assert.equal(result.configured,false, 'A different path segment must not impersonate the official npm package');
  const refused=spawnSync(process.execPath,[new URL('../plugins/playwright-game-tester/proxy.mjs',import.meta.url).pathname], {env:{...process.env,GENEX_UPSTREAM_PATH:path,GENEX_UPSTREAM_SHA256:digest,GENEX_ALLOWED_ORIGIN:'http://127.0.0.1:5173'},timeout:4000});
  assert.equal(refused.status,78,'The proxy itself must fail before launching an untrusted lookalike');
 } finally {await rm(base,{recursive:true,force:true});}
});
