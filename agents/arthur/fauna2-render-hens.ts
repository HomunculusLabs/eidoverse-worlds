// fauna2-render-hens.ts — review renders for the fauna-2 flock rebuild.
// Chassis: fauna1-render-goats.ts (module-scope render law — async loadAsync
// at top level, evaluate only calls sync setters; evaluate-driven renders
// after await produce BLANK canvases).
// Serves the new flock bytes (ea0ddae2…) + before lone-hen bytes
// (edc1a4c7…); views: gameplay 18m, four angles, near 5m (a 0.6m subject
// needs the closer framing for identity), closeface, top, night, and
// MOTION PAIRS at both framings driven by the REAL client closed forms
// (motioneval.js pendulumTheta + rotatePartAtPivot verbatim from
// client/lib/motion.js) with the exact comp payloads the placer sends.
// Ground = LIVE-MEADOW tone 0x3d3a29 (dress-106 law).
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const newBytes = readFileSync("agents/arthur/assets/village_hens_flock.glb");
const oldBytes = readFileSync("agents/arthur/reviews/fauna2-hens/before/village_hen_a.glb");
const outDir = resolve("agents/arthur/reviews/fauna2-hens");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const ME = readFileSync("client/lib/motioneval.js", "utf8"); // unmodified evaluator

// the exact comp payloads the placer sends (mirrored in fauna2-place-hens.ts)
const COMPS = [
  { part: "hen_a_head", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.28, period: 2.2, phase: 0.0, t0: 1 } },
  { part: "hen_a_tail", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.30, period: 0.9, phase: 0.2, t0: 1 } },
  { part: "hen_b_head", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.09, period: 3.4, phase: 1.7, t0: 1 } },
  { part: "hen_b_tail", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.22, period: 1.1, phase: 0.8, t0: 1 } },
  { part: "hen_c_head", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.16, period: 2.7, phase: 4.2, t0: 1 } },
  { part: "hen_c_tail", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.26, period: 1.0, phase: 2.6, t0: 1 } },
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
  const r=Math.max(size[0],size[2],1.2); const target=new THREE.Vector3(0,Math.max(0.35,size[1]*0.45),0);
  const views={ front:[0,0.9,r*2.6], right:[r*2.6,0.9,0],
    back:[0,0.9,-r*2.6], left:[-r*2.6,0.9,0],
    gameplay:[0,1.65,18], near:[0,1.05,5], ultra:[0,0.55,1.2], top:[0,Math.max(6,r*2.6),0.001], closeface:[0,Math.max(0.55,size[1]*.5),Math.max(2.2,r*1.6)]};
  camera.position.fromArray(views[name]); camera.lookAt(target); renderer.render(scene,camera); };
window.setNight=(on)=>{scene.background.set(on?0x111827:0xcbd6df);hemi.intensity=on?.18:2;ambient.intensity=on?.04:.45;sun.intensity=on?.15:3.2;};
window.setPhase=(tSec)=>{ for(const k of Object.keys(parts)){ const {p,base,m}=parts[k];
    const t=Math.max(0,(tSec*1000+1 - m.t0)/1000);
    rotatePartAtPivot(p,base,m.axis,m.pivot,pendulumTheta(m,t)); } };
window.snap=()=>{renderer.render(scene,camera); return renderer.domElement.toDataURL('image/png');};
window.colorCount=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const d=x.getImageData(0,0,c.width,c.height).data; const s=new Set();
  for(let i=0;i<d.length;i+=4) s.add((d[i]<<16)|(d[i+1]<<8)|d[i+2]);
  return s.size; };
let _lastFrame=null;
window.frame=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  return x.getImageData(0,0,c.width,c.height).data.slice(); };
window.frameDiff=(a,b)=>{ if(!a||!b||a.length!==b.length) return -1;
  let n=0; const row=[];
  for(let i=0;i<a.length;i+=4){ if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>18){
    n++; row.push(Math.floor((i/4)%c2w())); } } window.lastDiffRows=row; return n; };
const c2w=()=>renderer.domElement.width;
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
// pixel-count law: every render must carry real content (blank-canvas guard)
await page.evaluate(() => (window as any).setNight(false));
const counts: any = {};
for (const v of ["gameplay", "front", "right", "back", "left", "near", "ultra", "closeface", "top"]) {
  await page.evaluate((s: any) => (window as any).setView(s, "new"), v);
  await page.waitForTimeout(60);
  counts[v] = await page.evaluate(() => (window as any).colorCount());
  await grab(`new-${v}.png`);
}
console.log("unique colors:", JSON.stringify(counts));
for (const [v, n] of Object.entries(counts)) if ((n as number) < 400) throw new Error(`view ${v} looks blank (${n} colors)`);
// motion pairs at both framings: t=0.35s vs t=1.15s (engine closed forms)
// (a-head amp .28 period 2.2: theta0 = .28*cos(2π*.35/2.2) = -.198,
//  theta1 = .28*cos(2π*1.15/2.2) = +.277 — a full down↔up swing)
// diff computed page-side (canvas readback); row band printed for clustering.
for (const framing of ["gameplay", "near"]) {
  await page.evaluate((s: any) => (window as any).setView(s, "new"), framing);
  await page.evaluate((t: any) => (window as any).setPhase(t), 0.35);
  await grab(`new-motion-${framing}-a.png`);
  const fa: any = await page.evaluate(() => (window as any).frame());
  await page.evaluate((t: any) => (window as any).setPhase(t), 1.15);
  await grab(`new-motion-${framing}-b.png`);
  const fb: any = await page.evaluate(() => (window as any).frame());
  const diff = await page.evaluate(([a, b]: any) => (window as any).frameDiff(a, b), [fa, fb] as any);
  const rows: any = await page.evaluate(() => (window as any).lastDiffRows);
  const band = rows.length ? `${Math.min(...rows)}-${Math.max(...rows)} (of 720)` : "none";
  console.log(`motion pair ${framing}: ${diff} px differ, row band ${band}`);
}
// night set
await page.evaluate(() => (window as any).setNight(true));
await page.evaluate(() => (window as any).setView("gameplay", "new"));
await grab("new-night.png");
await page.evaluate(() => (window as any).setView("near", "new"));
await grab("new-night-near.png");
// before model comparison set (the lone 0.38m hen at its yard scale)
await page.evaluate(() => (window as any).setNight(false));
for (const v of ["gameplay", "front", "near"]) {
  await page.evaluate((s: any) => (window as any).setView(s, "old"), v);
  await page.waitForTimeout(60);
  await grab(`before-${v}.png`);
}
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close();
server.close();
console.log(`wrote fauna2 hens renders -> ${outDir}`);
