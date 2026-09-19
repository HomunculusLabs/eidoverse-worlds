// fauna35-render-heron.ts — review renders for the grey heron. Chassis:
// fauna34-render-swallows.ts (module-scope render law). Serves the heron
// entity AT ITS SEAT FRAME (local 0 == world (13.72, 0.08093, −91.38)
// yaw −π/2) together with the ACTUAL pool GLB at world pose + context
// fauna at world-true relative poses (ducks, frog, robin, geese, angler).
// Meadow ground #4a5d33 (robin rig law a) — covered to ±100 (robin law b).
// Views: pool_gameplay 18m E bank approach; pool_west 18m from the
// village side; near 5.5m (bank vantage); encounter 4.5m bridge-reader;
// side profile (the S-neck contract view); night. Aimed probes: headface
// (crown/stripe/bill), below (legs-in-water read from the bridge). MOTION
// PAIRS at pool_gameplay + near, t=8 vs 8.6 — driven by the REAL closed
// forms (bob sin + pendulum rotatePartAtPivot verbatim).
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const heronBytes = readFileSync("agents/arthur/assets/village_fauna35_heron.glb");
const SHA = "8c586d0aa8bdb2a9cd7ddd61e451fbdefe1ad8bcce0abc16dca29cd70b6cb85c";
if (createHash("sha256").update(heronBytes).digest("hex") !== SHA) throw new Error("heron bytes drift");
const poolBytes = readFileSync("agents/arthur/assets/village_reedpool3.glb");
const duckBytes = readFileSync("agents/arthur/assets/village_duckpair.glb");
const frogBytes = readFileSync("agents/arthur/assets/village_dress_frog.glb");
const robinBytes = readFileSync("agents/arthur/assets/village_dress_robin1.glb");
const gooseBytes = readFileSync("agents/arthur/assets/village_goosepair.glb");
const anglerBytes = readFileSync("agents/arthur/assets/village_angler3.glb");
const outDir = resolve("agents/arthur/reviews/fauna35-heron-ctrl");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");

// seat: world (13.72, 0.08093, -91.38) yaw -π/2; rig origin AT the seat
// (heron local 0 == seat); context placed at world-minus-seat + (0, -0.08093)
// so y=0 == water top.
const SEAT = [12.92, 0.08093, -91.38];
const rel = (wx: number, wy: number, wz: number): [number, number, number] =>
  [wx - SEAT[0], wy - SEAT[1], wz - SEAT[2]];

// the exact comp payloads the placer sends (mirrored in fauna35-place-heron.ts)
const COMPS = [
  { part: "heron", m: { type: "bob", axis: [0, 1, 0], amp: 0.006, period: 4.6, phase: 0.0, t0: 1 } },
  { part: "heron_neck", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.08, period: 6.4, phase: 1.2, t0: 1 } },
  { part: "heron_head", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.30, period: 9.0, phase: 2.4, t0: 1 } },
  { part: "heron_tail", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.10, period: 2.6, phase: 0.6, t0: 1 } },
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
// sun WSW-high: the heron faces W; front-lights the W-facing read (bill
// + crown catch light from the village-side reader's sun)
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(-5,10,3); sun.castShadow=true; scene.add(sun);
const fill=new THREE.DirectionalLight(0xffffff,1.1); fill.position.set(2,4,10); scene.add(fill);
const gmat=new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:1,metalness:0});
// ground BELOW the pool base: pool water top sits at rig y=0; pool local
// ground plane at world -0.059 -> rig -0.14. Ground disc under the pool,
// meadow plane elsewhere at rig y -0.14 (bank grade).
const gdisc=new THREE.Mesh(new THREE.CircleGeometry(8.5,36),gmat); gdisc.rotation.x=-Math.PI/2; gdisc.position.set(0.6,-0.139,0.4); scene.add(gdisc);
const gplane=new THREE.Mesh(new THREE.PlaneGeometry(220,220),gmat); gplane.rotation.x=-Math.PI/2; gplane.position.y=-0.141; gplane.receiveShadow=true; scene.add(gplane);
const loader=new GLTFLoader();
const load=async(url)=>{ const gltf=await loader.loadAsync(url); const root=gltf.scene; scene.add(root);
  root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}}); root.updateMatrixWorld(true); return root; };
// pool at world pose (rel + pool's own py baked: world -0.05907)
const POOL=await load('/pool.glb'); POOL.position.set(...${JSON.stringify(rel(9.723, -0.05907, -90.982))}); POOL.rotation.y=0;
const DUCKS=await load('/ducks.glb'); DUCKS.position.set(...${JSON.stringify(rel(8.0, 0.06093, -91.0))}); DUCKS.rotation.y=0;
const FROG=await load('/frog.glb'); FROG.position.set(...${JSON.stringify(rel(7.873, 0.08093, -89.132))}); FROG.rotation.y=3*Math.PI/4;
const ROBIN=await load('/robin.glb'); ROBIN.position.set(...${JSON.stringify(rel(6.3, -0.0291, -86.35))}); ROBIN.rotation.y=3*Math.PI/2;
const GEESE=await load('/geese.glb'); GEESE.position.set(...${JSON.stringify(rel(7.9, -0.0408, -96.6))}); GEESE.rotation.y=0.45;
const ANGLER=await load('/angler.glb'); ANGLER.position.set(...${JSON.stringify(rel(3.203, -0.035, -90.982))}); ANGLER.rotation.y=0;
const HERON=await load('/heron.glb'); HERON.rotation.y=-3*Math.PI/4; HERON.visible=false;
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts={};
for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(HERON,c.part);
  if(p) parts[c.part]={p, base:{pos:p.position.toArray(), quat:p.quaternion.toArray()}, m:c.m}; }
