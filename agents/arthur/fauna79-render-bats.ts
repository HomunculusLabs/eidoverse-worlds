// fauna79-render-bats.ts — review renders for the pipistrelle bat swarm.
// Chassis: fauna75-render-carp.ts. Serves the bats entity AT ITS SEAT
// FRAME (local 0 == world (9.723, 0.06093, -90.982) yaw 0 — frame-copy
// air-rider) together with the ACTUAL reedpool + all seven resident GLBs
// + the angler at world-true relative poses. Meadow ground #4a5d33.
// Views: dusk18 (SW-bank 18m reader line — the pool's classic vantage),
// deckWalker (eye 2.07 on the bridge deck, the ring-3 crossing overhead),
// oblique8 (bank-oblique), near4 (solo encounter profile, dynamically
// aimed at bats_2's live position), night (the dusk animal's hour).
// MOTION PAIRS at dusk18 (t 8 vs 11 — the swarm's ring arcs) + near4
// (8 vs 8.3 — the flutter) — REAL closed forms: orbit (both face modes)
// + pendulumTheta rotatePartAtPivot, all VERBATIM from client/lib/motion.js.
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const batsBytes = readFileSync("agents/arthur/assets/village_fauna79_bats.glb");
const SHA = "d89f04bbceef2f9833cfd9b1898a19c20ea52afbeb327f4aecd9b7f91ff3e7c7";
if (createHash("sha256").update(batsBytes).digest("hex") !== SHA) throw new Error("bats bytes drift");
const poolBytes = readFileSync("agents/arthur/assets/village_reedpool3.glb");
const duckBytes = readFileSync("agents/arthur/assets/village_duckpair.glb");
const heronBytes = readFileSync("agents/arthur/assets/village_fauna35_heron.glb");
const frogBytes = readFileSync("agents/arthur/assets/village_dress_frog.glb");
const gooseBytes = readFileSync("agents/arthur/assets/village_goosepair.glb");
const swanBytes = readFileSync("agents/arthur/assets/village_fauna63_swan.glb");
const anglerBytes = readFileSync("agents/arthur/assets/village_angler3.glb");
const carpBytes = readFileSync("agents/arthur/assets/village_fauna75_carp.glb");
const outDir = resolve("agents/arthur/reviews/fauna79-bats");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");

const SEAT = [9.723, 0.06093, -90.982]; // entity origin == reedpool host origin (air frame copy)
const rel = (wx: number, wy: number, wz: number): [number, number, number] =>
  [wx - SEAT[0], wy - SEAT[1], wz - SEAT[2]];

// the exact comp payloads the placer sends (mirrored in fauna79-place-bats.ts)
const T0 = 1;
const RINGS: [string, number[], number, number, number][] = [
  // [part, center, radius, degPerSec, phase] — v5 evenly-spread slots plan
  ["bats_1", [0, 2.45, 0.3], 0.50, 84, 5.895],
  ["bats_2", [0, 2.70, 0.3], 0.90, 66, 2.973],
  ["bats_3", [0, 2.55, 0.3], 1.20, 52, 3.821],
  ["bats_4", [0, 2.90, 0.3], 1.55, 76, 1.806],
  ["bats_5", [0, 2.60, 0.3], 1.80, 60, 2.560],
];
const JINKS: [string, number, number, number][] = [
  // [part, radius, degPerSec, phase] — center [0,0,0] in anchor frame
  ["bats_1_jink", 0.18, 170, 0.7],
  ["bats_2_jink", 0.16, -150, 2.3],
  ["bats_3_jink", 0.20, 135, 4.1],
  ["bats_4_jink", 0.15, -190, 1.1],
  ["bats_5_jink", 0.17, 160, 3.3],
];
const WINGP: [string, number, number, number][] = [
  // [part, amp, period, phase] — L negative, R positive, same period/phase
  ["bats_1", -0.62, 0.22, 0.0],
  ["bats_2", -0.58, 0.24, 0.8],
  ["bats_3", -0.66, 0.20, 1.6],
  ["bats_4", -0.55, 0.26, 2.4],
  ["bats_5", -0.60, 0.23, 3.2],
];
const COMPS: { part: string; m: any }[] = [];
for (const [part, center, radius, degPerSec, phase] of RINGS)
  COMPS.push({ part, m: { type: "orbit", center, radius, degPerSec, phase, t0: T0 } });
for (const [part, radius, degPerSec, phase] of JINKS)
  COMPS.push({ part, m: { type: "orbit", center: [0, 0, 0], radius, degPerSec, phase, face: false, t0: T0 } });
