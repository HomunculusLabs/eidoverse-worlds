// p335-rig.ts — carousel survey rig under LIVE light conditions, DRACO-aware
// (p327-rig.ts chassis). Subject: nx-carousel exact live bytes (served or local).
// Views: gameplay 18m day/night, approach 10m, boarding 5m, side, deck-level
// horse view, aerial. Night = emissives only (engine point-lights never reach
// the carousel at 25m from plaza; polish-274 range law).
import { createServer } from "node:http";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { chromium } from "playwright";

const modelPath = resolve(process.argv[2] ?? "/tmp/p335/live-served.glb");
const outDir = resolve(process.argv[3] ?? "/tmp/p335/rig");
mkdirSync(outDir, { recursive: true });
const THREE_ROOT = resolve("node_modules/three");
const DRACO_DIR = resolve("node_modules/three/examples/jsm/libs/draco/gltf/");
const threeModule = join(THREE_ROOT, "build/three.module.js");
const modelBytes = readFileSync(modelPath);
const html = `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;overflow:hidden;background:#cbd6df}canvas{display:block}</style><script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '/examples/jsm/loaders/DRACOLoader.js';
const draco=new DRACOLoader(); draco.setDecoderPath('/draco/');
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1); renderer.setSize(960,720); renderer.outputColorSpace=THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene(); scene.background=new THREE.Color(0xcbd6df);
const camera=new THREE.PerspectiveCamera(42,960/720,0.05,200);
const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2.0); scene.add(hemi);
const ambient=new THREE.AmbientLight(0xffffff,0.45); scene.add(ambient);
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(8,12,6); scene.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(120,120),new THREE.MeshStandardMaterial({color:0x7f8d70,roughness:1}));
ground.rotation.x=-Math.PI/2; scene.add(ground);
const loader=new GLTFLoader(); loader.setDRACOLoader(draco);
const gltf=await loader.loadAsync('/model.glb'); const root=gltf.scene; scene.add(root);
root.updateMatrixWorld(true);
window.setCam=(x,y,z,tx,ty,tz)=>{camera.position.set(x,y,z);camera.lookAt(tx,ty,tz);renderer.render(scene,camera)};
window.setNight=(on)=>{scene.background.set(on?0x111827:0xcbd6df);hemi.intensity=on?.18:2;ambient.intensity=on?.04:.45;sun.intensity=on?.15:3.2;renderer.render(scene,camera)};
window.setCam(0,1.65,18,0,3,0); window.rigReady=true;
</script>`;
const server=createServer((req,res)=>{
  const url=(req.url??"").split("?")[0];
  if(url==="/"||url==="/index.html"){res.setHeader("content-type","text/html");res.end(html);return;}
  if(url==="/model.glb"){res.setHeader("content-type","model/gltf-binary");res.end(modelBytes);return;}
  if(url==="/three.module.js"){res.setHeader("content-type","text/javascript");res.end(readFileSync(threeModule));return;}
  if(url==="/three.core.js"){res.setHeader("content-type","text/javascript");res.end(readFileSync(join(THREE_ROOT,"build/three.core.js")));return;}
  if(url.startsWith("/draco/")){
    const f=url.slice("/draco/".length);
    const p=resolve(DRACO_DIR,f);
    if(!p.startsWith(DRACO_DIR)){res.statusCode=403;res.end("escape");return;}
    res.setHeader("content-type",f.endsWith(".wasm")?"application/wasm":"text/javascript");
    res.end(readFileSync(p));return;
  }
  if(url.startsWith("/examples/jsm/")){const p=resolve(THREE_ROOT,url.slice(1));let s=readFileSync(p,"utf8").replaceAll("from 'three'","from '/three.module.js'").replaceAll('from "three"','from "/three.module.js"');res.setHeader("content-type","text/javascript");res.end(s);return;}
  res.statusCode=404;res.end("not found");
});
await new Promise<void>(r=>server.listen(0,"127.0.0.1",r));
const addr=server.address(); if(!addr||typeof addr==="="+"string") throw new Error("no address");
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage({viewport:{width:960,height:720},deviceScaleFactor:1});
  await page.goto(`http://127.0.0.1:${addr.port}/`,{waitUntil:"networkidle"});
  await page.waitForFunction(()=>(window as any).rigReady===true,undefined,{timeout:60_000});
  const shot=async(name:string,fn:()=>void)=>{
    await page.evaluate(fn);
    await page.screenshot({path:join(outDir,`${name}.png`)});
  };
  await shot("gameplay-day",()=>{(window as any).setCam(0,1.65,18,0,3,0);(window as any).setNight(false)});
  await shot("gameplay-night",()=>{(window as any).setCam(0,1.65,18,0,3,0);(window as any).setNight(true)});
  await shot("approach-day",()=>{(window as any).setCam(0,1.65,10,0,2.6,0);(window as any).setNight(false)});
  await shot("approach-night",()=>{(window as any).setCam(0,1.65,10,0,2.6,0);(window as any).setNight(true)});
  await shot("boarding-day",()=>{(window as any).setCam(0,1.5,5,0,2.4,0);(window as any).setNight(false)});
  await shot("boarding-night",()=>{(window as any).setCam(0,1.5,5,0,2.4,0);(window as any).setNight(true)});
  await shot("side-day",()=>{(window as any).setCam(13,1.65,0,0,2.8,0);(window as any).setNight(false)});
  await shot("deck-day",()=>{(window as any).setCam(4.6,3.4,4.6,0,3.1,0);(window as any).setNight(false)});
  await shot("deck-night",()=>{(window as any).setCam(4.6,3.4,4.6,0,3.1,0);(window as any).setNight(true)});
  await shot("aerial-day",()=>{(window as any).setCam(0.01,11,0.01,0,0,0);(window as any).setNight(false)});
  await shot("aerial-night",()=>{(window as any).setCam(0.01,11,0.01,0,0,0);(window as any).setNight(true)});
  console.log("RIG_DONE");
} finally {await browser.close();server.close();}
