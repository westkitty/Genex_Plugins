/** Prebuild GENEX CSP-compatible HTML panels with the pinned, MIT-licensed Studio SDK. */
import {readFile,writeFile} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const source=join(root,'tools');
const projectCss=await readFile(join(source,'panels/project-load.css'),'utf8');
const [bridge,ui,css]=await Promise.all(['vendor/genex-panel.js','vendor/genex-ui.js','panels/base.css'].map(s=>readFile(join(source,s),'utf8')));
// Preserve the exact pinned SDK under tools/vendor; exclude its authoring-only header from shipped HTML.
const sdkHeader = '// Include this in a prebuilt panel. No credential values or arbitrary IPC are exposed.\n';
if (!bridge.startsWith(sdkHeader)) throw new Error('Pinned SDK header changed; review before embedding');
const compiledBridge = bridge.slice(sdkHeader.length);
for(const [name,slug] of [['ink-panel.html','ink-narrative'],['xstate-panel.html','xstate-rulebook']]){
 let html=await readFile(join(source,'panels',name),'utf8');
 if(!html.includes('<!-- STUDIO_PANEL_CSS -->')||!html.includes('<!-- STUDIO_PANEL_SDK -->'))throw new Error('Incomplete panel template '+name);
 html=html.replace('<!-- STUDIO_PANEL_CSS -->',css+'\n'+projectCss)
   .replace('<!-- STUDIO_PANEL_SDK -->',`<script>\n${compiledBridge}\n${ui}\n</script>`);
 await writeFile(join(root,'plugins',slug,'panel.html'),html,'utf8');
}

// Two read-only diagnostic consoles keep native-code execution behind GENEX's confirmed probe action.
const browserTemplate=await readFile(join(source,'panels','browser-panel.html'),'utf8');
const browsers=[
 {slug:'playwright-game-tester',title:'Browser Test Console',category:'PLAYWRIGHT',description:'Check the locally configured browser-testing server before an agent begins testing player controls, screenshots and browser errors.',limit:'Direct navigation is constrained to the selected local origin. Redirects, links and subresource requests are not an OS network sandbox. Never reuse a sensitive browser profile.'},
 {slug:'spector-frame-inspector',title:'WebGL Capture Console',category:'SPECTOR',description:'Verify the local WebGL debugging server before capturing draw calls, shaders, textures and frame evidence from a running game.',limit:'A successful MCP handshake is not proof of GPU frame capture. Run a real WebGL scene and inspect its captured evidence before treating a graphics defect as fixed.'},
];
for(const item of browsers){
 let html=browserTemplate.replaceAll('__PANEL_TITLE__',item.title).replaceAll('__PANEL_CATEGORY__',item.category)
   .replaceAll('__PANEL_DESCRIPTION__',item.description).replaceAll('__PANEL_LIMIT__',item.limit)
   .replace('<!-- OPTIONAL_CANVAS_SETTING -->\n', item.slug==='playwright-game-tester'
      ? '<div class="node"><strong>Canvas pointer input</strong><small id="pointer-mode">Reading settings…</small></div>\n'
      : '')
   .replace('<!-- OPTIONAL_CANVAS_CODE -->', item.slug==='playwright-game-tester' ? "const pointer=$('pointer-mode');if(pointer)pointer.textContent=data['canvas-pointer-input']?'Enabled — requests Playwright vision tools for canvas movement and drag':'Disabled — baseline DOM testing only';" : '')
   .replace('<!-- STUDIO_PANEL_CSS -->',css)
   .replace('<!-- STUDIO_PANEL_SDK -->',`<script>\n${compiledBridge}\n${ui}\n</script>`);
 await writeFile(join(root,'plugins',item.slug,'panel.html'),html,'utf8');
}
