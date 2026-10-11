/** GENEX sandbox panel behavior against real backend actions through the pinned SDK bridge. */
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile,writeFile,mkdir,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {activate as activateInk} from '../plugins/ink-narrative/backend.mjs';
import {activate as activateXState} from '../plugins/xstate-rulebook/backend.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
class Node {
  constructor(tag='div',id='') {this.tagName=tag;this.id=id;this.textContent='';this.children=[];this.value='';this.disabled=false;this.className='';this.dataset={};this.attributes=new Map();this.onclick=null;this.listeners=new Map();}
  append(...children){this.children.push(...children);if(this.tagName==='select'&&!this.value&&children[0])this.value=children[0].value;}
  replaceChildren(...children){this.children=children;this.textContent='';if(this.tagName==='select')this.value=children[0]?.value||'';}
  setAttribute(name,value){this.attributes.set(name,String(value));}
  addEventListener(name,cb){this.listeners.set(name,cb);}
  trigger(name){this.listeners.get(name)?.();}
}
class Option extends Node {constructor(text,value){super('option');this.textContent=text;this.value=value;}}
const pause=()=>new Promise(r=>setTimeout(r,35));
async function panelHarness(slug,backend,settings={},projectFiles={}){
  const html=await readFile(join(root,'plugins',slug,'panel.html'),'utf8');
  const nodes=new Map();const listeners=new Map();const ctx={signal:new AbortController().signal,project:'sandbox-test',directory:'/test/game',
    async host(method,args){if(method==='settings.read')return settings;if(method==='project.read'){if(Object.hasOwn(projectFiles,args.path))return projectFiles[args.path];throw new Error('ENOENT: file not found');}throw new Error('Panel action crossed prohibited host boundary: '+method);}};
  const host=await backend();
  const document={getElementById(id){if(!nodes.has(id))nodes.set(id,new Node(id==='events'?'select':'div',id));return nodes.get(id);},createElement(tag){return new Node(tag);},createTextNode(text){const n=new Node('#text');n.textContent=text;return n;}};
  const source=[];
  const fakeWindow={
    addEventListener(name,fn){if(!listeners.has(name))listeners.set(name,[]);listeners.get(name).push(fn);},
    dispatch(name,ev){for(const fn of listeners.get(name)||[])fn(ev);},
  };
  const parent={postMessage(message){
    if(message.type!=='studio-plugin-request')throw new Error('Unexpected panel request');
    source.push({method:message.method,name:message.name});
    Promise.resolve().then(async()=>{
      if(message.method==='action')return await host.action(message.name,message.args,ctx);
      if(message.method==='context')return {project:'sandbox-test',apiVersion:3,theme:{}};
      if(message.method==='settings')return settings;
      throw new Error('Forbidden bridge method '+message.method);
    }).then(result=>fakeWindow.dispatch('message',{source:parent,data:{type:'studio-plugin-result',id:message.id,result}}),
      error=>fakeWindow.dispatch('message',{source:parent,data:{type:'studio-plugin-result',id:message.id,error:error.message}}));
  }};
  const browser=vm.createContext({document,parent,Option,console,setTimeout,clearTimeout,Map,Set,window:fakeWindow});
  browser.window=browser;
  browser.addEventListener=fakeWindow.addEventListener.bind(fakeWindow);
  // Make messages appear to originate from the parent as Studio's bridge expects.
  browser.dispatch=fakeWindow.dispatch.bind(fakeWindow);
  for(const [i,s] of [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].entries())
    vm.runInContext(s[1],browser,{filename:slug+':script-'+i,timeout:2000});
  const el=id=>document.getElementById(id);
  return {html,el,source,
    async click(id){let p=el(id).onclick?.();if(p&&typeof p.then==='function')await p;await pause();},
    async choose(index){let p=el('choices').children[index]?.onclick?.();if(p&&typeof p.then==='function')await p;await pause();},
    change(id,value){el(id).value=value;el(id).trigger('input');},
    close(){fakeWindow.dispatch('pagehide',{});}};
}
const sampleMachine=JSON.stringify({id:'simple',initial:'off',states:{off:{on:{START:'on'}},on:{on:{STOP:'off',END:'ended'}},ended:{type:'final'}}});
const sampleStory=JSON.stringify({start:'a',knots:[{id:'a',paragraphs:['A choice.'],choices:[{text:'Next',target:'b'}]},{id:'b',paragraphs:['The result.'],choices:[]}]});
test('GENEX panel bridge source mirrors reviewed upstream MIT SDK and panels contain no external resources',async()=>{
  const file=await readFile(join(root,'tools/vendor/genex-panel.js'));
  const sha=createHash('sha1').update(`blob ${file.length}\0`).update(file).digest('hex');
  assert.equal(sha,'35861b1176c2042187303a42cc07a7402cf83ebb');
  for(const slug of ['ink-narrative','xstate-rulebook']){
    const html=await readFile(join(root,'plugins',slug,'panel.html'),'utf8');
    assert.match(html,/studio-plugin-request/);assert.doesNotMatch(html,/<!-- STUDIO_PANEL/);
    assert.doesNotMatch(html,/<(?:script|link)\s[^>]*(?:src|href)\s*=/i);
    const normalized=file.toString().replace(/^\/\/ Include this in a prebuilt panel\. No credential values or arbitrary IPC are exposed\.\n/, '');
    assert.ok(html.includes(normalized),'Executable pinned SDK bridge must be present after exact comment-only normalization');
    assert.doesNotMatch(html,/Include this in a prebuilt panel/, 'Authoring-only comments must not ship in panel HTML');
  }
});
test('XState panel can inspect, step through real backend actions, reset and render shortest test paths',async()=>{
  const p=await panelHarness('xstate-rulebook',activateXState);
  try{
    p.change('spec',sampleMachine);await p.click('inspect');
    assert.match(p.el('readout').textContent,/off/);
    assert.ok(p.el('nodes').children.length>=3);
    assert.ok(p.el('metrics').children.length>=3);
    p.el('events').value='START';await p.click('advance');
    assert.match(p.el('readout').textContent,/on/);
    assert.ok(p.el('trace').children.length>=2);
    await p.click('reset');assert.match(p.el('readout').textContent,/off/);
    await p.click('plan');assert.match(p.el('raw').textContent,/testCases/);
    assert.ok(p.el('paths').children.length>0);await p.el('paths').children[0].onclick();await pause();
    assert.match(p.el('readout').textContent,/on/);
    assert.ok(p.source.some(x=>x.name==='testplan'));assert.ok(p.source.every(x=>x.method==='action'));
  } finally{p.close()}
});
test('Ink panel can inspect and traverse a branched story using real backend actions',async()=>{
  const p=await panelHarness('ink-narrative',activateInk);
  try{
    p.change('story',sampleStory);await p.click('inspect');
    assert.match(p.el('raw').textContent,/totalKnots/);
    await p.click('begin');assert.match(p.el('readout').textContent,/a/);
    assert.equal(p.el('choices').children.length,1);
    await p.choose(0);assert.match(p.el('readout').textContent,/END/);
    assert.match(p.el('scene').children.at(-1).textContent,/ends here/);
    await p.click('routes');assert.match(p.el('raw').textContent,/terminalRoutes/);
    assert.ok(p.el('paths').children.length>0);await p.el('paths').children[0].onclick();await pause();
    assert.match(p.el('readout').textContent,/END/);
    assert.ok(p.source.every(x=>x.method==='action'));
  } finally{p.close()}
});
test('Ink panel retains error status for invalid stories (not false success)',async()=>{
  const p=await panelHarness('ink-narrative',activateInk);
  try{
    p.change('story','{not json}');await p.click('inspect');
    assert.match(p.el('status').className,/error/);
    assert.match(p.el('status').textContent,/Invalid story JSON|Invalid/i);
  } finally{p.close()}
});
test('Both panels reject unsupported semantics and do not write game files',async()=>{
  for(const [slug,backend,id,key] of [['xstate-rulebook',activateXState,'spec','inspect'],['ink-narrative',activateInk,'story','inspect']]){
    const p=await panelHarness(slug,backend);
    try{p.change(id,JSON.stringify({unexpected:true}));await p.click(key);
      assert.match(p.el('status').className,/error/);
    }finally{p.close()}
  }
});

