import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {activate as xstate} from '../plugins/xstate-rulebook/backend.mjs';
import {activate as ink} from '../plugins/ink-narrative/backend.mjs';
const url = name => new URL('../examples/' + name, import.meta.url);
test('starter XState fixture has all states reachable and achieves a final state',async()=>{
 const input=await readFile(url('state-machine.json'),'utf8');const api=await xstate();
 const info=await api.tool('inspect',{spec:input},{});
 assert.equal(info.ok,true);assert.deepEqual(info.unreachable,[]);
 const result=await api.tool('simulate',{spec:input,events:JSON.stringify(['UNLOCK','OPEN','ESCAPE'])},{});
 assert.equal(result.final,'escaped');assert.equal(result.done,true);
 assert.equal(result.coverage.exercisedTransitions,3);
});
test('starter Ink fixture produces deterministic graph and script preview',async()=>{
 const input=await readFile(url('narrative.json'),'utf8');const api=await ink();
 const info=await api.tool('inspect',{story:input},{});
 assert.equal(info.ok,true);assert.deepEqual(info.unreachable,[]);assert.equal(info.metrics.choiceCount,4);
 const result=await api.tool('simulate',{story:input,choices:JSON.stringify([0,0])},{});
 assert.equal(result.finished,true);assert.deepEqual(result.visited.map(x=>x.knot),['arrival','relay','recorder']);
 const source=await api.tool('preview',{story:input},{});
 assert.match(source.ink,/=== recorder ===/);
});
