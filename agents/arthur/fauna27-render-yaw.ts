// fauna27-render-yaw.ts — YAW-PRESENTATION FALSIFICATION for the fauna-27
// re-seat (struct-104/struct-152 law: a yaw change re-presents the SAME
// bytes to the reader — falsify by render BEFORE live mutation).
// Candidate: world yaw −2.318 (display faces the dovecote/stroll side);
// reader's actual vantage ≈ 18° off dead-front (closest stroll-polyline
// point 5.23m away on the dovecote→rows leg). Control: the REAR 18°
// oblique — the presentation a WRONG yaw (facing away from the approach)
// would give: train dome fronting the view, face/crest invisible. A judge
// that cannot tell these apart is not discriminating presentation.
// Rig: fauna25-render-peacock.ts chassis (module-scope render law, world
// meadow ground #4a5d33, real COMPS not needed for a static presentation
// check — static base pose, phase 0).
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const newBytes = readFileSync("agents/arthur/assets/village_dress_peacock.glb");
const outDir = resolve("agents/arthur/reviews/fauna27-peacock-reseat");
mkdirSync(outDir, { recursive: true });
const THREE_ROOT = resolve("node_modules/three");
const YAW = -2.318;          // candidate world yaw
const OBL = 0.315;           // 18° reader oblique

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
const fill=new THREE.DirectionalLight(0xffffff,0.85); fill.position.set(0,4,10); scene.add(fill);
const gmat=new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:0.95,metalness:0});
const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),gmat); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const loader=new GLTFLoader();
const gltf=await loader.loadAsync('/model-new.glb'); const root=gltf.scene; scene.add(root);
root.updateMatrixWorld(true); const bb0=new THREE.Box3().setFromObject(root);
root.position.x-=bb0.getCenter(new THREE.Vector3()).x; root.position.z-=bb0.getCenter(new THREE.Vector3()).z;
root.position.y-=bb0.min.y;
root.rotation.y=${YAW}; // candidate world orientation (rig +z = world facing dir)
root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
root.updateMatrixWorld(true);
const target=new THREE.Vector3(0,0.85,0);
const PHI=${YAW}; // model facing yaw: local +z -> (sin PHI, cos PHI)
window.setView=(name)=>{
  // camera sits along the model's FACING (front views) or its opposite
  // (rear control), rotated by the 18deg reader oblique. v1 bug: camera
  // was pinned at rig +z = the yawed model's REAR (judge caught it).
  const views={
    cand18:[Math.sin(PHI+${OBL})*18,1.65,Math.cos(PHI+${OBL})*18],       // reader vantage, front oblique
    ctrlRear18:[Math.sin(PHI+Math.PI-${OBL})*18,1.65,Math.cos(PHI+Math.PI-${OBL})*18], // true rear control
    candNear:[Math.sin(PHI+${OBL})*5,1.1,Math.cos(PHI+${OBL})*5],       // encounter 5m at same oblique
  };
  camera.position.fromArray(views[name]); camera.lookAt(target); renderer.render(scene,camera); };
window.snap=()=>{renderer.render(scene,camera); return renderer.domElement.toDataURL('image/png'); };
window.colorCount=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const d=x.getImageData(0,0,c.width,c.height).data; const s=new Set();
  for(let i=0;i<d.length;i+=4) s.add((d[i]<<16)|(d[i+1]<<8)|d[i+2]);
  return s.size; };
window.setView('cand18'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/model-new.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(newBytes); }
    if (url === "/three.module.js") { res.writeHead(200, { "content-type": "text/javascript" }); return res.end(readFileSync(resolve(THREE_ROOT, "build/three.module.js"))); }
    if (url === "/three.core.js") { res.writeHead(200, { "content-type": "text/javascript" }); return res.end(readFileSync(resolve(THREE_ROOT, "build/three.core.js"))); }
    if (url.startsWith("/examples/jsm/")) {
      const p = resolve(THREE_ROOT, url.slice(1));
      if (!p.startsWith(THREE_ROOT)) throw new Error("escape");
      const s = readFileSync(p, "utf8").replaceAll("from 'three'", "from '/three.module.js'").replaceAll('from "three"', 'from "/three.module.js"');
      res.writeHead(200, { "content-type": "text/javascript" }); return res.end(s);
    }
    res.writeHead(404); res.end("not found");
  } catch (e: any) { res.statusCode = 500; res.end(String(e?.message ?? e)); }
});
await new Promise<void>(r => server.listen(0, "127.0.0.1", r));
const port = (server.address() as any).port;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 960, height: 720 }, deviceScaleFactor: 1 });
page.on("pageerror", e => console.error("PAGEERROR", e.message));
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
await page.waitForFunction(() => (window as any).reviewReady === true, undefined, { timeout: 60_000 });
const grab = async (name: string) => {
  const dataUrl: string = await page.evaluate(() => (window as any).snap());
  writeFileSync(resolve(outDir, name), Buffer.from(dataUrl.split(",")[1], "base64"));
};
const counts: any = {};
for (const v of ["cand18", "ctrlRear18", "candNear"]) {
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  counts[v] = await page.evaluate(() => (window as any).colorCount());
  await grab(`${v}.png`);
}
console.log("unique colors:", JSON.stringify(counts));
for (const [v, n] of Object.entries(counts)) if ((n as number) < 400) throw new Error(`view ${v} looks blank (${n} colors)`);
await browser.close(); server.close();
console.log(`wrote fauna27 yaw-falsification renders -> ${outDir}`);
