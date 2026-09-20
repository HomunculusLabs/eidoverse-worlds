// fauna63-render-swan.ts — review renders for the mute swan. Chassis:
// fauna61-render-stork.ts. Serves the swan entity AT ITS SEAT FRAME
// (local 0 == world (9.323, 0.06093, -92.082) yaw −0.28) together with
// the ACTUAL reedpool + ducks + heron + frog GLBs at world-true relative
// poses. Meadow ground #4a5d33 (robin rig law a), covered ±150. Views:
// approach18 (18m SW bank reader — the true pool vantage), flank18 (18m
// N bridge-deck reader, true profile), near5, side3 (close profile),
// night. Aimed probes: cob face (bill/knob/face from the facing
// direction), pen head (low-reach read). MOTION PAIRS at approach18 +
// near5, t=8 vs 8.6 — REAL closed forms (bob sin + pendulum
// rotatePartAtPivot verbatim).
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const swanBytes = readFileSync("agents/arthur/assets/village_fauna63_swan.glb");
const SHA = "9206edbedd472f6195afd093bc742c0ddd5fbd4a7d6cf966defadb340c7779e9";
if (createHash("sha256").update(swanBytes).digest("hex") !== SHA) throw new Error("swan bytes drift");
const poolBytes = readFileSync("agents/arthur/assets/village_reedpool3.glb");
const duckBytes = readFileSync("agents/arthur/assets/village_duckpair.glb");
const heronBytes = readFileSync("agents/arthur/assets/village_fauna35_heron.glb");
const frogBytes = readFileSync("agents/arthur/assets/village_dress_frog.glb");
const gooseBytes = readFileSync("agents/arthur/assets/village_goosepair.glb");
const outDir = resolve("agents/arthur/reviews/fauna63-swan");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");

const SEAT = [9.723, 0.06093, -90.982]; // entity origin == reedpool host origin (pool center; swans authored host-local)
const rel = (wx: number, wy: number, wz: number): [number, number, number] =>
  [wx - SEAT[0], wy - SEAT[1], wz - SEAT[2]];

// the exact comp payloads the placer sends (mirrored in fauna63-place-swan.ts)
const T0 = 1;
const COMPS = [
  { part: "swan_a", m: { type: "bob", axis: [0, 1, 0], amp: 0.006, period: 6.2, phase: 0.0, t0: T0 } },
  { part: "swan_a_neck", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.07, period: 8.0, phase: 1.2, t0: T0 } },
  { part: "swan_a_head", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.22, period: 9.5, patrol: undefined, phase: 2.4, t0: T0 } },
  { part: "swan_b", m: { type: "bob", axis: [0, 1, 0], amp: 0.005, period: 5.6, phase: 0.6, t0: W_T0() } },
  { part: "swan_b_neck", m: { type: "pendulum", axis: [1,  0, 0], pivot: [0, 0, 0], amp: 0.10, period: 3.8, phase: 1.8, t0: T0 } },
];
function W_T0() { return T0; }
const COMPS_CLEAN = COMPS.map(({ part, m }) => ({ part, m: { type: m.type, axis: m.axis, pivot: m.pivot, amp: m.amp, period: m.period, phase: m.phase, t0: T0 } }));

