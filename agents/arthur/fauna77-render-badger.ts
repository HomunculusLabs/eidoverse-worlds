// fauna77-render-badger.ts — review renders for the fauna-77 European
// badger. Chassis: fauna73-render-hare.ts (module-scope render law).
// TWO scenes: LONE (entity recentred — identity/anatomy judging) and
// SEAT COMPOSITE (world-frame: the sett at the swept seat (47.5,-40.25)
// yaw -2.274, PY -0.02251 — the SE woodland margin; the sett IS the
// habitat, zero host props). Ground = meadow #4a5d33 (robin rig law a).
// Motion pairs at seat_gameplay + seat_near driven by the REAL client
// closed forms — motioneval.js pendulumTheta for head/snout/tail,
// evalPart bob VERBATIM from client/lib/motion.js for the breathing.
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const bytes = readFileSync("agents/arthur/assets/village_dress_badger1.glb");
const sha = createHash("sha256").update(bytes).digest("hex");
if (sha !== "2f62aae90ac7cdd10f32857d108804c1007a085373b1e4dfc3e5633ad24128f5") throw new Error(`bytes drift ${sha}`);
const outDir = resolve("agents/arthur/reviews/fauna77-badger");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const ME = readFileSync("client/lib/motioneval.js", "utf8"); // unmodified evaluator

// the exact comp payloads the placer sends (mirrored in fauna77-place-badger.ts)
const COMPS = [
  { part: "badger", m: { type: "bob", amp: 0.005, period: 5.2, phase: 0.0, t0: 1 } },
  { part: "badger_head", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.26, period: 9.5, phase: 1.1, t0: 1 } },
  { part: "badger_snout", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.16, period: 2.6, phase: 0.7, t0: 1 } },
  { part: "badger_tail", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.10, period: 3.4, phase: 1.5, t0: 1 } },
];

