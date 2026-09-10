// struct150-filmprobe-gyroid.ts — projected-area probe for gyroid v2 (pitfall-11
// law: vision quantitative claims are probes, not a verdict). s176's native read:
// "curved cream panels with iron pipe edge-trim and two punched circular holes,
// NOT a periodic tunnel labyrinth". Hypothesis (decode-proven on live-pinned
// bytes da2a4b15: gy_bone doubleSided=False): FrontSide culling hides every
// film face whose winding faces away — half the labyrinth walls — so the mouths
// read as punched holes in panels. Measure film projected area at three
// eye-level vantages on the CURRENT bytes (RED), then on v2 (GREEN, struct-139
// enneper chassis adapted: material gy_bone, heart-height target).
// Read-only; writes nothing.
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const MODEL = process.argv[2] ?? join(ROOT, "agents/arthur/assets/village_gyroid3.glb");
const bytes = readFileSync(MODEL);
const THREE_ROOT = join(ROOT, "node_modules/three");
const html = `<!doctype html><style>html,body{margin:0}canvas{display:block}</style><script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
const r = new THREE.WebGLRenderer({antialias:true, preserveDrawingBuffer:true});
r.setPixelRatio(1); r.setSize(960,720); r.outputColorSpace = THREE.SRGBColorSpace; r.shadowMap.enabled = false;
document.body.appendChild(r.domElement);
const s = new THREE.Scene(); s.background = new THREE.Color(0xcbd6df);
const cam = new THREE.PerspectiveCamera(42, 960/720, 0.05, 200);
const hemi = new THREE.HemisphereLight(0xffffff, 0x48505a, 2.0); s.add(hemi);
const amb = new THREE.AmbientLight(0xffffff, 0.45); s.add(amb);
const sun = new THREE.DirectionalLight(0xfff1d4, 3.2); sun.position.set(8,12,6); s.add(sun);
const loader = new GLTFLoader();
const g = (await loader.loadAsync('/model/x.glb')).scene;
s.add(g);
g.updateMatrixWorld(true);
const box = new THREE.Box3().setFromObject(g);
g.position.x -= (box.min.x + box.max.x) / 2; g.position.z -= (box.min.z + box.max.z) / 2; g.position.y -= box.min.y;
g.updateMatrixWorld(true);
let filmMesh = null;
g.traverse(o => { if (o.isMesh && o.material && o.material.name === 'gy_bone') filmMesh = o; });
window.hasFilm = !!filmMesh;
window.shotAt = (px,py,pz) => {
  cam.position.set(px,py,pz); cam.lookAt(0, 2.1, 0); r.render(s,cam);
};
window.setFilm = (v) => { if (filmMesh) filmMesh.visible = v; r.render(s,cam); };
const gl = r.getContext();
window.countBg = () => {
  const w = 960, h = 720;
  const d = new Uint8Array(w*h*4);
  gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,d);
  let bg = 0;
  for (let i = 0; i < w*h; i++) {
    const r0 = d[i*4], g0 = d[i*4+1], b0 = d[i*4+2];
    if (Math.abs(r0-203) < 7 && Math.abs(g0-214) < 7 && Math.abs(b0-223) < 7) bg++;
  }
  return bg;
};
window.palette = () => {
  const d = new Uint8Array(960*720*4);
  gl.readPixels(0,0,960,720,gl.RGBA,gl.UNSIGNED_BYTE,d);
  const m = new Map();
  for (let i = 0; i < 960*720; i++) {
    const k = (d[i*4]>>4)+","+(d[i*4+1]>>4)+","+(d[i*4+2]>>4);
    m.set(k,(m.get(k)||0)+1);
  }
  return [...m.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8);
};
window.ready = true;
</script>`;
const server = createServer((req, res) => {
  const u = (req.url ?? "/").split("?")[0];
  try {
    if (u === "/") { res.setHeader("content-type", "text/html"); res.end(html); return; }
    if (u === "/three.module.js") { res.setHeader("content-type", "text/javascript"); res.end(readFileSync(join(THREE_ROOT, "build/three.module.js"))); return; }
    if (u === "/three.core.js") { res.setHeader("content-type", "text/javascript"); res.end(readFileSync(join(THREE_ROOT, "build/three.core.js"))); return; }
    if (u.startsWith("/examples/jsm/")) {
      const p = join(THREE_ROOT, u.slice(1));
      let x = readFileSync(p, "utf8").replaceAll("from 'three'", "from '/three.module.js'").replaceAll('from "three"', 'from "/three.module.js"');
      res.setHeader("content-type", "text/javascript");
      res.end(x); return;
    }
    const m = u.match(/^\/model\/(.+)\.glb$/);
    if (m) { res.setHeader("content-type", "model/gltf-binary"); res.end(bytes); return; }
    res.statusCode = 404; res.end("not found");
  } catch (e) { res.statusCode = 500; res.end(String(e)); }
});
await new Promise<void>(q => server.listen(0, "127.0.0.1", q));
const addr: any = server.address();
const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 960, height: 720 } });
p.on("console", m => console.error("BROWSER", m.type(), m.text()));
p.on("pageerror", e => console.error("PAGEERROR", e.message));
p.on("requestfailed", r => console.error("REQUESTFAILED", r.url(), r.failure()?.errorText));
await p.goto(`http://127.0.0.1:${addr.port}/`, { waitUntil: "domcontentloaded" });
await p.waitForFunction(() => window.ready === true, undefined, { timeout: 120_000 });
const hasFilm = await p.evaluate(() => window.hasFilm);
console.log(`model: ${MODEL}`);
console.log(`film mesh (gy_bone) found: ${hasFilm}`);
const D = 18, A = 0.7071067811865476;
const vants: Array<[string, number, number, number]> = [
  ["edge-on +z (gameplay)", 0, 1.65, D],
  ["face-on +x (cube face)", D, 1.65, 0],
  ["45-deg oblique", D * A, 1.65, D * A],
];
const FRAME = 960 * 720;
for (const [name, px, py, pz] of vants) {
  await p.evaluate(([a, b2, c]) => window.shotAt(a, b2, c), [px, py, pz]);
  await p.evaluate(() => window.setFilm(false));
  const bgHidden = await p.evaluate(() => window.countBg());
  await p.evaluate(() => window.setFilm(true));
  const bgVis = await p.evaluate(() => window.countBg());
  if (bgHidden >= 691200 - 1000) { const pal = await p.evaluate(() => window.palette()); console.log(`  SANITY palette: ${JSON.stringify(pal.slice(0,5))}`); }
  const filmPx = bgHidden - bgVis; // pixels where film now covers sky
  console.log(`${name}: film projected ${filmPx}px = ${(100 * filmPx / FRAME).toFixed(1)}% of frame (sky ${bgVis}->${bgHidden} bg-class px)`);
}
await b.close(); server.close();
