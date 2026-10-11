/* GENEX Rulebook: a deliberately bounded, deterministic XState v5 FSM authoring tool.
 * No dependencies or filesystem activity at import/activation time.
 */
const SLUG = /^[a-z][a-z0-9-]{0,39}$/;
const IDENT = /^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/;
const EVENT = /^[A-Z][A-Z0-9_:-]{0,63}$/;
const MAX_SPEC_BYTES = 120_000;
const activeWrites = new Set();
const ROOT_FIELDS = new Set(['id', 'initial', 'states']);
const STATE_FIELDS = new Set(['on', 'type']);

function stopped(ctx) {
  if (ctx?.signal?.aborted) throw new Error('GENEX operation cancelled before project mutation');
}
async function scopedWrite(ctx, path, text) {
  const key = (ctx.directory || ctx.project || 'unbound') + '::' + path;
  if (activeWrites.has(key)) throw new Error('Another Rulebook write is in progress for ' + path);
  activeWrites.add(key);
  try {
    stopped(ctx);
    await absent(ctx, path);
    stopped(ctx);
    return await ctx.host('project.write', { path, text });
  } finally { activeWrites.delete(key); }
}
function isRecord(x) { return x !== null && typeof x === 'object' && !Array.isArray(x); }
function errorsForKeys(record, allowed, prefix, errors) {
  for (const key of Object.keys(record)) if (!allowed.has(key)) errors.push(`${prefix}: unsupported property ${key}`);
}
function parseSpec(raw) {
  if (typeof raw !== 'string' || Buffer.byteLength(raw, 'utf8') > MAX_SPEC_BYTES)
    throw new Error('Spec must be JSON text at most 120 KB');
  let original;
  try { original = JSON.parse(raw); } catch { throw new Error('Spec is not valid JSON'); }
  if (!isRecord(original)) throw new Error('Spec must be an object');
  const errors = [];
  errorsForKeys(original, ROOT_FIELDS, 'machine', errors);
  const { id, initial, states: sourceStates } = original;
  if (typeof id !== 'string' || !IDENT.test(id)) errors.push('id must be a valid machine name');
  if (typeof initial !== 'string' || !IDENT.test(initial)) errors.push('initial must be a valid state name');
  if (!isRecord(sourceStates)) errors.push('states must be an object');
  const names = isRecord(sourceStates) ? Object.keys(sourceStates) : [];
  if (!names.length || names.length > 64) errors.push('declare 1-64 states');
  for (const name of names) {
    if (!IDENT.test(name) || ['__proto__', 'constructor', 'prototype'].includes(name)) errors.push('invalid state name ' + name);
  }
  if (typeof initial === 'string' && !names.includes(initial)) errors.push('initial does not name a state');
  const states = Object.create(null);
  const events = new Set();
  for (const name of names.slice(0, 64)) {
    const item = sourceStates[name];
    if (!isRecord(item)) { errors.push(`${name}: must be an object`); continue; }
    errorsForKeys(item, STATE_FIELDS, name, errors);
    if (item.type !== undefined && item.type !== 'final') errors.push(`${name}: only type 'final' is supported`);
    const on = Object.create(null);
    if (item.on !== undefined && !isRecord(item.on)) errors.push(`${name}: on must be an object`);
    else if (item.on) for (const [event, target] of Object.entries(item.on)) {
      if (!EVENT.test(event)) errors.push(`${name}: invalid event ${event}`);
      if (typeof target !== 'string' || !names.includes(target)) errors.push(`${name}: ${event} target ${String(target)} not found`);
      else if (EVENT.test(event)) { on[event] = target; events.add(event); }
    }
    if (item.type === 'final' && Object.keys(on).length) errors.push(`${name}: final state must have no events`);
    states[name] = { ...(item.type === 'final' ? { type: 'final' } : {}), ...(Object.keys(on).length ? { on } : {}) };
  }
  const reachable = new Set();
  function visit(name) {
    if (reachable.has(name) || !Object.hasOwn(states, name)) return;
    reachable.add(name);
    for (const target of Object.values(states[name].on || {})) visit(target);
  }
  if (names.includes(initial)) visit(initial);
  const transitions = [];
  for (const name of Object.keys(states)) {
    for (const [event, target] of Object.entries(states[name].on || {}))
      transitions.push({ from: name, event, to: target });
  }
  const deadEnds = names.filter(name => states[name] && !states[name].type && !Object.keys(states[name].on || {}).length);
  const unreachable = names.filter(name => !reachable.has(name));
  return {
    errors, spec: { id, initial, states }, states: names, events: [...events].sort(),
    unreachable, deadEnds, transitions, reachable: [...reachable],
  };
}
function validate(raw) {
  const info = parseSpec(raw);
  if (info.errors.length) throw new Error('Invalid machine: ' + info.errors.join('; '));
  return info;
}

