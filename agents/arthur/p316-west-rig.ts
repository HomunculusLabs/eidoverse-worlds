// p316-west-rig.ts — west-facing night/day views of the well (one-shot probe).
// The standard rig and the p313 close rig are +Z cameras; the polish-315
// lantern hangs at local -x (world -x, yaw 0) — NONE of the standing views
// face it (polish-307 rig-law class). This rig frames the lantern side:
//   westClose: 4m W of the well, eye 1.65, looking at the lantern (1.4m)
//   west18:    18m W (gameplay distance), eye 1.65, looking at well center
//   westNight / westNight18: same cameras, night lighting
// Plus a day pair for washout falsification.
import { createServer } from "node:http";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { chromium } from "playwright";

const modelPath = resolve(process.argv[2] ?? "agents/arthur/assets/village_well.glb");
const outDir = resolve(process.argv[3] ?? "/tmp/p316-west");
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
window.setCam(-4,1.65,0.6, 0,1.3,0); window.rigReady=true;
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
const addr=server.address(); if(!addr||typeof addr=="="+"string") throw new Error("no address");
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage({viewport:{width:960,height:720},deviceScaleFactor:1});
  await page.goto(`http://127.0.0.1:${addr.port}/`,{waitUntil:"networkidle"});
  await page.waitForFunction(()=>(window as any).rigReady===true,undefined,{timeout:30_000});
  // westClose day: 4m W, slightly S so the W post face is visible, eye on lantern
  await page.evaluate(()=>{(window as any).setCam(-4,1.65,0.6,0,1.3,0);(window as any).setNight(false)});
  await page.screenshot({path:join(outDir,"westclose-day.png")});
  // westClose night
  await page.evaluate(()=>{(window as any).setCam(-4,1.65,0.6,0,1.3,0);(window as any).setNight(true)});
  await page.screenshot({path:join(outDir,"westclose-night.png")});
  // west18 night (gameplay distance on the lantern axis)
  await page.evaluate(()=>{(window as any).setCam(-18,1.65,2.5,0,1.1,0);(window as any).setNight(true)});
  await page.screenshot({path:join(outDir,"west18-night.png")});
  // west18 day
  await page.evaluate(()=>{(window as any).setCam(-18,1.65,2.5,0,1.1,0);(window as any).setNight(false)});
  await page.screenshot({path:join(outDir,"west18-day.png")});
  console.log("RIG_DONE");
} finally {await browser.close();server.close();}
