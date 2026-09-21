// fauna85-render-bfly.ts — review renders for the butterfly pair.
// Chassis: fauna79-render-bats.ts. Serves the bfly entity AT ITS SEAT
// FRAME (local 0 == world (-39.5826, 0.0402, 62.8918) yaw 2.3562 —
// frame-copy air-rider over the lavender field) together with the REAL
// lavender field GLB (upload-twin bytes 5e04ce4b, local mason/retex —
// no DRACO needed, hmou law e) + the stroll-line context GLBs (hedge,
// yellowhammers, dovecote, peacock, peahen, stile) at world-true
// relative poses. Meadow ground #4a5d33.
// Views: stroll18 (the stile-side 18m reader line), strollOblique (8m
// oblique), encounter3 (dynamically aimed at bfly_b — the tortoise is
// judged in its own solo pass), encounter3a (aimed at bfly_a), night
// (the air tier's quiet hour).
// MOTION PAIRS at stroll18 (t 8 vs 11 — the ring arcs) + encounter3
// (8 vs 8.25 — the flutter) — REAL closed forms: orbit (both face
// modes) + bob + pendulumTheta rotatePartAtPivot, all VERBATIM from
// client/lib/motion.js evalPart.
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const bflyBytes = readFileSync("agents/arthur/assets/village_fauna85_bfly.glb");
const SHA = "77232f5398b06ab55206d4a7fd59e358edfce8e3119b358b83eb45378de21360";
if (createHash("sha256").update(bflyBytes).digest("hex") !== SHA) throw new Error("bfly bytes drift");
const lavBytes = readFileSync("agents/arthur/mason/glb-retex/work_1660_lavender.glb");
if (createHash("sha256").update(lavBytes).digest("hex").slice(0, 16) !== "5e04ce4b2ad6e90c") throw new Error("lavender twin drift");
const hedgeBytes = readFileSync("agents/arthur/assets/village_dress_nw_hedge1.glb");
const yhamBytes = readFileSync("agents/arthur/assets/village_dress_yham1.glb");
const dovecoteBytes = readFileSync("agents/arthur/assets/village_dress_dovecote.glb");
const peacockBytes = readFileSync("agents/arthur/assets/village_dress_peacock.glb");
const peahenBytes = readFileSync("agents/arthur/assets/village_dress_peahen.glb");
const stileBytes = readFileSync("agents/arthur/assets/village_dress_nw_stile1.glb");
const outDir = resolve("agents/arthur/reviews/fauna85-bfly");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");

// SEAT: entity == lavender host origin + yaw (frame-copy law)
const HOST = { x: -39.5826, y: 0.0402, z: 62.8918, yaw: 2.3562 };
const SEAT = [HOST.x, HOST.y, HOST.z];
const rel = (wx: number, wy: number, wz: number): [number, number, number] =>
  [wx - SEAT[0], wy - SEAT[1], wz - SEAT[2]];

// the exact comp payloads the placer sends (mirrored in fauna85-place-bfly.ts)
const T0 = 1;
// 2 wander rings (face default — head +z leads velocity)
const RINGS: [string, number[], number, number, number][] = [
  ["bfly_a", [0, 0.72, 0], 1.30, 34, 5.895],
  ["bfly_b", [2.0, 0.78, 1.2], 1.70, 28, 2.400],
];
// 2 jink orbits nested in the ring anchors (face:false — bank survives)
const JINKS: [string, number, number, number][] = [
  ["bfly_a_jink", 0.22, 42, 0.9],
  ["bfly_b_jink", 0.22, -40, 2.1],
];
// 2 hover bobs nested in the jinks (the nectar settle)
const HOVERS: [string, number, number, number][] = [
  ["bfly_a_hover", 0.006, 2.8, 0.3],
  ["bfly_b_hover", 0.006, 3.1, 1.7],
];
// 4 wing pendulums nested in the hover groups (L −, R +)
const WINGP: [string, number, number, number][] = [
  ["bfly_a", -0.85, 0.26, 0.0],
  ["bfly_b", -0.90, 0.24, 0.7],
];
const COMPS: { part: string; m: any }[] = [];
for (const [part, center, radius, degPerSec, phase] of RINGS)
  COMPS.push({ part, m: { type: "orbit", center, radius, degPerSec, phase, t0: T0 } });
for (const [part, radius, degPerSec, phase] of JINKS)
  COMPS.push({ part, m: { type: "orbit", center: [0, 0, 0], radius, degPerSec, phase, face: false, t0: T0 } });