const echoMcp=String.raw`const rl=require('node:readline').createInterface({input:process.stdin});rl.on('line',s=>{const m=JSON.parse(s);if(m.id===undefined)return;const result=m.method==='initialize'?{protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:'fixture',version:'1'}}:m.method==='tools/list'?{tools:[{name:'browser_navigate'},{name:'browser_snapshot'},{name:'load_url'},{name:'capture_frame'}]}:{};process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:m.id,result})+'\n');});`;
for(const [slug,backend] of [['playwright-game-tester', (await import('../plugins/playwright-game-tester/backend.mjs')).activate],['spector-frame-inspector',(await import('../plugins/spector-frame-inspector/backend.mjs')).activate]]){
 test(slug+' setup panel verifies a reviewed entry then negotiates MCP through the REAL backend and proxy',async()=>{
   const temp=await mkdtemp(join(tmpdir(),'genex-panel-mcp-'));
   const file=slug==='playwright-game-tester'?join(temp,'playwright-mcp'):join(temp,'mcp','dist','index.js');
   await mkdir(join(file,'..'),{recursive:true});await writeFile(file,echoMcp);
   const digest=createHash('sha256').update(echoMcp).digest('hex');
   const p=await panelHarness(slug,backend,{'upstream-path':file,'upstream-sha256':digest,'allowed-origin':'http://127.0.0.1:5173'});
   try{
     await pause();assert.equal(p.el('upstream').textContent,file);
     await p.click('verify');assert.match(p.el('entry-status').className,/ok/);
     await p.click('probe');assert.match(p.el('readout').textContent,/Protocol ready/);
     assert.match(p.el('raw').textContent,/negotiatedProtocol/);
     assert.ok(p.source.some(x=>x.name==='probe'));
   }finally{p.close();await rm(temp,{recursive:true,force:true});}
 });
}
test('Ink panel guards rapid duplicate choice clicks while a replay is pending',async()=>{
  const p=await panelHarness('ink-narrative',activateInk);
  try{
    p.change('story',sampleStory);await p.click('begin');
    const choose=p.el('choices').children[0].onclick;
    const first=choose();const second=choose();
    await first;await second;await pause();
    assert.match(p.el('readout').textContent,/END/);
    assert.doesNotMatch(p.el('status').className,/error/);
    assert.equal(p.el('trace').children.length,1);
  }finally{p.close();}
});
test('State map distinguishes declared final states from nonfinal dead ends',async()=>{
 const p=await panelHarness('xstate-rulebook',activateXState);
 try{
  const spec=JSON.stringify({id:'ends',initial:'start',states:{start:{on:{WIN:'winner',STALL:'trap'}},winner:{type:'final'},trap:{}}});
  p.change('spec',spec);await p.click('inspect');
  const cards=p.el('nodes').children;
  const winner=cards.find(n=>n.children[0]?.textContent==='winner');
  const trap=cards.find(n=>n.children[0]?.textContent==='trap');
  assert.ok(winner);assert.ok(trap);
  assert.match(winner.className,/final/);
  assert.doesNotMatch(trap.className,/final/);
  assert.match(trap.children[1].textContent,/Dead end/);
 }finally{p.close()}
});
test('Hash mismatches require source review rather than encouraging a blind digest update',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'genex-hash-review-'));const file=join(dir,'playwright-mcp');await writeFile(file,'console.log(1);\n');
 const p=await panelHarness('playwright-game-tester',(await import('../plugins/playwright-game-tester/backend.mjs')).activate,{'upstream-path':file,'upstream-sha256':'0'.repeat(64),'allowed-origin':'http://127.0.0.1:5173'});
 try{await pause();await p.click('verify');assert.match(p.el('entry-status').className,/error/);assert.doesNotMatch(p.el('entry-status').textContent,/Copy detectedSha256/);assert.match(p.el('entry-status').textContent,/review/i);}
 finally{p.close();await rm(dir,{recursive:true,force:true});}
});

