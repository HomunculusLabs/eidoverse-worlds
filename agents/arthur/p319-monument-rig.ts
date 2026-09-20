// p319-monument-rig.ts — monument-framed views for the polish-319 night
// survey. polish-307 rig-law class: frame the element under judgment — the
// knot (y 1.2..2.9, the monument's namesake) needs its own close framing;
// standing rigs never framed it at night. View set (monument local frame,
// model yaw 0 — the entity yaw is applied by the placer, not the rig):
//   gameplay: 18m S-axis whole-structure, eye 1.65 (the plaza read)
//   approach: 12m S-axis, knot-aimed (the walking-toward read)
//   knotclose: 4.5m diagonal of the knot + under-glow lamp
//   plaquefront: 6m +Z plaque-face approach (dedication vantage)
//   sideeast: 8m +X profile (knot silhouette against sky)
//   aerial: top-down
// Day + night per view (night = the p318 chassis: hemi .18, ambient .04,
// sun .15, sky 0x111827 — the lane's standing night contract).
import { createServer } from "node:http";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { chromium } from "playwright";

const modelPath = resolve(process.argv[2] ?? "agents/arthur/assets/village_monument3.glb");
const outDir = resolve(process.argv[3] ?? "/tmp/p319-monument");
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
const camera=new THREE.PerspectiveCamera(42,960/720,0.05,200);
const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2.0); scene.add(hemi);
const ambient=new THREE.AmbientLight(0xffffff,0.45); scene.add(ambient);
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(8,12,6); scene.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(120,120),new THREE.MeshStandardMaterial({color:0x7f8d70,roughness:1}));
ground.rotation.x=-Math.PI/2; scene.add(ground);
const gltf=await new GLTFLoader().loadAsync('/model.glb'); const root=gltf.scene; scene.add(root);
root.updateMatrixWorld(true);
window.setCam=(x,y,z,tx,ty,tz)=>{camera.position.set(x,y,z);camera.lookAt(tx,ty,tz);renderer.render(scene,camera)};
window.setNight=(on)=>{scene.background.set(on?0x111827:0xcbd6df);hemi.intensity=on?.18:2;ambient.intensity=on?.04:.45;sun.intensity=on?.15:3.2;renderer.render(scene,camera)};
window.setCam(0,1.65,18,0,1.7,0); window.rigReady=true;
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
  const shot=async(name:string,fn:()=>void)=>{
    await page.evaluate(fn);
    await page.screenshot({path:join(outDir,`${name}.png`)});
  };
  // gameplay 18m S-axis
  await shot("gameplay-day",()=>{(window as any).setCam(0,1.65,18,0,1.7,0);(window as any).setNight(false)});
  await shot("gameplay-night",()=>{(window as any).setCam(0,1.65,18,0,1.7,0);(window as any).setNight(true)});
  // approach 12m knot-aimed
  await shot("approach-day",()=>{(window as any).setCam(0,1.65,12,0,1.95,0);(window as any).setNight(false)});
  await shot("approach-night",()=>{(window as any).setCam(0,1.65,12,0,1.95,0);(window as any).setNight(true)});
  // knotclose 4.5m diagonal
  await shot("knotclose-day",()=>{(window as any).setCam(3.2,2.5,3.2,0,2.05,0);(window as any).setNight(false)});
  await shot("knotclose-night",()=>{(window as any).setCam(3.2,2.5,3.2,0,2.05,0);(window as any).setNight(true)});
  // plaquefront 6m +Z
  await shot("plaquefront-day",()=>{(window as any).setCam(0,1.5,6,0,1.3,0);(window as any).setNight(false)});
  await shot("plaquefront-night",()=>{(window as any).setCam(0,1.5,6,0,1.3,0);(window as any).setNight(true)});
  // sideeast 8m +X profile
  await shot("sideeast-day",()=>{(window as any).setCam(8,1.65,0,0,1.6,0);(window as any).setNight(false)});
  await shot("sideeast-night",()=>{(window as any).setCam(8,1.65,0,0,1.6,0);(window as any).setNight(true)});
  // aerial top-down day
  await shot("aerial-day",()=>{(window as any).setCam(0.01,9,0.01,0,0,0);(window as any).setNight(false)});
  console.log("RIG_DONE");
} finally {await browser.close();server.close();}