const html = `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#cbd6df}canvas{display:block}
</style><script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1); renderer.setSize(960,720); renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true; document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene(); scene.background=new THREE.Color(0xcbd6df);
const camera=new THREE.PerspectiveCamera(42,960/720,0.05,400);
const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2.0); scene.add(hemi);
const ambient=new THREE.AmbientLight(0xffffff,0.45); scene.add(ambient);
// sun WSW-high — from the SW bank reader's side (the approach18 camera
// stands SW; fauna-11 law b: sun on the reader's flank)
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(-8,12,-10); sun.castShadow=true; scene.add(sun);
const fill=new THREE.DirectionalLight(0xffffff,1.0); fill.position.set(6,4,8); scene.add(fill);
// v5 fill-v2 (disclosed, fauna-7 law b kin): the rig sky (203,214,223) is
// color-identical to shaded swan white — the 4px necks vanish against it.
// A mild reader-side fill separates the necks from the sky at 18m; the
// game's own sun varies, this stays inside the world envelope.
const fill2=new THREE.DirectionalLight(0xffffff,0.55); fill2.position.set(-10,3,-10); scene.add(fill2);
const gmat=new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:1,metalness:0});
const gplane=new THREE.Mesh(new THREE.PlaneGeometry(300,300),gmat); gplane.rotation.x=-Math.PI/2; gplane.position.y=-0.002; gplane.receiveShadow=true; scene.add(gplane);
const loader=new GLTFLoader();
const load=async(url)=>{ const gltf=await loader.loadAsync(url); const root=gltf.scene; scene.add(root);
  root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}}); root.updateMatrixWorld(true); return root; };
const POOL=await load('/pool.glb'); POOL.position.set(...${JSON.stringify(rel(9.723, -0.05907, -90.982))}); POOL.rotation.y=0;
const DUCKS=await load('/ducks.glb'); DUCKS.position.set(...${JSON.stringify(rel(8, 0.06093, -91))}); DUCKS.rotation.y=0;
const HERON=await load('/heron.glb'); HERON.position.set(...${JSON.stringify(rel(12.92, 0.08093, -91.38))}); HERON.rotation.y=-2.356194490192345;
const FROG=await load('/frog.glb'); FROG.position.set(...${JSON.stringify(rel(7.873, 0.08093, -89.132))}); FROG.rotation.y=2.356194490192345;
const GEESE=await load('/geese.glb'); GEESE.position.set(...${JSON.stringify(rel(7.9, -0.0408, -96.6))}); GEESE.rotation.y=0.45;
const SWAN=await load('/swan.glb'); SWAN.rotation.y=0; // frame-copy seat: entity yaw == host yaw (0) — v4 authored host-local; the v3 rig's stray -0.28 swung the flock off its authored water
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts={};
for(const c of ${JSON.stringify(COMPS_CLEAN)}){ const p=findPart(SWAN,c.part);
  if(p) parts[c.part]={p, base:{pos:p.position.toArray(), quat:p.quaternion.toArray()}, m:c.m}; }
window.stats={swanParts:Object.keys(parts).length};
const _ax=new THREE.Vector3(); const _q=new THREE.Quaternion(); const _qb=new THREE.Quaternion();
const _pv=new THREE.Vector3(); const _rp=new THREE.Vector3();
function evalPartCase(p, base, m, t){
  if(m.type==='bob'){
    const off=Math.sin((2*Math.PI/(m.period??4))*t+(m.phase??0))*(m.amp??0.3);
    _ax.set(...(m.axis??[0,1,0])).normalize();
    p.position.set(...base.pos).addScaledVector(_ax,off); return;
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
// aimed probe: camera at named node + worldDir(dist), looking at it —
// resolves ANY named node (the pen's head rides the neck pendulum and
// carries no comp of its own, so parts[] lookup is too narrow)
window.aimFrom=(name,dist,h,ang)=>{ const p=findPart(SWAN,name); if(!p) return false;
  p.updateMatrixWorld(true); const wp=new THREE.Vector3(); p.getWorldPosition(wp);
  const dx=Math.cos(ang), dz=Math.sin(ang);
  camera.position.set(wp.x+dx*dist,wp.y+(h??0),wp.z+dz*dist); camera.lookAt(wp); renderer.render(scene,camera); return wp.toArray(); };
window.setView=(name)=>{ const views={
  approach18:[-13,1.65,-13],         // 18m SW bank meadow reader (the geese's own vantage family) — SW oblique
  flank18:[-2.05,1.65,-20],          // 18m from the N (bridge-deck side) — true profile, pair centered
  flankNE12:[5.5,1.65,-12],          // 12m NE of the pair, water behind them — the honest profile framing
  near5:[-4.5,1.6,-4.5],             // 5m encounter on the SW approach
  side3:[-2.05,0.9,-5.1],            // 3m close profile from the N side
  night:[-13,1.65,-13] };
  const tgt={approach18:[-2.05,0.55,-1.95],flank18:[-2.05,0.55,-1.95],flankNE12:[-2.05,0.55,-1.95],near5:[-2.05,0.5,-1.95],side3:[-2.05,0.6,-1.95],night:[-2.05,0.55,-1.95]}[name];  camera.position.fromArray(views[name]); camera.lookAt(...tgt); renderer.render(scene,camera); };
window.setNight=(on)=>{scene.background.set(on?0x111827:0xcbd6df);hemi.intensity=on?.18:2;ambient.intensity=on?.04:.45;sun.intensity=on?.15:3.2;};
window.setPhase=(tSec)=>{ for(const k of Object.keys(parts)){ const {p,base,m}=parts[k];
  const t=Math.max(0,(tSec*1000+1 - m.t0)/1000);
  evalPartCase(p,base,m,t); } };
window.snap=()=>{renderer.render(scene,camera); return renderer.domElement.toDataURL('image/png');};
window.colorCount=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const d=x.getImageData(0,0,c.width,c.height).data; const s=new Set();
  for(let i=0;i<d.length;i+=4) s.add((d[i]<<16)|(d[i]<<8)|d[i+2]);
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
// world->screen projector for named nodes (the decisive position
// instrument — no more judging-position guesswork)
window.project=(name)=>{ const p=findPart(SWAN,name); if(!p) return null;
  p.updateMatrixWorld(true); const wp=new THREE.Vector3(); p.getWorldPosition(wp);
  const v=wp.clone().project(camera);
  return {world:[+wp.x.toFixed(2),+wp.y.toFixed(2),+wp.z.toFixed(2)], px:[Math.round((v.x+1)/2*960), Math.round((1-(v.y+1)/2)*720)]}; };
window.projectWorld=(x,y,z)=>{ const v=new THREE.Vector3(x,y,z).project(camera);
  return [Math.round((v.x+1)/2*960), Math.round((1-(v.y+1)/2)*720)]; };
window.setView('approach18'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/swan.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(swanBytes); }
    if (url === "/pool.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(poolBytes); }
    if (url === "/ducks.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(duckBytes); }
    if (url === "/heron.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(heronBytes); }
    if (url === "/frog.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(frogBytes); }
    if (url === "/geese.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(gooseBytes); }
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
if (stats.swanParts !== 5) throw new Error(`expected 5 swan parts, got ${stats.swanParts}`);
// position instrument: project the pair + landmarks at the approach18 view
await page.evaluate(() => (window as any).setView("approach18"));
const projs: any = await page.evaluate(() => {
  const out: any = {};
  for (const n of ["swan_a", "swan_a_head", "swan_b", "swan_b_head"]) out[n] = (window as any).project(n);
  // rig-frame landmarks: pool center water (0,0.061,0), bridge deck (0,0.28,-3.2), ducks (-1.75,0.08,0)
  out.pool = (window as any).projectWorld(0, 0.061, 0);
  out.bridge = (window as any).projectWorld(0, 0.28, -3.2);
  out.ducks = (window as any).projectWorld(-1.75, 0.08, 0);
  out.heron = (window as any).projectWorld(3.197, 0.4, -0.398);
  out.mastE = (window as any).projectWorld(1.25, 1.2, -3.8);
  return out;
});
console.log("projections:", JSON.stringify(projs));

const grab = async (name: string) => {
  const dataUrl: string = await page.evaluate(() => (window as any).snap());
  writeFileSync(resolve(outDir, name), Buffer.from(dataUrl.split(",")[1], "base64"));
};
await page.evaluate(() => (window as any).setPhase(8.0));
await page.evaluate(() => (window as any).setNight(false));
// honest profile framing first (the flank18 frame buries the pair behind
// foreground lampposts + geese — v-frame law)
await page.evaluate(() => (window as any).setView("flankNE12"));
await page.waitForTimeout(60);
await grab("v3-flankNE12.png");
const counts: any = {};
for (const v of ["approach18", "flank18", "near5", "side3", "night"]) {
  if (v === "night") { await page.evaluate(() => (window as any).setNight(true)); }
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  counts[v] = await page.evaluate(() => (window as any).colorCount());
  await grab(`v3-${v}.png`);
}
await page.evaluate(() => (window as any).setNight(false));
// aimed probes — cob head: ride the facing direction (entity +x world at
// yaw −0.28 = (cos −0.28, −sin −0.28) = (0.961, 0.276); rig angle
// atan2(dz,dx) = atan2(0.276, 0.961) ≈ 0.278)
const hpA: any = await page.evaluate(() => (window as any).aimFrom("swan_a_head", 1.5, 0.0, Math.PI + 0.278));
await page.waitForTimeout(60);
await grab("v3-cobface.png"); counts.cobface = await page.evaluate(() => (window as any).colorCount());
console.log("aimed cob head at rig", JSON.stringify(hpA.map((v: number) => +v.toFixed(2))));
// pen head probe from the same facing side
const hpB: any = await page.evaluate(() => (window as any).aimFrom("swan_b_head", 1.5, 0.2, Math.PI + 0.278));
await page.waitForTimeout(60);
await grab("v3-penface.png"); counts.penface = await page.evaluate(() => (window as any).colorCount());
console.log("aimed pen head at rig", JSON.stringify(hpB.map((v: number) => +v.toFixed(2))));
console.log("unique colors:", JSON.stringify(counts));
// motion pairs
for (const framing of ["approach18", "near5"]) {
  await page.evaluate((s: any) => (window as any).setView(s), framing);
  await page.evaluate((t: any) => (window as any).setPhase(t), 8.0);
  await grab(`v3-motion-${framing}-a.png`);
  const fa: any = await page.evaluate(() => (window as any).frame());
  await page.evaluate((t: any) => (window as any).setPhase(t), 8.6);
  await grab(`v3-motion-${framing}-b.png`);
  const fb: any = await page.evaluate(() => (window as any).frame());
  const diff = await page.evaluate(([a, b]: any) => (window as any).frameDiff(a, b), [fa, fb] as any);
  const rows: any = await page.evaluate(() => (window as any).lastDiffRows);
  const band = rows.length ? `${Math.min(...rows)}-${Math.max(...rows)} (of 720)` : "none";
  console.log(`motion pair ${framing}: ${diff} px differ, row band ${band}`);
}
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close();
server.close();
console.log(`wrote fauna63 swan renders -> ${outDir}`);
