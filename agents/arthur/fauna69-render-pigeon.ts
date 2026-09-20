// fauna69-render-pigeon.ts — review renders for the fauna-69 pigeon flock.
// Chassis: fauna67-render-guinea.ts (module-scope render law). Serves the
// flock AT ITS SEAT FRAME (root local 0 == world (−6.25, 0, 2) yaw 0.4354)
// with the market fore-court's context at world-true RELATIVE poses:
// market stall + banner + giftshelf (exact live local bytes — hashes
// verified 8c16ea9a/d32e7bcb/c623cfa6) + plaza hearth envelope + the two
// nearest streetlamp posts as position-true cylinders (decoded posts,
// fauna69-lampposts.ts — proxy geometry, disclosed). Ground: plaza-paving
// soil tone 0x7a7256 (core-paths family mean of 0x756d4b/0x827858).
// Views: rimN18 — the TRUE 18m hearth-side vantage world (0.9,−3.5);
// gateW9 — the W-gate spoke (−16,0); encounter 4.2m; side broadside;
// aimed face probes on the bowing cock (cere/bill/irid collar) + pecker
// profile + walker profile.
// MOTION PAIRS at rimN18/encounter, t=6.0 vs 6.6 — REAL closed forms
// (bob + pendulum, rotatePartAtPivot verbatim).
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const birdBytes = readFileSync("agents/arthur/assets/village_dress_pigeon1.glb");
const SHA = createHash("sha256").update(birdBytes).digest("hex");
console.log("pigeon sha256:", SHA);
const marketBytes = readFileSync("agents/arthur/assets/village_market3.glb"); // sha16 8c16ea9a == live
const bannerBytes = readFileSync("agents/arthur/assets/village_banner.glb");   // d32e7bcb == live
const giftBytes = readFileSync("agents/arthur/assets/village_giftshelf3.glb");// c623cfa6 == live
const outDir = resolve("agents/arthur/reviews/fauna69-pigeon");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");

// the exact comp payloads the placer sends (mirrored in fauna69-place-pigeon.ts)
const T0OFF = 1; // rig t0 proxy — phases matter, not epoch
const COMPS = [
  { part: "pige_a", m: { type: "bob", amp: 0.005, period: 3.6, phase: 0.0, t0: T0OFF } },
  { part: "pige_b", m: { type: "bob", amp: 0.005, period: 4.1, phase: 1.3, t0: T0OFF } },
  { part: "pige_c", m: { type: "bob", amp: 0.004, period: 4.6, phase: 2.4, t0: T0OFF } },
  { part: "pige_a_head", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.16, period: 2.7, phase: 0.5, t0: T0OFF } },
  { part: "pige_b_head", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.26, period: 6.5, phase: 2.1, t0: T0OFF } },
  { part: "pige_c_head", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.30, period: 3.4, phase: 1.6, t0: T0OFF } },
  { part: "pige_b_tail", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.14, period: 2.2, phase: 0.9, t0: T0OFF } },
];

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
const sun=new THREE.DirectionalLight(0xfff1d4,3.0); sun.position.set(6,11,5); sun.castShadow=true; scene.add(sun);
const fill=new THREE.DirectionalLight(0xffffff,1.3); fill.position.set(-4,6,-8); scene.add(fill);
window.__fill=fill;
const fillT=new THREE.Object3D(); scene.add(fillT); fill.target=fillT; window.__fillT=fillT;
const gmat=new THREE.MeshStandardMaterial({color:0x7a7256,roughness:1,metalness:0});
const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),gmat); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const loader=new GLTFLoader();
const load=async(url)=>{ const gltf=await loader.loadAsync(url); const root=gltf.scene; scene.add(root);
  root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}}); root.updateMatrixWorld(true); return root; };
