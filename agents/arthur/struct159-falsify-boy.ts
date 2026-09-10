// struct159-falsify-boy.ts — falsification rig for the boy native identity
// FAIL (struct-159 native gameplay: "deformed ball", concording struct-136
// fallback "bilobed blob"). Hypothesis (enneper struct-138/139 class): the
// 3-fold pinwheel axis is VERTICAL in the standing build, so every walking
// vantage reads the pinwheel edge-on; pitching the same bytes 90deg about
// world Z puts the axis horizontal and the pinwheel face vertical — if the
// pitched form then reads as a deliberate 3-fold mathematical form from a
// walking vantage, the composition rotation (enneper v3 axle-borne cure
// class) is validated as the v2 fix; if not, do NOT build it.
//
// Renders THREE frames from the exact banked bytes (no rebuild, no mutation):
//   control-gameplay — unrotated, 18m walking vantage (must reproduce the
//                      standing FAIL read; same-rig control)
//   pitch-faceon     — rotation.z = -90deg (pinwheel axis -> world +X),
//                      camera 18m along +X at eye height: pinwheel face-on
//   pitch-oblique    — same pitched form, camera 38deg off the axle
// Stone slab node (material bs_stone) is hidden in the two pitched frames —
// a pitched slab reads as a wall and pollutes the form-read probe. Disclosed.
// Usage: bun agents/arthur/struct159-falsify-boy.ts <model.glb> <outdir>
// Read-only.
import { createServer } from "node:http";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve, join, normalize } from "node:path";
import { chromium } from "playwright";

const modelPath = resolve(process.argv[2] ?? "");
const outDir = resolve(process.argv[3] ?? "agents/arthur/reviews/struct159-boy-v2/falsify");
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
const camera=new THREE.PerspectiveCamera(42,960/720,0.05,200);
const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2.0); scene.add(hemi);
const ambient=new THREE.AmbientLight(0xffffff,0.45); scene.add(ambient);
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(8,12,6); sun.castShadow=true; scene.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(120,120), new THREE.MeshStandardMaterial({color:0x7f8d70,roughness:1})); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const loader=new GLTFLoader(); loader.setDRACOLoader(draco);
const gltf=await loader.loadAsync('/model.glb'); const root=gltf.scene; scene.add(root);
root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
root.updateMatrixWorld(true);
// frame 1: control — unrotated, grounded as standing
const bb0=new THREE.Box3().setFromObject(root); const c0=bb0.getCenter(new THREE.Vector3());
const baseX=root.position.x-c0.x, baseZ=root.position.z-c0.z, baseY=root.position.y-bb0.min.y;
const size=bb0.getSize(new THREE.Vector3());
window.frame=(name)=>{
  // reset to standing pose, then apply per-frame transform
  root.rotation.set(0,0,0); root.position.set(baseX,baseY,baseZ);
  scene.traverse(o=>{if(o.isMesh&&o.material&&o.material.name==='bs_stone')o.visible=true;});
  if(name!=='control-gameplay'){
    // pitch: pinwheel axis (world Y in standing build) -> world +X
    root.rotation.z=-Math.PI/2;
    // hide the pitched slab (wall-read pollution; disclosed)
    scene.traverse(o=>{if(o.isMesh&&o.material&&o.material.name==='bs_stone')o.visible=false;});
  }
  root.updateMatrixWorld(true);
  const bb=new THREE.Box3().setFromObject(root); const c=bb.getCenter(new THREE.Vector3());
  root.position.x+= (0-c.x); root.position.z+=(0-c.z); root.position.y-=(bb.min.y);
  root.updateMatrixWorld(true);
  const bb2=new THREE.Box3().setFromObject(root); const s2=bb2.getSize(new THREE.Vector3());
  const target=new THREE.Vector3(0,Math.max(0.7,s2.y*0.38),0);
  let pos;
  if(name==='control-gameplay') pos=[0,1.65,18];
  else if(name==='pitch-faceon') pos=[18,1.65,0];
  else { const a=38*Math.PI/180; pos=[18*Math.cos(a),1.65,18*Math.sin(a)]; }
  camera.position.fromArray(pos); camera.lookAt(target); renderer.render(scene,camera);
  return true;
};
window.frame('control-gameplay'); window.reviewReady=true;
</script>`;
const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/") { res.setHeader("content-type", "text/html"); res.end(html); return; }
    if (url === "/model.glb") { res.setHeader("content-type", "model/gltf-binary"); res.end(modelBytes); return; }
    if (url === "/three.module.js") { res.setHeader("content-type", "text/javascript"); res.end(readFileSync(threeModule)); return; }
    if (url === "/three.core.js") { res.setHeader("content-type", "text/javascript"); res.end(readFileSync(join(THREE_ROOT, "build/three.core.js"))); return; }
    if (url.startsWith("/draco/")) { const f = url.slice("/draco/".length); const p = join(DRACO_DIR, f); if (!p.startsWith(DRACO_DIR)) throw new Error("escape"); res.setHeader("content-type", f.endsWith(".wasm") ? "application/wasm" : "text/javascript"); res.end(readFileSync(p)); return; }
    if (url.startsWith("/examples/jsm/")) {
      const rel = normalize(url.slice(1)); const p = join(THREE_ROOT, rel);
      if (!p.startsWith(THREE_ROOT)) throw new Error("path escape");
      const s = readFileSync(p, "utf8").replaceAll("from 'three'", "from '/three.module.js'").replaceAll('from "three"', 'from "/three.module.js"');
      res.setHeader("content-type", "text/javascript"); res.end(s); return;
    }
    res.statusCode = 404; res.end("not found");
  } catch (e: any) { res.statusCode = 500; res.end(String(e?.message ?? e)); }
});
await new Promise<void>(r => server.listen(0, "127.0.0.1", r));
const addr = server.address(); if (!addr || typeof addr === "string") throw new Error("no server address");
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 960, height: 720 }, deviceScaleFactor: 1 });
  page.on("console", m => { if (m.type() === "error") console.error("BROWSER", m.type(), m.text()); });
  page.on("pageerror", e => console.error("PAGEERROR", e.message));
  await page.goto(`http://127.0.0.1:${addr.port}/`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => (window as any).reviewReady === true, undefined, { timeout: 120_000 });
  for (const name of ["control-gameplay", "pitch-faceon", "pitch-oblique"]) {
    await page.evaluate((n) => (window as any).frame(n), name);
    await page.screenshot({ path: join(outDir, `${name}.png`) });
    console.log(`rendered ${name}.png`);
  }
  console.log(`DONE -> ${outDir}`);
} finally { await browser.close(); server.close(); }
