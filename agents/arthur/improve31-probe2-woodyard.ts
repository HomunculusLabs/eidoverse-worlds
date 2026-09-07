// improve31-probe2-woodyard.ts — cure-design probe on live decoded bytes:
// (a) wy3_0 y-value histogram (course pitch for banding),
// (b) wy3_2 normal-axis histogram (end-cap classification),
// (c) wy3_0 normal spread (front-face lit analysis). Read-only.
import { createServer } from "node:http";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, join, normalize } from "node:path";
import { chromium } from "playwright";

const modelPath = resolve("/tmp/improve31-woodyard-live.glb");
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
const out={};
root.traverse(o=>{
  if(!o.isMesh) return;
  const g=o.geometry, pos=g.getAttribute('position'), nor=g.getAttribute('normal');
  if(o.name==='wy3_0'){
    const yHist={};
    for(let i=0;i<pos.count;i++){
      const y=+pos.getY(i).toFixed(3);
      yHist[y]=(yHist[y]??0)+1;
    }
    const nz={}; for(let i=0;i<nor.count;i++){const v=+nor.getZ(i).toFixed(2); nz[v]=(nz[v]??0)+1;}
    out.wy3_0={yLevels:Object.entries(yHist).sort((a,b)=>a[0]-b[0]).map(([y,n])=>[+y,n]), nzHist:nz};
  }
  if(o.name==='wy3_2'){
    const axis={x:0,y:0,z:0,mixed:0};
    const xExtrema={};
    for(let i=0;i<nor.count;i++){
      const nx=Math.abs(nor.getX(i)),ny=Math.abs(nor.getY(i)),nz2=Math.abs(nor.getZ(i));
      const m=Math.max(nx,ny,nz2);
      if(m===nx)axis.x++; else if(m===ny)axis.y++; else if(m===nz2)axis.z++; else axis.mixed++;
    }
    // x-position histogram to find log runs
    const xHist={};
    for(let i=0;i<pos.count;i++){const x=+pos.getX(i).toFixed(2); xHist[x]=(xHist[x]??0)+1;}
    out.wy3_2={axisHist:axis, xClusters:Object.entries(xHist).sort((a,b)=>a[0]-b[0]).map(([x,n])=>[+x,n]).filter(e=>e[1]>=8)};
  }
  if(o.name==='wy3_1'){
    const ny={}; for(let i=0;i<nor.count;i++){const v=+nor.getY(i).toFixed(2); ny[v]=(ny[v]??0)+1;}
    out.wy3_1={nyHist:ny};
  }
});
window.__out=out; window.__ready=true;
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
  const page=await browser.newPage({viewport:{width:960,height:720}});
  page.on("pageerror",e=>console.error("PAGEERROR",e.message));
  await page.goto(`http://127.0.0.1:${addr.port}/`,{waitUntil:"networkidle"});
  await page.waitForFunction(()=>(window as any).__ready===true,undefined,{timeout:60_000});
  const out=await page.evaluate(()=>(window as any).__out);
  console.log(JSON.stringify(out));
  writeFileSync("/tmp/improve31-probe2.json",JSON.stringify(out));
} finally {await browser.close();server.close();}
