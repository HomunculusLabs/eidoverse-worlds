// dress108-render-hookrow.ts — v1 review renders (sha 8d723b69). The hook
// row reads along the devotional walking line (row local +x), hooks facing
// local -z (toward the corridor). Four views:
//   approach18  — 18m from -z, mid-row: the district-scan read (row rhythm)
//   approach30  — 30m from -z: does the row carry at distance
//   close4      — 4m from -z: the hook read (post courses, crook, hand-stone)
//   oblique     — quarter view: row directionality + hook side
import { createServer } from "node:http";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const modelPath = resolve(process.argv[2] ?? "");
const outDir = resolve(process.argv[3] ?? "agents/arthur/reviews/dress108-hookrow-v1");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const DRACO_DIR = resolve("node_modules/three/examples/jsm/libs/draco/gltf/");
const threeModule = resolve("node_modules/three/build/three.module.js");
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
const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.MeshStandardMaterial({color:0x3d3a29,roughness:1})); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
// ^ v14 calibration (dress-106): LIVE-MEADOW tone, not studio green. Measured
// on dress-105's accepted live-seat walker frame, ground rgb(60,57,41). The
// old 0x7f8d70 studio grass renders 1.18x its albedo while plain-mat() GLB
// props (no glTF material -> loader-default metal-1, COLOR_0-tinted; struct-38
// class, probe-proven 0.53-0.70x) could NEVER read pale against it — a rig
// artifact, not an asset defect. Judging happens against the ground viewers
// actually see in-world.
const loader=new GLTFLoader(); loader.setDRACOLoader(draco);
const gltf=await loader.loadAsync('/model.glb'); const root=gltf.scene; scene.add(root);
root.updateMatrixWorld(true); const bb=new THREE.Box3().setFromObject(root);
const center=bb.getCenter(new THREE.Vector3());
root.position.x-=center.x; root.position.z-=center.z; root.position.y-=bb.min.y;
root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
root.updateMatrixWorld(true);
// row center sits ~2.7 - center.x in x; target mid-row
const views={
  approach18:[2.8, 1.65, 18.5],   // from -z: hook-side read, row rhythm
  approach30:[2.8, 1.65, 30],
  close4:[2.0, 1.45, 4.2],        // eye lowered: post/hook/hand-stone read
  oblique:[-9, 1.65, 12],         // quarter: row directionality
  // dress-109 re-judge view: framing control for the 2-post/dead-gap read —
  // close4's camera sits at post-1's shoulder (world x≈0.03, 42° FOV at 4.2m
  // covers ~3.2m) so post 3 (x=3.7) is CROPPED and the judge saw a partial
  // row. closewide centers on the row midpoint and holds all three posts.
  closewide:[2.8, 1.30, 7.5],
};
const target=new THREE.Vector3(2.7 - center.x, 0.45, 0);
window.setView=(name)=>{camera.position.set(views[name][0] - center.x, views[name][1], views[name][2] - center.z);camera.lookAt(target);renderer.render(scene,camera)};
window.setView('approach18'); window.reviewReady=true;
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
      res.writeHead(200, { "content-type": f.endsWith(".wasm") ? "application/wasm" : "text/javascript" });
      return res.end(readFileSync(p));
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
for (const v of ["approach18", "approach30", "close4", "oblique", "closewide"]) {
  await page.evaluate((n) => (window as any).setView(n), v);
  await page.waitForTimeout(120);
  await page.screenshot({ path: resolve(outDir, `${v}.png`) });
}
await browser.close();
server.close();
console.log(`wrote hookrow renders → ${outDir}`);