test('XState inspection awaits initial replay and preserves simulation errors',async()=>{
 const real=await activateXState();
 const backend=async()=>({...real,async action(name,args,ctx){
   if(name==='simulate')throw new Error('Injected initial-replay failure');
   return real.action(name,args,ctx);
 }});
 const p=await panelHarness('xstate-rulebook',backend);
 try{
   p.change('spec',sampleMachine);await p.click('inspect');
   assert.match(p.el('status').className,/error/);
   assert.match(p.el('status').textContent,/Initial replay failed/);
   assert.doesNotMatch(p.el('status').textContent,/inspected|complete/i);
 }finally{p.close();}
});

test('All four compiled HTML panels exactly match checked-in templates and pinned licensed SDK',async()=>{
 const vendor=await readFile(join(root,'tools/vendor/genex-panel.js'),'utf8');
 const ui=await readFile(join(root,'tools/vendor/genex-ui.js'),'utf8');
 const css=await readFile(join(root,'tools/panels/base.css'),'utf8');
 const projectCss=await readFile(join(root,'tools/panels/project-load.css'),'utf8');
 const normalized=vendor.replace(/^\/\/ Include this in a prebuilt panel\. No credential values or arbitrary IPC are exposed\.\n/, '');
 const sdk=`<script>\n${normalized}\n${ui}\n</script>`;
 const substitutions=[
  ['ink-narrative','ink-panel.html',{}],
  ['xstate-rulebook','xstate-panel.html',{}],
  ['playwright-game-tester','browser-panel.html',{
    '__PANEL_TITLE__':'Browser Test Console','__PANEL_CATEGORY__':'PLAYWRIGHT',
    '__PANEL_DESCRIPTION__':'Check the locally configured browser-testing server before an agent begins testing player controls, screenshots and browser errors.',
    '__PANEL_LIMIT__':'Direct navigation is constrained to the selected local origin. Redirects, links and subresource requests are not an OS network sandbox. Never reuse a sensitive browser profile.'}],
  ['spector-frame-inspector','browser-panel.html',{
    '__PANEL_TITLE__':'WebGL Capture Console','__PANEL_CATEGORY__':'SPECTOR',
    '__PANEL_DESCRIPTION__':'Verify the local WebGL debugging server before capturing draw calls, shaders, textures and frame evidence from a running game.',
    '__PANEL_LIMIT__':'A successful MCP handshake is not proof of GPU frame capture. Run a real WebGL scene and inspect its captured evidence before treating a graphics defect as fixed.'}]
 ];
 for(const [slug,template,variables] of substitutions){
   let expected=await readFile(join(root,'tools/panels',template),'utf8');
   for(const [key,value] of Object.entries(variables)) expected=expected.replaceAll(key,value);
   if(template==='browser-panel.html')expected=expected.replace('<!-- OPTIONAL_CANVAS_SETTING -->\n',slug==='playwright-game-tester'
     ? '<div class="node"><strong>Canvas pointer input</strong><small id="pointer-mode">Reading settings…</small></div>\n'
     : '');
   expected=expected.replace('<!-- OPTIONAL_CANVAS_CODE -->', slug==='playwright-game-tester' ? "const pointer=$('pointer-mode');if(pointer)pointer.textContent=data['canvas-pointer-input']?'Enabled — requests Playwright vision tools for canvas movement and drag':'Disabled — baseline DOM testing only';" : '');
   expected=expected.replace('<!-- STUDIO_PANEL_CSS -->',slug==='ink-narrative'||slug==='xstate-rulebook'?css+'\n'+projectCss:css).replace('<!-- STUDIO_PANEL_SDK -->',sdk);
   const actual=await readFile(join(root,'plugins',slug,'panel.html'),'utf8');
   assert.equal(actual,expected,slug+' compiled panel drift');
   assert.doesNotMatch(actual,/<script\b[^>]*\bsrc\s*=|<link\b[^>]*\bhref\s*=/i);
   const license=await readFile(join(root,'plugins',slug,'LICENSE.genex-sdk'),'utf8');
   assert.match(license,/MIT License/);
 }
});

