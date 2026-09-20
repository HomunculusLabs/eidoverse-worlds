// fauna67-render-guinea.ts — review renders for the fauna-67 guinea flock.
// Chassis: fauna65-render-kestrel.ts (module-scope render law). Serves the
// flock AT ITS SEAT FRAME (root at local 0 == world (45.5, PY≈−0.046,
// −12.75) yaw −1.22) with the poultry yard's context at world-true
// RELATIVE poses: hutch + turkey + coop + cat (exact live local bytes —
// hashes verified c0a64ac4/5a3c1cf5/f5d40394/0030ce54), moonmoth as a
// decoded envelope block (11.1×3.96×7.05, disclosed). Meadow ground
// #4a5d33 (robin rig law a).
// Views: spoke18 — the TRUE 18m plaza-spoke vantage world (28.2,−7.9);
// encounter 4.2m; side plan (broadside — the flock spread read); aimed
// face probes on the sentinel head (casque/wattles) + pecker profile.
// MOTION PAIRS at spoke18/encounter, t=6.0 vs 6.6 — REAL closed forms
// (bob + pendulum scans, rotatePartAtPivot verbatim).
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const birdBytes = readFileSync("agents/arthur/assets/village_fauna67_guinea.glb");
const SHA = createHash("sha256").update(birdBytes).digest("hex");
console.log("guinea sha256:", SHA);
const mothBytes = readFileSync("agents/arthur/moon-moth/moon-moth.glb"); // sha16 df959099 == live lib
const hutchBytes = readFileSync("agents/arthur/assets/village_hutch3.glb");
const turkBytes = readFileSync("agents/arthur/assets/village_dress_turkeys.glb");
const coopBytes = readFileSync("agents/arthur/assets/village_coop3.glb");
const catBytes = readFileSync("agents/arthur/assets/village_dress_bcat1.glb");
const outDir = resolve("agents/arthur/reviews/fauna67-guinea");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");

// the exact comp payloads the placer sends (mirrored in fauna67-place-guinea.ts)
const T0OFF = 1; // rig t0 proxy — phases matter, not epoch
const COMPS = [
  { part: "guine_a", m: { type: "bob", amp: 0.005, period: 3.8, phase: 0.0, t0: T0OFF } },
  { part: "guine_b", m: { type: "bob", amp: 0.005, period: 4.3, phase: 1.1, t0: T0OFF } },
  { part: "guine_c", m: { type: "bob", amp: 0.004, period: 4.8, phase: 2.3, t0: T0OFF } },
  { part: "guine_a_head", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.24, period: 1.8, phase: 0.4, t0: T0OFF } },
  { part: "guine_b_head", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.30, period: 2.1, phase: 2.0, t0: T0OFF } },
  { part: "guine_c_head", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.22, period: 2.6, phase: 1.5, t0: T0OFF } },
  { part: "guine_a_tail", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.18, period: 1.9, phase: 0.8, t0: T0OFF } },
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
const gmat=new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:1,metalness:0});
const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),gmat); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
// moonmoth TRUE MESH (sha16 df959099 == live lib; bounds x±5.61 y0.01-5.35 z−4.22..3.13
// @ world (36.17,-14.88) yaw 0 — the fat envelope block false-occluded the sightline,
// a rig artifact, not world truth). Loaded below, after the loader is defined.
const loader=new GLTFLoader();
const load=async(url)=>{ const gltf=await loader.loadAsync(url); const root=gltf.scene; scene.add(root);
  root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}}); root.updateMatrixWorld(true); return root; };
