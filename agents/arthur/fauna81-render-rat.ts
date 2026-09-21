// fauna81-render-rat.ts — review renders for the fauna-81 brown rat.
// Chassis: fauna71-render-vole.ts (module-scope render law). TWO scenes:
// LONE (rat recentred — identity/anatomy judging, DYNAMIC HEAD AIM,
// fauna-77 law a) and YARD COMPOSITE (world-frame): the coop GLB
// (village_coop3.glb sha16 f5d40394 == live lib prefix, hard-gated) at
// its live tuple (37.5,0,-6.5) yaw -1.8 + the watch-cat GLB
// (village_dress_bcat1.glb sha16 0030ce54 == live lib, hard-gated) at
// (40.7,-0.038,-7.5) yaw 3.216 + the rat at the swept seat
// (38.7,-0.0395,-6.25) yaw -2.35. Ground = meadow #4a5d33 (robin rig
// law). Vantages: the yard-loop discover stop 2.6m E (the honest
// encounter), the cat's-eye view 4m SE (the mouser's-quarry story), the
// plaza-bearing 18m (composition; occlusion-checked by the render
// itself — swan law f). Motion pairs driven by the REAL client closed
// forms — motioneval.js pendulumTheta + evalPart bob VERBATIM.
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const ratBytes = readFileSync("agents/arthur/assets/village_dress_rat1.glb");
const ratSha = createHash("sha256").update(ratBytes).digest("hex");
if (ratSha !== "9b1cb0d657c42d3fd90c398c8506eb68153569ae70875a803248ec361cf3c641") throw new Error(`rat bytes drift ${ratSha}`);
const coopBytes = readFileSync("agents/arthur/assets/village_coop3.glb");
const coopSha = createHash("sha256").update(coopBytes).digest("hex");
if (coopSha.slice(0, 16) !== "f5d4039489c1ce4b") throw new Error(`coop bytes drift ${coopSha.slice(0, 16)}`);
const catBytes = readFileSync("agents/arthur/assets/village_dress_bcat1.glb");
const catSha = createHash("sha256").update(catBytes).digest("hex");
if (catSha.slice(0, 16) !== "0030ce54d92e6785") throw new Error(`cat bytes drift ${catSha.slice(0, 16)}`);
const outDir = resolve("agents/arthur/reviews/fauna81-rat");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const ME = readFileSync("client/lib/motioneval.js", "utf8"); // unmodified evaluator

// the exact comp payloads the placer sends (mirrored in fauna81-place-rat.ts)
const COMPS = [
  { part: "rat", m: { type: "bob", amp: 0.004, period: 3.6, phase: 0.0, t0: 1 } },
  { part: "rat_head", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.24, period: 7.0, phase: 0.4, t0: 1 } },
  { part: "rat_snout", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.15, period: 2.4, phase: 1.0, t0: 1 } },
];