/** Shortest deterministic event sequence to each reachable transition.
 * A planning artifact; not proof that game code responds to these events.
 */
export function transitionTestPlan(raw) {
  const info=validate(raw);
  const routes=new Map([[info.spec.initial,[]]]), queue=[info.spec.initial];
  for(let head=0;head<queue.length;head++){
    const from=queue[head], sequence=routes.get(from);
    const outgoing=Object.entries(info.spec.states[from].on||{}).sort(([a],[b])=>a<b?-1:a>b?1:0);
    for(const [event,target] of outgoing){
      if(routes.has(target))continue;
      routes.set(target,[...sequence,event]);queue.push(target);
    }
  }
  const testCases=[], unreachableTransitions=[];
  let reachableTransitions=0;
  const MAX_PLANS=160;
  for(const t of info.transitions){
    if(!routes.has(t.from)){unreachableTransitions.push(t);continue;}
    reachableTransitions++;
    if(testCases.length<MAX_PLANS)testCases.push({from:t.from,event:t.event,expectedState:t.to,
      events:[...routes.get(t.from),t.event]});
  }
  return {initial:info.spec.initial,testCases,unreachableStates:info.unreachable,unreachableTransitions,
    reachableTransitions,totalTransitions:info.transitions.length,coveredByPlan:testCases.length,
    truncated:reachableTransitions>testCases.length,nonFinalDeadEnds:info.deadEnds,
    note:'Shortest unit-level event traces, not runtime/gameplay evidence. Verify with xstate@5 and game controls.'};
}

function exportedIdentifier(slug) {
  return slug.replace(/-+([a-z0-9])/g, (_, ch) => ch.toUpperCase()).replace(/-+$/, '') + 'Machine';
}
async function absent(ctx, path) {
  try {
    await ctx.host('project.read', { path });
    throw new Error('Refusing to overwrite existing game file: ' + path);
  } catch (error) {
    const msg = String(error?.message || error);
    if (msg.startsWith('Refusing to overwrite')) throw error;
    if (!/ENOENT|no such file|not found|does not exist/i.test(msg))
      throw new Error('Cannot prove destination absent; refusing write: ' + msg);
  }
}
export function simulateMachine(raw, eventsJson) {
  const info = validate(raw);
  let eventSequence;
  try { eventSequence = JSON.parse(eventsJson); } catch { throw new Error('events must be a JSON array'); }
  if (!Array.isArray(eventSequence) || eventSequence.length > 500 || eventSequence.some(x => typeof x !== 'string' || !EVENT.test(x)))
    throw new Error('events must be an array of at most 500 event names');
  let state = info.spec.initial;
  const trace = [{ step: 0, state, event: null, accepted: true }];
  const covered = new Set();
  const entered = new Set([state]);
  for (const [index, event] of eventSequence.entries()) {
    const from = state;
    const next = info.spec.states[state]?.on?.[event];
    const stopped = info.spec.states[state]?.type === 'final';
    if (next && !stopped) {
      state = next;
      covered.add(JSON.stringify([from, event, next]));
      entered.add(state);
    }
    trace.push({ step: index + 1, event, from, to: state, state, accepted: !!next && !stopped });
  }
  return {
    initial: info.spec.initial, final: state, done: info.spec.states[state]?.type === 'final', trace,
    unreachable: info.unreachable, deadEnds: info.deadEnds,
    coverage: {
      visitedStates: [...entered], stateCount: info.states.length,
      exercisedTransitions: covered.size, totalTransitions: info.transitions.length,
      transitionPercent: info.transitions.length ? Math.round(100 * covered.size / info.transitions.length) : 100,
      missedTransitions: info.transitions.filter(t => !covered.has(JSON.stringify([t.from, t.event, t.to]))),
    },
  };
}
/** Load one root-level structured specification from the already bound game's worktree.
 * Read-only by design: panel text is never silently saved back into a project.
 */