test('Current package version and MCP client identity are consistent across all four plugins',async()=>{
 for(const slug of ['ink-narrative','xstate-rulebook','playwright-game-tester','spector-frame-inspector']){
   const manifest=JSON.parse(await readFile(join(root,'plugins',slug,'plugin.json'),'utf8'));
   assert.equal(manifest.version,'0.9.1');
   assert.equal(manifest.icon,'icon.svg');
   const image=await readFile(join(root,'plugins',slug,'icon.svg'),'utf8');
   assert.match(image,/^<svg\s/);
   if(slug.includes('playwright')||slug.includes('spector')){
     const probe=await readFile(join(root,'plugins',slug,'probe.mjs'),'utf8');
     assert.match(probe,/name:'genex-plugin-probe',version:'0.9.1'/);
   }
 }
});

test('Ink choice replay recovers from a temporary simulator failure without duplicating history', async () => {
  const real = await activateInk();
  let failOnce = true;
  const backend = async () => ({...real,
    action: async (name, args, ctx) => {
      if (name === 'simulate' && JSON.parse(args.choices).length && failOnce) {
        failOnce = false;
        throw new Error('Temporary simulator interruption');
      }
      return real.action(name, args, ctx);
    },
  });
  const p = await panelHarness('ink-narrative', backend);
  try {
    p.change('story', sampleStory);
    await p.click('begin');
    assert.match(p.el('readout').textContent, /a/);
    await p.choose(0);
    assert.match(p.el('status').textContent, /Temporary simulator interruption/);
    await p.choose(0);
    assert.equal(p.el('readout').textContent, 'END');
    assert.match(p.el('status').textContent, /completed/i);
  } finally { p.close(); }
});