const FLOCK=await load('/guinea.glb');
const MM=await load('/moth.glb'); MM.position.set(-2.294,0.017,-8.829); MM.rotation.y=0; // sha16 df959099 == live lib, true bounds
const HUTCH=await load('/hutch.glb'); HUTCH.position.set(-6.545,0.0465,-4.793); HUTCH.rotation.y=-0.68;
const TURK=await load('/turkey.glb'); TURK.position.set(-7.043,0.0078,2.577); TURK.rotation.y=0.07;
const COOP=await load('/coop.glb'); COOP.position.set(-9.706,0.0465,-4.701); COOP.rotation.y=-0.58;
const CAT=await load('/cat.glb'); CAT.position.set(-7.667,0.0085,-2.040); CAT.rotation.y=4.436;
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
// aimed probes: bird-local facing after per-bird lean
window.aimAtBird=(tag,dist,mode)=>{ const head=FLOCK.getObjectByName('guine_'+tag+'_head'); if(!head) return false;
  const lean={a:-0.12,b:0.18,c:0.05}[tag]??0;
  const front=new THREE.Vector3(Math.sin(lean),0,Math.cos(lean));
  const dir=mode==='face'?front.clone():mode==='rear'?front.clone().negate():new THREE.Vector3(-front.z,0,front.x);
  head.updateMatrixWorld(true); const wp=new THREE.Vector3(); head.getWorldPosition(wp);
  camera.position.copy(wp).addScaledVector(dir,dist); camera.position.y=wp.y+(mode==='face'?0.05:0.12);
  camera.lookAt(wp);
  if(window.__fill&&window.__fillT){ window.__fillT.position.copy(wp);
    window.__fill.position.copy(wp).addScaledVector(dir,3); window.__fill.position.y+=1.0; }
  renderer.render(scene,camera); return wp.toArray(); };
window.setView=(name)=>{ const views={
  spoke18:[-11.586,1.63,-13.916],
  encounter:[2.694,0.90,3.231],
  side:[6.2,0.85,1.2] };
  const tgt={spoke18:[0,0.45,0],encounter:[0,0.45,0],side:[0,0.40,0]}[name];
  camera.position.fromArray(views[name]); camera.lookAt(...tgt); renderer.render(scene,camera); };
window.projOf=(name)=>{ const pt=FLOCK.getObjectByName(name); if(!pt) return null;
  pt.updateMatrixWorld(true); const wp=new THREE.Vector3(); pt.getWorldPosition(wp);
  const sp=wp.project(camera); return [(sp.x*0.5+0.5)*960,( -sp.y*0.5+0.5)*720]; };
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
window.setView('spoke18'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/guinea.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(birdBytes); }
    if (url === "/moth.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(mothBytes); }
    if (url === "/hutch.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(hutchBytes); }
    if (url === "/turkey.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(turkBytes); }
    if (url === "/coop.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(coopBytes); }
    if (url === "/cat.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(catBytes); }
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
for (const v of ["spoke18", "encounter", "side"]) {
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  counts[v] = await page.evaluate(() => (window as any).colorCount());
  await grab(`new-${v}.png`);
}
// aimed probes: sentinel face (casque/wattles/bare head), sentinel profile,
// pecker profile (the ground-probe), leader profile
for (const [tag, mode, dist] of [["b", "face", 0.85], ["b", "side", 0.9], ["c", "side", 0.8], ["a", "side", 0.9]] as [string, string, number][]) {
  const wp: any = await page.evaluate(([t, m, d]: any) => (window as any).aimAtBird(t, d, m), [tag, mode, dist] as any);
  await page.waitForTimeout(60);
  await grab(`new-${mode}-${tag}.png`);
  console.log(`aimed ${mode} guine_${tag} at ${JSON.stringify(wp.map((v: number) => +v.toFixed(2)))}`);
}
// motion pairs: t=6.0 vs 6.6
for (const framing of ["spoke18", "encounter"]) {
  await page.evaluate((s: any) => (window as any).setView(s), framing);
  await page.evaluate((t: any) => (window as any).setPhase(t), 6.0);
  await grab(`new-motion-${framing}-a.png`);
  const fa: any = await page.evaluate(() => (window as any).frame());
  await page.evaluate((t: any) => (window as any).setPhase(t), 6.6);
  await grab(`new-motion-${framing}-b.png`);
  const fb: any = await page.evaluate(() => (window as any).frame());
  const diff = await page.evaluate(([a, b]: any) => (window as any).frameDiff(a, b), [fa, fb] as any);
  const rows: any = await page.evaluate(() => (window as any).lastDiffRows);
  const band = rows.length ? `${Math.min(...rows)}-${Math.max(...rows)} (of 720)` : "none";
  console.log(`motion pair ${framing}: ${diff} px differ, row band ${band}`);
}
console.log("unique colors:", JSON.stringify(counts));
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close();
server.close();
console.log(`wrote fauna67 guinea renders -> ${outDir}`);
console.log("SHA256=" + SHA);
