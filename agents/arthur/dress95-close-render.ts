// dress95-close-render.ts — pitfall-13 close-face renderer for the
// rainbarrel prop. The stock review-model front view frames at ~8.2m for a
// ~1m prop (r*2.05 with r=4), under-resolving the tap — the concept
// contract (tap -> pail water column) is a ~2.6m inspection-distance read.
// Renders three views at walker scale: front-tap (2.6m, eye 1.4m looking
// down at the tap line), face-aisle (2.6m from the +z face), and a
// half-approach (5m). Ground/sky/lighting identical to review-model.ts.
// Usage: bun agents/arthur/dress95-close-render.ts <model.glb> <out-dir>
import { createServer } from "node:http";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve, join, normalize } from "node:path";
import { chromium } from "playwright";

const modelPath = resolve(process.argv[2] ?? "");
const outDir = resolve(process.argv[3] ?? "agents/arthur/reviews/model");
if (!modelPath.endsWith(".glb")) throw new Error("first argument must be a .glb path");
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
renderer.shadowMap.enabled=true; document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene(); scene.background=new THREE.Color(0xcbd6df);
const camera=new THREE.PerspectiveCamera(42,960/720,0.05,100);
const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2.0); scene.add(hemi);
const ambient=new THREE.AmbientLight(0xffffff,0.45); scene.add(ambient);
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(8,12,6); sun.castShadow=true; scene.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x7f8d70,roughness:1}));
ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const gltf=await new GLTFLoader().loadAsync('/model.glb'); const root=gltf.scene; scene.add(root);
root.updateMatrixWorld(true);
root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
window.setView=(name)=>{
  // model stands at its origin; tap cluster sits near (0.10, ~0.3, 0.5)
  const views={
    // walker 2.6m out on the +z aisle, eye 1.4m, looking at the tap line (y .32)
    tapface:[0.35,1.40,2.6],
    // straight on the +z face, centered, eye 1.1m (crouch/child read of the stand)
    aisle:[0,1.10,2.6],
    // half-approach 5m, eye 1.65
    approach:[0.5,1.65,5.0],
  };
  const v=views[name];
  camera.position.set(v[0],v[1],v[2]);
  camera.lookAt(0.05,0.30,0.4);
  renderer.render(scene,camera);
};
window.setView('tapface'); window.reviewReady=true;
</script>`;

const server=createServer((req,res)=>{
  const url=(req.url??"/").split("?")[0];
  try {
    if(url==="/"||url==="/index.html"){res.setHeader("content-type","text/html");res.end(html);return;}
    if(url==="/model.glb"){res.setHeader("content-type","model/gltf-binary");res.end(modelBytes);return;}
    if(url==="/three.module.js"){res.setHeader("content-type","text/javascript");res.end(readFileSync(threeModule));return;}
    if(url==="/three.core.js"){res.setHeader("content-type","text/javascript");res.end(readFileSync(join(THREE_ROOT,"build/three.core.js")));return;}
    if(url.startsWith("/examples/jsm/")){const rel=normalize(url.slice(1)); const p=join(THREE_ROOT,rel);
      if(!p.startsWith(THREE_ROOT)) throw new Error("path escape");
      let s=readFileSync(p,"utf8").replaceAll("from 'three'","from '/three.module.js'").replaceAll('from "three"','from "/three.module.js"');
      res.setHeader("content-type","text/javascript");res.end(s);return;}
    res.statusCode=404;res.end("not found");
  } catch(e:any){res.statusCode=500;res.end(String(e?.message??e));}
});
await new Promise<void>(r=>server.listen(0,"127.0.0.1",r));
const addr=server.address(); if(!addr||typeof addr==="string") throw new Error("no server address");
const browser=await chromium.launch({ headless: true });
try{
  const page=await browser.newPage({viewport:{width:960,height:720},deviceScaleFactor:1});
  page.on("console", m => console.error("BROWSER", m.type(), m.text()));
  page.on("pageerror", e => console.error("PAGEERROR", e.message));
  await page.goto(`http://127.0.0.1:${addr.port}/`,{waitUntil:"networkidle"});
  await page.waitForFunction(()=> (window as any).reviewReady===true, undefined, { timeout: 30_000 });
  for(const view of ["tapface","aisle","approach"]){
    await page.evaluate(v=>(window as any).setView(v),view);
    await page.screenshot({path:join(outDir,`${view}.png`)});
  }
  console.log("close views written:", outDir);
} finally {await browser.close();server.close();}