test('XState panel reads a bound game JSON file into draft and can inspect it (no writes)', async () => {
  const p=await panelHarness('xstate-rulebook',activateXState,{}, {'battle-machine.json':sampleMachine});
  try {
    p.change('spec','Unsent draft'); p.el('project-file').value='battle-machine.json';
    await p.click('load-file');
    assert.equal(p.el('spec').value,sampleMachine);
    assert.match(p.el('status').textContent,/loaded/i);
    await p.click('inspect');assert.match(p.el('readout').textContent,/off/);
    assert.deepEqual(p.source.map(x=>x.name).slice(0,2),['load','inspect']);
  }finally{p.close()}
});
test('Ink panel reads project story JSON while keeping failed loads non-destructive', async () => {
  const p=await panelHarness('ink-narrative',activateInk,{}, {'station-story.json':sampleStory});
  try{
    p.change('story','A preserved draft');p.el('project-file').value='missing.json';
    await p.click('load-file');assert.equal(p.el('story').value,'A preserved draft');
    assert.match(p.el('status').className,/error/);
    p.el('project-file').value='station-story.json';await p.click('load-file');
    assert.equal(p.el('story').value,sampleStory);
    await p.click('begin');assert.match(p.el('readout').textContent,/a/);
    assert.ok(p.source.every(x=>x.method==='action'));
  }finally{p.close()}
});
test('XState failed route replay restores previous trace history before the next real event',async()=>{
  const actual=await activateXState();let failOnce=true;
  const backend=async()=>({...actual,async action(name,args,ctx){
    if(name==='simulate'&&JSON.parse(args.events).length&&failOnce){failOnce=false;throw new Error('Injected replay failure')}
    return actual.action(name,args,ctx);
  }});
  const p=await panelHarness('xstate-rulebook',backend);
  try{
    p.change('spec',sampleMachine);await p.click('inspect');await p.click('plan');
    await p.el('paths').children[0].onclick();await pause();
    assert.match(p.el('status').className,/error/);
    p.el('events').value='START';await p.click('advance');
    assert.equal(p.el('trace').children.length,2);
    assert.match(p.el('readout').textContent,/on/);
  }finally{p.close()}
});

test('game file load cannot overwrite a draft edited while the read is in flight', async()=>{
  const actual=await activateXState();let fulfill,requested;
  const backend=async()=>({...actual,async action(name,args,ctx){
    if(name==='load'){requested=args.file;return new Promise(resolve=>{fulfill=()=>resolve({file:args.file,spec:sampleMachine})})}
    return actual.action(name,args,ctx);
  }});
  const p=await panelHarness('xstate-rulebook',backend);
  try{
    p.el('project-file').value='game-rules.json';const pending=p.click('load-file');
    await pause();assert.equal(requested,'game-rules.json');
    p.change('spec','My unsaved newer text');fulfill();await pending;
    assert.equal(p.el('spec').value,'My unsaved newer text');
  }finally{p.close()}
});

