// fauna1-probe-render.ts — diagnose the blank-canvas rig: renderer.info,
// canvas metrics, scene children, camera pose. Read-only probe.
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const newBytes = readFileSync("agents/arthur/assets/village_goats3.glb");
const THREE_ROOT = resolve("node_modules/three");

const html = `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#cbd6df}canvas{display:block}
</style><script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1); renderer.setSize(960,720); renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true; document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene(); scene.background=new THREE.Color(0xcbd6df);
const camera=new THREE.PerspectiveCamera(42,960/720,0.05,300);
const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2.0); scene.add(hemi);
const ambient=new THREE.AmbientLight(0xffffff,0.45); scene.add(ambient);
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(8,12,6); sun.castShadow=true; scene.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.MeshStandardMaterial({color:0x3d3a29,roughness:1})); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const loader=new GLTFLoader();
const gltf=await loader.loadAsync('/model.glb'); const root=gltf.scene; scene.add(root);
root.updateMatrixWorld(true); const bb=new THREE.Box3().setFromObject(root);
const size=bb.getSize(new THREE.Vector3()); const center=bb.getCenter(new THREE.Vector3());
root.position.x-=center.x; root.position.z-=center.z; root.position.y-=bb.min.y;
root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
camera.position.set(0,1.65,18); camera.lookAt(0,0.7,0);
window.doRender=()=>{renderer.render(scene,camera);};  // NOT called at module scope
window.probe={
  triangles:renderer.info.render.triangles, calls:renderer.info.render.calls,
  canvW:renderer.domElement.width, canvH:renderer.domElement.height,
  rect:renderer.domElement.getBoundingClientRect().toJSON(),
  children:scene.children.map(c=>c.type+(c.name?':'+c.name:'')),
  ctx:!!renderer.getContext(),
};
window.readPx=()=>{ const gl=renderer.getContext(); const px=new Uint8Array(4);
  gl.readPixels(480,360,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px); return Array.from(px); };
window.ready=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  if (url === "/") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
  if (url === "/model.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(newBytes); }
  if (url === "/three.module.js") { res.writeHead(200, { "content-type": "text/javascript" }); return res.end(readFileSync(resolve(THREE_ROOT, "build/three.module.js"))); }
  if (url === "/three.core.js") { res.writeHead(200, { "content-type": "text/javascript" }); return res.end(readFileSync(resolve(THREE_ROOT, "build/three.core.js"))); }
  if (url.startsWith("/examples/jsm/")) {
    const p = resolve(THREE_ROOT, url.slice(1));
    const s = readFileSync(p, "utf8").replaceAll("from 'three'", "from '/three.module.js'").replaceAll('from "three"', 'from "/three.module.js"');
    res.writeHead(200, { "content-type": "text/javascript" }); res.end(s); return;
  }
  res.writeHead(404); res.end("no");
});
await new Promise<void>(r => server.listen(0, "127.0.0.1", r));
const port = (server.address() as any).port;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 960, height: 720 }, deviceScaleFactor: 1 });
page.on("pageerror", e => console.error("PAGEERROR", e.message));
page.on("console", m => console.error("BROWSER", m.type(), m.text()));
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
await page.waitForFunction(() => (window as any).ready === true, undefined, { timeout: 60_000 });
console.log(JSON.stringify(await page.evaluate(() => (window as any).probe), null, 1));
await page.evaluate(() => (window as any).doRender());
console.log("center px after evaluate-render:", await page.evaluate(() => (window as any).readPx()));
console.log("px after AWAIT+render:", await page.evaluate(async () => {
  const w = window as any;
  await new Promise(r => setTimeout(r, 100));
  w.doRender();
  return w.readPx();
}));
await page.screenshot({ path: "/tmp/fauna1-probe.png" });
await browser.close(); server.close();
