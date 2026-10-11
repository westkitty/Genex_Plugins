import test from 'node:test';
import assert from 'node:assert/strict';
import {activate} from '../plugins/spector-frame-inspector/backend.mjs';
import {mkdtemp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const script='process.stdin.resume();';
test('Spector rejects a lookalike mcp directory boundary while keeping genuine mcp/dist', async () => {
 const base=await mkdtemp(join(tmpdir(),'genex-lookalike-spector-'));
 try{
  const backend=await activate();
  const digest=createHash('sha256').update(script).digest('hex');
  const fake=join(base,'fake_mcp','dist','index.js');
  await mkdir(join(fake,'..'),{recursive:true}); await writeFile(fake,script);
  const ctx={host:async()=>({'upstream-path':fake,'upstream-sha256':digest})};
  assert.equal((await backend.tool('status',{},ctx)).configured,false,'Only a literal path segment mcp is allowed');
  const refused=spawnSync(process.execPath,[new URL('../plugins/spector-frame-inspector/proxy.mjs',import.meta.url).pathname], {env:{...process.env,GENEX_UPSTREAM_PATH:fake,GENEX_UPSTREAM_SHA256:digest,GENEX_ALLOWED_ORIGIN:'http://127.0.0.1:5173'},timeout:4000});
  assert.equal(refused.status,78,'Spector proxy must reject the lookalike path before executing it');
  const good=join(base,'mcp','dist','index.js');
  await mkdir(join(good,'..'),{recursive:true}); await writeFile(good,script);
  const goodCtx={host:async()=>({'upstream-path':good,'upstream-sha256':digest})};
  const status=await backend.tool('status',{},goodCtx);
  assert.equal(status.configured,true);assert.equal(status.hashMatched,true);
 }finally{await rm(base,{recursive:true,force:true})}
});