const FLOCK=await load('/pigeon.glb'); FLOCK.rotation.y=0.4354; // the seat yaw (swan rig law: deliberate)
const MKT=await load('/market.glb'); MKT.position.set(-0.25,0,4.5); MKT.rotation.y=2.3562;
const BAN=await load('/banner.glb'); BAN.position.set(2.25,0,7.5); BAN.rotation.y=2.3562;
const GFT=await load('/gift.glb'); GFT.position.set(-2.75,0,7.0); GFT.rotation.y=2.3562;
// hearth envelope block (foreign domain, disclosed proxy): 7.389×1.808×6.486 at world (0,0) → rig (6.25,-2)
const hb=new THREE.Mesh(new THREE.BoxGeometry(7.389,1.808,6.486),new THREE.MeshStandardMaterial({color:0x5a5442,roughness:1}));
hb.position.set(6.25,0.904,-2); scene.add(hb);
// two nearest streetlamp posts — position-true cylinders (decoded, proxy geometry)
const pm=new THREE.MeshStandardMaterial({color:0x2c2c30,roughness:0.6,metalness:0.4});
for(const [px,pz] of [[-3.147,1.42],[2.83,7.397]]){
  const p=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.09,2.95,8),pm); p.position.set(px,1.475,pz); p.castShadow=true; scene.add(p);
}
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts={};
for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(FLOCK,c.part);
  if(p) parts[c.part]={p, base:{pos:p.position.toArray(), quat:p.quaternion.toArray()}, m:c.m}; }
window.stats={parts:Object.keys(parts).length};
const _ax=new THREE.Vector3(); const _q=new THREE.Quaternion(); const _qb=new THREE.Quaternion();
const _pv=new THREE.Vector3(); const _rp=new THREE.Vector3();
function evalPartCase(p, base, m, t){
  if(m.type==='bob'){
    const off=Math.sin((2*Math.PI/(m.period??4))*t+(m.phase??0))*(m.amp??0.3);
    p.position.set(...base.pos); p.position.y+=off; return;
  }
  if(m.type==='pendulum'){
    const w0=(2*Math.PI)/(m.period??3.5);
    const theta=(m.amp??0.3)*Math.cos(w0*t+(m.phase??0));
    _ax.set(...(m.axis??[1,0,0])).normalize();
    _q.setFromAxisAngle(_ax,theta);
    _qb.fromArray(base.quat);
    p.quaternion.copy(_qb).multiply(_q);
    _pv.set(...(m.pivot??[0,0,0]));
    _rp.copy(_pv).applyQuaternion(_q);
    _pv.sub(_rp).applyQuaternion(_qb);
    p.position.set(...base.pos).add(_pv); return;
  }
}
window.setPhase=(tSec)=>{ for(const k of Object.keys(parts)){ const {p,base,m}=parts[k];
  const t=Math.max(0,(tSec*1000+1 - m.t0)/1000);
  evalPartCase(p,base,m,t); } };
// aimed probes: bird-local facing after per-bird lean (facing local +x)
window.aimAtBird=(tag,dist,mode)=>{ const head=FLOCK.getObjectByName('pige_'+tag+'_head'); if(!head) return false;
  const lean={a:-0.12,b:0.16,c:0.38}[tag]??0;
  const front=new THREE.Vector3(Math.cos(lean),0,-Math.sin(lean));
  const dir=mode==='face'?front.clone():mode==='rear'?front.clone().negate():new THREE.Vector3(-front.z,0,front.x);
  head.updateMatrixWorld(true); const wp=new THREE.Vector3(); head.getWorldPosition(wp);
  camera.position.copy(wp).addScaledVector(dir,dist); camera.position.y=wp.y+(mode==='face'?0.04:0.10);
  camera.lookAt(wp);
  if(window.__fill&&window.__fillT){ window.__fillT.position.copy(wp);
    window.__fill.position.copy(wp).addScaledVector(dir,3); window.__fill.position.y+=1.0; }
  renderer.render(scene,camera); return wp.toArray(); };