// seat + vantage arithmetic
const SEAT = { x: 38.95, y: -0.03909, z: -6.5, yaw: -2.35 };
// yard-loop discover bearing (E toward the cat pocket): unit (0.931,0.364)
const V26 = { x: SEAT.x + 2.6 * 0.931, z: SEAT.z + 2.6 * 0.364 }; // (41.12,-5.30)
// cat's-eye story view: stand AT the cat, look W at the rat
const VCAT = { x: 41.6, z: -5.7 };
// plaza bearing (U = seat->plaza unit (-0.987,0.161))
const V18 = { x: SEAT.x - 18 * 0.987, z: SEAT.z + 18 * 0.161 }; // (20.94,-3.35)

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
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(${SEAT.x + 10},12,${SEAT.z + 6}); sun.castShadow=true; scene.add(sun);
// r4 SUN LAW (fauna-61 law b): the sun sits on the READER side (ESE) — the
// v3 west sun put the coop's cast shadow exactly over the rat and the
// judge read a shadow-fabricated "black cutout"; east sun lights the
// discover/encounter flank and drops the coop's shadow WNW, away from it
// sun.target at the SCENE SUBJECT (fauna-65 law b)
sun.target.position.set(${SEAT.x},0,${SEAT.z}); scene.add(sun.target);
const fill=new THREE.DirectionalLight(0xffffff,0); fill.position.set(${SEAT.x + 10},4,${SEAT.z - 10}); scene.add(fill);
fill.target.position.set(${SEAT.x},0,${SEAT.z}); scene.add(fill.target);
window.setFill=(on)=>{fill.intensity=on?1.4:0;};
const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:1})); ground.rotation.x=-Math.PI/2; ground.position.set(${SEAT.x},${SEAT.y},${SEAT.z}); ground.receiveShadow=true; scene.add(ground);
// r3 RIG LAW (judge r1 decomposition): the composite ground must sit at
// the SEAT'S live terrain height — a y=0 plane under a negative-PY seat
// buries the animal's lower body, lane, pile and contact shadow under
// opaque meadow, and the judge reads a half-buried black sludge (the
// "pure black smudge / no lane / no pile" cluster was 100% this)
const loader=new GLTFLoader(); const shade=(root)=>root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
// LONE: rat recentred on the ground (identity judging)
const lone=(await loader.loadAsync('/model-rat.glb')).scene; scene.add(lone);
lone.updateMatrixWorld(true);
{ const bb=new THREE.Box3().setFromObject(lone);
  const c=bb.getCenter(new THREE.Vector3());
  lone.position.x-=c.x; lone.position.z-=c.z; lone.position.y-=bb.min.y; }
shade(lone); lone.updateMatrixWorld(true);
// YARD COMPOSITE: world-frame, live tuples (y quashed to grade for the
// furniture hosts; the rat carries its live PY)
const coop=(await loader.loadAsync('/model-coop.glb')).scene; coop.position.set(37.5,0,-6.5); coop.rotation.y=-1.8; coop.visible=false; scene.add(coop); shade(coop);
const bcat=(await loader.loadAsync('/model-cat.glb')).scene; bcat.position.set(40.7,-0.038,-7.5); bcat.rotation.y=3.216; bcat.visible=false; scene.add(bcat); shade(bcat);
const compRat=(await loader.loadAsync('/model-rat.glb')).scene; compRat.position.set(${SEAT.x},${SEAT.y},${SEAT.z}); compRat.rotation.y=${SEAT.yaw}; compRat.visible=false; scene.add(compRat); shade(compRat);
const LONE_ON=()=>{lone.visible=true;coop.visible=false;bcat.visible=false;compRat.visible=false;};
const COMP_ON=()=>{lone.visible=false;coop.visible=true;bcat.visible=true;compRat.visible=true;};
// bind part bases on the COMPOSITE rat (the placement read drives motion)
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts={};
for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(compRat,c.part);
  if(p) parts[c.part]={p, base:{pos:p.position.toArray(), quat:p.quaternion.toArray(), rot:p.rotation.toArray()}, m:c.m}; }
