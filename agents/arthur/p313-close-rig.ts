// p313-close-rig.ts — rim-close day/night views of the well candidate (one-shot probe).
// The standard rig's night view is the 18m gameplay camera, from which the water
// disc at y0.33 behind a 0.75 rim crest is geometrically occluded (sightline
// clears the crest only inside ~2.5m). Players read well water AT the rim.
import { createServer } from "node:http";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { chromium } from "playwright";

const modelPath = resolve(process.argv[2] ?? "agents/arthur/assets/village_well.glb");
const outDir = resolve(process.argv[3] ?? "/tmp/p313-close");
mkdirSync(outDir, { recursive: true });
const THREE_ROOT = resolve("node_modules/three");
const threeModule = join(THREE_ROOT, "build/three.module.js");
const modelBytes = readFileSync(modelPath);
const html = `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;overflow:hidden;background:#cbd6df}canvas{display:block}</style><script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1); renderer.setSize(960,720); renderer.outputColorSpace=THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene(); scene.background=new THREE.Color(0xcbd6df);
const camera=new THREE.PerspectiveCamera(42,960/720,0.05,100);
const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2.0); scene.add(hemi);
const ambient=new THREE.AmbientLight(0xffffff,0.45); scene.add(ambient);
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(8,12,6); scene.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x7f8d70,roughness:1}));
ground.rotation.x=-Math.PI/2; scene.add(ground);
const gltf=await new GLTFLoader().loadAsync('/model.glb'); const root=gltf.scene; scene.add(root);
root.updateMatrixWorld(true);
window.setCam=(x,y,z,tx,ty,tz)=>{camera.position.set(x,y,z);camera.lookAt(tx,ty,tz);renderer.render(scene,camera)};
window.setNight=(on)=>{scene.background.set(on?0x111827:0xcbd6df);hemi.intensity=on?.18:2;ambient.intensity=on?.04:.45;sun.intensity=on?.15:3.2;renderer.render(scene,camera)};
window.setCam(0,1.65,1.9, 0,0.45,0); window.rigReady=true;
</script>`;
const server=createServer((req,res)=>{
  const url=(req.url??"").split("?")[0];
  if(url==="/"||url==="/index.html"){res.setHeader("content-type","text/html");res.end(html);return;}
  if(url==="/model.glb"){res.setHeader("content-type","model/gltf-binary");res.end(modelBytes);return;}
  if(url==="/three.module.js"){res.setHeader("content-type","text/javascript");res.end(readFileSync(threeModule));return;}
  if(url==="/three.core.js"){res.setHeader("content-type","text/javascript");res.end(readFileSync(join(THREE_ROOT,"build/three.core.js")));return;}
  if(url.startsWith("/examples/jsm/")){const p=join(THREE_ROOT,url.slice(1));let s=readFileSync(p,"utf8").replaceAll("from 'three'","from '/three.module.js'").replaceAll('from "three"','from "/three.module.js"');res.setHeader("content-type","text/javascript");res.end(s);return;}
  res.statusCode=404;res.end("not found");
});
await new Promise<void>(r=>server.listen(0,"127.0.0.1",r));
const addr=server.address(); if(!addr||typeof addr=="string") throw new Error("no address");
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage({viewport:{width:960,height:720},deviceScaleFactor:1});
  await page.goto(`http://127.0.0.1:${addr.port}/`,{waitUntil:"networkidle"});
  await page.waitForFunction(()=>(window as any).rigReady===true,undefined,{timeout:30_000});
  // rimClose day: standing 1.9m out, eye 1.65, looking into the mouth
  await page.evaluate(()=>{(window as any).setCam(0,1.65,1.9,0,0.45,0);(window as any).setNight(false)});
  await page.screenshot({path:join(outDir,"rimclose-day.png")});
  // rimClose night: same vantage, lights down
  await page.evaluate(()=>{(window as any).setCam(0,1.65,1.9,0,0.45,0);(window as any).setNight(true)});
  await page.screenshot({path:join(outDir,"rimclose-night.png")});
  // nearApproach night: 4m, eye 1.65, looking at the well (the walk-up read)
  await page.evaluate(()=>{(window as any).setCam(0,1.65,4.0,0,0.9,0);(window as any).setNight(true)});
  await page.screenshot({path:join(outDir,"near-night.png")});
  // slight-elevation night aerial (a low fly/hill vantage at 30deg)
  await page.evaluate(()=>{(window as any).setCam(2.5,4.5,2.5,0,0.3,0);(window as any).setNight(true)});
  await page.screenshot({path:join(outDir,"oblique-night.png")});
  console.log("RIG_DONE");
} finally {await browser.close();server.close();}