window.stats={heronParts:Object.keys(parts).length};
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
// aimed probes at the heron's parts (world pos of the node)
window.aimAtPart=(name,dist,h,lift)=>{ const pt=parts[name]; if(!pt) return false;
  pt.p.updateMatrixWorld(true); const wp=new THREE.Vector3(); pt.p.getWorldPosition(wp);
  camera.position.set(wp.x,wp.y+(lift??0.05),wp.z+dist); camera.lookAt(wp.x,wp.y+(h??0),wp.z); renderer.render(scene,camera); return wp.toArray(); };
// heron faces W (local +z -> world -x after yaw -π/2). Face-front camera
// stands WEST of it, at h above water, aimed at the head world pos.
window.aimFront=(dist,h,lift)=>{ const pt=parts['heron_head']; if(!pt) return false;
  pt.p.updateMatrixWorld(true); const wp=new THREE.Vector3(); pt.p.getWorldPosition(wp);
  camera.position.set(wp.x-dist,wp.y+(lift??0),wp.z); camera.lookAt(wp); renderer.render(scene,camera); return wp.toArray(); };
window.setView=(name)=>{ const views={
  pool_gameplay:[18,1.65,0],        // 18m E bank: the heron's REAR — silhouette + legs-in-water over the pool
  pool_west:[-18,1.65,0],           // 18m W (village side): the heron's FRONT — S-neck + dagger read
  near:[-5.5,1.65,0],               // 5.5m bank vantage from the village side (encounter space)
  encounter:[-4,1.75,0.4],          // 4m bridge-quarter reader (world 9.72,-91.4 on the deck)
  side:[0.5,1.0,-5.5],              // profile from the S bank — the S-neck contract view
  night:[18,1.65,0] };
  const tgt={pool_gameplay:[0,0.5,0],pool_west:[0,0.5,0],near:[0,0.55,0],encounter:[0,0.55,0],side:[0,0.45,0],night:[0,0.5,0]}[name];  camera.position.fromArray(views[name]); camera.lookAt(...tgt); renderer.render(scene,camera); };
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
window.setView('pool_gameplay'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/heron.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(heronBytes); }
    if (url === "/pool.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(poolBytes); }
    if (url === "/ducks.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(duckBytes); }
    if (url === "/frog.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(frogBytes); }
    if (url === "/robin.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(robinBytes); }
    if (url === "/geese.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(gooseBytes); }
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
if (stats.heronParts !== 4) throw new Error(`expected 4 heron parts, got ${stats.heronParts}`);

const grab = async (name: string) => {
  const dataUrl: string = await page.evaluate(() => (window as any).snap());
  writeFileSync(resolve(outDir, name), Buffer.from(dataUrl.split(",")[1], "base64"));
};
await page.evaluate(() => (window as any).setPhase(8.0));
await page.evaluate(() => (window as any).setNight(false));
const counts: any = {};
for (const v of ["near"]) {
  if (v === "night") { await page.evaluate(() => (window as any).setNight(true)); }
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  counts[v] = await page.evaluate(() => (window as any).colorCount());
  await grab(`new-${v}.png`);
}
await page.evaluate(() => (window as any).setNight(false));
// aimed probes: head-front (crown+stripe+bill), neck profile close, legs/below
const hp: any = await page.evaluate(() => (window as any).aimFront(1.4, 0.0, 0.02));
await page.waitForTimeout(60);
await grab("new-headface.png"); counts.headface = await page.evaluate(() => (window as any).colorCount());
console.log("aimed head at rig", JSON.stringify(hp.map((v: number) => +v.toFixed(2))));
const np: any = await page.evaluate(() => (window as any).aimAtPart("heron_neck", 1.2, 0.0, 0.15));
await page.waitForTimeout(60);
await grab("new-neckprofile.png"); counts.neckprofile = await page.evaluate(() => (window as any).colorCount());
// legs-in-water from slightly above (the bridge reader looks DOWN - frog law d)
await page.evaluate(() => (window as any).setView("encounter"));
await grab("new-legswater.png"); counts.legswater = await page.evaluate(() => (window as any).colorCount());
console.log("unique colors:", JSON.stringify(counts));
// motion pairs
for (const framing of ["pool_gameplay", "near", "encounter"]) {
  await page.evaluate((s: any) => (window as any).setView(s), framing);
  await page.evaluate((t: any) => (window as any).setPhase(t), 8.0);
  await grab(`new-motion-${framing}-a.png`);
  const fa: any = await page.evaluate(() => (window as any).frame());
  await page.evaluate((t: any) => (window as any).setPhase(t), 8.6);
  await grab(`new-motion-${framing}-b.png`);
  const fb: any = await page.evaluate(() => (window as any).frame());
  const diff = await page.evaluate(([a, b]: any) => (window as any).frameDiff(a, b), [fa, fb] as any);
  const rows: any = await page.evaluate(() => (window as any).lastDiffRows);
  const band = rows.length ? `${Math.min(...rows)}-${Math.max(...rows)} (of 720)` : "none";
  console.log(`motion pair ${framing}: ${diff} px differ, row band ${band}`);
}
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close();
server.close();
console.log(`wrote fauna35 heron renders -> ${outDir}`);
