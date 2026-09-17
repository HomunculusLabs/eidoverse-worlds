// struct210-render-arbelos.ts — build-review renders of the LOCAL exact bytes
// village_arbelos3.glb (sha 1a0b3967..., struct-210 v1, BANKED pre-placement).
// Chassis = struct208-render-morley.ts verbatim (survey377 archispiral lineage,
// dress108 DRACO-aware rig) + review-model view set + night toggle + face-on
// night frame (arbelos' sole night element = one warm bead at D, where the
// construction ruler meets the sky-arc — s363 sole-bead law; front face-on
// frame binds) + closeface view (the construction read: the blade + the twins
// + the ruler + the sole); ground = LIVE-MEADOW tone 0x3d3a29 (dress-106 law).
import { createServer } from "node:http";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const modelPath = resolve(process.argv[2] ?? "");
const outDir = resolve(process.argv[3] ?? "agents/arthur/reviews/struct210-arbelos");
if (!modelPath.endsWith(".glb")) throw new Error("first argument must be a .glb path");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const DRACO_DIR = resolve("node_modules/three/examples/jsm/libs/draco/gltf/");
const threeModule = resolve(THREE_ROOT, "build/three.module.js");
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
const camera=new THREE.PerspectiveCamera(42,960/720,0.05,300);
const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2.0); scene.add(hemi);
const ambient=new THREE.AmbientLight(0xffffff,0.45); scene.add(ambient);
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(8,12,6); sun.castShadow=true; scene.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.MeshStandardMaterial({color:0x3d3a29,roughness:1})); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const loader=new GLTFLoader(); loader.setDRACOLoader(draco);
const gltf=await loader.loadAsync('/model.glb'); const root=gltf.scene; scene.add(root);
root.updateMatrixWorld(true); const bb=new THREE.Box3().setFromObject(root);
const size=bb.getSize(new THREE.Vector3()); const center=bb.getCenter(new THREE.Vector3());
root.position.x-=center.x; root.position.z-=center.z; root.position.y-=bb.min.y;
root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
root.updateMatrixWorld(true);
window.reviewStats={bounds:{min:bb.min.toArray(),max:bb.max.toArray(),size:size.toArray()},center:center.toArray()};
const r=Math.max(size.x,size.z,4); const target=new THREE.Vector3(0,Math.max(0.7,size.y*0.38),0);
const views={
 front:[0,Math.max(2.3,size.y*.55),r*2.05], right:[r*2.05,Math.max(2.3,size.y*.55),0],
 back:[0,Math.max(2.3,size.y*.55),-r*2.05], left:[-r*2.05,Math.max(2.3,size.y*.55),0],
 gameplay:[0,1.65,18], top:[0,Math.max(10,r*2.15),0.001],
 closeface:[0,size.y*.5,Math.max(8,r*1.15)]
};
window.setView=(name)=>{camera.position.fromArray(views[name]);camera.lookAt(target);renderer.render(scene,camera)};
window.setNight=(on)=>{scene.background.set(on?0x111827:0xcbd6df);hemi.intensity=on?.18:2;ambient.intensity=on?.04:.45;sun.intensity=on?.15:3.2;renderer.render(scene,camera)};
window.setView('gameplay'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/model.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(modelBytes); }
    if (url === "/three.module.js") { res.writeHead(200, { "content-type": "text/javascript" }); return res.end(readFileSync(threeModule)); }
    if (url === "/three.core.js") { res.writeHead(200, { "content-type": "text/javascript" }); return res.end(readFileSync(resolve(THREE_ROOT, "build/three.core.js"))); }
    if (url.startsWith("/examples/jsm/")) {
      const rel = url.slice(1);
      const p = resolve(THREE_ROOT, rel);
      if (!p.startsWith(THREE_ROOT)) throw new Error("path escape");
      const s = readFileSync(p, "utf8").replaceAll("from 'three'", "from '/three.module.js'").replaceAll('from "three"', 'from "/three.module.js"');
      res.writeHead(200, { "content-type": "text/javascript" }); return res.end(s);
    }
    if (url.startsWith("/draco/")) {
      const f = url.slice("/draco/".length);
      const p = resolve(DRACO_DIR, f);
      if (!p.startsWith(DRACO_DIR)) throw new Error("escape");
      res.writeHead(200, { "content-type": f.endsWith(".wasm") ? "application/wasm" : "text/javascript" }); return res.end(readFileSync(p));
    }
    res.writeHead(404); res.end("not found");
  } catch (e: any) { res.statusCode = 500; res.end(String(e?.message ?? e)); }
});
await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
const port = (server.address() as any).port;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 960, height: 720 }, deviceScaleFactor: 1 });
page.on("console", (m) => { if (m.type() === "error") console.error("BROWSER", m.type(), m.text()); });
page.on("pageerror", (e) => console.error("PAGEERROR", e.message));
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
await page.waitForFunction(() => (window as any).reviewReady === true, undefined, { timeout: 60_000 });
const stats = await page.evaluate(() => (window as any).reviewStats);
console.log("BOUNDS", JSON.stringify(stats));
for (const v of ["gameplay", "front", "right", "back", "left", "closeface", "top"]) {
  await page.evaluate((n) => (window as any).setView(n), v);
  await page.waitForTimeout(120);
  await page.screenshot({ path: resolve(outDir, `${v}.png`) });
}
await page.evaluate(() => (window as any).setNight(true));
await page.evaluate((n) => (window as any).setView(n), "gameplay");
await page.waitForTimeout(120);
await page.screenshot({ path: resolve(outDir, "night.png") });
// face-on night frame (s363 law): arbelos' sole night element is the warm
// bead at D, where the construction ruler meets the sky-arc — the front
// face-on frame binds the sole-bead census.
await page.evaluate((n) => (window as any).setView(n), "front");
await page.waitForTimeout(120);
await page.screenshot({ path: resolve(outDir, "night-face.png") });
await browser.close();
server.close();
console.log(`wrote struct210 arbelos renders -> ${outDir}`);
