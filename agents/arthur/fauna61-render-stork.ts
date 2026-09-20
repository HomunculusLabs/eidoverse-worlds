// fauna61-render-stork.ts — review renders for the white stork. Chassis:
// fauna35-render-heron.ts. Serves the stork entity AT ITS SEAT FRAME
// (local 0 == world (−74.741, −0.01248, 4.674) yaw 3.3224) together with
// the ACTUAL millrace GLB + screwwell + kingfisher at world-true relative
// poses. Meadow ground #4a5d33 (robin rig law a), covered ±120 (robin
// law b). Views: approach18 (plaza-spoke ENE reader, flank-front
// oblique), flank18 (true profile — the two-tone band contract view),
// near5, side3 (close profile), night. Aimed probes: sentinel face
// (bill/stripe/crest from the facing direction), prober head (deep-reach
// read). MOTION PAIRS at approach18 + near5, t=8 vs 8.6 — REAL closed
// forms (bob sin + pendulum rotatePartAtPivot verbatim).
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const storkBytes = readFileSync("agents/arthur/assets/village_fauna61_stork.glb");
const SHA = "ff10aad02365d6ab74bed6ca38b8717ac3922ab162568a793a7a806f601c4eb5";
if (createHash("sha256").update(storkBytes).digest("hex") !== SHA) throw new Error("stork bytes drift");
const raceBytes = readFileSync("agents/arthur/assets/village_millrace3.glb");
const wellBytes = readFileSync("agents/arthur/assets/village_screwwell3.glb");
const kfishBytes = readFileSync("agents/arthur/assets/village_dress_kfish1.glb");
const outDir = resolve("agents/arthur/reviews/fauna61-stork");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");

const SEAT = [-74.777, -0.01219, 4.478];
const rel = (wx: number, wy: number, wz: number): [number, number, number] =>
  [wx - SEAT[0], wy - SEAT[1], wz - SEAT[2]];

// the exact comp payloads the placer sends (mirrored in fauna61-place-stork.ts)
const T0 = 1;
const COMPS = [
  { part: "stork_a", m: { type: "bob", axis: [0, 1, 0], amp: 0.005, period: 5.2, phase: 0.0, t0: T0 } },
  { part: "stork_a_neck", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.06, period: 7.5, phase: 1.3, t0: T0 } },
  { part: "stork_a_head", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.30, period: 9.0, phase: 2.6, t0: T0 } },
  { part: "stork_b", m: { type: "bob", axis: [0, 1, 0], amp: 0.004, period: 4.6, phase: 0.7, t0: T0 } },
  { part: "stork_b_neck", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.13, period: 3.2, phase: 1.9, t0: T0 } },
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
const camera=new THREE.PerspectiveCamera(42,960/720,0.05,400);
const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2.0); scene.add(hemi);
const ambient=new THREE.AmbientLight(0xffffff,0.45); scene.add(ambient);
// sun ENE-high — from the READER's side (the approach18/flank18 cameras
// stand ENE; the heron rig's WSW sun would back-light this seat's reader
// flank — fauna-11 law b; v1's shade-side flank rendered the white bodies
// at ~0.6x albedo and the pair vanished at 18m)
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(8,12,10); sun.castShadow=true; scene.add(sun);
const fill=new THREE.DirectionalLight(0xffffff,1.0); fill.position.set(-6,4,-8); scene.add(fill);
const gmat=new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:1,metalness:0});
const gplane=new THREE.Mesh(new THREE.PlaneGeometry(300,300),gmat); gplane.rotation.x=-Math.PI/2; gplane.position.y=-0.002; gplane.receiveShadow=true; scene.add(gplane);
const loader=new GLTFLoader();
const load=async(url)=>{ const gltf=await loader.loadAsync(url); const root=gltf.scene; scene.add(root);
  root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}}); root.updateMatrixWorld(true); return root; };
const RACE=await load('/race.glb'); RACE.position.set(...${JSON.stringify(rel(-76.707, -0.0256, 6.711))}); RACE.rotation.y=1.7516;
const WELL=await load('/well.glb'); WELL.position.set(...${JSON.stringify(rel(-88, 0.017, 0))}); WELL.rotation.y=3.142;
const KFISH=await load('/kfish.glb'); KFISH.position.set(...${JSON.stringify(rel(-70.05, -0.0222, 4.48))}); KFISH.rotation.y=4.893;
const STORK=await load('/stork.glb'); STORK.rotation.y=Math.PI/2;
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts={};
for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(STORK,c.part);
  if(p) parts[c.part]={p, base:{pos:p.position.toArray(), quat:p.quaternion.toArray()}, m:c.m}; }