for (const [base, amp, period, phase] of WINGP) {
  COMPS.push({ part: `${base}_wingL`, m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp, period, phase, t0: T0 } });
  COMPS.push({ part: `${base}_wingR`, m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: -amp, period, phase, t0: T0 } });
}
const COMPS_CLEAN = COMPS.map(({ part, m }) => ({ part, m: { ...m, t0: T0 } }));

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
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(-8,12,-10); sun.castShadow=true; scene.add(sun);
const fill=new THREE.DirectionalLight(0xffffff,1.0); fill.position.set(6,4,8); scene.add(fill);
// camera-side fill for the solo encounter probe (fauna-7 law b, disclosed)
const nearFill=new THREE.DirectionalLight(0xffe8c8,1.6);
nearFill.visible=false; scene.add(nearFill); scene.add(nearFill.target);
const gmat=new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:1,metalness:0});
const gplane=new THREE.Mesh(new THREE.PlaneGeometry(300,300),gmat); gplane.rotation.x=-Math.PI/2; gplane.position.y=-0.002; gplane.receiveShadow=true; scene.add(gplane);
const loader=new GLTFLoader(); const load=async(url)=>{ const gltf=await loader.loadAsync(url); const root=gltf.scene; scene.add(root);
  root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}}); root.updateMatrixWorld(true); return root; };
const POOL=await load('/pool.glb'); POOL.position.set(...${JSON.stringify(rel(9.723, -0.05907, -90.982))}); POOL.rotation.y=0;
const DUCKS=await load('/ducks.glb'); DUCKS.position.set(...${JSON.stringify(rel(8, 0.06093, -91))}); DUCKS.rotation.y=0;
const HERON=await load('/heron.glb'); HERON.position.set(...${JSON.stringify(rel(12.92, 0.08093, -91.38))}); HERON.rotation.y=-2.356194490192345;
const FROG=await load('/frog.glb'); FROG.position.set(...${JSON.stringify(rel(7.873, 0.08093, -89.132))}); FROG.rotation.y=2.356194490192345;
const GEESE=await load('/geese.glb'); GEESE.position.set(...${JSON.stringify(rel(7.9, -0.0408, -96.6))}); GEESE.rotation.y=0.45;
const SWAN=await load('/swan.glb'); SWAN.position.set(...${JSON.stringify(rel(8.123, 0.05493, -92.482))}); SWAN.rotation.y=0;
const ANGLER=await load('/angler.glb'); ANGLER.position.set(...${JSON.stringify(rel(3.203, -0.035, -90.982))}); ANGLER.rotation.y=0;
const CARP=await load('/carp.glb'); CARP.position.set(0,0,0); CARP.rotation.y=0;
const BATS=await load('/bats.glb'); BATS.position.set(0,0,0); BATS.rotation.y=0; // frame-copy air seat: entity yaw == host yaw 0
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts={};
for(const c of ${JSON.stringify(COMPS_CLEAN)}){ const p=findPart(BATS,c.part);
  if(p) parts[c.part]={p, base:{pos:p.position.toArray(), quat:p.quaternion.toArray()}, m:c.m}; }
window.stats={batParts:Object.keys(parts).length};
const _ax=new THREE.Vector3(); const _q=new THREE.Quaternion(); const _qb=new THREE.Quaternion();
const _pv=new THREE.Vector3(); const _rp=new THREE.Vector3();
function evalPartCase(p, base, m, t){
  if(m.type==='orbit'){
    // VERBATIM from client/lib/motion.js evalPart case 'orbit'
    const c=m.center ?? base.pos; const r=m.radius ?? 1;
    const a=(m.phase ?? 0)+((m.degPerSec ?? 12)*Math.PI/180)*t;
    p.position.set(c[0]+r*Math.sin(a), (c[1] ?? base.pos[1]), c[2]+r*Math.cos(a));
    if(m.face !== false) p.rotation.set(0, a+Math.PI/2, 0);
    return;
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
  evalPartCase(p,base,m,t); } BATS.updateMatrixWorld(true); };
const center=[0,2.7,0.3];
window.setView=(name)=>{ const views={
  dusk18:[-12.8,2.6,12.8],      // SW-bank 18m reader line (camera 2.6 = frame q; villager eye 1.75 disclosed)
  duskEye:[-12.8,1.75,12.8],    // the HONEST villager-eye dusk line (judge r1 horizon ask)
  deckWalker:[0,3.07,2.2],      // deck-walker eye 2.07 + 1m margin, looking NW across the deck
  oblique8:[3.4,2.6,4.6],       // 8m NE-bank oblique — the stroller vantage
  nearSolo:[-3.6,2.7,-2.4],     // SOLO encounter: OUTSIDE the ring, aimed at bats_5 below (others fall behind)
  night:[-12.8,1.75,12.8] };
  camera.position.fromArray(views[name]);
  if(name==='nearSolo'){ const p=parts['bats_5']?.p; const wp=new THREE.Vector3();
    if(p){ p.getWorldPosition(wp); camera.lookAt(wp); } else camera.lookAt(...center);
    // camera-side fill for the encounter probe (fauna-7 law b: anatomy
    // probes carry a camera-side fill, disclosed — the game's own sun varies)
    nearFill.position.copy(camera.position).add(new THREE.Vector3(0,0.4,0));
    nearFill.target.position.copy(camera.position).clone().negate();
    nearFill.visible=true;
  } else { nearFill.visible=false;
    if(name==='deckWalker'){ camera.lookAt(-1.2,2.5,-1.6); }
    else { camera.lookAt(...center); }
  }
  renderer.render(scene,camera); };
