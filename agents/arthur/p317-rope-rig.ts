// p317-rope-rig.ts — rope/bucket framed views of the well (one-shot probe).
// polish-307 rig-law class: the rope (y 1.20..1.70) hangs under the gable roof
// and is only partially framed by the standing rigs. This rig frames the
// rope-drop zone (crossbar -> rope -> bucket) close and at approach distance,
// day + night:
//   ropeNear: 0.92m diagonal closeup of crossbar+rope+knot (the polish-310
//             belfry-close equivalent for the well)
//   ropeFace: 1.56m diagonal framing the whole drop zone y~0.75..1.95
//   ropeGameplay: 9m approach axis, eye 1.65
import { createServer } from "node:http";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { chromium } from "playwright";

const modelPath = resolve(process.argv[2] ?? "agents/arthur/assets/village_well.glb");
const outDir = resolve(process.argv[3] ?? "/tmp/p317-rope");
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
window.setCam(0.65,1.5,0.65, 0,1.4,0); window.rigReady=true;
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
const addr=server.address(); if(!addr||typeof addr==="="+"string") throw new Error("no address");
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage({viewport:{width:960,height:720},deviceScaleFactor:1});
  await page.goto(`http://127.0.0.1:${addr.port}/`,{waitUntil:"networkidle"});
  await page.waitForFunction(()=>(window as any).rigReady===true,undefined,{timeout:30_000});
  // ropeNear day+night: 0.92m diagonal of crossbar+upper rope+knot
  await page.evaluate(()=>{(window as any).setCam(0.65,1.5,0.65,0,1.4,0);(window as any).setNight(false)});
  await page.screenshot({path:join(outDir,"ropenear-day.png")});
  await page.evaluate(()=>{(window as any).setCam(0.65,1.5,0.65,0,1.4,0);(window as any).setNight(true)});
  await page.screenshot({path:join(outDir,"ropenear-night.png")});
  // ropeFace day+night: 1.56m diagonal of the whole drop zone
  await page.evaluate(()=>{(window as any).setCam(1.1,1.6,1.1,0,1.35,0);(window as any).setNight(false)});
  await page.screenshot({path:join(outDir,"ropeface-day.png")});
  await page.evaluate(()=>{(window as any).setCam(1.1,1.6,1.1,0,1.35,0);(window as any).setNight(true)});
  await page.screenshot({path:join(outDir,"ropeface-night.png")});
  // ropeGameplay day: 9m approach axis
  await page.evaluate(()=>{(window as any).setCam(0,1.65,9,0,1.1,0);(window as any).setNight(false)});
  await page.screenshot({path:join(outDir,"ropegamplay-day.png")});
  // ropeGameplay night (lantern-lit composition from the E side)
  await page.evaluate(()=>{(window as any).setCam(0,1.65,9,0,1.1,0);(window as any).setNight(true)});
  await page.screenshot({path:join(outDir,"ropegamplay-night.png")});
  console.log("RIG_DONE");
} finally {await browser.close();server.close();}