window.stats={storkParts:Object.keys(parts).length};
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
// aimed probe: camera at head + worldDir(dist), looking at the head
window.aimFrom=(name,dist,h,ang)=>{ const pt=parts[name]; if(!pt) return false;
  pt.p.updateMatrixWorld(true); const wp=new THREE.Vector3(); pt.p.getWorldPosition(wp);
  const dx=Math.cos(ang), dz=Math.sin(ang);
  camera.position.set(wp.x+dx*dist,wp.y+(h??0),wp.z+dz*dist); camera.lookAt(wp); renderer.render(scene,camera); return wp.toArray(); };
window.setView=(name)=>{ const views={
  approach18:[18,1.65,0],          // 18m TRUE plaza-spoke reader: due EAST of the seat (rig +x) — true profile
  flank18:[0,1.65,-18],            // 18m from the N (the birds' facing) — rear-quarter/spread view
  near5:[5,1.6,0],                 // 5m encounter on the approach line (profile)
  side3:[0.2,0.85,-3.2],           // 3m close profile from the N-facing side
  night:[18,1.65,0] };
  const tgt={approach18:[0,0.75,0],flank18:[0,0.75,0],near5:[0,0.7,0],side3:[0,0.8,0],night:[0,0.75,0]}[name];  camera.position.fromArray(views[name]); camera.lookAt(...tgt); renderer.render(scene,camera); };
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
window.setView('approach18'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/stork.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(storkBytes); }
    if (url === "/race.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(raceBytes); }
    if (url === "/well.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(wellBytes); }
    if (url === "/kfish.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(kfishBytes); }
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
if (stats.storkParts !== 5) throw new Error(`expected 5 stork parts, got ${stats.storkParts}`);

const grab = async (name: string) => {
  const dataUrl: string = await page.evaluate(() => (window as any).snap());
  writeFileSync(resolve(outDir, name), Buffer.from(dataUrl.split(",")[1], "base64"));
};
await page.evaluate(() => (window as any).setPhase(8.0));
await page.evaluate(() => (window as any).setNight(false));
const counts: any = {};
for (const v of ["approach18", "flank18", "near5", "side3", "night"]) {
  if (v === "night") { await page.evaluate(() => (window as any).setNight(true)); }
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  counts[v] = await page.evaluate(() => (window as any).colorCount());
  await grab(`v1-${v}.png`);
}
await page.evaluate(() => (window as any).setNight(false));
// aimed probes — sentinel face from its facing dir (entity +x world = angle atan2(0.178? dx=cos… entity +x world dir = (cos 3.3224, −sin 3.3224) = (−0.984, +0.178) → rig angle atan2(dz,dx)=atan2(0.178,−0.984)=2.962
const hpA: any = await page.evaluate(() => (window as any).aimFrom("stork_a_head", 1.5, 0.0, -Math.PI/2));
await page.waitForTimeout(60);
await grab("v1-sentinelface.png"); counts.sentinelface = await page.evaluate(() => (window as any).colorCount());
console.log("aimed sentinel head at rig", JSON.stringify(hpA.map((v: number) => +v.toFixed(2))));
// prober head: rides the neck pendulum (hierarchy — not separately
// comp'd); aim at the neck anchor from the same facing dir
const hpB: any = await page.evaluate(() => (window as any).aimFrom("stork_b_neck", 1.5, 0.3, -Math.PI/2));
await page.waitForTimeout(60);
await grab("v1-proberface.png"); counts.proberface = await page.evaluate(() => (window as any).colorCount());
console.log("aimed prober head at rig", JSON.stringify(hpB.map((v: number) => +v.toFixed(2))));
console.log("unique colors:", JSON.stringify(counts));
// motion pairs
for (const framing of ["approach18", "near5"]) {
  await page.evaluate((s: any) => (window as any).setView(s), framing);
  await page.evaluate((t: any) => (window as any).setPhase(t), 8.0);
  await grab(`v1-motion-${framing}-a.png`);
  const fa: any = await page.evaluate(() => (window as any).frame());
  await page.evaluate((t: any) => (window as any).setPhase(t), 8.6);
  await grab(`v1-motion-${framing}-b.png`);
  const fb: any = await page.evaluate(() => (window as any).frame());
  const diff = await page.evaluate(([a, b]: any) => (window as any).frameDiff(a, b), [fa, fb] as any);
  const rows: any = await page.evaluate(() => (window as any).lastDiffRows);
  const band = rows.length ? `${Math.min(...rows)}-${Math.max(...rows)} (of 720)` : "none";
  console.log(`motion pair ${framing}: ${diff} px differ, row band ${band}`);
}
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close();
server.close();
console.log(`wrote fauna61 stork renders -> ${outDir}`);