// v0.7.1 regression-first: generated path coverage must be browseable, not silently hidden after 12.
test('XState panel exposes every generated test path beyond the first twelve', async()=>{
 const on=Object.fromEntries(Array.from({length:16},(_,i)=>['T'+String(i).padStart(2,'0'),'end']));
 const spec=JSON.stringify({id:'wide',initial:'start',states:{start:{on},end:{type:'final'}}});
 const p=await panelHarness('xstate-rulebook',activateXState);
 try{p.change('spec',spec);await p.click('inspect');await p.click('plan');
  assert.equal(p.el('paths').children.length,12);
  assert.match(p.el('paths-summary').textContent,/16/);
  await p.click('paths-next');
  assert.equal(p.el('paths').children.length,4);
  await p.el('paths').children[0].onclick();await pause();
  assert.match(p.el('trace').children.at(-1).textContent,/T12/);
 }finally{p.close()}
});

test('Ink panel exposes replayable ending paths after the first twelve', async()=>{
 const knots=[{id:'start',paragraphs:['Start.'],choices:['a','b','c'].map(x=>({text:x,target:x}))}];
 for(const id of ['a','b','c']) knots.push({id,paragraphs:[id],choices:Array.from({length:6},(_,i)=>({text:'Leave '+i,target:'END'}))});
 const p=await panelHarness('ink-narrative',activateInk);
 try{p.change('story',JSON.stringify({start:'start',knots}));await p.click('routes');
  assert.equal(p.el('paths').children.length,12);
  assert.match(p.el('paths-summary').textContent,/18/);
  await p.click('paths-next');assert.equal(p.el('paths').children.length,6);
  await p.el('paths').children[0].onclick();await pause();
  assert.match(p.el('trace').children.map(c=>c.textContent).join(' '),/c/);
  assert.equal(p.el('readout').textContent,'END');
 }finally{p.close()}
});

test('XState failed reset preserves prior event history for the next event',async()=>{
 const actual=await activateXState();let failNext=false;
 const backend=async()=>({...actual,async action(name,args,ctx){
  if(name==='simulate'&&failNext){failNext=false;throw new Error('Fixture simulation interruption')}
  return actual.action(name,args,ctx);
 }});
 const spec=JSON.stringify({id:'reset',initial:'off',states:{off:{on:{START:'on'}},on:{on:{END:'done'}},done:{type:'final'}}});
 const p=await panelHarness('xstate-rulebook',backend);
 try{p.change('spec',spec);await p.click('inspect');p.el('events').value='START';await p.click('advance');
  assert.equal(p.el('readout').textContent,'on');failNext=true;await p.click('reset');
  assert.match(p.el('status').className,/error/);
  p.el('events').value='END';await p.click('advance');
  assert.match(p.el('readout').textContent,/done/);
 }finally{p.close()}
});

test('Ink failed restart preserves choices and next valid continuation',async()=>{
 const actual=await activateInk();let failNext=false;
 const backend=async()=>({...actual,async action(name,args,ctx){
  if(name==='simulate'&&failNext){failNext=false;throw new Error('Fixture story interruption')}
  return actual.action(name,args,ctx);
 }});
 const story=JSON.stringify({start:'a',knots:[{id:'a',paragraphs:['A.'],choices:[{text:'Go',target:'b'}]},
  {id:'b',paragraphs:['B.'],choices:[{text:'Finish',target:'END'}]}]});
 const p=await panelHarness('ink-narrative',backend);
 try{p.change('story',story);await p.click('begin');await p.choose(0);
  assert.equal(p.el('readout').textContent,'b');failNext=true;await p.click('reset');
  assert.match(p.el('status').className,/error/);
  await p.choose(0);assert.equal(p.el('readout').textContent,'END');
 }finally{p.close()}
});

test('Ink route explorer exposes nonterminating branch cases instead of an empty ending-only list',async()=>{
 const story=JSON.stringify({start:'loop',knots:[{id:'loop',paragraphs:['The signal repeats.'],choices:[{text:'Listen again',target:'loop'}]}]});
 const p=await panelHarness('ink-narrative',activateInk);
 try{p.change('story',story);await p.click('routes');
  assert.match(p.el('raw').textContent,/trapKnots/);
  assert.match(p.el('paths-summary').textContent,/branch|cycle/i);
  assert.equal(p.el('paths').children.length,1);
  await p.el('paths').children[0].onclick();await pause();
  assert.match(p.el('trace').children[0].textContent,/Listen again/);
 }finally{p.close()}
});

