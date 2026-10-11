import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {activate as playwright} from '../plugins/playwright-game-tester/backend.mjs';
import {activate as spector} from '../plugins/spector-frame-inspector/backend.mjs';

// Fake upstream reports the exact environment it received from both nested spawns.
// This is a Linux process-level proxy fixture, not a macOS Electron application test.
const upstream=String.raw`const readline=require('node:readline').createInterface({input:process.stdin});readline.on('line',line=>{const msg=JSON.parse(line);if(msg.id===undefined)return;const enabled=process.env.ELECTRON_RUN_AS_NODE==='1';const result=msg.method==='initialize'?{protocolVersion:'2025-06-18',capabilities:{tools:{}}}:msg.method==='tools/list'?{tools:[{name:'browser_navigate'},{name:'load_url'},...(enabled?[{name:'browser_snapshot'},{name:'capture_frame'}]:[])]}:{};process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:msg.id,result})+'\n');});`;
for(const [slug,activate,relative] of [
  ['playwright-game-tester',playwright,['playwright-mcp']],
  ['spector-frame-inspector',spector,['mcp','dist','index.js']]
]) {
 test(slug+' preserves GENEX Electron Node mode through probe and upstream MCP spawn',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'genex-electron-node-'));
  const path=join(dir,...relative);
  await mkdir(join(path,'..'),{recursive:true});await writeFile(path,upstream);
  const sha=createHash('sha256').update(await readFile(path)).digest('hex');
  const prior=process.env.ELECTRON_RUN_AS_NODE;
  process.env.ELECTRON_RUN_AS_NODE='1';
  try {
   const plugin=await activate();
   const ctx={signal:new AbortController().signal,host:async method=>{
    assert.equal(method,'settings.read');
    return {'upstream-path':path,'upstream-sha256':sha,'allowed-origin':'http://127.0.0.1:5173'};
   }};
   const result=await plugin.action('probe',{},ctx);
   assert.equal(result.handshake,true);
   assert.equal(result.ready,true,'Both nested child processes must remain in Node mode for required tools');
   assert.deepEqual(result.missingTools,[]);
  } finally {
   if(prior===undefined)delete process.env.ELECTRON_RUN_AS_NODE;
   else process.env.ELECTRON_RUN_AS_NODE=prior;
   await rm(dir,{recursive:true,force:true});
  }
 });
}
