// polish-285 probe: find the single clipped vertex the review renderer
// rejects in its front view. Mirrors render.ts math exactly (frozen rig).
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { chromium } from "/Users/t3rpz/projects/node_modules/playwright/index.mjs";

const modelPath = resolve(process.argv[2] ?? "");
const THREE_ROOT = "/Users/t3rpz/projects/eidoverse-worlds/node_modules/three";
const threeModule = join(THREE_ROOT, "build/three.module.js");
const modelBytes = readFileSync(modelPath);
const html = `<!doctype html><meta charset="utf-8"><script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '/examples/jsm/loaders/DRACOLoader.js';
const renderer=new THREE.WebGLRenderer(); renderer.setSize(64,48);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(42,960/720,0.05,100);
const draco=new DRACOLoader().setDecoderPath('/draco/');
const data=await (await fetch('/model.glb')).arrayBuffer();
const gltf=await new GLTFLoader().setDRACOLoader(draco).parseAsync(data,'/');
const root=gltf.scene; scene.add(root); root.updateMatrixWorld(true);
const rigSize=new THREE.Vector3(7.099999904632568,6.7699999833107,7.389999949932099);
const r=Math.max(rigSize.x,rigSize.z,4); const target=new THREE.Vector3(0,Math.max(0.7,rigSize.y*0.38),0);
camera.position.set(0,Math.max(2.3,rigSize.y*.55),r*2.05); camera.lookAt(target); camera.updateMatrixWorld(true);
const p=new THREE.Vector3(); const bad=[];
root.traverse(o=>{ if(!o.isMesh) return; const nm=o.name;
 o.traverseAncestors(a=>{}); });
scene.updateMatrixWorld(true);
root.traverse(o=>{ if(!o.isMesh) return;
 const a=o.geometry.getAttribute('position');
 for(let i=0;i<a.count;i++){ p.fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld).project(camera);
  if(!Number.isFinite(p.x+p.y+p.z)||Math.max(Math.abs(p.x),Math.abs(p.y),Math.abs(p.z))>1.00001){
   const w=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld);
   bad.push({mesh:o.name, world:[+w.x.toFixed(4),+w.y.toFixed(4),+w.z.toFixed(4)], ndc:[+p.x.toFixed(4),+p.y.toFixed(4),+p.z.toFixed(4)]});
 }}});
console.log(JSON.stringify({badCount:bad.length, bad:bad.slice(0,10)}));
window.__done=true;
</script>`;
const server=createServer((req,res)=>{
  const url=(req.url??"/").split("?")[0];
  try{
    if(url==="/"){res.setHeader("content-type","text/html");res.end(html);return;}
    if(url==="/model.glb"){res.setHeader("content-type","model/gltf-binary");res.end(modelBytes);return;}
    if(url==="/three.module.js"){res.setHeader("content-type","text/javascript");res.end(readFileSync(threeModule));return;}
    if(url==="/three.core.js"){res.setHeader("content-type","text/javascript");res.end(readFileSync(join(THREE_ROOT,"build/three.core.js")));return;}
    if(['/draco/draco_wasm_wrapper.js','/draco/draco_decoder.wasm','/draco/draco_decoder.js'].includes(url)){
      res.setHeader('content-type',url.endsWith('.wasm')?'application/wasm':'text/javascript');
      res.end(readFileSync(join(THREE_ROOT,'examples/jsm/libs/draco/gltf',url.slice('/draco/'.length))));return;}
    if(url.startsWith("/examples/jsm/")){ const p=join(THREE_ROOT,url.slice(1));
      let s=readFileSync(p,"utf8").replaceAll("from 'three'","from '/three.module.js'").replaceAll('from "three"','from "/three.module.js"');
      res.setHeader("content-type","text/javascript");res.end(s);return;}
    res.statusCode=404;res.end("not found");
  }catch(e){res.statusCode=500;res.end(String(e?.message??e));}
});
await new Promise<void>(r=>server.listen(0,"127.0.0.1",r));
const addr=server.address();
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage({viewport:{width:64,height:48}});
  page.on("console",m=>console.error("BROWSER",m.type(),m.text()));
  await page.goto(`http://127.0.0.1:${addr.port}/`,{waitUntil:"networkidle"});
  await page.waitForFunction(()=>(window as any).__done===true,undefined,{timeout:30_000});
} finally { await browser.close(); server.close(); }
