// fauna75-render-carp.ts — review renders for the common carp. Chassis:
// fauna63-render-swan.ts. Serves the carp entity AT ITS SEAT FRAME (local
// 0 == world (9.723, 0.06093, -90.982) yaw 0 — frame-copy water-rider)
// together with the ACTUAL reedpool + all six resident GLBs + the angler
// at world-true relative poses. Meadow ground #4a5d33 (robin rig law a).
// Views: topdown (bridge-deck reader looking DOWN — fauna-29 law d: the
// surface reader looks down), angler18 (the angler's own 18m sightline
// across the water — the fish he is not catching), oblique8 (deck-oblique
// at 8m), near5 (bank encounter), night. MOTION PAIRS at topdown (t 8 vs
// 11 — the cruise arc) + angler18 (8 vs 8.6) — REAL closed forms:
// orbit evalPart case VERBATIM from client/lib/motion.js + bob +
// pendulumTheta rotatePartAtPivot.
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const carpBytes = readFileSync("agents/arthur/assets/village_fauna75_carp.glb");
const SHA = "2f91932ddbd14ff4028f6f03b2ef61982a84b44f18b4bd86e82f0c614f003b8a";
if (createHash("sha256").update(carpBytes).digest("hex") !== SHA) throw new Error("carp bytes drift");
const poolBytes = readFileSync("agents/arthur/assets/village_reedpool3.glb");
const duckBytes = readFileSync("agents/arthur/assets/village_duckpair.glb");
const heronBytes = readFileSync("agents/arthur/assets/village_fauna35_heron.glb");
const frogBytes = readFileSync("agents/arthur/assets/village_dress_frog.glb");
const gooseBytes = readFileSync("agents/arthur/assets/village_goosepair.glb");
const swanBytes = readFileSync("agents/arthur/assets/village_fauna63_swan.glb");
const anglerBytes = readFileSync("agents/arthur/assets/village_angler3.glb");
const outDir = resolve("agents/arthur/reviews/fauna75-carp");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");

const SEAT = [9.723, 0.06093, -90.982]; // entity origin == reedpool host origin; PY = water top 0.08093 - WL 0.02
const rel = (wx: number, wy: number, wz: number): [number, number, number] =>
  [wx - SEAT[0], wy - SEAT[1], wz - SEAT[2]];

// the exact comp payloads the placer sends (mirrored in fauna75-place-carp.ts)
const T0 = 1;
const COMPS = [
  { part: "carp", m: { type: "orbit", center: [1.95, 0.02, 1.05], radius: 0.5, degPerSec: 8, phase: 0, t0: T0 } },
  { part: "carp_dfin", m: { type: "bob", axis: [0, 1, 0], amp: 0.006, period: 3.0, phase: 0.5, t0: T0 } },
  { part: "carp_tail", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.30, period: 4.2, phase: 1.3, t0: T0 } },
];
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
// sun WSW-high (swan rig fixture)
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(-8,12,-10); sun.castShadow=true; scene.add(sun);
const fill=new THREE.DirectionalLight(0xffffff,1.0); fill.position.set(6,4,8); scene.add(fill);
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
const SWAN=await load('/swan.glb'); SWAN.position.set(...${JSON.stringify(rel(8.123, 0.05493, -92.482))}); SWAN.rotation.y=0;
const ANGLER=await load('/angler.glb'); ANGLER.position.set(...${JSON.stringify(rel(3.203, -0.035, -90.982))}); ANGLER.rotation.y=0;
const CARP=await load('/carp.glb'); CARP.position.set(0,0,0); CARP.rotation.y=0; // frame-copy seat: entity yaw == host yaw 0
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts={};
for(const c of ${JSON.stringify(COMPS_CLEAN)}){ const p=findPart(CARP,c.part);
  if(p) parts[c.part]={p, base:{pos:p.position.toArray(), quat:p.quaternion.toArray()}, m:c.m}; }
