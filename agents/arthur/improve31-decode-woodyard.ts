// improve31-decode-woodyard.ts — DRACO decode of live woodyard store-min
// bytes via the proven playwright chassis (review-model-draco.ts server
// block; Bun-native three DRACOLoader hangs on this three version's fetch
// progress path). Per-mesh vertex-color histogram + position bounds.
// Read-only probe. Usage: bun agents/arthur/improve31-decode-woodyard.ts
import { createServer } from "node:http";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, join, normalize } from "node:path";
import { chromium } from "playwright";

const modelPath = resolve("/tmp/improve31-woodyard-live.glb");
const outDir = resolve("agents/arthur/reviews/improve31-woodyard");
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
  const g=o.geometry, pos=g.getAttribute('position'), col=g.getAttribute('color');
  const idx=g.getIndex();
  const mn=new THREE.Vector3(Infinity,Infinity,Infinity), mx=new THREE.Vector3(-Infinity,-Infinity,-Infinity);
  const colors={};
  for(let i=0;i<pos.count;i++){
    const c=new THREE.Color().fromBufferAttribute(col,i);
    const key=[c.r,c.g,c.b].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('');
    colors[key]=(colors[key]??0)+1;
    const p=new THREE.Vector3().fromBufferAttribute(pos,i);
    mn.min(p); mx.max(p);
  }
  rows.push({name:o.name, parent:o.parent?.name??null, verts:pos.count,
    tris:idx?idx.count/3:pos.count/3,
    min:mn.toArray(), max:mx.toArray(),
    colors:Object.entries(colors).sort((a,b)=>b[1]-a[1]).slice(0,14).map(([hex,n])=>[hex,n]),
    distinct:Object.keys(colors).length,
    matName:o.material?.name??null, matIsDefault:!!o.material?.isMeshStandardMaterial&&!o.material.uuid,
  });
});
// scene hierarchy: node tree with names
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
  const out=rows.map((r:any)=>({
    name:r.name,parent:r.parent,verts:r.verts,tris:r.tris,
    min:r.min.map((v:number)=>+v.toFixed(3)),max:r.max.map((v:number)=>+v.toFixed(3)),
    distinctColors:r.distinct,
    topColors:r.colors.map((c:any)=>`#${c[0]} x${c[1]}`),
  }));
  console.log(JSON.stringify({tree:tree.map((t:any)=>t.name),meshes:out},null,1));
  writeFileSync("/tmp/improve31-decode.json",JSON.stringify({meshes:out},null,1));
} finally {await browser.close();server.close();}
