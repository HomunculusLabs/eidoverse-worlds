// fauna71-render-vole.ts — review renders for the fauna-71 field vole.
// Chassis: fauna45-render-hmou.ts (module-scope render law). TWO scenes:
// LONE (vole recentred — identity/anatomy judging) and KESTREL COMPOSITE
// (world-frame): the kestrel entity GLB (village_fauna65_kestrel.glb,
// sha16 941d1db7… == live lib prefix) at its live tuple (57.5,-0.05137,-24)
// yaw -2.4 — its baked anchor already carries the bird at 6m over the post
// — plus the vole at the swept seat (53.75,-0.04276,-25.5) yaw -2.563.
// Ground = meadow #4a5d33 (robin rig law). Reader vantages derive from
// the plaza spoke (fauna-40 law f): 18m point = seat + 18·U, U pointing
// AT the plaza (38.68,-15.65); discover stop 2.6m (51.57,-24.08).
// Motion pairs at comp_near driven by the REAL client closed forms —
// motioneval.js pendulumTheta for head/snout, evalPart bob VERBATIM
// from client/lib/motion.js for the breathing.
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const voleBytes = readFileSync("agents/arthur/assets/village_dress_vole1.glb");
const voleSha = createHash("sha256").update(voleBytes).digest("hex");
if (voleSha !== "f27037673949833b4f240288e072f72410c8fb8a2fb1460607fefabd7e65772c") throw new Error(`vole bytes drift ${voleSha}`);
const kestrelBytes = readFileSync("agents/arthur/assets/village_fauna65_kestrel.glb");
const kestrelSha = createHash("sha256").update(kestrelBytes).digest("hex");
if (kestrelSha.slice(0, 16) !== "941d1db792e25010") throw new Error(`kestrel bytes drift ${kestrelSha.slice(0, 16)}`);
const outDir = resolve("agents/arthur/reviews/fauna71-vole");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const ME = readFileSync("client/lib/motioneval.js", "utf8"); // unmodified evaluator

// the exact comp payloads the placer sends (mirrored in fauna71-place-vole.ts)
const COMPS = [
  { part: "vole", m: { type: "bob", amp: 0.004, period: 3.4, phase: 0.0, t0: 1 } },
  { part: "vole_head", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.22, period: 8.5, phase: 0.4, t0: 1 } },
  { part: "vole_snout", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.15, period: 2.4, phase: 1.0, t0: 1 } },
];

// seat + vantage arithmetic (plaza spoke, fauna-40 law f)
const SEAT = { x: 53.75, y: -0.04276, z: -25.5, yaw: -1.863 }; // r9 oblique re-seat
const U = { x: -0.837, z: 0.547 }; // unit seat->plaza
const V18 = { x: SEAT.x + 18 * U.x, z: SEAT.z + 18 * U.z }; // (38.68,-15.65)
const V26 = { x: SEAT.x + 2.6 * U.x, z: SEAT.z + 2.6 * U.z }; // (51.57,-24.08)

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
// sun.target at the SCENE SUBJECT (fauna-65 law b — a fill/sun aimed at world
// origin mislights an offset seat): aim at the vole seat
sun.target.position.set(${SEAT.x},0,${SEAT.z}); scene.add(sun.target);
const fill=new THREE.DirectionalLight(0xffffff,0); fill.position.set(${SEAT.x - 10},4,${SEAT.z + 10}); scene.add(fill);
fill.target.position.set(${SEAT.x},0,${SEAT.z}); scene.add(fill.target);
window.setFill=(on)=>{fill.intensity=on?1.4:0;};
const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:1})); ground.rotation.x=-Math.PI/2; ground.position.set(${SEAT.x},0,${SEAT.z}); ground.receiveShadow=true; scene.add(ground);
const loader=new GLTFLoader(); const shade=(root)=>root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
// LONE: vole recentred on the ground (identity judging)
const lone=(await loader.loadAsync('/model-vole.glb')).scene; scene.add(lone);
lone.updateMatrixWorld(true);
{ const bb=new THREE.Box3().setFromObject(lone);
  const c=bb.getCenter(new THREE.Vector3());
  lone.position.x-=c.x; lone.position.z-=c.z; lone.position.y-=bb.min.y; }
