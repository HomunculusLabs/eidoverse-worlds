// dress98-maze-gaps.ts — locate the entrance gap(s) in labyrinth-0038's
// outer wall (_l$_0) from served live bytes: dump xz vertex scatter, walk the
// perimeter at the wall's radius, and report angular coverage vs gaps.
// Read-only probe. Usage: bun agents/arthur/dress98-maze-gaps.ts <file.glb>
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve, join, normalize } from "node:path";
import { chromium } from "playwright";

const modelPath = resolve(process.argv[2] ?? "");
const THREE_ROOT = resolve("node_modules/three");
const DRACO_DIR = join(THREE_ROOT, "examples/jsm/libs/draco/gltf/");
const threeModule = join(THREE_ROOT, "build/three.module.js");
const modelBytes = readFileSync(modelPath);
const html = `<!doctype html><meta charset="utf-8">
<script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '/examples/jsm/loaders/DRACOLoader.js';
const draco=new DRACOLoader(); draco.setDecoderPath('/draco/');
const loader=new GLTFLoader(); loader.setDRACOLoader(draco);
const gltf=await loader.loadAsync('/model.glb');
const root=gltf.scene; root.updateMatrixWorld(true);
let outer=null, verts=[];
root.traverse(o=>{
  if(!o.isMesh) return;
  if(o.name==='_l$_0'){
    const pos=o.geometry.getAttribute('position');
    for(let i=0;i<pos.count;i++){
      const p=new THREE.Vector3().fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);
      verts.push([p.x,p.y,p.z]);
    }
  }
});
// radial analysis: distance from origin (maze center at local origin)
const rs=verts.map(v=>Math.hypot(v[0],v[2]));
const yVals=verts.map(v=>v[1]);
// histogram of radii
const buckets={};
for(const r of rs){const k=r.toFixed(1);buckets[k]=(buckets[k]??0)+1;}
// angular coverage at outer radius band (>5.5m): deg bins of 2deg
const angs={};
for(const v of verts){
  const r=Math.hypot(v[0],v[2]);
  if(r>5.0){
    let a=Math.atan2(v[2],v[0])*180/Math.PI; if(a<0)a+=360;
    const k=Math.floor(a/2)*2;
    (angs[k]=angs[k]??[]).push(r);
  }
}
const angOut={}; for(const k of Object.keys(angs)){const v=angs[k];angOut[k]=[v.length,+Math.min(...v).toFixed(2),+Math.max(...v).toFixed(2)];}
window.__out={radHist:buckets,yMin:Math.min(...yVals),yMax:Math.max(...yVals),angBins:angOut};
window.__ready=true;
</script>`;
const server=createServer((req,res)=>{
  const url=(req.url??"").split("?")[0];
  try {
    if(url==="/"||url==="/index.html"){res.setHeader("content-type","text/html");res.end(html);return;}
    if(url==="/model.glb"){res.setHeader("content-type","model/gltf-binary");res.end(modelBytes);return;}
    if(url==="/three.module.js"){res.setHeader("content-type","text/javascript");res.end(readFileSync(threeModule));return;}
    if(url==="/three.core.js"){res.setHeader("content-type","text/javascript");res.end(readFileSync(join(THREE_ROOT,"build/three.core.js")));return;}
    if(url.startsWith("/draco/")){const f=url.slice("/draco/".length);const p=join(DRACO_DIR,f);if(!p.startsWith(DRACO_DIR))throw new Error("escape");res.setHeader("content-type",f.endsWith(".wasm")?"application/wasm":"text/javascript");res.end(readFileSync(p));return;}
    if(url.startsWith("/examples/jsm/")){
      const rel=normalize(url.slice(1)); const p=join(THREE_ROOT,rel);
      if(!p.startsWith(THREE_ROOT)) throw new Error("path escape");
      let s=readFileSync(p,"utf8").replaceAll("from 'three'","from '/three.module.js'").replaceAll('from "three"','from "/three.module.js"');
      res.setHeader("content-type","text/javascript");res.end(s);return;
    }
    res.statusCode=404;res.end("not found");
  } catch(e:any){res.statusCode=500;res.end(String(e?.message??e));}
});
await new Promise<void>(r=>server.listen(0,"127.0.0.1",r));
const addr=server.address(); if(!addr||typeof addr==="string") throw new Error("no server address");
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage({viewport:{width:400,height:300}});
  page.on("console",m=>{if(m.type()==="error")console.error("BROWSER",m.type(),m.text());});
  page.on("pageerror",e=>console.error("PAGEERROR",e.message));
  await page.goto(`http://127.0.0.1:${addr.port}/`,{waitUntil:"networkidle"});
  await page.waitForFunction(()=>(window as any).__ready===true,undefined,{timeout:60_000});
  const out=await page.evaluate(()=>(window as any).__out);
  console.log("radius histogram:",JSON.stringify(out.radHist));
  console.log(`wall y range: ${out.yMin.toFixed(2)}..${out.yMax.toFixed(2)}`);
  // gap analysis: consecutive empty 2-deg bins in [0,360)
  const bins=new Set(Object.keys(out.angBins).map(Number));
  const gaps=[]; let run=[];
  for(let a=0;a<360;a+=2){
    if(!bins.has(a)){run.push(a);}else{if(run.length)gaps.push(run);run=[];}
  }
  if(run.length)gaps.push(run);
  console.log("angular gaps (2-deg bins, r>5.0):");
  for(const g of gaps) if(g.length>=2) console.log(`  ${g[0]}..${g[g.length-1]+2} deg (${g.length*2} deg wide)`);
  console.log("occupied bins (deg:count,rmin,rmax):");
  const ks=Object.keys(out.angBins).map(Number).sort((a,b)=>a-b);
  for(const k of ks) console.log(`  ${k}: n=${out.angBins[k][0]} r=[${out.angBins[k][1]},${out.angBins[k][2]}]`);
} finally {await browser.close();server.close();}
