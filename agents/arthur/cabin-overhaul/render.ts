// Local SOLO evidence only: no world connection, upload, verb, or user GUI.
// bun agents/arthur/cabin-overhaul/render.ts <model.glb> <out-dir> [baseline-camera.json|baseline.glb|baseline-render-dir]
// Reuse the BEFORE camera.json for every AFTER candidate. No automatic candidate re-framing.
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, join, extname, sep } from "node:path";
import { chromium } from "playwright";

const modelPath = resolve(process.argv[2] ?? "");
const outDir = resolve(process.argv[3] ?? "");
if (!process.argv[2] || !process.argv[3] || extname(modelPath) !== ".glb") {
  throw Error("usage: bun render.ts <model.glb> <out-dir> [baseline-camera.json|baseline.glb|baseline-render-dir]");
}
const THREE_ROOT = resolve(import.meta.dir, "../../../node_modules/three");
const sha = (b: Buffer | string) => createHash("sha256").update(b).digest("hex");
const modelBytes = readFileSync(modelPath);
let cameraRef: any = null;
let referenceBytes: Buffer | null = null;
if (process.argv[4]) {
  let p = resolve(process.argv[4]);
  if (statSync(p).isDirectory()) p = join(p, "camera.json");
  if (extname(p) === ".glb") referenceBytes = readFileSync(p);
  else cameraRef = JSON.parse(readFileSync(p, "utf8"));
}
const views = ["front", "right", "back", "left", "gameplay", "aerial", "top", "night", "interior"];
const safeJSON = (x: any) => JSON.stringify(x).replaceAll("<", "\\u003c");
const html = `<!doctype html><meta charset="utf-8"><link rel="icon" href="data:,">
<style>html,body{margin:0;width:100%;height:100%;overflow:hidden}canvas{display:block}
#label{position:absolute;left:10px;top:8px;padding:5px 7px;background:#121820c9;color:#eee;font:12px monospace;pointer-events:none}</style>
<div id="label"></div><script type="importmap">{"imports":{"three":"/three/build/three.module.js"}}</script>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from '/three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '/three/examples/jsm/loaders/DRACOLoader.js';
try {
const draco = new DRACOLoader();
draco.setDecoderPath('/three/examples/jsm/libs/draco/gltf/');
draco.setDecoderConfig({type:'wasm'}); draco.setWorkerLimit(1);
const loader = new GLTFLoader().setDRACOLoader(draco);
const gltf = await loader.loadAsync('/model.glb');
const root = gltf.scene; root.updateMatrixWorld(true);
const box = new THREE.Box3().setFromObject(root);
if (box.isEmpty()) throw Error('model has no renderable bounds');
const reference = ${referenceBytes !== null} ? (await loader.loadAsync('/reference.glb')).scene : root;
reference.updateMatrixWorld(true);
const rb = new THREE.Box3().setFromObject(reference), size = rb.getSize(new THREE.Vector3()), ctr = rb.getCenter(new THREE.Vector3());
const R = Math.max(size.x,size.z,4), gy=rb.min.y, cy=Math.max(gy+.7,gy+size.y*.38), eyeY=gy+1.65;
const v=(eye,target,fov=42,night=false)=>({eye,target,fov,night});
const target=[ctr.x,cy,ctr.z];
const defaultRig={version:1,coordinateFrame:'unchanged-model-local',width:960,height:720,near:.05,far:200,
 groundY:gy, referenceBounds:{min:rb.min.toArray(),max:rb.max.toArray()},
 lighting:{day:{background:0xcbd6df,hemi:2,ambient:.45,sun:3.2},night:{background:0x111827,hemi:.18,ambient:.04,sun:.15},sunPosition:[8,12,6]},
 views:{
 front:v([ctr.x,gy+Math.max(2.3,size.y*.55),ctr.z+R*2.05],target),
 right:v([ctr.x+R*2.05,gy+Math.max(2.3,size.y*.55),ctr.z],target),
 back:v([ctr.x,gy+Math.max(2.3,size.y*.55),ctr.z-R*2.05],target),
 left:v([ctr.x-R*2.05,gy+Math.max(2.3,size.y*.55),ctr.z],target),
 gameplay:v([ctr.x,eyeY,ctr.z+18],target),
 aerial:v([ctr.x+R*1.15,gy+Math.max(8,R*1.3),ctr.z+R*1.15],target),
 top:v([ctr.x,gy+Math.max(10,R*2.15),ctr.z+.001],target),
 night:v([ctr.x,eyeY,ctr.z+18],target,42,true),
 interior:v([0,eyeY,1.35],[0,gy+1.2,-1],65)
}};
const rig=${safeJSON(cameraRef)} ?? defaultRig;
const vector=x=>Array.isArray(x)&&x.length===3&&x.every(Number.isFinite);
if(rig.version!==1||rig.coordinateFrame!=='unchanged-model-local'||rig.width!==960||rig.height!==720||!Number.isFinite(rig.groundY)||!(rig.near>0)||!(rig.far>rig.near)) throw Error('invalid fixed camera reference');
if (!vector(rig.lighting?.sunPosition)) throw Error('invalid lighting reference');
for(const key of ['day','night']) {const p=rig.lighting[key];if(!p||!['background','hemi','ambient','sun'].every(k=>Number.isFinite(p[k])))throw Error('invalid light preset '+key);}
for(const name of ${safeJSON(views)}) {const c=rig.views?.[name];if(!c||!vector(c.eye)||!vector(c.target)||!(c.fov>0&&c.fov<180)||typeof c.night!=='boolean'||new THREE.Vector3(...c.eye).distanceTo(new THREE.Vector3(...c.target))<.001) throw Error('invalid fixed camera '+name);}
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1);renderer.setSize(rig.width,rig.height);renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.add(root);
root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2);scene.add(hemi);
const ambient=new THREE.AmbientLight(0xffffff,.45);scene.add(ambient);
const sun=new THREE.DirectionalLight(0xfff1d4,3.2);sun.position.fromArray(rig.lighting.sunPosition);sun.castShadow=true;scene.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.MeshStandardMaterial({color:0x7f8d70,roughness:1}));
ground.rotation.x=-Math.PI/2;ground.position.y=rig.groundY;ground.receiveShadow=true;scene.add(ground);
const camera=new THREE.PerspectiveCamera(42,rig.width/rig.height,rig.near,rig.far);
const meshes=[];root.traverse(o=>{if(o.isMesh)meshes.push(o)});
const stats={bounds:{min:box.min.toArray(),max:box.max.toArray(),size:box.getSize(new THREE.Vector3()).toArray()},
 meshes:meshes.length,triangles:meshes.reduce((n,m)=>n+(m.geometry.index?.count??m.geometry.attributes.position.count)/3,0),
 namedNodes:[],materials:[...new Set(meshes.flatMap(m=>(Array.isArray(m.material)?m.material:[m.material]).map(x=>x.name||'(unnamed)')))].sort(),
 extensionsUsed:gltf.parser.json.extensionsUsed??[]};
root.traverse(o=>{if(o.name)stats.namedNodes.push(o.name)});
window.fixedRig=rig;window.reviewStats=stats;
window.captureView=(name)=>{const v=rig.views[name];if(!v)throw Error('unknown view '+name);
 const l=rig.lighting[v.night?'night':'day'];scene.background=new THREE.Color(l.background);hemi.intensity=l.hemi;ambient.intensity=l.ambient;sun.intensity=l.sun;
 camera.position.fromArray(v.eye);camera.fov=v.fov;camera.up.set(0,1,0);camera.updateProjectionMatrix();camera.lookAt(new THREE.Vector3(...v.target));
 document.getElementById('label').textContent='LOCAL SOLO / NOT IN-WORLD / '+name;
 renderer.render(scene,camera);
 return {eye:camera.position.toArray(),quaternion:camera.quaternion.toArray(),projectionMatrix:camera.projectionMatrix.toArray(),drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles};};
window.captureView('front');window.reviewReady=true;draco.dispose();
} catch(e) {window.reviewError=String(e?.stack??e);console.error(window.reviewError);}
</script>`;

