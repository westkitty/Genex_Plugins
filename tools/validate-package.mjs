#!/usr/bin/env node
/** Conservative, independent GENEX API 3 manifest validation; not the official GENEX plugin:doctor. */
import {readFile, lstat, readdir} from 'node:fs/promises';
import {join,resolve,sep} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(process.argv[2]||'');
const ID=/^[a-z][a-z0-9-]{0,47}$/;
const MCP=/^[a-z][a-z0-9-]{0,31}$/;
const semver=/^\d+\.\d+\.\d+$/;
const validCapabilities=new Set(['settings','project.read','project.write','credentials','external-auth','observe','jobs','network','export','native-runtime']);
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const relative=x=>typeof x==='string'&&!!x&&x.split('/').every(s=>s!=='.'&&s!=='..'&&!s.startsWith('.'))&& !x.startsWith('/') && !x.includes('\\');
async function walk(root){for(const ent of await readdir(root,{withFileTypes:true})){const p=join(root,ent.name),s=await lstat(p);assert.ok(s.isDirectory()||s.isFile(),'No special files '+p);assert.equal(s.isSymbolicLink(),false,'No links '+p);if(s.isDirectory())await walk(p);}}
async function exists(path){const s=await lstat(path);assert.ok(s.isFile());}
await walk(root);
const j=JSON.parse(await readFile(join(root,'plugin.json'),'utf8'));
assert.equal(j.apiVersion,3);assert.match(j.id,ID);assert.match(j.version,semver);
assert.ok(typeof j.name==='string'&&typeof j.publisher==='string'&&typeof j.description==='string');
for(const n of ['capabilities','tools','skills','panels','settings','actions'])assert.ok(Array.isArray(j[n]),n+' must be array');
for(const cap of j.capabilities)assert.ok(validCapabilities.has(cap),'Unknown capability '+cap);
assert.ok(relative(j.backend));await exists(join(root,j.backend));
let names=new Set();for(const tool of j.tools){assert.match(tool.name,ID);assert.equal(names.has(tool.name),false);names.add(tool.name);assert.ok(object(tool.parameters));assert.equal(tool.parameters.type,'object');assert.ok(object(tool.parameters.properties));for(const [key,p] of Object.entries(tool.parameters.properties))assert.ok(['string','number','boolean','object'].includes(p.type));for(const k of tool.parameters.required||[])assert.ok(Object.hasOwn(tool.parameters.properties,k));if(tool.confirmation)assert.ok(tool.confirmation.length<=300);}
names=new Set();for(const set of j.settings){assert.match(set.key,ID);assert.equal(names.has(set.key),false);names.add(set.key);assert.ok(['string','number','boolean'].includes(set.type));assert.equal(typeof set.default,set.type);}
// Validate the newly contributed user action and toolbar surfaces, not just tools/MCP.
const actionIds=new Set();
for(const action of j.actions){
 assert.match(action.name,ID);assert.ok(!actionIds.has(action.name),'Duplicate action name');
 actionIds.add(action.name);assert.ok(typeof action.label==='string'&&action.label.length>0&&action.label.length<=120);
 if(action.confirmation!==undefined)assert.ok(typeof action.confirmation==='string'&&action.confirmation.length>0&&action.confirmation.length<=300);
}
assert.ok(!j.toolbar||j.toolbar.length<=4,'At most four toolbar buttons');
const toolbarIds=new Set(),toolbarLabels=new Set(),toolbarAria=new Set();
const reserved=new Set(['retry','ready','live','builds','assets','export','plugins','reload','state','close plugins']);
for(const item of j.toolbar||[]){
 assert.match(item.id,ID);assert.ok(!toolbarIds.has(item.id));toolbarIds.add(item.id);
 assert.ok(typeof item.label==='string'&&item.label.length>0&&item.label.length<=24&&!reserved.has(item.label.toLowerCase()));
 assert.ok(!toolbarLabels.has(item.label.toLowerCase()));toolbarLabels.add(item.label.toLowerCase());
 assert.ok(typeof item.ariaLabel==='string'&&item.ariaLabel.length>0&&item.ariaLabel.length<=60);
 assert.ok(!toolbarAria.has(item.ariaLabel.toLowerCase()));toolbarAria.add(item.ariaLabel.toLowerCase());
 assert.ok(item.requiresProject===undefined||typeof item.requiresProject==='boolean');
 assert.ok(item.target?.kind==='action'||item.target?.kind==='panel');
 if(item.target.kind==='action')assert.ok(actionIds.has(item.target.name),'Toolbar action must exist');
 else assert.ok(j.panels.some(x=>x.id===item.target.id),'Toolbar panel must exist');
}
// Host-relevant panel/icon checks. These were missing from the earlier local doctor surrogate.
const officialIcons=new Set(['globe','export','play','image','box','boxes']);
for(const item of j.toolbar||[]){assert.ok(item.icon===undefined||(typeof item.icon==='string'&&(item.icon.length<=4||officialIcons.has(item.icon))),'Unsupported toolbar icon '+item.icon);}
const panelIds=new Set();
for(const panel of j.panels){
 assert.match(panel.id,ID);assert.ok(!panelIds.has(panel.id),'Duplicate panel '+panel.id);panelIds.add(panel.id);
 assert.ok(typeof panel.title==='string'&&panel.title.length>0&&panel.title.length<=120);
 assert.ok(['project','settings'].includes(panel.placement));assert.ok(relative(panel.file));await exists(join(root,panel.file));
 const html=await readFile(join(root,panel.file),'utf8');
 assert.match(html,/<html\s/i);assert.match(html,/studio-plugin-request/);
 assert.doesNotMatch(html,/<(?:script|link)\s[^>]*(?:src|href)\s*=/i,'External panel scripts/styles disallowed');
 assert.doesNotMatch(html,/<!-- STUDIO_PANEL_/,'Panels must include prebuilt SDK');
}
if(j.icon!==undefined){
 assert.ok(relative(j.icon)&&/\.(?:svg|png|jpg|jpeg|webp)$/i.test(j.icon));await exists(join(root,j.icon));
 const image=await readFile(join(root,j.icon));assert.ok(image.length<=512*1024);
 if(j.icon.endsWith('.svg')){
  const svg=image.toString();assert.match(svg,/^<svg\s/i);assert.doesNotMatch(svg,/<script|<foreignObject|\s(?:href|xlink:href)=/i);
 }
}
for(const skill of j.skills){assert.match(skill.name,ID);if(skill.file){assert.ok(relative(skill.file)&&skill.file.endsWith('.md'));await exists(join(root,skill.file));assert.ok(skill.summary?.length>0&&skill.summary.length<=300);}}
for(const m of j.mcpServers||[]){assert.match(m.id,ID);assert.match(j.id+'-'+m.id,MCP);assert.equal(m.transport,'stdio');assert.equal(m.command,'node');assert.equal(m.cwd,'storage:project');assert.ok(relative(m.args[0]));await exists(join(root,m.args[0]));for(const s of m.requires?.settings||[])assert.ok(j.settings.some(x=>x.key===s));for(const [k,v] of Object.entries(m.env||{})){assert.match(k,/^[A-Z_][A-Z0-9_]*$/);if(v.startsWith('setting:'))assert.ok(j.settings.some(s=>s.key===v.slice(8)));}assert.ok(m.maxTools<=64);}
for(const n of ['network','settings']){if(n==='network'&&j[n])assert.ok(j[n].hosts.every(x=>/^[a-z0-9.\-]+$/i.test(x)));}
process.stdout.write('LOCAL MANIFEST CHECK PASS: '+j.id+' '+j.version+'\n');
