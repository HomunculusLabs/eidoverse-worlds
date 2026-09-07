// dress98-decode-hosts.ts — DRACO decode of SW host candidates for round-3
// item 18 (offering niche host-rider), via the proven playwright chassis
// (improve31-decode-woodyard.ts; Bun-native DRACOLoader hangs on this three
// version). Prints per-mesh world bboxes + envelope + node tree.
// Read-only probe. Usage: bun agents/arthur/dress98-decode-hosts.ts <file.glb>
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
const rows=[];
root.traverse(o=>{
  if(!o.isMesh) return;
  const g=o.geometry, pos=g.getAttribute('position');
  const mn=new THREE.Vector3(Infinity,Infinity,Infinity), mx=new THREE.Vector3(-Infinity,-Infinity,-Infinity);
  for(let i=0;i<pos.count;i++){
    const p=new THREE.Vector3().fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);
    mn.min(p); mx.max(p);
  }
  rows.push({name:o.name, verts:pos.count,
    min:mn.toArray(), max:mx.toArray()});
});
const tree=[]; root.traverse(o=>tree.push({name:o.name,type:o.type,mesh:!!o.isMesh}));
window.__rows=rows; window.__tree=tree; window.__ready=true;
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
  page.on("console",m=>{if(m.type()==="error")console.error("BROWSER",m.type(),m.text());});
  page.on("pageerror",e=>console.error("PAGEERROR",e.message));
  await page.goto(`http://127.0.0.1:${addr.port}/`,{waitUntil:"networkidle"});
  await page.waitForFunction(()=>(window as any).__ready===true,undefined,{timeout:60_000});
  const rows=await page.evaluate(()=>(window as any).__rows);
  const tree=await page.evaluate(()=>(window as any).__tree);
  const env=[Infinity,Infinity,Infinity].map(()=>0);
  let e0=[1e9,1e9,1e9],e1=[-1e9,-1e9,-1e9];
  for(const r of rows){for(let k=0;k<3;k++){e0[k]=Math.min(e0[k],r.min[k]);e1[k]=Math.max(e1[k],r.max[k]);}}
  console.log("TREE:",tree.map((t:any)=>t.name+(t.mesh?"*":"")).join(" | "));
  for(const r of rows){
    console.log(
      `${(r.name??"(anon)").padEnd(32)} v=${String(r.verts).padStart(5)} `+
      `x[${r.min[0].toFixed(2)},${r.max[0].toFixed(2)}] y[${r.min[1].toFixed(2)},${r.max[1].toFixed(2)}] z[${r.min[2].toFixed(2)},${r.max[2].toFixed(2)}] `+
      `size=(${(r.max[0]-r.min[0]).toFixed(2)},${(r.max[1]-r.min[1]).toFixed(2)},${(r.max[2]-r.min[2]).toFixed(2)})`);
  }
  console.log(`ENVELOPE x[${e0[0].toFixed(2)},${e1[0].toFixed(2)}] y[${e0[1].toFixed(2)},${e1[1].toFixed(2)}] z[${e0[2].toFixed(2)},${e1[2].toFixed(2)}] size=(${(e1[0]-e0[0]).toFixed(2)}x${(e1[1]-e0[1]).toFixed(2)}x${(e1[2]-e0[2]).toFixed(2)})`);
} finally {await browser.close();server.close();}
