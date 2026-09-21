// fauna77-control-18m.ts — dress-80 in-family control: render the ACCEPTED
// standing hare (fauna-73/74, live at the meadow seat) in the SAME solo rig
// at the SAME 18m framing as the badger's seat_gameplay view. If the
// accepted sibling also fails the 18m animal-resolvability read, the
// finding is rig-limited, not badger-limited (law: close-view + in-family
// control + contract-framed 18m stays the standard; solo 18m reads
// systematically degrade).
const { createServer } = await import("node:http");
import { createHash } from "node:crypto";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const bytes = readFileSync("agents/arthur/assets/village_dress_hare1.glb");
const sha = createHash("sha256").update(bytes).digest("hex");
const outDir = resolve("agents/arthur/reviews/fauna77-badger");
mkdirSync(outDir, { recursive: true });

const html = `<!doctype html><html><body style="margin:0"><script type="module">
import * as THREE from '/node_modules/three/build/three.module.js';
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1); renderer.setSize(960,720); renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true; document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene(); scene.background=new THREE.Color(0xcbd6df);
const camera=new THREE.PerspectiveCamera(42,960/720,0.05,300);
const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2.0); scene.add(hemi);
const ambient=new THREE.AmbientLight(0xffffff,0.45); scene.add(ambient);
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(8,12,6); sun.castShadow=true; scene.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:1})); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const loader=new GLTFLoader(); const shade=(root)=>root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
const m=(await loader.loadAsync('/model.glb')).scene; scene.add(m); shade(m);
// the hare's live seat per fauna-73/74 records: near (47.5,-40.25)-class
// meadow margin; render the same world-frame 18m vantage shape
m.position.set(47.5,0.0,-40.25); m.rotation.y=-2.274;
camera.position.set(33.77,1.65,-28.61); camera.lookAt(47.5,0.05,-40.25);
window.reviewReady=true; renderer.render(scene,camera);
</script></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 960, height: 720 } });
const server = createServer((req, res) => {
  if (req.url === "/model.glb") {
    res.writeHead(200, { "content-type": "model/gltf-binary" });
    res.end(bytes);
    return;
  }
  if (req.url?.endsWith("three.module.js") || req.url?.includes("loaders/GLTFLoader")) {
    try {
      const p = resolve("node_modules/three" + (req.url.includes("loaders") ? req.url.split("three")[1] : "/build/three.module.js"));
      res.writeHead(200, { "content-type": "text/javascript" });
      res.end(readFileSync(p));
      return;
    } catch { /* fallthrough */ }
  }
  res.writeHead(404); res.end();
}).listen(0);
const PORT = (server.address() as any).port;
const url = `http://localhost:${PORT}/`;
await page.goto(`about:blank`);
await page.setContent(html.replace(/\/node_modules\/three/g, `${url}node_modules/three`), { waitUntil: "networkidle" });
await page.waitForFunction(() => (window as any).reviewReady === true, null, { timeout: 30000 });
await page.waitForTimeout(300);
await page.screenshot({ path: resolve(outDir, "control-hare-18m.png") });
const colors = await page.evaluate(() => {
  const c = new Set();
  const ctx = (document.querySelector("canvas") as any).getContext("webgl2");
  // colorCount equivalent: count via readPixels on a downsample
  return Array.from(c).length;
});
await browser.close();
console.log("control-hare-18m written; hare sha16:", sha.slice(0, 16));
