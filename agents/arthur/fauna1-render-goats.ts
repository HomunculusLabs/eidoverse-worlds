// fauna1-render-goats.ts — review renders for the fauna-1 goats rebuild.
// Chassis: fauna1-probe-render.ts (module-scope render proven working;
// evaluate-driven loadAsync rendered blank canvases — all async work now
// lives at module scope, evaluate only calls sync setters).
// Serves BOTH the new bytes (b7ac584d…) and before bytes (c47861e4…);
// views: gameplay 18m, four angles, closeface, top, night, and a MOTION
// PAIR driven by the REAL client/lib/motioneval.js closed forms with
// rotatePartAtPivot verbatim from client/lib/motion.js — the exact comp
// payloads the placer sends, evaluated at two sample times.
// Ground = LIVE-MEADOW tone 0x3d3a29 (dress-106 law).
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const newBytes = readFileSync("agents/arthur/assets/village_goats3.glb");
const oldBytes = readFileSync("agents/arthur/reviews/fauna1-goats/before/village_goats3.glb");
const outDir = resolve("agents/arthur/reviews/fauna1-goats");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const ME = readFileSync("client/lib/motioneval.js", "utf8"); // unmodified evaluator

// the exact comp payloads the placer sends (mirrored in fauna1-place-goats.ts)
const COMPS = [
  { part: "goat_a_head", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.16, period: 4.6, phase: 0.0, t0: 1 } },
  { part: "goat_a_tail", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.45, period: 1.9, phase: 1.3, t0: 1 } },
  { part: "goat_b_head", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.075, period: 5.8, phase: 2.1, t0: 1 } },
  { part: "goat_b_tail", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.5, period: 1.7, phase: 0.4, t0: 1 } },
  { part: "goat_c_head", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.11, period: 3.9, phase: 4.0, t0: 1 } },
  { part: "goat_c_tail", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.4, period: 2.1, phase: 2.7, t0: 1 } },
];