test('XState plan surface discloses truncated test coverage over 160 edges',async()=>{
 const on=Object.fromEntries(Array.from({length:161},(_,i)=>['E'+String(i).padStart(3,'0'),'end']));
 const spec=JSON.stringify({id:'many',initial:'start',states:{start:{on},end:{type:'final'}}});
 const p=await panelHarness('xstate-rulebook',activateXState);
 try{p.change('spec',spec);await p.click('inspect');await p.click('plan');
  assert.match(p.el('raw').textContent,/"truncated": true/);
  assert.match(p.el('paths-summary').textContent,/truncated|160 of 161/i);
 }finally{p.close()}
});

test('Ink route mode buttons switch between branch and ending coverage with accessible pressed state',async()=>{
 const story=JSON.stringify({start:'a',knots:[
  {id:'a',paragraphs:['A.'],choices:[{text:'Loop',target:'a'},{text:'End',target:'END'}]},
 ]});
 const p=await panelHarness('ink-narrative',activateInk);
 try{p.change('story',story);await p.click('routes');
  assert.equal(p.el('paths').children.length,1);
  assert.equal(p.el('paths-endings').attributes.get('aria-pressed'),'true');
  await p.click('paths-branches');
  assert.equal(p.el('paths').children.length,2);
  assert.equal(p.el('paths-endings').attributes.get('aria-pressed'),'false');
  assert.equal(p.el('paths-branches').attributes.get('aria-pressed'),'true');
  await p.click('paths-endings');
  assert.equal(p.el('paths').children.length,1);
  assert.equal(p.el('paths-endings').attributes.get('aria-pressed'),'true');
 }finally{p.close()}
});

test('Replayable Ink route controls visibly disable while a simulation is pending', async()=>{
 const actual=await activateInk();let release;
 const backend=async()=>({...actual,async action(name,args,ctx){
   if(name==='simulate')return new Promise(resolve=>{release=async()=>resolve(await actual.action(name,args,ctx));});
   return actual.action(name,args,ctx);
 }});
 const p=await panelHarness('ink-narrative',backend);
 try{p.change('story',sampleStory);await p.click('routes');
  const btn=p.el('paths').children[0];const pending=btn.onclick();
  assert.equal(btn.disabled,true,'The live route button must expose its pending state');
  assert.equal(p.el('paths-prev').disabled,true);
  assert.equal(p.el('paths-endings').disabled,true);
  await pause();assert.equal(typeof release,'function');await release();await pending;
  assert.equal(btn.disabled,false);
 }finally{p.close()}
});

test('XState test-path buttons and pagination expose pending simulation state',async()=>{
 const actual=await activateXState();let release;
 const backend=async()=>({...actual,async action(name,args,ctx){
  if(name==='simulate'&&JSON.parse(args.events).length>0)return new Promise(resolve=>{release=async()=>resolve(await actual.action(name,args,ctx));});
  return actual.action(name,args,ctx);
 }});
 const p=await panelHarness('xstate-rulebook',backend);
 try{p.change('spec',sampleMachine);await p.click('inspect');await p.click('plan');
  const path=p.el('paths').children[0];const pending=path.onclick();
  assert.equal(path.disabled,true);
  assert.equal(p.el('paths-prev').disabled,true);
  assert.equal(p.el('paths-next').disabled,true);
  await pause();assert.equal(typeof release,'function');await release();await pending;
  assert.equal(path.disabled,false);
 }finally{p.close()}
});

test('Playwright setup console exposes honest opt-in canvas input mode; Spector remains capture-only', async()=>{
 const play=await panelHarness('playwright-game-tester',(await import('../plugins/playwright-game-tester/backend.mjs')).activate,
   {'canvas-pointer-input':true,'upstream-path':'','allowed-origin':'http://127.0.0.1:5173'});
 const spector=await panelHarness('spector-frame-inspector',(await import('../plugins/spector-frame-inspector/backend.mjs')).activate,{});
 try{
   await pause();
   assert.match(play.html,/id="pointer-mode"/);
   assert.match(play.el('pointer-mode').textContent,/Enabled/);
   assert.match(play.el('pointer-mode').textContent,/vision tools/);
   assert.doesNotMatch(spector.html,/id="pointer-mode"/);
   assert.doesNotMatch(spector.html,/canvas-pointer-input|vision tools/);
 }finally{play.close();spector.close();}
});
