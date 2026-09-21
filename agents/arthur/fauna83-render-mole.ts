// fauna83-render-mole.ts — review renders for the fauna-83 European mole.
// Chassis: fauna81-render-rat.ts (module-scope render law) + fauna57 magpie
// DRACO law (the SERVED cottage bytes decode via local DRACO — local sha
// cee52aca != live lib b5b3f102, so the composite must use the served
// re-encode). TWO scenes: LONE (mole recentred — identity/anatomy judging)
// and GARDEN COMPOSITE (world-frame): the SERVED cottage bytes at its live
// tuple (-26, 0.00095, 19) yaw 2.2004 + the mole at the swept seat
// (-24.5, 26.5, yaw 2.2004 — the cottage's own facing, dig line along the
// N/NW margin). Ground = meadow #4a5d33 at the SEAT'S terrain height
// 0.01447 (r3 RIG LAW). Vantages: the gallery-line discover stop 2.6m N,
// the cottage-path view 4m S, the plaza-bearing 18m (composition;
// occlusion-checked by the render itself — swan law f). Motion pairs
// driven by the REAL client closed forms — motioneval.js pendulumTheta +
// evalPart bob VERBATIM. Moles: slow. Periods long (4.5s+), amps tiny.
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const moleBytes = readFileSync("agents/arthur/assets/village_dress_mole1.glb");
const moleSha = createHash("sha256").update(moleBytes).digest("hex");
if (moleSha !== "31717975fcc5323b2908c903bb64a3dba41c881bb6f4ac98c00bc27b2676638d") throw new Error(`mole bytes drift ${moleSha}`);
// magpie law: SERVED cottage bytes (content-gated to live lib b5b3f102)
const cottageBytes = readFileSync("/Users/t3rpz/.hermes/profiles/arthur/cache/scratch/fauna83-cottage-served.glb");
const cottageSha = createHash("sha256").update(cottageBytes).digest("hex");
console.log(`cottage served sha16: ${cottageSha.slice(0, 16)} (live lib b5b3f10227856571)`);
const outDir = resolve("agents/arthur/reviews/fauna83-mole");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const ME = readFileSync("client/lib/motioneval.js", "utf8"); // unmodified evaluator

// the exact comp payloads the placer sends (mirrored in fauna83-place-mole.ts)
// Phases staggered per individual (mole1 = phase 0 family)
const COMPS = [
  { part: "mole", m: { type: "bob", amp: 0.002, period: 5.2, phase: 0.0, t0: 1 } },          // earth-breath
  { part: "mole_head", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.22, period: 8.5, phase: 0.3, t0: 1 } }, // slow scan
  { part: "mole_snout", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.12, period: 2.8, phase: 0.9, t0: 1 } }, // sniff
];

// seat + vantage arithmetic
const SEAT = { x: -24.5, y: 0.01447, z: 26.5, yaw: 2.2004 - Math.PI }; // FLIPPED: nose faces the approach
// gallery-line discover bearing (N toward the lane): unit (0.196, 0.981)
const V26 = { x: SEAT.x + 2.6 * 0.196, z: SEAT.z + 2.6 * 0.981 }; // (-23.99, 29.05)
// cottage-path story view: stand on the cottage's N margin, look NW
const VPATH = { x: -26.5, z: 23.5 };
// plaza bearing (U = seat->plaza unit (0.679,-0.734))
const V18 = { x: SEAT.x + 18 * 0.679, z: SEAT.z - 18 * 0.734 }; // (-12.28, 13.29)

