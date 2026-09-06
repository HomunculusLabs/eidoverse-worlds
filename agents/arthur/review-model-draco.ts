// review-model-draco.ts — improve-N lane: review-model.ts chassis with DRACO
// support for live store-min bytes (server serves DRACO-compressed shadows via
// /library/store/). Renders the same 8 views. Read-only.
// Usage: bun agents/arthur/review-model-draco.ts <model.glb> <output-dir>
import { createServer } from "node:http";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve, join, normalize } from "node:path";
import { chromium } from "playwright";

const modelPath = resolve(process.argv[2] ?? "");
const outDir = resolve(process.argv[3] ?? "agents/arthur/reviews/model");
if (!modelPath.endsWith(".glb")) throw new Error("first argument must be a .glb path");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const DRACO_DIR = join(THREE_ROOT, "examples/jsm/libs/draco/gltf/");
const threeModule = join(THREE_ROOT, "build/three.module.js");
const modelBytes = readFileSync(modelPath);
const html = `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#cbd6df}canvas{display:block}
</style><script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '/examples/jsm/loaders/DRACOLoader.js';
const draco=new DRACOLoader(); draco.setDecoderPath('/draco/');
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1); renderer.setSize(960,720); renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true; document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene(); scene.background=new THREE.Color(0xcbd6df);
const camera=new THREE.PerspectiveCamera(42,960/720,0.05,100);
const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2.0); scene.add(hemi);
const ambient=new THREE.AmbientLight(0xffffff,0.45); scene.add(ambient);
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(8,12,6); sun.castShadow=true; scene.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x7f8d70,roughness:1})); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const loader=new GLTFLoader(); loader.setDRACOLoader(draco);
const gltf=await loader.loadAsync('/model.glb'); const root=gltf.scene; scene.add(root);
root.updateMatrixWorld(true); const original=new THREE.Box3().setFromObject(root); const size=original.getSize(new THREE.Vector3());
const center=original.getCenter(new THREE.Vector3()); root.position.x-=center.x; root.position.z-=center.z; root.position.y-=original.min.y;
root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}}); root.updateMatrixWorld(true);
const nodes=[]; root.traverse(o=>nodes.push(o.name||'(unnamed)'));
const meshes=[]; root.traverse(o=>{if(o.isMesh)meshes.push(o)});
window.reviewStats={bounds:{min:original.min.toArray(),max:original.max.toArray(),size:size.toArray()},nodes:nodes.length,drawMeshes:meshes.length,namedNodes:nodes.filter(n=>n!=='(unnamed)')};
const r=Math.max(size.x,size.z,4); const target=new THREE.Vector3(0,Math.max(0.7,size.y*0.38),0);
const views={
 front:[0,Math.max(2.3,size.y*.55),r*2.05], right:[r*2.05,Math.max(2.3,size.y*.55),0],
 back:[0,Math.max(2.3,size.y*.55),-r*2.05], left:[-r*2.05,Math.max(2.3,size.y*.55),0],
 gameplay:[0,1.65,18], aerial:[r*1.15,Math.max(8,r*1.3),r*1.15], top:[0,Math.max(10,r*2.15),0.001]
};
window.setView=(name)=>{camera.position.fromArray(views[name]);camera.lookAt(target);renderer.render(scene,camera)};
window.setNight=(on)=>{scene.background.set(on?0x111827:0xcbd6df);hemi.intensity=on?.18:2;ambient.intensity=on?.04:.45;sun.intensity=on?.15:3.2;renderer.render(scene,camera)};
window.setView('front'); window.reviewReady=true;
</script>`;

const server=createServer((req,res)=>{
  const url=(req.url??"/").split("?")[0];
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
const browser=await chromium.launch({ headless: true });
try{
  const page=await browser.newPage({viewport:{width:960,height:720},deviceScaleFactor:1});
  page.on("console", m => { if(m.type()==="error") console.error("BROWSER", m.type(), m.text()); });
  page.on("pageerror", e => console.error("PAGEERROR", e.message));
  await page.goto(`http://127.0.0.1:${addr.port}/`,{waitUntil:"networkidle"});
  await page.waitForFunction(()=> (window as any).reviewReady===true, undefined, { timeout: 60_000 });
  for(const view of ["front","right","back","left","gameplay","aerial","top"]){await page.evaluate(v=>(window as any).setView(v),view);await page.screenshot({path:join(outDir,`${view}.png`)});}
  await page.evaluate(()=>{(window as any).setView("gameplay");(window as any).setNight(true)}); await page.screenshot({path:join(outDir,"night.png")});
  const stats=await page.evaluate(()=> (window as any).reviewStats); console.log(JSON.stringify(stats));
} finally {await browser.close();server.close();}
