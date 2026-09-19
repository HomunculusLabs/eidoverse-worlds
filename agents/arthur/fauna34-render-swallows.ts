// fauna34-render-swallows.ts — review renders for the barnyard barn
// swallows. Chassis: fauna32-render-bees.ts (module-scope render law).
// Serves the swallows entity AT ITS SEAT FRAME (root at local 0 == world
// (49.5, PY≈-0.036, 0) yaw 0) together with the yard's standing context
// at world-true RELATIVE poses: stable (local −6.5,0,0 rotY −π/2 — its
// live lib 98f2d5b6 is the local source; horses' 6ef0e86c + owl's
// a11e5432 are exact-live local bytes), ruledtower + wavepergola as
// decoded envelope blocks (visual context, disclosed). Meadow ground
// #4a5d33 (robin rig law a).
// Views: yard_gameplay 18m ENE on the horses' own proven visitor line
// (66,−8.5)→(51.2,−1.4); yard_west 18m from the W approach (cross-lane);
// near 5.5m; encounter at the yard vantage looking UP (readers look up
// at 2.4-3.6m birds); side plan view (3 rings + horses + posts — the
// composition proof); night. Aimed PROFILE probes at each bird's a=0
// phase (t = 2π/ω̇ per ring — full fork-tail profile). MOTION PAIRS at
// yard_gameplay + near, t=6.0 vs 6.6 — driven by the REAL closed forms
// (orbit + nested pendulum flap, rotatePartAtPivot verbatim).
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const birdsBytes = readFileSync("agents/arthur/assets/village_fauna34_swallows.glb");
const SHA = "9e3f6b05f1f41ab8dc215ce87f2bcbd4f861d6558aea5dbfb2f7c508f98f45cd";
if (createHash("sha256").update(birdsBytes).digest("hex") !== SHA) throw new Error("swallow bytes drift");
const stableBytes = readFileSync("agents/arthur/assets/village_stable3.glb");
const horseBytes = readFileSync("agents/arthur/assets/village_dress_stablehorses.glb");
const owlBytes = readFileSync("agents/arthur/assets/village_dress_barnowl1.glb");
const outDir = resolve("agents/arthur/reviews/fauna34-swallows");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const ME = readFileSync("client/lib/motioneval.js", "utf8");

// the exact comp payloads the placer sends (mirrored in fauna34-place-swallows.ts)
const COMPS = [
  { part: "swallow_1", m: { type: "orbit", center: [-1.9, 2.40, -1.9], radius: 2.6, degPerSec: 52, phase: 0.0, t0: 1 } },
  { part: "swallow_2", m: { type: "orbit", center: [1.9, 2.50, 4.5], radius: 1.8, degPerSec: 62, phase: 2.1, t0: 1 } },
  { part: "swallow_3", m: { type: "orbit", center: [0.4, 3.60, 1.0], radius: 3.0, degPerSec: 44, phase: 4.2, t0: 1 } },
  { part: "swallow_1_wingL", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: -0.55, period: 0.34, phase: 0.0, t0: 1 } },
  { part: "swallow_1_wingR", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.55, period: 0.34, phase: 0.0, t0: 1 } },
  { part: "swallow_2_wingL", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: -0.62, period: 0.30, phase: 1.3, t0: 1 } },
  { part: "swallow_2_wingR", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.62, period: 0.30, phase: 1.3, t0: 1 } },
  { part: "swallow_3_wingL", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: -0.50, period: 0.38, phase: 2.6, t0: 1 } },
  { part: "swallow_3_wingR", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.50, period: 0.38, phase: 2.6, t0: 1 } },
];