const html = `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#cbd6df}canvas{display:block}
</style><script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
import { pendulumTheta } from '/motioneval.js';
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
const prep=async(url)=>{ const gltf=await loader.loadAsync(url); const root=gltf.scene; scene.add(root);
  root.updateMatrixWorld(true); const bb=new THREE.Box3().setFromObject(root);
  const size=bb.getSize(new THREE.Vector3()); const center=bb.getCenter(new THREE.Vector3());
  root.position.x-=center.x; root.position.z-=center.z; root.position.y-=bb.min.y;
  root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}}); root.updateMatrixWorld(true);
  return {root,bounds:{min:bb.min.toArray(),max:bb.max.toArray(),size:size.toArray()}}; };
const NEW=await prep('/model-new.glb'), OLD=await prep('/model-old.glb');
OLD.root.visible=false;
// bind part bases for the NEW model (findPart semantics = world.js: exact name)
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts={};
for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(NEW.root,c.part);
  if(p) parts[c.part]={p, base:{pos:p.position.toArray(), quat:p.quaternion.toArray()}, m:c.m}; }
// rotatePartAtPivot — VERBATIM from client/lib/motion.js
const _q=new THREE.Quaternion(), _ax=new THREE.Vector3(), _pv=new THREE.Vector3(), _rp=new THREE.Vector3(), _qb=new THREE.Quaternion();
function rotatePartAtPivot(obj,pbase,axis,pivot,theta){
  _ax.set(...(axis??[0,1,0])).normalize(); _q.setFromAxisAngle(_ax,theta);
  _qb.fromArray(pbase.quat); obj.quaternion.copy(_qb).multiply(_q);
  _pv.set(...(pivot??[0,0,0])); _rp.copy(_pv).applyQuaternion(_q);
  _pv.sub(_rp).applyQuaternion(_qb); obj.position.set(...pbase.pos).add(_pv);
}
window.stats={newBounds:NEW.bounds, oldBounds:OLD.bounds, parts:Object.keys(parts).length};
window.setView=(name,which)=>{ const root=which==='old'?OLD.root:NEW.root;
  NEW.root.visible=which!=='old'; OLD.root.visible=which==='old';
  const size=(which==='old'?OLD:NEW).bounds.size;
  const r=Math.max(size[0],size[2],4); const target=new THREE.Vector3(0,Math.max(0.7,size[1]*0.38),0);
  const views={ front:[0,Math.max(2.3,size[1]*.55),r*2.05], right:[r*2.05,Math.max(2.3,size[1]*.55),0],
    back:[0,Math.max(2.3,size[1]*.55),-r*2.05], left:[-r*2.05,Math.max(2.3,size[1]*.55),0],
    gameplay:[0,1.65,18], top:[0,Math.max(10,r*2.15),0.001], closeface:[0,size[1]*.5,Math.max(8,r*1.15)]};
  camera.position.fromArray(views[name]); camera.lookAt(target); renderer.render(scene,camera); };
window.setNight=(on)=>{scene.background.set(on?0x111827:0xcbd6df);hemi.intensity=on?.18:2;ambient.intensity=on?.04:.45;sun.intensity=on?.15:3.2;};
window.setPhase=(tSec)=>{ for(const k of Object.keys(parts)){ const {p,base,m}=parts[k];
    const t=Math.max(0,(tSec*1000+1 - m.t0)/1000);
    rotatePartAtPivot(p,base,m.axis,m.pivot,pendulumTheta(m,t)); } };
window.snap=()=>{renderer.render(scene,camera); return renderer.domElement.toDataURL('image/png');};
window.rinfo=()=>({tri:renderer.info.render.triangles,calls:renderer.info.render.calls});
window.setView('gameplay','new'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/model-new.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(newBytes); }
    if (url === "/model-old.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(oldBytes); }
    if (url === "/motioneval.js") { res.writeHead(200, { "content-type": "text/javascript" }); return res.end(ME); }
    if (url === "/three.module.js") { res.writeHead(200, { "content-type": "text/javascript" }); return res.end(readFileSync(resolve(THREE_ROOT, "build/three.module.js"))); }
    if (url === "/three.core.js") { res.writeHead(200, { "content-type": "text/javascript" }); return res.end(readFileSync(resolve(THREE_ROOT, "build/three.core.js"))); }
    if (url.startsWith("/examples/jsm/")) {
      const p = resolve(THREE_ROOT, url.slice(1));
      if (!p.startsWith(THREE_ROOT)) throw new Error("escape");
      const s = readFileSync(p, "utf8").replaceAll("from 'three'", "from '/three.module.js'").replaceAll('from "three"', 'from "/three.module.js"');
      res.writeHead(200, { "content-type": "text/javascript" }); res.end(s); return;
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

const stats = await page.evaluate(() => (window as any).stats);
console.log("stats:", JSON.stringify(stats));
if (stats.parts !== 6) throw new Error(`expected 6 parts, got ${stats.parts}`);

const grab = async (name: string) => {
  const dataUrl: string = await page.evaluate(() => (window as any).snap());
  writeFileSync(resolve(outDir, name), Buffer.from(dataUrl.split(",")[1], "base64"));
};
await page.evaluate(() => (window as any).setNight(false));
for (const v of ["gameplay", "front", "right", "back", "left", "closeface", "top"]) {
  await page.evaluate(s => (window as any).setView(s, "new"), v);
  await page.waitForTimeout(60);
  await grab(`new-${v}.png`);
}
// motion pair at gameplay framing: t=0.6s vs t=2.4s (engine closed forms)
await page.evaluate(() => (window as any).setView("gameplay", "new"));
await page.evaluate(t => (window as any).setPhase(t), 0.6);
await grab("new-motion-a.png");
await page.evaluate(t => (window as any).setPhase(t), 2.4);
await grab("new-motion-b.png");
// night set
await page.evaluate(() => (window as any).setNight(true));
await page.evaluate(() => (window as any).setView("gameplay", "new"));
await grab("new-night.png");
await page.evaluate(() => (window as any).setView("closeface", "new"));
await grab("new-night-close.png");
// before model comparison set (rest pose — the old build had no anchors)
await page.evaluate(() => (window as any).setNight(false));
for (const v of ["gameplay", "front", "closeface"]) {
  await page.evaluate(s => (window as any).setView(s, "old"), v);
  await page.waitForTimeout(60);
  await grab(`before-${v}.png`);
}
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close();
server.close();
console.log(`wrote fauna1 goats renders -> ${outDir}`);