window.stats={carpParts:Object.keys(parts).length};
const _ax=new THREE.Vector3(); const _q=new THREE.Quaternion(); const _qb=new THREE.Quaternion();
const _pv=new THREE.Vector3(); const _rp=new THREE.Vector3();
function evalPartCase(p, base, m, t){
  if(m.type==='bob'){
    const off=Math.sin((2*Math.PI/(m.period??4))*t+(m.phase??0))*(m.amp??0.3);
    _ax.set(...(m.axis??[0,1,0])).normalize();
    p.position.set(...base.pos).addScaledVector(_ax,off); return;
  }
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
window.setView=(name)=>{ const views={
  topdown:[2.25,3.4,1.32],        // bridge-deck reader looking DOWN at the ring (fauna-29 law d)
  angler18:[-15.4,1.65,-1.2],     // the angler's own 18m sightline across the water
  oblique8:[0.2,2.3,3.0],         // 8m deck-oblique — the honest stroller vantage
  near5:[5.6,1.5,4.4],            // 5m encounter from the NE bank
  night:[-15.4,1.65,-1.2] };
  const tgt={topdown:[2.25,0.02,1.18],angler18:[2.25,0.0,1.15],oblique8:[2.3,0.0,1.2],near5:[2.25,0.0,1.15],night:[2.25,0.0,1.15]}[name];
  camera.position.fromArray(views[name]); camera.lookAt(...tgt); renderer.render(scene,camera); };
window.setNight=(on)=>{scene.background.set(on?0x111827:0xcbd6df);hemi.intensity=on?.18:2;ambient.intensity=on?.04:.45;sun.intensity=on?.15:3.2;};
window.setPhase=(tSec)=>{ for(const k of Object.keys(parts)){ const {p,base,m}=parts[k];
  const t=Math.max(0,(tSec*1000+1 - m.t0)/1000);
  evalPartCase(p,base,m,t); } };
window.snap=()=>{renderer.render(scene,camera); return renderer.domElement.toDataURL('image/png'); };
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
// world->screen projector for named nodes (position instrument)
window.project=(name)=>{ const p=findPart(CARP,name); if(!p) return null;
  p.updateMatrixWorld(true); const wp=new THREE.Vector3(); p.getWorldPosition(wp);
  const v=wp.clone().project(camera);
  return {world:[+wp.x.toFixed(2),+wp.y.toFixed(2),+wp.z.toFixed(2)], px:[Math.round((v.x+1)/2*960), Math.round(1-(v.y+1)/2*720)]}; };
window.setView('angler18'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/carp.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(carpBytes); }
    if (url === "/pool.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(poolBytes); }
    if (url === "/ducks.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(duckBytes); }
    if (url === "/heron.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(heronBytes); }
    if (url === "/frog.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(frogBytes); }
    if (url === "/geese.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(gooseBytes); }
    if (url === "/swan.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(swanBytes); }
    if (url === "/angler.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(anglerBytes); }
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
if (stats.carpParts !== 3) throw new Error(`expected 3 carp parts, got ${stats.carpParts}`);

// position instrument: project the carp at each view
await page.evaluate(() => (window as any).setView("angler18"));
const projs: any = await page.evaluate(() => {
  const out: any = {};
  for (const n of ["carp", "carp_dfin", "carp_tail"]) out[n] = (window as any).project(n);
  out.anglerRod = (window as any).project ? null : null;
  return out;
});
console.log("projections (angler18, t=8):", JSON.stringify(projs));

const grab = async (name: string) => {
  const dataUrl: string = await page.evaluate(() => (window as any).snap());
  writeFileSync(resolve(outDir, name), Buffer.from(dataUrl.split(",")[1], "base64"));
};
await page.evaluate(() => (window as any).setPhase(8.0));
await page.evaluate(() => (window as any).setNight(false));
const counts: any = {};
for (const v of ["topdown", "angler18", "oblique8", "near5", "night"]) {
  if (v === "night") { await page.evaluate(() => (window as any).setNight(true)); }
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  counts[v] = await page.evaluate(() => (window as any).colorCount());
  await grab(`v2-${v}.png`);
}
await page.evaluate(() => (window as any).setNight(false));
console.log("unique colors:", JSON.stringify(counts));

// motion pairs — the CRUISE (orbit) at plan view t8 vs t11 (24deg arc) +
// the angler vantage t8 vs t8.6
for (const [framing, ta, tb] of [["topdown", 8.0, 11.0], ["angler18", 8.0, 8.6]] as const) {
  await page.evaluate((s: any) => (window as any).setView(s), framing);
  await page.evaluate((t: any) => (window as any).setPhase(t), ta);
  await grab(`v2-motion-${framing}-a.png`);
  const fa: any = await page.evaluate(() => (window as any).frame());
  await page.evaluate((t: any) => (window as any).setPhase(t), tb);
  await grab(`v2-motion-${framing}-b.png`);
  const fb: any = await page.evaluate(() => (window as any).frame());
  const diff = await page.evaluate(([a, b]: any) => (window as any).frameDiff(a, b), [fa, fb] as any);
  const rows: any = await page.evaluate(() => (window as any).lastDiffRows);
  const band = rows.length ? `rows ${Math.min(...rows)}-${Math.max(...rows)} (of 720)` : "none";
  console.log(`motion pair ${framing} t${ta} vs t${tb}: ${diff} px differ, ${band}`);
}
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close();
server.close();
console.log(`wrote fauna75 carp renders -> ${outDir}`);
