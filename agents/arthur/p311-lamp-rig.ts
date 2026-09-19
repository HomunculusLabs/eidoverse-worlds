// p311-lamp-rig.ts — dedicated lamp-mount view renderer for polish-311.
// Camera set aimed at the improve-17 lantern housing (lamp bead local
// (0.75, 5.6, 0.75)) so the mount bracket + hood + posts resolve at close
// range, plus the standard 18m gameplay-aim view. p307-belfry-rig.ts chassis.
// Usage: bun agents/arthur/p311-lamp-rig.ts <model.glb> <outdir>
import { createServer } from "node:http";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve, join, normalize } from "node:path";
import { chromium } from "playwright";

const modelPath = resolve(process.argv[2] ?? "");
const outDir = resolve(process.argv[3] ?? "/tmp/p311-rig-out");
mkdirSync(outDir, { recursive: true });
const THREE_ROOT = resolve("node_modules/three");
const threeModule = join(THREE_ROOT, "build/three.module.js");
const modelBytes = readFileSync(modelPath);
const html = `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#cbd6df}canvas{display:block}
</style><script type="module">
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
window.setView=(x,y,z,ax,ay,az)=>{camera.position.set(x,y,z);camera.lookAt(ax,ay,az);renderer.render(scene,camera)};
window.setNight=(on)=>{scene.background.set(on?0x111827:0xcbd6df);hemi.intensity=on?.18:2;ambient.intensity=on?.04:.45;sun.intensity=on?.15:3.2;renderer.render(scene,camera)};
window.setView(2.2,5.6,2.2,0.75,5.6,0.75); window.rigReady=true;
</script>`;
const server=createServer((req,res)=>{
  const url=(req.url??"").split("?")[0];
  try {
    if(url==="/"){res.setHeader("content-type","text/html");res.end(html);return;}
    if(url==="/model.glb"){res.setHeader("content-type","model/gltf-binary");res.end(modelBytes);return;}
    if(url==="/three.module.js"){res.setHeader("content-type","text/javascript");res.end(readFileSync(threeModule));return;}
    if(url==="/three.core.js"){res.setHeader("content-type","text/javascript");res.end(readFileSync(join(THREE_ROOT,"build/three.core.js")));return;}
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
const addr=server.address(); if(!addr||typeof addr==="="+"string") throw new Error("no server address");
const browser=await chromium.launch({ headless: true });
try{
  const page=await browser.newPage({viewport:{width:960,height:720},deviceScaleFactor:1});
  page.on("pageerror", e => console.error("PAGEERROR", e.message));
  await page.goto(`http://127.0.0.1:${addr.port}/`,{waitUntil:"networkidle"});
  await page.waitForFunction(()=> (window as any).rigReady===true, undefined, { timeout: 30_000 });
  // [name, ex,ey,ez, ax,ay,az] — lamp bead at local (0.75, 5.6, 0.75)
  const views: [string, number, number, number, number, number, number][] = [
    ["lampClose", 2.2, 5.6, 2.2, 0.75, 5.6, 0.75],
    ["lampDiag", 4.2, 5.9, 4.2, 0.75, 5.62, 0.75],
    ["lampFace", 0.75, 5.6, 3.0, 0.75, 5.6, 0.75],
    ["belfry", 0, 5.35, 5.2, 0, 5.15, 0],
    ["gpAim", 0, 1.65, 18, 0, 5.15, 0],
  ];
  for(const [n,x,y,z,ax,ay,az] of views){await page.evaluate(([x,y,z,ax,ay,az])=>(window as any).setView(x,y,z,ax,ay,az),[x,y,z,ax,ay,az]);await page.screenshot({path:join(outDir,`${n}.png`)});}
  await page.evaluate(()=>{(window as any).setView(2.2,5.6,2.2,0.75,5.6,0.75);(window as any).setNight(true)});
  await page.screenshot({path:join(outDir,"lampNight.png")});
  await page.evaluate(()=>{(window as any).setView(0,1.65,18,0,5.15,0);(window as any).setNight(true)});
  await page.screenshot({path:join(outDir,"gpAimNight.png")});
} finally {await browser.close();server.close();}