const html = `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#cbd6df}canvas{display:block}
</style><script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
import { pendulumTheta, axisOf, ampOf } from '/motioneval.js';
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1); renderer.setSize(960,720); renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true; document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene(); scene.background=new THREE.Color(0xcbd6df);
const camera=new THREE.PerspectiveCamera(42,960/720,0.05,300);
const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2.0); scene.add(hemi);
const ambient=new THREE.AmbientLight(0xffffff,0.45); scene.add(ambient);
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(8,12,6); sun.castShadow=true; scene.add(sun);
// probe fill (fauna-7 law b): anatomy probes get a camera-side fill so
// materials judge true; gameplay/near placement reads keep world light.
const fill=new THREE.DirectionalLight(0xffffff,0); fill.position.set(-6,4,10); scene.add(fill);
window.setFill=(on)=>{fill.intensity=on?1.4:0; fill.target=camera;};
// meadow ground — the WORLD's ground (robin rig law a: #4a5d33)
const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:1})); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const loader=new GLTFLoader(); const shade=(root)=>root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
// LONE: entity recentred on the ground (identity judging)
const lone=(await loader.loadAsync('/model.glb')).scene; scene.add(lone);
lone.updateMatrixWorld(true);
{ const bb=new THREE.Box3().setFromObject(lone);
  const c=bb.getCenter(new THREE.Vector3());
  lone.position.x-=c.x; lone.position.z-=c.z; lone.position.y-=bb.min.y; }
shade(lone); lone.updateMatrixWorld(true);
// LONE-frame landmarks (v6 decode + recentre shift −0.185x/+0.0195z):
// badger body ~(1.17,0.20,0.12), head ~(1.50,0.25,0.12), nose ~(1.57,0.18),
// tail tip ~(0.57,0.06), hole face +x at (0.33,0.16,0.19), mound center (-0.72,0.17,0.04)
// SEAT COMPOSITE: world-frame, the swept seat tuple
const seat=(await loader.loadAsync('/model.glb')).scene; seat.position.set(47.5,-0.02251,-40.25); seat.rotation.y=-2.274; seat.visible=false; scene.add(seat); shade(seat);
const LONE_ON=()=>{lone.visible=true;seat.visible=false;};
const SEAT_ON=()=>{lone.visible=false;seat.visible=true;};
// v9: DYNAMIC AIM — hand-derived head projections missed 5 rounds straight
// (the judge kept seeing an edge-crop). Aim straight at the head NODE's
// live world position with a fixed offset. Framing class killed for good.
const headNode=(()=>{let f=null;lone.traverse(c=>{if(!f&&c.name==="badger_head")f=c;});return f;})();
function aimHead(dx,dy,dz){
  const hp=new THREE.Vector3(); headNode.getWorldPosition(hp);
  camera.position.set(hp.x+dx,hp.y+dy,hp.z+dz);
  camera.lookAt(hp.x,hp.y-0.02,hp.z);
}
window.stats={nodes:(await loader.loadAsync('/model.glb')).scene.children.length};
// bind part bases on the SEAT model (the placement read drives motion)
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts={};
for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(seat,c.part);
  if(p) parts[c.part]={p, base:{pos:p.position.toArray(), quat:p.quaternion.toArray(), rot:p.rotation.toArray()}, m:c.m}; }
window.stats.parts=Object.keys(parts).length;
const _q=new THREE.Quaternion(), _ax=new THREE.Vector3(), _pv=new THREE.Vector3(), _rp=new THREE.Vector3(), _qb=new THREE.Quaternion();
function rotatePartAtPivot(obj,pbase,axis,pivot,theta){
  _ax.set(...(axis??[0,1,0])).normalize(); _q.setFromAxisAngle(_ax,theta);
  _qb.fromArray(pbase.quat); obj.quaternion.copy(_qb).multiply(_q);
  _pv.set(...(pivot??[0,0,0])); _rp.copy(_pv).applyQuaternion(_q);
  _pv.sub(_rp).applyQuaternion(_qb); obj.position.set(...pbase.pos).add(_pv);
}
function evalPartCase(p, base, m, t){
  if(m.type==='bob'){
    const off=Math.sin((2*Math.PI/(m.period??4))*t+(m.phase??0))*ampOf(m,0.3);
    _ax.set(...axisOf(m,[0,1,0])).normalize();
    p.position.set(...base.pos).addScaledVector(_ax,off); return;
  }
}
window.setView=(name)=>{
  const views={
    // lone: the SETT composition (mound+door+spoil), the door approach,
    // the badger profile (contract view), the striped face
    lone_sett:()=>{LONE_ON();camera.position.set(2.7,1.6,2.3);camera.lookAt(-0.05,0.1,0.02);},
    lone_settdoor:()=>{LONE_ON();camera.position.set(1.15,0.50,0.75);camera.lookAt(0.25,0.15,0.17);},
    lone_profile:()=>{LONE_ON();camera.position.set(1.26,0.34,1.58);camera.lookAt(1.26,0.11,0.10);}, // v10: full-body aim — head-aim cropped the rump
    lone_profilelow:()=>{LONE_ON();camera.position.set(1.26,0.17,1.32);camera.lookAt(1.26,0.09,0.10);},
    lone_face:()=>{LONE_ON();aimHead(0.42,0.18,0.38);},
    // seat composite, world frame; reader approach = the plaza spoke
    // (U=(-0.763,0.647); 18m vantage + 3.2m discover stop)
    seat_gameplay:()=>{SEAT_ON();camera.position.set(33.77,1.65,-28.61);camera.lookAt(47.5,0.05,-40.25);},
    seat_near:()=>{SEAT_ON();camera.position.set(45.06,0.75,-38.18);camera.lookAt(47.4,0.03,-40.2);},
  };
  views[name](); renderer.render(scene,camera); };
window.setPhase=(tSec)=>{ for(const k of Object.keys(parts)){ const {p,base,m}=parts[k];
    const t=Math.max(0,(tSec*1000+1 - m.t0)/1000);
    if(m.type==='pendulum') rotatePartAtPivot(p,base,m.axis,m.pivot,pendulumTheta(m,t));
    else evalPartCase(p,base,m,t); } };
window.snap=()=>{renderer.render(scene,camera); return renderer.domElement.toDataURL('image/png');};
window.colorCount=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const d=x.getImageData(0,0,c.width,c.height).data; const s=new Set();
  for(let i=0;i<d.length;i+=4) s.add((d[i]<<16)|(d[i+1]<<8)|d[i+2]);
  return s.size; }
window.frame=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  return x.getImageData(0,0,c.width,c.height).data.slice(); }
window.frameDiff=(a,b)=>{ if(!a||!b||a.length!==b.length) return -1;
  let n=0; const row=[];
  for(let i=0;i<a.length;i+=4){ if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>18){
    n++; row.push(Math.floor((i/4)%960)); } } window.lastDiffRows=row; return n; };
window.rinfo=()=>({tri:renderer.info.render.triangles,calls:renderer.info.render.calls});
window.setView('seat_gameplay'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/model.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(bytes); }
    if (url === "/motioneval.js") { res.writeHead(200, { "content-type": "text/javascript" }); return res.end(ME); }
    if (url === "/three.module.js") { res.writeHead(200, { "content-type": "text/javascript" }); return res.end(readFileSync(resolve(THREE_ROOT, "build/three.module.js"))); }
    if (url === "/three.core.js") { res.writeHead(200, { "content-type": "text/javascript" }); return res.end(readFileSync(resolve(THREE_ROOT, "build/three.core.js"))); }
    if (url.startsWith("/examples/jsm/")) {
      const p = resolve(THREE_ROOT, url.slice(1));
      if (!p.startsWith(THREE_ROOT)) throw new Error("escape");
      const s = readFileSync(p, "utf8").replaceAll("from 'three'", "from '/three.module.js'").replaceAll('from "three"', 'from "/three.module.js"');
      res.writeHead(200, { "content-type": "text/javascript" });
      res.end(s); return;
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
if (stats.parts !== 4) throw new Error(`expected 4 parts, got ${stats.parts}`);

const grab = async (name: string) => {
  const dataUrl: string = await page.evaluate(() => (window as any).snap());
  writeFileSync(resolve(outDir, name), Buffer.from(dataUrl.split(",")[1], "base64"));
};
const counts: any = {};
for (const v of ["lone_sett", "lone_settdoor", "lone_profile", "lone_profilelow", "lone_face", "seat_gameplay", "seat_near"]) {
  await page.evaluate(() => (window as any).setFill(false));
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  counts[v] = await page.evaluate(() => (window as any).colorCount());
  await grab(`v2-${v}.png`);
}
console.log("unique colors:", JSON.stringify(counts));
// fill-lit anatomy probe (fauna-7 law b, disclosed)
{
  await page.evaluate((s: any) => (window as any).setView(s), "lone_face");
  await page.evaluate(() => (window as any).setFill(true));
  await page.waitForTimeout(40);
  await grab("v2-lone_face-fill.png");
  await page.evaluate(() => (window as any).setFill(false));
}
for (const [v, n] of Object.entries(counts)) {
  if ((n as number) < 300) throw new Error(`view ${v} looks blank (${n} colors)`);
}
// motion pairs at both seat framings: t=4.1s vs t=17.3s — all 4 comps
// far from phase coincidence
for (const framing of ["seat_gameplay", "seat_near"]) {
  await page.evaluate((s: any) => (window as any).setView(s), framing);
  await page.evaluate((t: any) => (window as any).setPhase(t), 4.1);
  await grab(`v2-motion-${framing}-a.png`);
  const fa: any = await page.evaluate(() => (window as any).frame());
  await page.evaluate((t: any) => (window as any).setPhase(t), 17.3);
  await grab(`v2-motion-${framing}-b.png`);
  const fb: any = await page.evaluate(() => (window as any).frame());
  const diff = await page.evaluate(([a, b]: any) => (window as any).frameDiff(a, b), [fa, fb] as any);
  const rows: any = await page.evaluate(() => (window as any).lastDiffRows);
  const band = rows.length ? `${Math.min(...rows)}-${Math.max(...rows)} (of 960)` : "none";
  console.log(`motion pair ${framing}: ${diff} px differ, x band ${band}`);
}
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close();
server.close();
console.log(`wrote fauna77 badger renders -> ${outDir}`);