const html = `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#cbd6df}canvas{display:block}
</style><script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
import { axisOf, ampOf } from '/motioneval.js';
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1); renderer.setSize(960,720); renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true; document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene(); scene.background=new THREE.Color(0xcbd6df);
const camera=new THREE.PerspectiveCamera(42,960/720,0.05,300);
const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2.0); scene.add(hemi);
const ambient=new THREE.AmbientLight(0xffffff,0.45); scene.add(ambient);
// sun WNW-high (local (−6,12,−4) = world (43.5,12,−4)): front-lights the
// road-end ENE reader vantage (the yard's chosen line, fauna-19)
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(-6,12,-4); sun.castShadow=true; scene.add(sun);
// camera-side fill for anatomy probes (fauna-7 law b — aimed cameras sat
// in the rig sun's shade and backlit anatomy read as dark lumps)
const fill=new THREE.DirectionalLight(0xffffff,1.15); fill.position.set(2,4,14); scene.add(fill);
const gmat=new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:1,metalness:0});
const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),gmat); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
// ruledtower + wavepergola as decoded envelope context blocks (disclosed:
// envelope boxes, not meshes — they sit at the rig edges)
const tw=new THREE.Mesh(new THREE.BoxGeometry(9,7.23,9),new THREE.MeshStandardMaterial({color:0x6b6f6a,roughness:.95}));
tw.position.set(8.75,7.23/2-0.036,0); tw.castShadow=true; tw.receiveShadow=true; scene.add(tw);
const pg=new THREE.Mesh(new THREE.BoxGeometry(14.18,4.65,4.48),new THREE.MeshStandardMaterial({color:0x7a6a4c,roughness:.95}));
pg.position.set(1.5,4.65/2-0.022,9); pg.castShadow=true; pg.receiveShadow=true; scene.add(pg);
const loader=new GLTFLoader();
const load=async(url)=>{ const gltf=await loader.loadAsync(url); const root=gltf.scene; scene.add(root);
  root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}}); root.updateMatrixWorld(true); return root; };
// yard context at world-true RELATIVE poses (seat at local 0):
const STABLE=await load('/stable.glb'); STABLE.position.set(-6.5,0,0); STABLE.rotation.y=-Math.PI/2;
const HORSES=await load('/horses.glb'); HORSES.position.set(0,-0.03564,0); HORSES.rotation.y=-1.75;
const OWL=await load('/owl.glb'); OWL.position.set(-0.7,-0.0295,4.2); OWL.rotation.y=2.89;
const BIRDS=await load('/swallows.glb');
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts={};
for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(BIRDS,c.part);
  if(p) parts[c.part]={p, base:{pos:p.position.toArray(), quat:p.quaternion.toArray()}, m:c.m}; }
window.stats={birdParts:Object.keys(parts).length};
// evalPart orbit + nested pendulum — VERBATIM math from client/lib/motion.js
// (rotatePartAtPivot composes on the captured base pose)
const _ax=new THREE.Vector3(); const _q=new THREE.Quaternion(); const _qb=new THREE.Quaternion();
const _pv=new THREE.Vector3(); const _rp=new THREE.Vector3();
function evalPartCase(p, base, m, t){
  if(m.type==='orbit'){
    const c=m.center??base.pos; const r=m.radius??1;
    const a=(m.phase??0)+((m.degPerSec??12)*Math.PI/180)*t;
    p.position.set(c[0]+r*Math.sin(a),(c[1]??base.pos[1]),c[2]+r*Math.cos(a));
    if(m.face!==false) p.rotation.set(0,a+Math.PI/2,0); return;
  }
  if(m.type==='pendulum'){
    // pendulumTheta (motioneval.js): amp·cos(w0·t + phase) — undamped
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
window.aimAtBird=(name,dist,lift)=>{ const pt=parts[name]; if(!pt) return false;
  pt.p.updateMatrixWorld(true); const wp=new THREE.Vector3(); pt.p.getWorldPosition(wp);
  camera.position.set(wp.x,wp.y+(lift??0.10),wp.z+dist); camera.lookAt(wp); renderer.render(scene,camera); return wp.toArray(); };
// from-below probe: the yard reader's TRUE vantage (1.65m eyes under
// 2.4-3.6m birds) — under-behind, showing cream underside + spread wings
window.aimFromBelow=(name,dist)=>{ const pt=parts[name]; if(!pt) return false;
  pt.p.updateMatrixWorld(true); const wp=new THREE.Vector3(); pt.p.getWorldPosition(wp);
  camera.position.set(wp.x-0.12,wp.y-0.55,wp.z+dist); camera.lookAt(wp); renderer.render(scene,camera); return wp.toArray(); };
// rear probe: directly behind the tail (camera on the reversed flight
// axis) — the fork reads as a clean V from behind, a real yard vantage as
// a bird circles away. (Side views compress the lateral span edge-on —
// species-true shallow read; below/rear are the fork's contract vantages.)
window.aimFromRear=(name,dist)=>{ const pt=parts[name]; if(!pt) return false;
  pt.p.updateMatrixWorld(true); const wp=new THREE.Vector3(); pt.p.getWorldPosition(wp);
  const q=pt.p.getWorldQuaternion(new THREE.Quaternion());
  const dir=new THREE.Vector3(0,0,1).applyQuaternion(q).negate();
  camera.position.copy(wp).addScaledVector(dir,dist); camera.position.y=wp.y+0.04;
  camera.lookAt(wp); renderer.render(scene,camera); return wp.toArray(); };
window.setView=(name)=>{ const views={
  yard_gameplay:[0,1.65,-18],       // 18m N on the coop-yard lane (turkeys/hutch lane — real foot traffic; clear sight)
  yard_west:[-16.5,1.65,-8.5],     // 18m from the W approach (cross-lane check)
  near:[5.5,1.65,0],               // 5.5m looking W into the yard
  encounter:[1.7,1.65,-1.4],       // the yard vantage, looking up at ring A
  side:[0,9,8.001],                // plan view: 3 rings + horses + posts
  top:[0.4,7,1.0] };
  const tgt={yard_gameplay:[0,2.3,0],yard_west:[0,2.3,0],near:[0,2.4,0],encounter:[-1.9,2.40,-1.9],side:[0,1,0],top:[0.4,0,1.0]}[name];  camera.position.fromArray(views[name]); camera.lookAt(...tgt); renderer.render(scene,camera); };
window.setNight=(on)=>{scene.background.set(on?0x111827:0xcbd6df);hemi.intensity=on?.18:2;ambient.intensity=on?.04:.45;sun.intensity=on?.15:3.2;};
window.setPhase=(tSec)=>{ for(const k of Object.keys(parts)){ const {p,base,m}=parts[k];
  const t=Math.max(0,(tSec*1000+1 - m.t0)/1000);
  evalPartCase(p,base,m,t); } };
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
window.setView('yard_gameplay'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/swallows.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(birdsBytes); }
    if (url === "/stable.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(stableBytes); }
    if (url === "/horses.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(horseBytes); }
    if (url === "/owl.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(owlBytes); }
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
if (stats.birdParts !== 9) throw new Error(`expected 9 bird parts, got ${stats.birdParts}`);

const grab = async (name: string) => {
  const dataUrl: string = await page.evaluate(() => (window as any).snap());
  writeFileSync(resolve(outDir, name), Buffer.from(dataUrl.split(",")[1], "base64"));
};
// render at a mid-flight phase so all three birds are visibly on-wing
await page.evaluate(() => (window as any).setPhase(6.0));
await page.evaluate(() => (window as any).setNight(false));
const counts: any = {};
for (const v of ["yard_gameplay", "yard_west", "near", "encounter", "side", "top"]) {
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  counts[v] = await page.evaluate(() => (window as any).colorCount());
  await grab(`new-${v}.png`);
}
// aimed PROFILE probes — v3 phase law: for each bird find t where the
// orbit angle is a PROFILE angle (a ≈ 0 mod π, ±20° tolerance is fine —
// the fork still spans the frame) AND the wing pendulum sits near LEVEL
// (θ = amp·cos(w·t + φ) ≈ 0, rising). v1/v2 probes landed mid-downstroke
// (wings drooped like a "magazine") and the judge read the droop as a
// grip. Solver: coarse-scan t in [0, T_orbit] at 1/480s, keep points
// with |sin| profile gate, then pick the t minimizing |θ_wing|.
const ORBITS = [
  { part: "swallow_1", ring: { cx: -1.9, cy: 2.40, cz: -1.9, r: 2.6, deg: 52, ph: 0.0 }, wingP: 0.34, wingPh: 0.0 },
  { part: "swallow_2", ring: { cx: 1.9, cy: 2.50, cz: 4.5, r: 1.8, deg: 62, ph: 2.1 }, wingP: 0.30, wingPh: 1.3 },
  { part: "swallow_3", ring: { cx: 0.4, cy: 3.60, cz: 1.0, r: 3.0, deg: 44, ph: 4.2 }, wingP: 0.38, wingPh: 2.6 },
];
const aims: [string, number][] = ORBITS.map(({ part, ring, wingP, wingPh }) => {
  const w_orb = (ring.deg * Math.PI / 180);
  const w_w = 2 * Math.PI / wingP;
  let best: [number, number] = [Infinity, 0];   // [|theta|, t]
  for (let t = 0; t <= (2 * Math.PI) / w_orb; t += 1 / 480) {
    const a = ring.ph + w_orb * t;
    if (Math.abs(Math.sin(a)) > 0.34) continue;   // near-profile angle only
    const th = Math.cos(w_w * t + wingPh);        // signed fraction (amp constant)
    if (Math.abs(th) < best[0]) best = [Math.abs(th), t];
  }
  console.log(`aimSolver ${part}: t=${best[1].toFixed(3)}s |sin a|=${Math.abs(Math.sin(ring.ph + w_orb * best[1])).toFixed(2)} wingThetaFrac=${best[0].toFixed(2)}`);
  return [part, best[1]] as [string, number];
});
for (const [bn, t] of aims) {
  await page.evaluate((tt: any) => (window as any).setPhase(tt), t);
  const wp: any = await page.evaluate(([n]: any) => (window as any).aimAtBird(n, 0.7, 0.08), [bn] as any);
  await page.waitForTimeout(60);
  await grab(`new-bird-${bn}.png`);
  counts[`bird-${bn}`] = await page.evaluate(() => (window as any).colorCount());
  console.log(`aimed ${bn} at local ${JSON.stringify(wp.map((v: number) => +v.toFixed(2)))}`);
  // from-below + rear variants (the fork's contract vantages) on every bird
  await page.evaluate(([n]: any) => (window as any).aimFromBelow(n, 0.75), [bn] as any);
  await page.waitForTimeout(60);
  await grab(`new-below-${bn}.png`);
  counts[`below-${bn}`] = await page.evaluate(() => (window as any).colorCount());
  await page.evaluate(([n]: any) => (window as any).aimFromRear(n, 0.7), [bn] as any);
  await page.waitForTimeout(60);
  await grab(`new-rear-${bn}.png`);
  counts[`rear-${bn}`] = await page.evaluate(() => (window as any).colorCount());
}
console.log("unique colors:", JSON.stringify(counts));
// motion pairs: t=6.0 vs t=6.6 (orbits advance 26-37 deg, wings flap ~2 cycles)
for (const framing of ["yard_gameplay", "near", "encounter"]) {
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
await page.evaluate(() => (window as any).setNight(true));
await page.evaluate(() => (window as any).setView("yard_gameplay"));
await grab("new-night.png");
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close();
server.close();
console.log(`wrote fauna34 swallow renders -> ${outDir}`);
