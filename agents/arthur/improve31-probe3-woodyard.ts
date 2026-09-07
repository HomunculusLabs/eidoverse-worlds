// improve31-probe3-woodyard.ts — split decoded live geometry into material
// buckets (classification per improve-31 contract) and export raw arrays for
// the node-side texMat rebuild. Geometry byte-faithful: positions/normals/
// indices copied verbatim. Read-only probe → /tmp/improve31-buckets.json.
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
const buckets={};
function emit(name, mesh){
  const g=mesh.geometry, pos=g.getAttribute('position'), nor=g.getAttribute('normal');
  const idx=g.getIndex();
  buckets[name]={
    pos:Array.from(pos.array), nor:Array.from(nor.array),
    idx:idx?Array.from(idx.array):null,
    count:pos.count
  };
}
root.traverse(o=>{
  if(!o.isMesh) return;
  if(o.name==='wy3_0'||o.name==='wy3_2'){
    // split by face-consistent vertex classification
    const g=o.geometry, pos=g.getAttribute('position'), nor=g.getAttribute('normal');
    const idx=g.getIndex();
    const n=pos.count;
    const cls=new Uint8Array(n); // 0 = body/bark, 1 = end/split
    for(let i=0;i<n;i++){
      const ax=Math.abs(nor.getX(i)), ay=Math.abs(nor.getY(i)), az=Math.abs(nor.getZ(i));
      if(o.name==='wy3_0'){
        // stack logs axis z: caps |nz|>=0.9 within stack depth & height
        if(az>=0.9 && pos.getZ(i)>=-0.75 && pos.getZ(i)<=0.45 && pos.getY(i)<=0.6) cls[i]=1;
      } else {
        // ground logs axis x: caps |nx|>=0.9; stump top (y-up, stump at x~2.6
        // y~0.4) is the working split face
        if(ax>=0.9) cls[i]=1;
        else if(ay>=0.9 && pos.getY(i)>=0.35 && pos.getX(i)>2.3) cls[i]=1;
      }
    }
    // face consistency check: every triangle's 3 verts same class (report)
    let mixed=0;
    const it=idx?idx.count:n;
    for(let t=0;t<it;t+=3){
      const a=idx?idx.getX(t):t, b=idx?idx.getX(t+1):t+1, c=idx?idx.getX(t+2):t+2;
      if(cls[a]!==cls[b]||cls[b]!==cls[c]) mixed++;
    }
    for(const want of [0,1]){
      const keep=new Set();
      for(let t=0;t<it;t+=3){
        const a=idx?idx.getX(t):t, b=idx?idx.getX(t+1):t+1, c=idx?idx.getX(t+2):t+2;
        const ca=cls[a],cb=cls[b],cc=cls[c];
        const same=ca===cb&&cb===cc;
        // mixed triangles fold into BODY (want 0) — zero-drop conservation
        const take = want===1 ? (same&&ca===1) : (!same||ca===0);
        if(take){keep.add(a);keep.add(b);keep.add(c);}
      }
      const map=new Map(); const newPos=[], newNor=[], newIdx=[];
      const push=(vi)=>{ if(!map.has(vi)){ map.set(vi,newPos.length/3);
          newPos.push(pos.getX(vi),pos.getY(vi),pos.getZ(vi));
          newNor.push(nor.getX(vi),nor.getY(vi),nor.getZ(vi)); }
        return map.get(vi); };
      for(let t=0;t<it;t+=3){
        const a=idx?idx.getX(t):t, b=idx?idx.getX(t+1):t+1, c=idx?idx.getX(t+2):t+2;
        const ca=cls[a],cb=cls[b],cc=cls[c];
        const same=ca===cb&&cb===cc;
        const take = want===1 ? (same&&ca===1) : (!same||ca===0);
        if(take) newIdx.push(push(a),push(b),push(c));
      }
      const nm = want? o.name+'e' : o.name;
      buckets[nm]={pos:newPos,nor:newNor,idx:newIdx,count:newPos.length/3};
    }
    buckets[o.name+'_meta']={mixedTris:mixed,totalTris:it/3};
  } else {
    emit(o.name, o);
  }
});
window.__buckets=buckets; window.__ready=true;
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
  const buckets=await page.evaluate(()=>(window as any).__buckets);
  const summary=Object.fromEntries(Object.entries(buckets).map(([k,v]:any)=>[k,v.count??v]));
  console.log(JSON.stringify(summary));
  writeFileSync("/tmp/improve31-buckets.json",JSON.stringify(buckets));
  console.error("buckets written");
} finally {await browser.close();server.close();}
