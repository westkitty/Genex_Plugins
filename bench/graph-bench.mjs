import { performance } from 'node:perf_hooks';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
const root = resolve(process.argv[2] || '.');
const ink = await import(pathToFileURL(join(root, 'plugins/ink-narrative/backend.mjs')).href);
const xst = await import(pathToFileURL(join(root, 'plugins/xstate-rulebook/backend.mjs')).href);
function story(n, out=12, textLen=600) {
  const knots=[];
  for(let i=0;i<n;i++) knots.push({id:'k'+i,paragraphs:['A'.repeat(textLen)],choices:Array.from({length:out},(_,j)=>({text:`Branch ${j} in ${i}`,target:'k'+((i+j+1)%n)}))});
  knots[n-1].choices[0]={text:'Finish',target:'END'};
  return JSON.stringify({title:'Story stress',start:'k0',knots});
}
function machine(n, out=8) {
  const states={};for(let i=0;i<n;i++){const on={};for(let j=0;j<out;j++)on['E'+j]='s'+((i+j+1)%n);states['s'+i]={on}};
  return JSON.stringify({id:'LoadTest',initial:'s0',states});
}
const medium=story(16,4,50), large=story(80,12,600), bigMachine=machine(64,8);
const cases=[
 ['Ink routes 16x4',()=>ink.routePlan(medium),200],
 ['Ink routes 80x12',()=>ink.routePlan(large),120],
 ['Ink inspect 80x12',()=>ink.storyInfo(large),120],
 ['XState plan 64x8',()=>xst.transitionTestPlan(bigMachine),120],
 ['XState simulate 500',()=>xst.simulateMachine(bigMachine,JSON.stringify(Array.from({length:500},(_,i)=>'E'+(i%8)))),120]
];
const results={node:process.version,platform:process.platform,root,measurements:{}};
for(const [name,fn,count] of cases){
  for(let i=0;i<20;i++)fn();
  const timings=[];
  const heapBefore=process.memoryUsage().heapUsed;
  for(let i=0;i<count;i++){
    const t=performance.now(); const result=fn();timings.push(performance.now()-t);
    if(result===undefined) throw new Error('Undefined result '+name);
  }
  const sorted=timings.toSorted((a,b)=>a-b);
  const median=sorted[Math.floor(count/2)],p95=sorted[Math.floor(count*0.95)];
  results.measurements[name]={median_ms:+median.toFixed(3),p95_ms:+p95.toFixed(3),total_ms:+timings.reduce((a,b)=>a+b,0).toFixed(3),runs:count,heap_delta_bytes:process.memoryUsage().heapUsed-heapBefore};
}
console.log(JSON.stringify(results,null,2));