// DYNAMIC HEAD AIM (fauna-77 law a): face cameras aim at the HEAD node's
// live world position, never authored coords
lone.updateMatrixWorld(true);
const HEAD_LONE = findPart(lone,'rat_head').getWorldPosition(new THREE.Vector3());
compRat.updateMatrixWorld(true);
const HEAD_COMP = findPart(compRat,'rat_head').getWorldPosition(new THREE.Vector3());
window.stats={ratNodes:(await loader.loadAsync('/model-rat.glb')).scene.children.length};
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
    lone_near:()=>{LONE_ON();camera.position.set(0,0.30,1.3);camera.lookAt(-0.02,0.05,0);},
    lone_profile:()=>{LONE_ON();camera.position.set(-0.02,0.14,0.55);camera.lookAt(-0.02,0.05,0);},
    lone_face:()=>{LONE_ON();camera.position.set(HEAD_LONE.x + 0.20, 0.09, HEAD_LONE.z + 0.05);camera.lookAt(HEAD_LONE.x, HEAD_LONE.y, HEAD_LONE.z);},
    // YARD COMPOSITE — the rat at its wall-run, coop behind, cat in story
    comp_gameplay:()=>{COMP_ON();camera.position.set(${V18.x},1.65,${V18.z});camera.lookAt(${SEAT.x},0.4,${SEAT.z});},
    comp_scope:()=>{COMP_ON();camera.fov=8;camera.position.set(${V18.x},1.65,${V18.z});camera.lookAt(${SEAT.x},0.03,${SEAT.z});camera.updateProjectionMatrix();},
    // the cat's-eye story view: the mouser 4m from its quarry
    comp_cat:()=>{COMP_ON();camera.position.set(${VCAT.x},0.45,${VCAT.z});camera.lookAt(${SEAT.x},0.05,${SEAT.z});},
    // the yard-loop discover stop 2.6m E
    comp_near:()=>{COMP_ON();camera.position.set(${V26.x},0.35,${V26.z});camera.lookAt(${SEAT.x - 0.05},0.05,${SEAT.z});},
    comp_face:()=>{COMP_ON();camera.position.set(HEAD_COMP.x + 0.26, 0.10, HEAD_COMP.z + 0.13);camera.lookAt(HEAD_COMP.x, HEAD_COMP.y, HEAD_COMP.z);},
    comp_profile:()=>{COMP_ON();camera.position.set(${SEAT.x + 0.35},0.12,${SEAT.z + 0.62});camera.lookAt(${SEAT.x},0.04,${SEAT.z});},
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
  // rat coat 0x6b5d4d albedo under rig light runs ~(86,74,62)..(140,125,105);
  // grey-brown r>g>b ladder; meadow (99,116,66) is g-dominant (robin law d)
  for(let i=0;i<img.length;i+=4){ const r=img[i],g=img[i+1],b=img[i+2];
    if(r>70&&r<155&&g>60&&g<135&&b<115&&r>g+6&&g>b+5) n++; }
  return n; }
window.tailProbe=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const img=x.getImageData(0,0,c.width,c.height).data;
  let n=0;
  // flesh 0x9a8676: sun-lit ~(115,100,88), BODY-SHADOWED ~(56..80,40..64,
  // 32..48) — the tail lies low behind the rump and rides body shade from
  // most sun angles (rendered-truth calibration, vole law; the fill-lit
  // probes carry the sun-lit proof); region-bound to the REAR half (left
  // 45%) so the ear discs and pink paws don't carry the count
  for(let yy=0;yy<c.height;yy++)for(let xx=0;xx<c.width*0.45;xx++){
    const i=(yy*c.width+xx)*4; const r=img[i],g=img[i+1],b=img[i+2];
    if(r>50&&r<210&&g>40&&g<185&&b>30&&b<165&&r>g+6&&g>b+4) n++; }
  return n; }
window.setView('comp_gameplay'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/model-rat.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(ratBytes); }
    if (url === "/model-coop.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(coopBytes); }
    if (url === "/model-cat.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(catBytes); }
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
for (const v of ["lone_gameplay", "lone_near", "lone_profile", "lone_face", "comp_gameplay", "comp_scope", "comp_cat", "comp_near", "comp_face", "comp_profile"]) {
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
  const floor = 60;
  if ((n as number) < floor) throw new Error(`view ${v} looks blank (${n} colors)`);
}
// coat + tail presence probes at lone_near (mechanical rat-presence proof)
await page.evaluate(() => (window as any).setView("lone_near"));
const coatPx = await page.evaluate(() => (window as any).coatProbe());
console.log("coat presence probe (lone_near grey-brown px):", coatPx);
if (coatPx < 40) throw new Error(`rat coat not present in lone_near (${coatPx} px)`);
const tailPx = await page.evaluate(() => (window as any).tailProbe());
console.log("tail presence probe (lone_near flesh px):", tailPx);
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
console.log(`wrote fauna81 rat renders -> ${outDir}`);
