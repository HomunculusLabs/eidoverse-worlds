// struct160-approach-boy-v2.ts — approach-frame renders of village_boy3.glb
// v2 EXACT BUILT BYTES (no pitch, no rebuild, read-only). The stock chassis
// (review-model.ts) covers front/right/back/left/gameplay/aerial/top/night;
// this rig adds the PLACEMENT-CONTRACT vantages (struct-159 authored law:
// axle oblique 35-45deg off the approach normal; v2 pinwheel face normal =
// world x = the axle):
//   approach-faceon-18   — camera [18,1.65,0], down the axle: the pinwheel
//                          face-on (falsify-rig IDENTITY PASS vantage)
//   approach-oblique-38-18 — camera 38deg off the axle at 18m: the seated
//                          walking vantage class (placement law)
//   approach-broadside-18  — camera [0,1.65,18]: film sheet broadside, the
//                          v1-fail vantage re-read on v2 bytes (control)
//   approach-oblique-38-13 / -8 — the 3-distance ladder (loop law)
//   night-oblique-38-18    — night identity at the seated vantage
// Frames the model by bbox center like the falsify chassis; ground plane,
// stock lighting values, slab VISIBLE (this is the real composition).
// Usage: bun agents/arthur/struct160-approach-boy-v2.ts <model.glb> <outdir>
import { createServer } from "node:http";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve, join, normalize } from "node:path";
import { chromium } from "playwright";

const modelPath = resolve(process.argv[2] ?? "");
const outDir = resolve(process.argv[3] ?? "agents/arthur/reviews/struct160-boy-v2");
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
const bb=new THREE.Box3().setFromObject(root); const c=bb.getCenter(new THREE.Vector3());
root.position.x-=c.x; root.position.z-=c.z; root.position.y-=bb.min.y;
root.updateMatrixWorld(true);
const bb2=new THREE.Box3().setFromObject(root); const s2=bb2.getSize(new THREE.Vector3());
const target=new THREE.Vector3(0,Math.max(0.7,s2.y*0.38),0);
const deg=Math.PI/180;
window.shot=(name,dist,angDeg,night)=>{
  const a=angDeg*deg;
  camera.position.set(dist*Math.cos(a),1.65,dist*Math.sin(a));
  camera.lookAt(target);
  if(night){scene.background.set(0x111827);hemi.intensity=.18;ambient.intensity=.04;sun.intensity=.15;}
  else{scene.background.set(0xcbd6df);hemi.intensity=2;ambient.intensity=.45;sun.intensity=3.2;}
  renderer.render(scene,camera);
  return true;
};
window.shot('init',18,90,false); window.reviewReady=true;
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
            if (!p.startsWith(THREE_ROOT)) throw new Error("path escape"); const s = readFileSync(p, "utf8").replaceAll("from 'three'", "from '/three.module.js'").replaceAll('from "three"', 'from "/three.module.js"');
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
    // (name, dist, angleDeg off +x axle, night) — angle 0 = down the axle (face-on),
    // 90 = broadside (film sheet), 38 = placement-law oblique
    const frames: [string, number, number, boolean][] = [
        ["approach-faceon-18", 18, 0, false],
        ["approach-oblique-38-18", 18, 38, false],
        ["approach-broadside-18", 18, 90, false],
        ["approach-oblique-38-13", 13, 38, false],
        ["approach-oblique-38-8", 8, 38, false],
        ["night-oblique-38-18", 18, 38, true],
        ["night-faceon-18", 18, 0, true],
    ];
    for (const [name, dist, ang, night] of frames) {
        await page.evaluate(([n, d, a, ni]) => (window as any).shot(n, d, a, ni), [name, dist, ang, night] as [string, number, number, boolean]);
        await page.screenshot({ path: join(outDir, `${name}.png`) });
        console.log(`rendered ${name}.png`);
    }
    console.log(`DONE -> ${outDir}`);
} finally { await browser.close(); server.close(); }