shade(lone); lone.updateMatrixWorld(true);
// KESTREL COMPOSITE: world-frame, live tuples (y quashed to grade)
const kestr=(await loader.loadAsync('/model-kestrel.glb')).scene; kestr.position.set(57.5,-0.05137,-24); kestr.rotation.y=-2.4; kestr.visible=false; scene.add(kestr); shade(kestr);
const compVole=(await loader.loadAsync('/model-vole.glb')).scene; compVole.position.set(${SEAT.x},${SEAT.y},${SEAT.z}); compVole.rotation.y=${SEAT.yaw}; compVole.visible=false; scene.add(compVole); shade(compVole);
const LONE_ON=()=>{lone.visible=true;kestr.visible=false;compVole.visible=false;};
const COMP_ON=()=>{lone.visible=false;kestr.visible=true;compVole.visible=true;};
// bind part bases on the COMPOSITE vole (the placement read drives motion)
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts={};
for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(compVole,c.part);
  if(p) parts[c.part]={p, base:{pos:p.position.toArray(), quat:p.quaternion.toArray(), rot:p.rotation.toArray()}, m:c.m}; }
// DYNAMIC HEAD AIM (r7, fauna-44 law a): the LONE recentre shifts on the
// FULL bbox (the run spans -0.6m) — face cameras aim at the HEAD's actual
// world position, never authored coords
lone.updateMatrixWorld(true);
const HEAD_LONE = findPart(lone,'vole_head').getWorldPosition(new THREE.Vector3());
compVole.updateMatrixWorld(true);
const HEAD_COMP = findPart(compVole,'vole_head').getWorldPosition(new THREE.Vector3());
window.stats={voleNodes:(await loader.loadAsync('/model-vole.glb')).scene.children.length};
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
  camera.fov=42; camera.updateProjectionMatrix(); // scope views narrow it; reset every call
  const views={
    lone_gameplay:()=>{LONE_ON();camera.position.set(0,1.65,18);camera.lookAt(0,0.05,0);},
    lone_near:()=>{LONE_ON();camera.position.set(0,0.35,1.6);camera.lookAt(-0.05,0.07,0);},
    lone_profile:()=>{LONE_ON();camera.position.set(-0.05,0.18,0.42);camera.lookAt(-0.03,0.06,0);},
    lone_face:()=>{LONE_ON();camera.position.set(HEAD_LONE.x + 0.22, 0.08, HEAD_LONE.z - 0.02);camera.lookAt(HEAD_LONE.x, HEAD_LONE.y, HEAD_LONE.z);},
    // KESTREL COMPOSITE — cameras derive from the plaza spoke (fauna-40 law f)
    // 18m reader: vole frame-center-low, the hovering kestrel upper-right
    comp_gameplay:()=>{COMP_ON();camera.position.set(${V18.x},1.65,${V18.z});camera.lookAt(${SEAT.x},0.6,${SEAT.z});},
    // spotting scope: SAME camera, narrow FOV — falsifies absent-vs-small
    comp_scope:()=>{COMP_ON();camera.fov=8;camera.position.set(${V18.x},1.65,${V18.z});camera.lookAt(${SEAT.x},0.05,${SEAT.z});camera.updateProjectionMatrix();},
    // the kestrel-eye scope: the composition the proposal promised — prey in
    // the grass beneath the hovering predator. r9 STAGING FIX: the v1 camera
    // at (57.5,6.4,-23.6) sat INSIDE the wander ring — the bird itself
    // filled frame as a "giant garbled blob" (judge r8's honest read of a
    // 49cm bird at 0.5m lens distance). Offset 2m SW of the hover: the bird
    // reads at honest scale upper-frame, the vole centers low.
    comp_hunter:()=>{COMP_ON();camera.fov=42;camera.position.set(55.8,5.4,-22.7);camera.lookAt(${SEAT.x},0,${SEAT.z});camera.updateProjectionMatrix();},
    // discover stop 2.6m on the spoke: the vole facing its reader
    comp_near:()=>{COMP_ON();camera.position.set(${V26.x},0.42,${V26.z});camera.lookAt(${SEAT.x - 0.05},0.06,${SEAT.z});},
    comp_face:()=>{COMP_ON();camera.position.set(HEAD_COMP.x + 0.14, 0.10, HEAD_COMP.z + 0.20);camera.lookAt(HEAD_COMP.x, HEAD_COMP.y, HEAD_COMP.z);},
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
window.coatProbe=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const img=x.getImageData(0,0,c.width,c.height).data;
  let n=0;
  // calibrated to RENDERED truth: chestnut 0x7a5232 albedo under rig light
  // runs ~(122,82,50)..(180,130,90); meadow (99,116,66) is g-dominant —
  // the vole's r>g+10 band separates (robin law d: probe rendered, not albedo)
  for(let i=0;i<img.length;i+=4){ const r=img[i],g=img[i+1],b=img[i+2];
    if(r>100&&r<200&&g>70&&g<150&&b<110&&r>g+10&&g>b+10) n++; }
  return n; }