async function loadProjectSpec(args, ctx) {
  if (!ctx?.project && !ctx?.directory) throw new Error('Open and bind a GENEX game before loading a file');
  const file = args?.file;
  if (typeof file !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,90}\.json$/.test(file) || file.includes('..'))
    throw new Error('Use a root-level JSON filename without directories, leading dots, or ..');
  stopped(ctx);
  const content = await ctx.host('project.read', {path: file});
  stopped(ctx);
  if (typeof content !== 'string' || Buffer.byteLength(content, 'utf8') > MAX_SPEC_BYTES)
    throw new Error('Game JSON file is not text or exceeds the 120 KB specification limit');
  validate(content);
  return {file, spec: content};
}
/** Side-effect-free GENEX API 3 plugin activation. */
export async function activate() {
  return {
    // Panel actions are read-only by contract; all writes remain separately consent-gated tools.
    async action(name, args, ctx) {
      if (name === 'load') return loadProjectSpec(args, ctx);
      if (name === 'inspect') {
        const r = parseSpec(args.spec);
        return { ok:r.errors.length === 0, errors:r.errors, states:r.states, events:r.events,
          unreachable:r.unreachable, deadEnds:r.deadEnds, finalStates:r.states.filter(state => r.spec.states[state]?.type === 'final'), transitions:r.transitions, reachable:r.reachable };
      }
      if (name === 'simulate') return simulateMachine(args.spec, args.events);
      if (name === 'testplan') return transitionTestPlan(args.spec);
      throw new Error('Unknown panel action '+name);
    },
    async tool(name, args, ctx) {
      if (name === 'inspect') {
        const r = parseSpec(args.spec);
        return { ok: r.errors.length === 0, errors: r.errors, states: r.states, events: r.events,
          unreachable: r.unreachable, deadEnds: r.deadEnds, transitions: r.transitions, reachable: r.reachable };
      }
      if (name === 'simulate') return simulateMachine(args.spec, args.events);
      if (name === 'testplan') return transitionTestPlan(args.spec);
      if (name === 'emit') {
        const info = validate(args.spec);
        const slug = args.slug;
        if (typeof slug !== 'string' || !SLUG.test(slug)) throw new Error('slug must be lowercase (1-40 characters, first a letter)');
        if (!ctx.project && !ctx.directory) throw new Error('Open and bind a GENEX game first');
        stopped(ctx);
        const filename = `genex-xstate-${slug}.generated.mjs`;
        const name = exportedIdentifier(slug);
        const code = `// Generated by GENEX XState Rulebook. Requires xstate@5 in this game.\nimport { createMachine } from 'xstate';\nexport const ${name} = createMachine(${JSON.stringify(info.spec, null, 2)});\nexport const ${name}Spec = ${JSON.stringify(info.spec, null, 2)};\n`;
        const result = await scopedWrite(ctx, filename, code);
        return { created: result.file, path: filename, export: name, requires: 'xstate@5', bytes: Buffer.byteLength(code),
          unreachable: info.unreachable, deadEnds: info.deadEnds };
      }
      throw new Error('Unknown tool ' + name);
    },
  };
}
