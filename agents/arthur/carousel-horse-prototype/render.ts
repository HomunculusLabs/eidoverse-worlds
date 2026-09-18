// Offline exact-byte comparison of one horse prototype. Synthetic lighting/motion; NOT a live rider test.
// review-model.ts — local, read-only GLB review renderer for inspect→approve→place.
// Usage: bun agents/arthur/review-model.ts <model.glb> <output-dir>
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, extname, join, normalize } from "node:path";
import { chromium } from "/Users/t3rpz/projects/node_modules/playwright/index.mjs";

import { createHash } from "node:crypto";
const modelPath = resolve(process.argv[2] ?? "");
const outDir = resolve(process.argv[3] ?? "agents/arthur/reviews/model");
if (!modelPath.endsWith(".glb")) throw new Error("first argument must be a .glb path");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = "/Users/t3rpz/projects/eidoverse-worlds/node_modules/three";
const threeModule = join(THREE_ROOT, "build/three.module.js");
const modelBytes = readFileSync(modelPath);
const html = `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#cbd6df}canvas{display:block}
</style><script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '/examples/jsm/loaders/DRACOLoader.js';
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1); renderer.setSize(960,720); renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true; document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene(); scene.background=new THREE.Color(0xcbd6df);
const camera=new THREE.PerspectiveCamera(42,960/720,0.05,100);
const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2.0); scene.add(hemi);
// nvp-14: four-angle inspection needs neutral fill; the single +Z key made
// every -Z face render near-black and falsely hid valid backside geometry.
const ambient=new THREE.AmbientLight(0xffffff,0.45); scene.add(ambient);
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(8,12,6); sun.castShadow=true; scene.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x7f8d70,roughness:1}));
ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const draco=new DRACOLoader().setDecoderPath('/draco/');
const data=await (await fetch('/model.glb')).arrayBuffer();const gltf=await new GLTFLoader().setDRACOLoader(draco).parseAsync(data,'/'); const root=gltf.scene; scene.add(root);
root.updateMatrixWorld(true); const original=new THREE.Box3().setFromObject(root); const size=original.getSize(new THREE.Vector3());
// Keep both carousel revisions at their authored origin; never fit separately.
root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}}); root.updateMatrixWorld(true);
const horseSolo=root.getObjectByName('horse_2').clone(true);
horseSolo.position.set(0,0.26,0);horseSolo.quaternion.identity();horseSolo.scale.setScalar(1);horseSolo.visible=false;scene.add(horseSolo);
let order=0;scene.traverse(o=>{if(o.isMesh)o.userData.reviewOrder=order++;});
renderer.setOpaqueSort((a,b)=>a.groupOrder-b.groupOrder||a.renderOrder-b.renderOrder||a.object.userData.reviewOrder-b.object.userData.reviewOrder);
window.horseView=(view)=>{
 root.visible=false;horseSolo.visible=true;
 const poses={side:[3.5,1,0.1],front:[0,1.05,3.5],threequarter:[2.65,1.45,2.65],rear:[2.65,1.25,-2.65]};
 camera.position.fromArray(poses[view]);camera.lookAt(0,.82,0.02);renderer.render(scene,camera);
};
window.ensembleView=()=>{root.visible=true;horseSolo.visible=false;camera.position.set(7,2.6,7);camera.lookAt(0,2.6,0);renderer.render(scene,camera)};
const nodes=[]; root.traverse(o=>nodes.push(o.name||'(unnamed)'));
const meshes=[]; root.traverse(o=>{if(o.isMesh)meshes.push(o)});
window.reviewStats={label:"LOCAL EXACT-BYTE REVIEW, NOT IN-WORLD",horse:"horse_2",opaqueSort:"source traversal",bounds:{min:original.min.toArray(),max:original.max.toArray(),size:size.toArray()},nodes:nodes.length,drawMeshes:meshes.length,namedNodes:nodes.filter(n=>n!=='(unnamed)'),materials:[...new Set(meshes.flatMap(m=>(Array.isArray(m.material)?m.material:[m.material]).map(x=>x.name||'(unnamed)')))].sort()};
// Freeze camera fit to the served baseline, including Draco accessor metadata.
// NodeIO legitimately recomputes min/max from decoded vertices; don't let that move a camera.
const rigSize=new THREE.Vector3(7.099999904632568,6.7699999833107,7.389999949932099);
const r=Math.max(rigSize.x,rigSize.z,4); const target=new THREE.Vector3(0,Math.max(0.7,rigSize.y*0.38),0);
const views={
 front:[0,Math.max(2.3,rigSize.y*.55),r*2.05], right:[r*2.05,Math.max(2.3,rigSize.y*.55),0],
 back:[0,Math.max(2.3,rigSize.y*.55),-r*2.05], left:[-r*2.05,Math.max(2.3,rigSize.y*.55),0],
 gameplay:[0,1.65,18], aerial:[r*1.15,Math.max(8,r*1.3),r*1.15], top:[0,Math.max(10,r*2.15),0.001]
};
let phase=0;
const carousel=root.getObjectByName('carousel');
const forgeCoals=root.getObjectByName('fire_fg_coals'),forgeCoalsBase=forgeCoals?.position.y;
const horsePhases={horse_0:0,horse_2:1.57,horse_4:3.14,horse_6:4.71};
const horseBases={};for(const n of Object.keys(horsePhases)){const h=root.getObjectByName(n);if(h)horseBases[n]=h.position.y;}
window.setView=(name)=>{camera.position.fromArray(views[name]);camera.lookAt(target);renderer.render(scene,camera)};
window.setNight=(on)=>{scene.background.set(on?0x111827:0xcbd6df);hemi.intensity=on?.18:2;ambient.intensity=on?.04:.45;sun.intensity=on?.15:3.2;renderer.render(scene,camera)};
window.setMotionPhase=(p)=>{phase=p;const w=root.getObjectByName('well_'),k=root.getObjectByName('pz_kettle');if(w)w.rotation.x=Math.sin(p)*THREE.MathUtils.degToRad(3);if(k)k.rotation.z=Math.sin(p+.7)*THREE.MathUtils.degToRad(2.5);if(carousel)carousel.rotation.y=p*0.2;if(forgeCoals&&forgeCoalsBase!==undefined)forgeCoals.position.y=forgeCoalsBase+0.014*Math.sin(p);for(const [n,ph] of Object.entries(horsePhases)){const h=root.getObjectByName(n);if(h&&horseBases[n]!==undefined)h.position.y=horseBases[n]+0.18*Math.sin(p+ph);}renderer.render(scene,camera)};
window.inspectFrame=(label)=>{
 scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
 // Boarding is an intentional under-canopy horse closeup, not a full-roof shot.
 const subject=label==='boarding'?root.getObjectByName('horse_2'):(root.visible?root:horseSolo);
 let vertices=0,clipped=0;const p=new THREE.Vector3();
 subject.traverse(o=>{if(o.isMesh){const a=o.geometry.getAttribute('position');for(let i=0;i<a.count;i++){
  p.fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld).project(camera);vertices++;
  if(!Number.isFinite(p.x+p.y+p.z)||Math.max(Math.abs(p.x),Math.abs(p.y),Math.abs(p.z))>1.00001)clipped++;
 }}});
 return {vertices,clipped,scope:label==='boarding'?'horse_2 under-canopy closeup':root.visible?'full model':'isolated horse_2',camera:camera.position.toArray(),quaternion:camera.quaternion.toArray()};
};
window.setView('front'); window.reviewReady=true;
</script>`;

