// dress105-live-seat-render.ts — render the SEATED streamstones pose
// exactly as live (exact tuple + forest-0057 host context) for Bill's
// eye-check packet. Read-only.
import { createServer } from "node:http";
import { readFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const OUT = join(ROOT, "agents/arthur/reviews/dress105-live-seat");
mkdirSync(OUT, { recursive: true });
const stream = readFileSync(join(ROOT, "agents/arthur/assets/village_dress_se_streamstones1.glb"));
const forest = readFileSync(join(ROOT, "agents/arthur/mason/glb-retex/work_1677_forest.glb"));

const THREE_ROOT = resolve("node_modules/three");
const threeModule = join(THREE_ROOT, "build/three.module.js");
const html = `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;overflow:hidden}canvas{display:block}</style><script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
const r = new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
r.setSize(1280,800); r.outputColorSpace = THREE.SRGBColorSpace; r.shadowMap.enabled = true; document.body.appendChild(r.domElement);
const s = new THREE.Scene(); s.background = new THREE.Color(0xcbd6df);
const cam = new THREE.PerspectiveCamera(50,1280/800,.1,500);
const hemi = new THREE.HemisphereLight(0xffffff,0x48505a,2); s.add(hemi);
const amb = new THREE.AmbientLight(0xffffff,.45); s.add(amb);
const sun = new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(60,90,40); sun.castShadow = true; s.add(sun);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(400,400), new THREE.MeshStandardMaterial({color:0x7f8d70,roughness:1}));
ground.rotation.x = -Math.PI/2; ground.receiveShadow = true; s.add(ground);
const loader = new GLTFLoader();
// exact live tuples: streamstones dress-105 + forest-0057 host
const st = (await loader.loadAsync('/stream.glb')).scene;
st.position.set(75.05,-0.0249,-46.90); st.rotation.y = -0.7853981633974483;
st.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
s.add(st);
const fo = (await loader.loadAsync('/forest.glb')).scene;
fo.position.set(63.006856,-0.019491742981888435,-42.498661); fo.rotation.y = -2.356194490192345;
fo.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
s.add(fo);
window.setView = (px,py,pz,tx,ty,tz) => { cam.position.set(px,py,pz); cam.lookAt(tx,ty,tz); r.render(s,cam); };
window.ready = true;
</script>`;
const server = createServer((req, res) => {
  const u = (req.url ?? "/").split("?")[0];
  try {
    if (u === "/") { res.setHeader("content-type", "text/html"); res.end(html); return; }
    if (u === "/three.module.js") { res.setHeader("content-type", "text/javascript"); res.end(readFileSync(threeModule)); return; }
    if (u === "/three.core.js") { res.setHeader("content-type", "text/javascript"); res.end(readFileSync(join(THREE_ROOT, "build/three.core.js"))); return; }
    if (u.startsWith("/examples/jsm/")) {
      const p = join(THREE_ROOT, u.slice(1));
      const x = readFileSync(p, "utf8").replaceAll("from 'three'", "from '/three.module.js'").replaceAll('from "three"', 'from "/three.module.js"');
      res.setHeader("content-type", "text/javascript"); res.end(x); return;
    }
    if (u === "/stream.glb") { res.setHeader("content-type", "model/gltf-binary"); res.end(stream); return; }
    if (u === "/forest.glb") { res.setHeader("content-type", "model/gltf-binary"); res.end(forest); return; }
    res.statusCode = 404; res.end("not found");
  } catch (e) { res.statusCode = 500; res.end(String(e)); }
});
await new Promise<void>((q) => server.listen(0, "127.0.0.1", q));
const addr = server.address() as any;
const b = await chromium.launch({ headless: true });
try {
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  p.on("pageerror", (e) => console.error("PAGEERROR", e.message));
  await p.goto(`http://127.0.0.1:${addr.port}/`, { waitUntil: "networkidle" });
  await p.waitForFunction(() => (window as any).ready === true);
  // walker view: from the az-315 spoke toward the seat (~18m, broadside-oblique)
  await p.evaluate(() => (window as any).setView(62.3, 1.65, -34.2, 75.05, 0.0, -46.9));
  await p.screenshot({ path: join(OUT, "walker-18m.png") });
  // near approach ~6m
  await p.evaluate(() => (window as any).setView(70.4, 1.65, -42.2, 75.05, 0.0, -46.9));
  await p.screenshot({ path: join(OUT, "walker-6m.png") });
  // aerial of the seat
  await p.evaluate(() => (window as any).setView(75.05, 60, -46.9, 75.05, 0, -46.9));
  await p.screenshot({ path: join(OUT, "aerial.png") });
  console.log("rendered", OUT);
} finally { await b.close(); server.close(); }
