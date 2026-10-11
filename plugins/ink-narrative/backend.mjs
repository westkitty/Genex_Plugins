/* Ink authoring + optional compiler. No external package required for authoring. */
import { isAbsolute, basename, join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdtemp, readFile, writeFile, rm, stat } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const runFile = promisify(execFile);
const NAME = /^[a-z][a-z0-9_]{0,39}$/;
const SLUG = /^[a-z][a-z0-9-]{0,39}$/;
const MAX=120000;
const activeWrites = new Set();
const ROOT_KEYS = new Set(['start','title','variables','knots']);
const KNOT_KEYS = new Set(['id','paragraphs','choices']);
const CHOICE_KEYS = new Set(['text','target']);
function stopped(ctx) {
  if (ctx?.signal?.aborted) throw new Error('GENEX operation cancelled before project mutation');
}
function extraKeys(obj,allowed,place,errors) {
  for (const key of Object.keys(obj)) if (!allowed.has(key)) errors.push(`${place}: unsupported property ${key}`);
}

async function scopedWrite(ctx,path,task) {
  const key = (ctx.directory||ctx.project||'unbound')+'::'+path;
  if(activeWrites.has(key))throw new Error('Another plugin write is in progress for '+path);
  activeWrites.add(key);
  try{stopped(ctx);return await task();}finally{activeWrites.delete(key);}
}
function plainObject(x) {return x!==null&&typeof x==='object'&&!Array.isArray(x);}
function safeLine(x,where) {
  if(typeof x!=='string'||!x.trim()||x.length>1000||/[\x00-\x1f\x7f]/.test(x)||/^\s*(?:VAR\b|CONST\b|LIST\b|INCLUDE\b|EXTERNAL\b|=|[-+*~#])/i.test(x)||/->|\/\/|\/\*|\*\/|[#{}<>]/.test(x))
    throw new Error(`Invalid plain narrative text in ${where}: Ink syntax/directives must be modeled explicitly`);
  return x;
}
function safeChoice(text,where) {
  if(typeof text!=='string'||!text.trim()||text.length>240||/[\[\]\x00-\x1f\x7f]/.test(text)||/^\s*(?:[-+*~#]|=)/.test(text)||/->|\/\/|\/\*|\*\/|[#{}<>]/.test(text))
    throw new Error(`Invalid plain choice text in ${where}: unsupported Ink syntax`);
  return text;
}
function storyInfo(json) {
  if(typeof json!=='string'||Buffer.byteLength(json)>MAX) throw new Error('Story must be JSON text up to 120 KB');
  let p;try{p=JSON.parse(json)}catch{throw new Error('Invalid story JSON')}
  if(!plainObject(p)) throw new Error('Story must be an object');
  const errors=[];
  extraKeys(p,ROOT_KEYS,'story',errors);
  if(p.title!==undefined && (typeof p.title!=='string'||!p.title.trim()||p.title.length>200||/[\r\n\0]/.test(p.title)))
    errors.push('title must be plain single-line text, 1-200 characters');
  const knots=[];
  if(!Array.isArray(p.knots)||p.knots.length===0||p.knots.length>80) errors.push('knots must have 1-80 entries');
  const seen=new Set();
  for(const k of Array.isArray(p.knots)?p.knots.slice(0,80):[]) {
    if(!plainObject(k)||typeof k.id!=='string'||!NAME.test(k.id)||seen.has(k.id)) {errors.push('Invalid or duplicate knot id');continue;}
    extraKeys(k,KNOT_KEYS,`knot ${k.id}`,errors);
    seen.add(k.id);
    const paragraphs=[];
    if(!Array.isArray(k.paragraphs)||k.paragraphs.length<1||k.paragraphs.length>25) errors.push(`${k.id}: expected 1-25 paragraphs`);
    else for(const [i,s] of k.paragraphs.entries()) try{paragraphs.push(safeLine(s,`${k.id}.paragraphs[${i}]`))}catch(e){errors.push(e.message)}
    const choices=[];
    if(!Array.isArray(k.choices)||k.choices.length>12) errors.push(`${k.id}: expected up to 12 choices`);
    else for(const [choiceIndex,c] of k.choices.entries()) {
      if (!plainObject(c)) { errors.push(`${k.id}: choice ${choiceIndex} must be an object`); continue; }
      extraKeys(c,CHOICE_KEYS,`${k.id}.choices[${choiceIndex}]`,errors);
      try { safeChoice(c.text,`${k.id}.choices[${choiceIndex}]`); } catch(e) { errors.push(e.message); continue; }
      if(typeof c.target!=='string'||(c.target!=='END'&&!NAME.test(c.target))) errors.push(`${k.id}: invalid choice target`);
      else choices.push({text:c.text,target:c.target});
    }
    knots.push({id:k.id,paragraphs,choices});
  }
  if(typeof p.start!=='string'||!seen.has(p.start)) errors.push('start must name a knot');
  for(const k of knots) for(const c of k.choices) if(c.target!=='END'&&!seen.has(c.target)) errors.push(`${k.id}: choice target ${c.target} does not exist`);
  const variables={};
  if(p.variables!==undefined){
    if(!plainObject(p.variables)||Object.keys(p.variables).length>40) errors.push('variables must be object with <=40 entries');
    else for(const [key,value] of Object.entries(p.variables)) {
      if(!NAME.test(key)||['__proto__','constructor','prototype'].includes(key)||!(['boolean','number','string'].includes(typeof value))||(typeof value==='number'&&!Number.isFinite(value))||(typeof value==='string'&&value.length>200)) errors.push('Invalid variable '+key);
      else variables[key]=value;
    }
  }
  const reached=new Set();
  const visit=(id)=>{if(reached.has(id)||id==='END')return;reached.add(id);for(const c of knots.find(k=>k.id===id)?.choices||[])visit(c.target)};
  if(seen.has(p.start))visit(p.start);
  const unreachable=knots.filter(k=>!reached.has(k.id)).map(k=>k.id);
  const terminalKnots=knots.filter(k=>k.choices.length===0).map(k=>k.id);
  const choiceCount=knots.reduce((sum,k)=>sum+k.choices.length,0);
  const warnings=Object.keys(variables).length
    ? ['Variables are declarations only: this structured subset has no choice guards or variable mutations. Use the full Ink language and inklecate for those features.']
    : [];
  return {errors, story:{title:typeof p.title==='string'?p.title:'Untitled',start:p.start,variables,knots},unreachable,warnings,
    metrics:{reachableKnots:reached.size,totalKnots:knots.length,choiceCount,terminalKnots,ends:knots.reduce((sum,k)=>sum+k.choices.filter(c=>c.target==='END').length,0)}};
}
function good(raw){const r=storyInfo(raw);if(r.errors.length)throw new Error(r.errors.join('; '));return r;}
function inkSource(story){
  const lines=[`// ${story.title.replace(/[\r\n]/g,' ')}`];
  for(const [name,val] of Object.entries(story.variables)) lines.push(`VAR ${name} = ${JSON.stringify(val)}`);
  lines.push('',`-> ${story.start}`,'');
  for(const k of story.knots){
    lines.push(`=== ${k.id} ===`,...k.paragraphs);
    for(const c of k.choices)lines.push(`+ [${c.text}] -> ${c.target}`);
    if(!k.choices.length)lines.push('-> END');
    lines.push('');
  }
  return lines.join('\n');
}
function simulate(raw, choicesJson) {
  const {story,unreachable}=good(raw);
  let choices;try{choices=JSON.parse(choicesJson)}catch{throw new Error('choices must be a JSON array')}
  if(!Array.isArray(choices)||choices.length>100||choices.some(x=>!Number.isInteger(x)||x<0)) throw new Error('choices must be 0-based nonnegative integers, <=100 entries');
  let current=story.start;const visited=[];
  for(let index=0;index<=choices.length;index++){
    if(current==='END'){
      if(index!==choices.length)throw new Error('Choice trace contains unused decisions after the story ended');
      return{finished:true,visited,unreachable};
    }
    const knot=story.knots.find(k=>k.id===current);
    if(!knot)throw new Error('Missing knot '+current);
    const entry={knot:knot.id,paragraphs:knot.paragraphs,choices:knot.choices};
    visited.push(entry);
    if(knot.choices.length===0){
      if(index!==choices.length)throw new Error('Choice trace contains unused decisions after the story ended');
      return{finished:true,visited,unreachable};
    }
    if(index===choices.length)return{finished:false,waitingAt:current,options:knot.choices,visited,unreachable};
    const option=knot.choices[choices[index]];
    if(!option)throw new Error(`Choice ${choices[index]} out of range at ${current}`);
    entry.chosen=option.text;
    current=option.target;
  }
  throw new Error('Choice trace exceeded 100');
}

/** Derive executable input traces from the same graph semantics used by simulate().
 * This is not proof that an Ink runtime has played the story.
 */
function routePlan(raw) {
  const {story,unreachable}=good(raw);
  const byId=new Map(story.knots.map(k=>[k.id,k]));
  const shortest=new Map([[story.start,[]]]);
  const queue=[story.start];
  for(let head=0;head<queue.length;head++){
    const id=queue[head], knot=byId.get(id), base=shortest.get(id);
    for(let i=0;i<knot.choices.length;i++){
      const target=knot.choices[i].target;
      if(target==='END'||shortest.has(target))continue;
      shortest.set(target,[...base,i]);queue.push(target);
    }
  }
  const live=[...shortest.keys()], terminalRoutes=[], testCases=[];
  let terminalRouteCount=0;
  const MAX_PLANS=160;
  let reachableChoices=0;
  for(const id of live){
    const knot=byId.get(id), base=shortest.get(id);
    if(knot.choices.length===0){terminalRouteCount++;if(terminalRoutes.length<MAX_PLANS)terminalRoutes.push({kind:'terminal-knot',knot:id,choices:base});}
    for(let i=0;i<knot.choices.length;i++){
      const choice=knot.choices[i], decisions=[...base,i];
      reachableChoices++;
      if(testCases.length<MAX_PLANS) testCases.push({from:id,index:i,text:choice.text,target:choice.target,choices:decisions});
      if(choice.target==='END'){terminalRouteCount++;if(terminalRoutes.length<MAX_PLANS)terminalRoutes.push({kind:'explicit-end',knot:id,choices:decisions});}
    }
  }
  const reverse=new Map(story.knots.map(k=>[k.id,[]]));
  const canEnd=new Set(story.knots.filter(k=>k.choices.length===0||k.choices.some(c=>c.target==='END')).map(k=>k.id));
  for(const knot of story.knots)for(const choice of knot.choices)if(choice.target!=='END')reverse.get(choice.target).push(knot.id);
  const endQueue=[...canEnd];
  for(let p=0;p<endQueue.length;p++)for(const preceding of reverse.get(endQueue[p]))if(!canEnd.has(preceding)){
    canEnd.add(preceding);endQueue.push(preceding);
  }
  // A node is marked cyclic only if it lies on a cycle, not merely if it can reach one.
  const cycleKnots=new Set();
  for(const start of live){
    const seen=new Set([start]), stack=[start];
    while(stack.length){
      const current=stack.pop();
      for(const {target} of byId.get(current).choices){
        if(target===start){cycleKnots.add(start);stack.length=0;break;}
        if(target!=='END'&&!seen.has(target)){seen.add(target);stack.push(target);}
      }
    }
  }
  return {start:story.start,unreachable,terminalRoutes,cycleKnots:live.filter(x=>cycleKnots.has(x)),
    trapKnots:live.filter(x=>!canEnd.has(x)),testCases,terminalRouteCount,terminalRoutesTruncated:terminalRoutes.length<terminalRouteCount,coverage:{reachableKnots:live.length,totalKnots:story.knots.length,
    reachableChoices,totalChoices:story.knots.reduce((n,k)=>n+k.choices.length,0),plannedChoices:testCases.length,
    truncated:reachableChoices>testCases.length},
    note:'Deterministic shortest input traces for the restricted structured story graph, not native Ink runtime proof.'};
}

async function absent(ctx,path){
  try{await ctx.host('project.read',{path});throw new Error('Refusing to overwrite existing game file: '+path)}
  catch(e){const m=String(e?.message||e);if(m.startsWith('Refusing to overwrite'))throw e;if(!/ENOENT|no such file|not found|does not exist/i.test(m))throw new Error('Cannot prove destination absent: '+m)}
}
function checkSource(text){
  if(typeof text!=='string'||!text.trim()||Buffer.byteLength(text)>MAX)throw new Error('Ink source must be nonempty text at most 120 KB');
  // Restricted on purpose: compiler runs in a transient temporary folder.
  if(/^\s*(?:INCLUDE|EXTERNAL)\b/im.test(text))throw new Error('INCLUDE and EXTERNAL directives are unsupported in this compiler tool');
}
function checkCompiler(path){
  if(!isAbsolute(path)||!/^inklecate(?:\.exe)?$/i.test(basename(path)))throw new Error('Configure the absolute path to an inklecate executable under plugin Settings');
}
async function compile(source,settings,signal){
  if(signal?.aborted) throw new Error('GENEX operation cancelled before compiler launch');
  const compiler=String(settings['inklecate-path']||'').trim();checkCompiler(compiler);
  const entry=await stat(compiler);if(!entry.isFile())throw new Error('inklecate executable must be a file');
  const temp=await mkdtemp(join(tmpdir(),'genex-ink-'));
  try {
    const input=join(temp,'story.ink'),output=join(temp,'story.ink.json');
    await writeFile(input,source,'utf8');
    const result=await runFile(compiler,['-o',output,input],{cwd:temp,timeout:30_000,maxBuffer:300_000,signal,
      env:{PATH:process.env.PATH||'',HOME:temp,TMPDIR:temp}});
    const content=await readFile(output,'utf8');
    if(Buffer.byteLength(content)>2_000_000)throw new Error('Compiler output >2 MB');
    const document=JSON.parse(content);
    if(!plainObject(document)) throw new Error('Compiler output is not a JSON object');
    if(signal?.aborted)throw new Error('GENEX operation cancelled after compilation');
    return {content,diagnostics:result.stdout.slice(0,3000)};
  }finally {await rm(temp,{recursive:true,force:true})}
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
  if (typeof content !== 'string' || Buffer.byteLength(content, 'utf8') > MAX)
    throw new Error('Game JSON file is not text or exceeds the 120 KB specification limit');
  good(content);
  return {file, story: content};
}
/** GENEX API 3 plugin activation; module import has no host side effects. */
export async function activate(){return{
  // Sandboxed panel actions can inspect, replay and preview. No project writes are exposed here.
  async action(name,args,ctx){
    if(name==='load')return loadProjectSpec(args,ctx);
    if(name==='inspect'){const r=storyInfo(args.story);return{ok:!r.errors.length,errors:r.errors,knots:r.story.knots.map(k=>k.id),unreachable:r.unreachable,metrics:r.metrics,warnings:r.warnings};}
    if(name==='preview'){const r=good(args.story);return {ink:inkSource(r.story),unreachable:r.unreachable,metrics:r.metrics,warnings:r.warnings};}
    if(name==='simulate')return simulate(args.story,args.choices);
    if(name==='routes')return routePlan(args.story);
    throw new Error('Unknown panel action '+name);
  },
  async tool(name,args,ctx){
    if(name==='inspect'){const r=storyInfo(args.story);return{ok:!r.errors.length,errors:r.errors,knots:r.story.knots.map(k=>k.id),unreachable:r.unreachable,metrics:r.metrics,warnings:r.warnings};}
    if(name==='preview'){const r=good(args.story);return {ink:inkSource(r.story),unreachable:r.unreachable,metrics:r.metrics,warnings:r.warnings};}
    if(name==='simulate')return simulate(args.story,args.choices);
    if(name==='routes')return routePlan(args.story);
    if(name==='write'){
      const {story,unreachable}=good(args.story);
      if(typeof args.slug!=='string'||!SLUG.test(args.slug))throw new Error('slug must be 1-40 lowercase letters/digits/hyphens starting with a letter');
      if(!ctx.project&&!ctx.directory)throw new Error('Open a GENEX game first');
      stopped(ctx);
      const path=`genex-ink-${args.slug}.generated.ink`;
      const text=inkSource(story);
      return scopedWrite(ctx,path,async()=>{await absent(ctx,path);stopped(ctx);const result=await ctx.host('project.write',{path,text});return{created:result.file,path,bytes:Buffer.byteLength(text),unreachable};});
    }
    if(name==='compile'){
      if(!ctx.project&&!ctx.directory)throw new Error('Open a GENEX game first');
      const path=args.source;
      if(typeof path!=='string'||!/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,90}\.ink$/.test(path)||path.includes('..'))throw new Error('Source must be a root-level .ink filename without ..');
      stopped(ctx);
      const text=await ctx.host('project.read',{path});checkSource(text);
      const output=path+'.json';
      return scopedWrite(ctx,output,async()=>{
        if(args.overwrite!==true)await absent(ctx,output);
        const settings=await ctx.host('settings.read');
        stopped(ctx);
        const done=await compile(text,settings,ctx.signal);
        stopped(ctx);
        const latestSource=await ctx.host('project.read',{path});
        if(latestSource!==text)throw new Error('Source changed during compilation; refusing to write stale Ink JSON');
        stopped(ctx);
        const written=await ctx.host('project.write',{path:output,text:done.content});
        return{compiled:written.file,source:path,bytes:Buffer.byteLength(done.content),compiler:'inklecate',diagnostics:done.diagnostics,overwritten:args.overwrite===true};
      });
    }
    throw new Error('Unknown tool '+name);
  }
}}
export {storyInfo,inkSource,simulate,routePlan};