const server=createServer((req,res)=>{
  const url=(req.url??"/").split("?")[0];
  try {
    if(url==="/"||url==="/index.html"){res.setHeader("content-type","text/html");res.end(html);return;}
    if(url==="/model.glb"){res.setHeader("content-type","model/gltf-binary");res.setHeader("content-length",modelBytes.length);res.end(modelBytes);return;}
    if(url==="/three.module.js"){res.setHeader("content-type","text/javascript");res.end(readFileSync(threeModule));return;}
    if(url==="/three.core.js"){res.setHeader("content-type","text/javascript");res.end(readFileSync(join(THREE_ROOT,"build/three.core.js")));return;}
    if(['/draco/draco_wasm_wrapper.js','/draco/draco_decoder.wasm','/draco/draco_decoder.js'].includes(url)){
      res.setHeader('content-type',url.endsWith('.wasm')?'application/wasm':'text/javascript');
      res.end(readFileSync(join(THREE_ROOT,'examples/jsm/libs/draco/gltf',url.slice('/draco/'.length))));return;
    }
    if(url.startsWith("/examples/jsm/")){
      const rel=normalize(url.slice(1)); const p=join(THREE_ROOT,rel);
      if(!p.startsWith(THREE_ROOT+"/examples/jsm/")) throw new Error("path escape");
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
  page.on("console", m => console.error("BROWSER", m.type(), m.text()));
  page.on("pageerror", e => console.error("PAGEERROR", e.message));
  page.on("requestfailed", r => console.error("REQUESTFAILED", r.url(), r.failure()?.errorText));
  await page.goto(`http://127.0.0.1:${addr.port}/`,{waitUntil:"networkidle"});
  await page.waitForFunction(()=> (window as any).reviewReady===true, undefined, { timeout: 30_000 });
  const framing:Record<string,any>={};
  async function capture(label:string){
    const result=await page.evaluate(v=>(window as any).inspectFrame(v),label);framing[label]=result;
    if(!result.vertices||result.clipped)throw new Error(`Cropped or empty ${label}: ${JSON.stringify(result)}`);
    await page.screenshot({path:join(outDir,label+'.png')});
  }
  for(const view of ["front","right","back","left","gameplay","aerial","top"]){await page.evaluate(v=>(window as any).setView(v),view);await capture(view);}
  await page.evaluate(()=>{(window as any).setView("gameplay");(window as any).setNight(true)}); await capture('night');
  await page.evaluate(()=>{(window as any).setNight(false);(window as any).setView("front");(window as any).setMotionPhase(0)}); await capture('motion-a');
  await page.evaluate(()=> (window as any).setMotionPhase(Math.PI/2)); await capture('motion-b');
  await page.evaluate(()=>{(window as any).setNight(false);(window as any).setMotionPhase(0);(window as any).ensembleView()});
  await capture('boarding');
  for(const view of ['side','front','threequarter','rear']){await page.evaluate(v=>(window as any).horseView(v),view);await capture('horse-'+view);}
  const stats=await page.evaluate(()=> (window as any).reviewStats);stats.sha256=createHash("sha256").update(modelBytes).digest("hex");stats.framing=framing;
  writeFileSync(join(outDir,"stats.json"),JSON.stringify(stats,null,2));console.log(JSON.stringify(stats,null,2));
} finally {await browser.close();server.close();}