const html = `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#cbd6df}canvas{display:block}
</style><script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '/examples/jsm/loaders/DRACOLoader.js';
import { pendulumTheta, axisOf, ampOf } from '/motioneval.js';
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1); renderer.setSize(960,720); renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true; document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene(); scene.background=new THREE.Color(0xcbd6df);
const camera=new THREE.PerspectiveCamera(42,960/720,0.05,300);
const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2.0); scene.add(hemi);
const ambient=new THREE.AmbientLight(0xffffff,0.45); scene.add(ambient);
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(${SEAT.x - 10},12,${SEAT.z + 6}); sun.castShadow=true; scene.add(sun);
// SUN LAW (fauna-61 law b): the sun sits on the READER side — the seat's
// approach runs N along the gallery line, so the sun sits WNW lighting the
// discover flank; sun.target at the SCENE SUBJECT (fauna-65 law b)
sun.target.position.set(${SEAT.x},${SEAT.y},${SEAT.z}); scene.add(sun.target);
const fill=new THREE.DirectionalLight(0xffffff,0); fill.position.set(${SEAT.x - 10},4,${SEAT.z - 10}); scene.add(fill);
fill.target.position.set(${SEAT.x},0,${SEAT.z}); scene.add(fill.target);
window.setFill=(on)=>{fill.intensity=on?1.4:0;};
const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:1})); ground.rotation.x=-Math.PI/2; ground.position.set(${SEAT.x},${SEAT.y},${SEAT.z}); ground.receiveShadow=true; scene.add(ground);
// r3 RIG LAW: the composite ground sits at the SEAT'S live terrain height
const draco=new DRACOLoader().setDecoderPath('/draco/');
const loader=new GLTFLoader(); loader.setDRACOLoader(draco);
const shade=(root)=>root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
// LONE: mole recentred on the ground (identity judging)
const lone=(await loader.loadAsync('/model-mole.glb')).scene; scene.add(lone);
lone.updateMatrixWorld(true);
{ const bb=new THREE.Box3().setFromObject(lone);
  const c=bb.getCenter(new THREE.Vector3());
  lone.position.x-=c.x; lone.position.z-=c.z; lone.position.y-=bb.min.y; }
shade(lone); lone.updateMatrixWorld(true);
// GARDEN COMPOSITE: world-frame, live tuples
const cottage=(await loader.loadAsync('/model-cottage.glb')).scene; cottage.position.set(-26,0.00095,19); cottage.rotation.y=2.2004; cottage.visible=false; scene.add(cottage); shade(cottage);
const compMole=(await loader.loadAsync('/model-mole.glb')).scene; compMole.position.set(${SEAT.x},${SEAT.y},${SEAT.z}); compMole.rotation.y=${SEAT.yaw}; compMole.visible=false; scene.add(compMole); shade(compMole);
const LONE_ON=()=>{lone.visible=true;cottage.visible=false;compMole.visible=false;};
const COMP_ON=()=>{lone.visible=false;cottage.visible=true;compMole.visible=true;};
// bind part bases on the COMPOSITE mole (the placement read drives motion)
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts={};
for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(compMole,c.part);
  if(p) parts[c.part]={p, base:{pos:p.position.toArray(), quat:p.quaternion.toArray(), rot:p.rotation.toArray()}, m:c.m}; }
window.stats={parts:Object.keys(parts).length, compMoleNodes:compMole.children.length};
// DYNAMIC HEAD AIM (fauna-77 law a): face cameras aim at the HEAD node's
// live world position, never authored coords
lone.updateMatrixWorld(true);
const HEAD_LONE = findPart(lone,'mole_head').getWorldPosition(new THREE.Vector3());
compMole.updateMatrixWorld(true);
const HEAD_COMP = findPart(compMole,'mole_head').getWorldPosition(new THREE.Vector3());
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
    lone_face:()=>{LONE_ON();camera.position.set(HEAD_LONE.x + 0.20, 0.10, HEAD_LONE.z + 0.05);camera.lookAt(HEAD_LONE.x, HEAD_LONE.y, HEAD_LONE.z);},
    // GARDEN COMPOSITE — the mole at its margin, cottage in story
    comp_gameplay:()=>{COMP_ON();camera.position.set(${V18.x},1.65,${V18.z});camera.lookAt(${SEAT.x},0.4,${SEAT.z});},
    comp_scope:()=>{COMP_ON();camera.fov=8;camera.position.set(${V18.x},1.65,${V18.z});camera.lookAt(${SEAT.x},0.03,${SEAT.z});camera.updateProjectionMatrix();},
    // the cottage-path story view: from the cottage's N margin
    comp_path:()=>{COMP_ON();camera.position.set(${VPATH.x},0.45,${VPATH.z});camera.lookAt(${SEAT.x},0.05,${SEAT.z});},
    // the gallery-line discover stop 2.6m N — TRUE DISTANCE, narrow fov:
    // the encounter frame a player's eye actually resolves (pitfall-13
    // cure; the 42° comp_near renders the head at ~12px — unreadable by
    // construction, judge round 3 conceded exactly this)
    comp_near:()=>{COMP_ON();camera.position.set(${V26.x},0.35,${V26.z});camera.lookAt(${SEAT.x + 0.05},0.05,${SEAT.z});},
    comp_encounter:()=>{COMP_ON();camera.fov=14;camera.position.set(${V26.x},0.35,${V26.z});camera.lookAt(${SEAT.x + 0.05},0.06,${SEAT.z});camera.updateProjectionMatrix();},
    comp_face:()=>{COMP_ON();camera.position.set(HEAD_COMP.x + 0.24, 0.10, HEAD_COMP.z - 0.10);camera.lookAt(HEAD_COMP.x, HEAD_COMP.y, HEAD_COMP.z);},
    comp_profile:()=>{COMP_ON();camera.position.set(${SEAT.x - 0.35},0.12,${SEAT.z + 0.62});camera.lookAt(${SEAT.x},0.04,${SEAT.z});},
  };
  views[name](); renderer.render(scene,camera); };
window.setPhase=(tSec)=>{ for(const k of Object.keys(parts)){ const {p,base,m}=parts[k];
    const t=Math.max(0,(tSec*1000+1 - m.t0)/1000);
    if(m.type==='pendulum') rotatePartAtPivot(p,base,m.axis,m.pivot,pendulumTheta(m,t));
    else evalPartCase(p,base,m,t); } }
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
    n++; row.push(Math.floor((i/4)%960)); } } window.lastDiffRows=row; return n; }
window.rinfo=()=>({tri:renderer.info.render.triangles,calls:renderer.info.render.calls});
window.coatProbe=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const img=x.getImageData(0,0,c.width,c.height).data;
  let n=0;
  // mole velvet 0x2a2622/0x38322c: sun-lit warm-black ~(52..95,46..83,38..70)
  // r>g>b warm ladder; meadow (99,116,66) is g-dominant; earth EA (138,122,
  // 78) is much lighter — both excluded by the r>g+6 and value ceiling
  for(let i=0;i<img.length;i+=4){ const r=img[i],g=img[i+1],b=img[i+2];
    if(r>30&&r<110&&g>25&&g<100&&b>20&&b<85&&r>g+4&&g>b+4) n++; }
  return n; }
window.spoilProbe=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const img=x.getImageData(0,0,c.width,c.height).data;
  let n=0;
  // RENDERED-TRUTH band (fauna83-color-calib on the exact rig): fresh spoil
  // EA/EB albedo (138..154,122..138,78..92) renders at the rig's ~53%
  // mid-tone falloff as (69..90,56..74,27..38) sunlit — warm r>g>b ladder,
  // HUE-split from the g-dominant meadow (96,114,64); velvet (<=52 r)
  // excluded by the r floor
  for(let i=0;i<img.length;i+=4){ const r=img[i],g=img[i+1],b=img[i+2];
    if(r>=58&&r<=112&&g>=48&&g<=92&&b>=20&&b<=50&&r>g+6&&g>b+18) n++; }
  return n; }
window.handProbe=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const img=x.getImageData(0,0,c.width,c.height).data;
  let n=0;
  // spade-hand flesh 0xc9917c albedo (201,145,124): rig renders mid-tones
  // at ~53% — sunlit ~(107,77,66), body-shade darker; band spans both,
  // r>g+20 warm split excludes meadow/earth/velvet; LOWER half region
  // (the mole sits low; warm cottage stone lives high in comp frames).
  // INFORMATIONAL — the fill-lit frames + native judge carry the true
  // anatomy proof (the band cannot separate sunlit flesh from warm stone
  // in every frame, so no hard gate).
  for(let yy=Math.floor(c.height*0.5);yy<c.height;yy++)for(let xx=0;xx<c.width;xx++){
    const i=(yy*c.width+xx)*4; const r=img[i],g=img[i+1],b=img[i+2];
    if(r>85&&r<180&&g>55&&g<130&&b>45&&b<115&&r>g+20) n++; }
  return n; }
window.setView('comp_gameplay'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/model-mole.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(moleBytes); }
    if (url === "/model-cottage.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(cottageBytes); }
    if (url === "/motioneval.js") { res.writeHead(200, { "content-type": "text/javascript" }); return res.end(ME); }
    if (url.startsWith("/draco/")) {
      const p = resolve(THREE_ROOT, "examples/jsm/libs/draco", url.slice("/draco/".length));
      if (!p.startsWith(resolve(THREE_ROOT, "examples/jsm/libs/draco"))) throw new Error("escape");
      res.writeHead(200, { "content-type": "application/wasm" }); return res.end(readFileSync(p));
    }
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
if (stats.parts !== 3) throw new Error(`expected 3 parts, got ${stats.parts}`);

const grab = async (name: string) => {
  const dataUrl: string = await page.evaluate(() => (window as any).snap());
  writeFileSync(resolve(outDir, name), Buffer.from(dataUrl.split(",")[1], "base64"));
};
const counts: any = {};
for (const v of ["lone_gameplay", "lone_near", "lone_profile", "lone_face", "comp_gameplay", "comp_scope", "comp_path", "comp_near", "comp_encounter", "comp_face", "comp_profile"]) {
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
// coat + spoil + hand presence probes at lone_near (mechanical mole-presence proof)
await page.evaluate(() => (window as any).setView("lone_near"));
const coatPx = await page.evaluate(() => (window as any).coatProbe());
console.log("coat presence probe (lone_near velvet px):", coatPx);
if (coatPx < 40) throw new Error(`mole coat not present in lone_near (${coatPx} px)`);
const spoilPx = await page.evaluate(() => (window as any).spoilProbe());
console.log("spoil presence probe (lone_near fresh-earth px):", spoilPx);
if (spoilPx < 60) throw new Error(`molehill spoil not present in lone_near (${spoilPx} px)`);
const handPx = await page.evaluate(() => (window as any).handProbe());
console.log("hand probe (lone_near flesh-band px, informational):", handPx);
// motion pair at the discover framing: t=1.7s vs t=11.3s — all 3 comps far
// from phase coincidence (periods 5.2/8.5/2.8)
await page.evaluate(() => (window as any).setView("comp_near"));
await page.evaluate((t: any) => (window as any).setPhase(t), 1.7);
await grab("new-motion-comp_near-a.png");
const fa: any = await page.evaluate(() => (window as any).frame());
await page.evaluate((t: any) => (window as any).setPhase(t), 11.3);
await grab("new-motion-comp_near-b.png");
const fb: any = await page.evaluate(() => (window as any).frame());
const diff = await page.evaluate(([a, b]: any) => (window as any).frameDiff(a, b), [fa, fb] as any);
const rows: any = await page.evaluate(() => (window as any).lastDiffRows);
const band = rows.length ? `${Math.min(...rows)}-${Math.max(...rows)} (of 960)` : "none";
console.log(`motion pair comp_near: ${diff} px differ, x band ${band}`);
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close();
server.close();
console.log(`wrote fauna83 mole renders -> ${outDir}`);