const mime = (p: string) => p.endsWith(".wasm") ? "application/wasm" : p.endsWith(".js") ? "text/javascript" : "application/octet-stream";
const server = createServer((req, res) => {
  try {
    const u = new URL(req.url ?? "/", "http://localhost");
    if (u.pathname === "/") { res.setHeader("content-type", "text/html"); res.end(html); return; }
    if (u.pathname === "/model.glb" || (u.pathname === "/reference.glb" && referenceBytes)) {
      res.setHeader("content-type", "model/gltf-binary"); res.end(u.pathname === "/model.glb" ? modelBytes : referenceBytes); return;
    }
    if (u.pathname.startsWith("/three/")) {
      const p = resolve(THREE_ROOT, decodeURIComponent(u.pathname.slice(7)));
      if (!p.startsWith(THREE_ROOT + sep)) throw Error("path escape");
      res.setHeader("content-type", mime(p)); res.end(readFileSync(p)); return;
    }
    res.statusCode = 404; res.end("not found");
  } catch { res.statusCode = 404; res.end("not found"); }
});
const errors: string[] = [], warnings: string[] = [];
let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;
try {
  await new Promise<void>((yes, no) => { server.once("error", no); server.listen(0, "127.0.0.1", yes); });
  const address = server.address(); if (!address || typeof address === "string") throw Error("no local port");
  const origin = `http://127.0.0.1:${address.port}`;
  browser = await chromium.launch({ headless: true, chromiumSandbox: true });
  const page = await browser.newPage({ viewport: { width: 960, height: 720 }, deviceScaleFactor: 1 });
  await page.route("**/*", route => {
    const u = route.request().url();
    if (/^https?:/.test(u) && new URL(u).origin !== origin) { errors.push("external request refused"); return route.abort(); }
    return route.continue();
  });
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); else if (m.type() === "warning") warnings.push(m.text()); });
  page.on("pageerror", e => errors.push(e.message));
  page.on("requestfailed", r => errors.push(`${new URL(r.url()).pathname}: ${r.failure()?.errorText}`));
  await page.goto(origin, { waitUntil: "networkidle" });
  await page.waitForFunction(() => (window as any).reviewReady || (window as any).reviewError, undefined, { timeout: 60_000 });
  const failure = await page.evaluate(() => (window as any).reviewError);
  if (failure) throw Error(failure);
  if (errors.length) throw Error(errors.join("\n"));
  const rig = await page.evaluate(() => (window as any).fixedRig);
  const stats = await page.evaluate(() => (window as any).reviewStats);
  const cameraJSON = JSON.stringify(rig, null, 2) + "\n";
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "camera.json"), cameraJSON);
  const frames: any[] = [];
  for (const view of views) {
    const actual = await page.evaluate(v => (window as any).captureView(v), view);
    const png = await page.screenshot({ path: join(outDir, `${view}.png`), animations: "disabled" });
    frames.push({ view, file: `${view}.png`, sha256: sha(png), bytes: png.length, camera: actual });
  }
  if (errors.length) throw Error(errors.join("\n"));
  const result = {
    status: "RENDERED", evidenceKind: "local-solo-render-not-in-world", modelPath, modelSha256: sha(modelBytes),
    rendererSha256: sha(readFileSync(import.meta.path)), cameraSha256: sha(cameraJSON),
    referenceModelSha256: referenceBytes ? sha(referenceBytes) : null,
    cameraReference: process.argv[4] ? resolve(process.argv[4]) : null,
    limitations: ["No live terrain, neighbors, component evaluators or authored world lights.", "Interior camera is model-local; inspect/adjust the BEFORE camera.json once per target, then reuse verbatim.", "Rendered evidence is not native visual acceptance."],
    stats, frames, errors, warnings,
  };
  writeFileSync(join(outDir, "render-manifest.json"), JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify({ status: result.status, evidenceKind: result.evidenceKind, modelSha256: result.modelSha256, cameraSha256: result.cameraSha256, views: frames.length, meshes: stats.meshes, triangles: stats.triangles, errors, warnings, outDir }));
} finally {
  await browser?.close();
  await new Promise<void>(done => server.close(() => done()));
}
