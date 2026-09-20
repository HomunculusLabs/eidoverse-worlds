// fauna67-probe-screen.ts — project the three birds to screen px in the
// encounter + spoke18 framings; the b/c fusion dispute settled by
// arithmetic (swan law c: judge spatial claims are probes).
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const birdBytes = readFileSync("agents/arthur/assets/village_fauna67_guinea.glb");
const THREE_ROOT = resolve("node_modules/three");

const html = `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;overflow:hidden}canvas{display:block}
</style><script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setPixelRatio(1); renderer.setSize(960,720);
document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(42,960/720,0.05,300);
const loader=new GLTFLoader();
const gltf=await loader.loadAsync('/guinea.glb'); const FLOCK=gltf.scene; scene.add(FLOCK);
FLOCK.rotation.y=-1.22;
const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2.0); scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff1d4,3.0); sun.position.set(6,11,5); scene.add(sun);
window.setView=(name)=>{ const views={encounter:[2.694,0.90,3.231],spoke18:[-11.586,1.63,-13.916]};
  const tgt={encounter:[0,0.45,0],spoke18:[0,0.45,0]}[name];
  camera.position.fromArray(views[name]); camera.lookAt(...tgt); renderer.render(scene,camera); };
window.projOf=(name)=>{ const pt=FLOCK.getObjectByName(name); if(!pt) return null;
  pt.updateMatrixWorld(true); const wp=new THREE.Vector3(); pt.getWorldPosition(wp);
  const sp=wp.project(camera); return [(sp.x*0.5+0.5)*960,( -sp.y*0.5+0.5)*720]; };
window.setView('encounter'); window.ready=true;
</script>`;
const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  if (url === "/") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
  if (url === "/guinea.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(birdBytes); }
  if (url === "/three.module.js") { res.writeHead(200, { "content-type": "text/javascript" }); return res.end(readFileSync(resolve(THREE_ROOT, "build/three.module.js"))); }
  if (url === "/three.core.js") { res.writeHead(200, { "content-type": "text/javascript" }); return res.end(readFileSync(resolve(THREE_ROOT, "build/three.core.js"))); }
  if (url.startsWith("/examples/jsm/")) {
    const p = resolve(THREE_ROOT, url.slice(1));
    const s = readFileSync(p, "utf8").replaceAll("from 'three'", "from '/three.module.js'").replaceAll('from "three"', 'from "/three.module.js"');
    res.writeHead(200, { "content-type": "text/javascript" }); res.end(s); return;
  }
  res.writeHead(404); res.end();
});
await new Promise<void>(r => server.listen(0, "127.0.0.1", r));
const port = (server.address() as any).port;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 960, height: 720 } });
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
await page.waitForFunction(() => (window as any).ready === true, undefined, { timeout: 30_000 });
for (const v of ["encounter", "spoke18"]) {
  await page.evaluate((s: any) => (window as any).setView(s), v);
  const pts: any = {};
  for (const n of ["guine_a", "guine_b", "guine_c", "guine_b_head", "guine_c_head"]) pts[n] = await page.evaluate((x: any) => (window as any).projOf(x), n);
  const sep = (p: any, q: any) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  console.log(`${v}: a@${pts.guine_a.map((v: number) => v.toFixed(0))} b@${pts.guine_b.map((v: number) => v.toFixed(0))} c@${pts.guine_c.map((v: number) => v.toFixed(0))} | b-c body sep ${sep(pts.guine_b, pts.guine_c).toFixed(0)}px | b-c head sep ${sep(pts.guine_b_head, pts.guine_c_head).toFixed(0)}px | a-b ${sep(pts.guine_a, pts.guine_b).toFixed(0)}px`);
}
await browser.close(); server.close();