for (const [part, amp, period, phase] of HOVERS)
  COMPS.push({ part, m: { type: "bob", amp, period, phase, t0: T0 } });
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
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(8,12,-6); sun.castShadow=true; scene.add(sun);
const fill=new THREE.DirectionalLight(0xffffff,1.0); fill.position.set(-6,4,8); scene.add(fill);
const nearFill=new THREE.DirectionalLight(0xffe8c8,1.6);
nearFill.visible=false; scene.add(nearFill); scene.add(nearFill.target);
const gmat=new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:1,metalness:0});
const gplane=new THREE.Mesh(new THREE.PlaneGeometry(300,300),gmat); gplane.rotation.x=-Math.PI/2; gplane.position.y=-0.002; gplane.receiveShadow=true; scene.add(gplane);
const loader=new GLTFLoader(); const load=async(url)=>{ const gltf=await loader.loadAsync(url); const root=gltf.scene; scene.add(root);
  root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}}); root.updateMatrixWorld(true); return root; };
// the host field + stroll-line context at world-true relative poses
const LAV=await load('/lavender.glb'); LAV.position.set(0,0,0); LAV.rotation.y=0; // entity == host frame copy
const HEDGE=await load('/hedge.glb'); HEDGE.position.set(...${JSON.stringify(rel(-35.34, 0.04, 62.14))}); HEDGE.rotation.y=-2.36 - ${HOST.yaw.toFixed(4)};
const YHAM=await load('/yham.glb'); YHAM.position.set(...${JSON.stringify(rel(-34.603, 1.48, 60.539))}); YHAM.rotation.y=-2.36 - ${HOST.yaw.toFixed(4)};
const DOVE=await load('/dovecote.glb'); DOVE.position.set(...${JSON.stringify(rel(-50.5, 0.0367, 62.55))}); DOVE.rotation.y=2.577 - ${HOST.yaw.toFixed(4)};
const PEAC=await load('/peacock.glb'); PEAC.position.set(...${JSON.stringify(rel(-43.3, 0.034, 69.7))}); PEAC.rotation.y=-2.318 - ${HOST.yaw.toFixed(4)};
const PEAH=await load('/peahen.glb'); PEAH.position.set(...${JSON.stringify(rel(-45.1, 0.0329, 67.5))}); PEAH.rotation.y=0.196 - ${HOST.yaw.toFixed(4)};
const STILE=await load('/stile.glb'); STILE.position.set(...${JSON.stringify(rel(-45.25, 0.046, 54.45))}); STILE.rotation.y=2.3562 - ${HOST.yaw.toFixed(4)};
const BFLY=await load('/bfly.glb'); BFLY.position.set(0,0,0); BFLY.rotation.y=0; // frame-copy air seat
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts={};
for(const c of ${JSON.stringify(COMPS_CLEAN)}){ const p=findPart(BFLY,c.part);
  if(p) parts[c.part]={p, base:{pos:p.position.toArray(), quat:p.quaternion.toArray()}, m:c.m}; }
