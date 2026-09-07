// struct60-probe-views.ts — one-off azimuth probe for stillwind v2 beads.
// Renders the EXACT v2 bytes at the two honest approach azimuths the stock
// chassis cannot frame: due-east (the village-side approach) and due-south
// (along-gate, worst normal for bead N). Read-only; writes only to
// reviews/struct60-stillwind-v2/az-*.png. Modeled on review-model.ts.
import { createServer } from "node:http";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve, join, normalize } from "node:path";
import { chromium } from "playwright";

const modelPath = "agents/arthur/assets/village_stillwind3.glb";
const outDir = "agents/arthur/reviews/struct60-stillwind-v2";
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
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
root.updateMatrixWorld(true); const original=new THREE.Box3().setFromObject(root); const size=original.getSize(new THREE.Vector3());
const center=original.getCenter(new THREE.Vector3()); root.position.x-=center.x; root.position.z-=center.z; root.position.y-=original.min.y;
root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}}); root.updateMatrixWorld(true);
// NOTE: chassis recenters x/z — the wall's local origin is NOT frame center.
// Beads sit at local (0.566,-0.644) and (-0.383,0.767) relative to model
// bbox center; we re-offset the camera so azimuths are measured in the
// MODEL's own frame (east = +x local, north = -z local).
const target=new THREE.Vector3(0,Math.max(0.7,size.y*0.38),0);
const views={
  east18:[18,1.65,0], south18:[0,1.65,18], east9:[9,1.65,0]
};
window.setView=(name)=>{camera.position.fromArray(views[name]);camera.lookAt(target);renderer.render(scene,camera)};
window.setView('east18'); window.probeReady=true;
</script>`;
const server=createServer((req,res)=>{
  const url=(req.url??"").split("?")[0];
  try {
    if(url==="/"||url==="/index.html"){res.setHeader("content-type","text/html");res.end(html);return;}
    if(url==="/model.glb"){res.setHeader("content-type","model/gltf-binary");res.end(modelBytes);return;}
    if(url==="/three.module.js"){res.setHeader("content-type","text/javascript");res.end(readFileSync(join(THREE_ROOT,"build/three.module.js")));return;}
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
const addr=server.address(); if(!addr||typeof addr==="string") throw new Error("no server address");
const browser=await chromium.launch({ headless: true });
try{
  const page=await browser.newPage({viewport:{width:960,height:720},deviceScaleFactor:1});
  page.on("pageerror", e => console.error("PAGEERROR", e.message));
  await page.goto(`http://127.0.0.1:${addr.port}/`,{waitUntil:"networkidle"});
  await page.waitForFunction(()=> (window as any).probeReady===true, undefined, { timeout: 30_000 });
  for(const view of ["east18","south18","east9"] as const){
    await page.evaluate(v=>(window as any).setView(v),view);
    await page.screenshot({path:join(outDir,`az-${view}.png`)});
  }
  console.log("wrote az-east18 / az-south18 / az-east9");
} finally {await browser.close();server.close();}