window.setView=(name)=>{ const views={
  rimN18:[2.75,1.6,15.0],
  gateW9:[-9.75,1.5,-2],
  encounter:[2.97,0.85,-2.97],
  side:[0.0,0.8,2.0] };
  const tgt={rimN18:[0,0.12,0],gateW9:[0,0.35,0],encounter:[0,0.12,0],side:[0,0.10,0]}[name];
  camera.position.fromArray(views[name]); camera.lookAt(...tgt); renderer.render(scene,camera); };
window.snap=()=>{renderer.render(scene,camera); return renderer.domElement.toDataURL('image/png');};
window.colorCount=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const d=x.getImageData(0,0,c.width,c.height).data; const s=new Set();
  for(let i=0;i<d.length;i+=4) s.add((d[i]<<16)|(d[i+1]<<8)|d[i+2]);
  return s.size; };
window.frame=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  return x.getImageData(0,0,c.width,c.height).data.slice(); };
window.frameDiff=(a,b)=>{ if(!a||!b||a.length!==b.length) return -1;
  let n=0; const row=[];
  for(let i=0;i<a.length;i+=4){ if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>18){
    n++; row.push(Math.floor((i/4)%960)); } } window.lastDiffRows=row; return n; };
window.rinfo=()=>({tri:renderer.info.render.triangles,calls:renderer.info.render.calls});
window.setView('rimN18'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/pigeon.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(birdBytes); }
    if (url === "/market.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(marketBytes); }
    if (url === "/banner.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(bannerBytes); }
    if (url === "/gift.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(giftBytes); }
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
if (stats.parts !== 7) throw new Error(`expected 7 moving parts, got ${stats.parts}`);

const grab = async (name: string) => {
  const dataUrl: string = await page.evaluate(() => (window as any).snap());
  writeFileSync(resolve(outDir, name), Buffer.from(dataUrl.split(",")[1], "base64"));
};
await page.evaluate(() => (window as any).setPhase(6.0));
const counts: any = {};
for (const v of ["rimN18", "gateW9", "encounter", "side"]) {
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  counts[v] = await page.evaluate(() => (window as any).colorCount());
  await grab(`v1-${v}.png`);
}
// aimed probes: bowing-cock face (cere/bill/iridescence), cock profile,
// pecker profile (the ground read), walker profile
for (const [tag, mode, dist] of [["c", "face", 0.6], ["c", "side", 0.65], ["a", "side", 0.6], ["b", "side", 0.65]] as [string, string, number][]) {
  const wp: any = await page.evaluate(([t, m, d]: any) => (window as any).aimAtBird(t, d, m), [tag, mode, dist] as any);
  await page.waitForTimeout(60);
  await grab(`v1-${mode}-${tag}.png`);
  console.log(`aimed ${mode} pige_${tag} at ${JSON.stringify(wp.map((v: number) => +v.toFixed(2)))}`);
}
// motion pairs: t=6.0 vs 6.6
for (const framing of ["rimN18", "encounter"]) {
  await page.evaluate((s: any) => (window as any).setView(s), framing);
  await page.evaluate((t: any) => (window as any).setPhase(t), 6.0);
  await grab(`v1-motion-${framing}-a.png`);
  const fa: any = await page.evaluate(() => (window as any).frame());
  await page.evaluate((t: any) => (window as any).setPhase(t), 6.6);
  await grab(`v1-motion-${framing}-b.png`);
  const fb: any = await page.evaluate(() => (window as any).frame());
  const diff = await page.evaluate(([a, b]: any) => (window as any).frameDiff(a, b), [fa, fb] as any);
  const rows: any = await page.evaluate(() => (window as any).lastDiffRows);
  const band = rows.length ? `${Math.min(...rows)}-${Math.max(...rows)} (of 960w)` : "none";
  console.log(`motion pair ${framing}: ${diff} px differ, x band ${band}`);
}
console.log("unique colors:", JSON.stringify(counts));
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close();
server.close();
console.log(`wrote fauna69 pigeon renders -> ${outDir}`);
console.log("SHA256=" + SHA);