window.stats={bflyParts:Object.keys(parts).length};
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
  if(m.type==='bob'){
    // VERBATIM from client/lib/motion.js evalPart case 'bob'
    const off=Math.sin((2*Math.PI/(m.period ?? 4))*t+(m.phase ?? 0))*(m.amp ?? 0.3);
    _ax.set(0,1,0).normalize();
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
window.setPhase=(tSec)=>{ for(const k of Object.keys(parts)){ const {p,base,m}=parts[k];
  const t=Math.max(0,(tSec*1000+1 - m.t0)/1000);
  evalPartCase(p,base,m,t); } BFLY.updateMatrixWorld(true); };
const center=[1,0.75,0.75];
window.setView=(name)=>{ const views={
  stroll18:[-8.7,1.75,-2.9],      // stile-side 18m reader line (villager eye 1.75)
  strollOblique:[-4.5,1.6,-1.2],  // 8m stroll oblique
  encounter3:null,                // dynamic aim at bfly_b
  encounter3a:null,               // dynamic aim at bfly_a
  night:[-8.7,1.75,-2.9] };
  nearFill.visible=false;
  if(name==='encounter3'||name==='encounter3a'){
    const key=name==='encounter3'?'bfly_b':'bfly_a';
    const p=parts[key]?.p; const wp=new THREE.Vector3();
    if(p){ p.getWorldPosition(wp);
      const dir=new THREE.Vector3(Math.sin(-0.5),0.18,Math.cos(-0.5)).normalize();
      camera.position.copy(wp).addScaledVector(dir,3.0);
      camera.lookAt(wp);
    } else camera.lookAt(...center);
    nearFill.position.copy(camera.position).add(new THREE.Vector3(0,0.4,0));
    nearFill.target.position.copy(wp ?? new THREE.Vector3(...center));
    nearFill.visible=true;
  } else {
    camera.position.fromArray(views[name]);
    if(name==='strollOblique'){ camera.lookAt(0,0.72,0.6); }
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
window.project=(name)=>{ const p=findPart(BFLY,name); if(!p) return null;
  p.updateMatrixWorld(true); const wp=new THREE.Vector3(); p.getWorldPosition(wp);
  const v=wp.clone().project(camera);
  return {world:[+wp.x.toFixed(2),+wp.y.toFixed(2),+wp.z.toFixed(2)], px:[Math.round((v.x+1)/2*960), Math.round(1-(v.y+1)/2*720)]}; };
window.setView('stroll18'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/bfly.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(bflyBytes); }
    if (url === "/lavender.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(lavBytes); }
    if (url === "/hedge.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(hedgeBytes); }
    if (url === "/yham.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(yhamBytes); }
    if (url === "/dovecote.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(dovecoteBytes); }
    if (url === "/peacock.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(peacockBytes); }
    if (url === "/peahen.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(peahenBytes); }
    if (url === "/stile.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(stileBytes); }
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
if (stats.bflyParts !== 10) throw new Error(`expected 10 bfly parts, got ${stats.bflyParts}`);

// projection instrument: where the two sit at t=8 (stroll18)
await page.evaluate(() => (window as any).setPhase(8.0));
await page.evaluate(() => (window as any).setView("stroll18"));
const projs: any = await page.evaluate(() => {
  const out: any = {};
  for (const n of ["bfly_a", "bfly_b"]) out[n] = (window as any).project(n);
  return out;
});
console.log("projections (stroll18, t=8):", JSON.stringify(projs));

const grab = async (name: string) => {
  const dataUrl: string = await page.evaluate(() => (window as any).snap());
  writeFileSync(resolve(outDir, name), Buffer.from(dataUrl.split(",")[1], "base64"));
};
await page.evaluate(() => (window as any).setNight(false));
for (const v of ["stroll18", "strollOblique", "encounter3", "encounter3a"]) {
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  await grab(`v1-${v}.png`);
}
await page.evaluate(() => (window as any).setNight(true));
await page.evaluate((s: any) => (window as any).setView(s), "night");
await page.waitForTimeout(60);
await grab("v1-night.png");
await page.evaluate(() => (window as any).setNight(false));

// motion pairs — the ring arcs at stroll18 (t 8 vs 11). The encounter
// pair must PHASE FIRST, THEN AIM: setView('encounter3') reads the live
// position, and aiming at t=11 then jumping to t=8 walks the butterfly
// ~2.7m around its ring OUT of the 3m frame (the first 0-px runs).
for (const [framing, ta, tb] of [["stroll18", 8.0, 11.0]] as const) {
  await page.evaluate((s: any) => (window as any).setView(s), framing);
  await page.evaluate((t: any) => (window as any).setPhase(t), ta);
  await grab(`v1-motion-${framing}-a.png`);
  const fa: any = await page.evaluate(() => (window as any).frame());
  await page.evaluate((t: any) => (window as any).setPhase(t), tb);
  await grab(`v1-motion-${framing}-b.png`);
  const fb: any = await page.evaluate(() => (window as any).frame());
  const diff = await page.evaluate(([a, b]: any) => (window as any).frameDiff(a, b), [fa, fb] as any);
  const rows: any = await page.evaluate(() => (window as any).lastDiffRows);
  const band = rows.length ? `rows ${Math.min(...rows)}-${Math.max(...rows)} (of 720)` : "none";
  console.log(`motion pair ${framing} t${ta} vs t${tb}: ${diff} px differ, ${band}`);
}
// encounter flutter pair: aim at the t=8 position, then micro-step
{
  await page.evaluate((t: any) => (window as any).setPhase(t), 8.0);
  await page.evaluate((s: any) => (window as any).setView(s), "encounter3");
  await grab("v1-motion-encounter3-a.png");
  const fa: any = await page.evaluate(() => (window as any).frame());
  await page.evaluate((t: any) => (window as any).setPhase(t), 8.13);
  await grab("v1-motion-encounter3-b.png");
  const fb: any = await page.evaluate(() => (window as any).frame());
  const diff = await page.evaluate(([a, b]: any) => (window as any).frameDiff(a, b), [fa, fb] as any);
  const rows: any = await page.evaluate(() => (window as any).lastDiffRows);
  const band = rows.length ? `rows ${Math.min(...rows)}-${Math.max(...rows)} (of 720)` : "none";
  console.log(`motion pair encounter3 t8 vs t8.13: ${diff} px differ, ${band}`);
}
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close();
server.close();
console.log(`wrote fauna85 bfly renders -> ${outDir}`);