window.setView('comp_gameplay'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/model-vole.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(voleBytes); }
    if (url === "/model-kestrel.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(kestrelBytes); }
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
if (stats.parts !== 3) throw new Error(`expected 3 parts, got ${stats.parts}`);

const grab = async (name: string) => {
  const dataUrl: string = await page.evaluate(() => (window as any).snap());
  writeFileSync(resolve(outDir, name), Buffer.from(dataUrl.split(",")[1], "base64"));
};
const counts: any = {};
for (const v of ["lone_gameplay", "lone_near", "lone_profile", "lone_face", "comp_gameplay", "comp_scope", "comp_hunter", "comp_near", "comp_face"]) {
  await page.evaluate(() => (window as any).setFill(false));
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  counts[v] = await page.evaluate(() => (window as any).colorCount());
  await grab(`new-${v}.png`);
}
console.log("unique colors:", JSON.stringify(counts));
// fill-lit anatomy probes (fauna-7 law b, disclosed)
for (const v of ["lone_face", "lone_profile", "comp_face"]) {
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.evaluate(() => (window as any).setFill(true));
  await page.waitForTimeout(40);
  await grab(`new-${v}-fill.png`);
  await page.evaluate(() => (window as any).setFill(false));
}
for (const [v, n] of Object.entries(counts)) {
  const floor = (v === "lone_gameplay" || v === "comp_gameplay" || v === "comp_near" || v === "comp_face" || v === "comp_scope") ? 60 : 300;
  if ((n as number) < floor) throw new Error(`view ${v} looks blank (${n} colors)`);
}
// chestnut-coat presence probe at lone_near (mechanical vole-presence proof)
await page.evaluate(() => (window as any).setView("lone_near"));
const coatPx = await page.evaluate(() => (window as any).coatProbe());
console.log("coat presence probe (lone_near chestnut px):", coatPx);
if (coatPx < 40) throw new Error(`vole chestnut coat not present in lone_near (${coatPx} px)`);
// motion pair at the discover framing: t=1.3s vs t=9.7s — all 3 comps
// far from phase coincidence
await page.evaluate(() => (window as any).setView("comp_near"));
await page.evaluate((t: any) => (window as any).setPhase(t), 1.3);
await grab("new-motion-comp_near-a.png");
const fa: any = await page.evaluate(() => (window as any).frame());
await page.evaluate((t: any) => (window as any).setPhase(t), 9.7);
await grab("new-motion-comp_near-b.png");
const fb: any = await page.evaluate(() => (window as any).frame());
const diff = await page.evaluate(([a, b]: any) => (window as any).frameDiff(a, b), [fa, fb] as any);
const rows: any = await page.evaluate(() => (window as any).lastDiffRows);
const band = rows.length ? `${Math.min(...rows)}-${Math.max(...rows)} (of 960)` : "none";
console.log(`motion pair comp_near: ${diff} px differ, x band ${band}`);
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close();
server.close();
console.log(`wrote fauna71 vole renders -> ${outDir}`);