window.setNight=(on)=>{scene.background.set(on?0x0d1420:0xcbd6df);hemi.intensity=on?.22:2;ambient.intensity=on?.05:.45;sun.intensity=on?.18:3.2;};
window.snap=()=>{renderer.render(scene,camera); return renderer.domElement.toDataURL('image/png'); };
window.frame=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  return x.getImageData(0,0,c.width,c.height).data.slice(); };
window.frameDiff=(a,b)=>{ if(!a||!b||a.length!==b.length) return -1;
  let n=0; const row=[];
  for(let i=0;i<a.length;i+=4){ if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>18){
    n++; row.push(Math.floor((i/4)%960)); } } window.lastDiffRows=row; return n; };
window.rinfo=()=>({tri:renderer.info.render.triangles,calls:renderer.info.render.calls});
window.project=(name)=>{ const p=findPart(BATS,name); if(!p) return null;
  p.updateMatrixWorld(true); const wp=new THREE.Vector3(); p.getWorldPosition(wp);
  const v=wp.clone().project(camera);
  return {world:[+wp.x.toFixed(2),+wp.y.toFixed(2),+wp.z.toFixed(2)], px:[Math.round((v.x+1)/2*960), Math.round(1-(v.y+1)/2*720)]}; };
window.setView('dusk18'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/bats.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(batsBytes); }
    if (url === "/pool.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(poolBytes); }
    if (url === "/ducks.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(duckBytes); }
    if (url === "/heron.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(heronBytes); }
    if (url === "/frog.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(frogBytes); }
    if (url === "/geese.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(gooseBytes); }
    if (url === "/swan.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(swanBytes); }
    if (url === "/angler.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(anglerBytes); }
    if (url === "/carp.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(carpBytes); }
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
if (stats.batParts !== 20) throw new Error(`expected 20 bat parts, got ${stats.batParts}`);

// projection instrument: where the five bats sit at t=8 (dusk18)
await page.evaluate(() => (window as any).setPhase(8.0));
await page.evaluate(() => (window as any).setView("dusk18"));
const projs: any = await page.evaluate(() => {
  const out: any = {};
  for (const n of ["bats_1", "bats_2", "bats_3", "bats_4", "bats_5"]) out[n] = (window as any).project(n);
  return out;
});
console.log("projections (dusk18, t=8):", JSON.stringify(projs));

const grab = async (name: string) => {
  const dataUrl: string = await page.evaluate(() => (window as any).snap());
  writeFileSync(resolve(outDir, name), Buffer.from(dataUrl.split(",")[1], "base64"));
};
await page.evaluate(() => (window as any).setNight(false));
for (const v of ["dusk18", "duskEye", "deckWalker", "oblique8", "nearSolo"]) {
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  await grab(`v6-${v}.png`);
}
await page.evaluate(() => (window as any).setNight(true));
await page.evaluate((s: any) => (window as any).setView(s), "night");
await page.waitForTimeout(60);
await grab("v6-night.png");
await page.evaluate(() => (window as any).setNight(false));

// motion pairs — the swarm's ring arcs at dusk18 (t 8 vs 11) + the flutter
// at near4 (t 8 vs 8.3)
for (const [framing, ta, tb] of [["dusk18", 8.0, 11.0], ["nearSolo", 8.0, 8.3]] as const) {
  await page.evaluate((s: any) => (window as any).setView(s), framing);
  await page.evaluate((t: any) => (window as any).setPhase(t), ta);
  await grab(`v6-motion-${framing}-a.png`);
  const fa: any = await page.evaluate(() => (window as any).frame());
  await page.evaluate((t: any) => (window as any).setPhase(t), tb);
  await grab(`v6-motion-${framing}-b.png`);
  const fb: any = await page.evaluate(() => (window as any).frame());
  const diff = await page.evaluate(([a, b]: any) => (window as any).frameDiff(a, b), [fa, fb] as any);
  const rows: any = await page.evaluate(() => (window as any).lastDiffRows);
  const band = rows.length ? `rows ${Math.min(...rows)}-${Math.max(...rows)} (of 720)` : "none";
  console.log(`motion pair ${framing} t${ta} vs t${tb}: ${diff} px differ, ${band}`);
}
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close();
server.close();
console.log(`wrote fauna79 bats renders -> ${outDir}`);
