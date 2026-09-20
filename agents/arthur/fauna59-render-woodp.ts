// fauna59-render-woodp.ts — review renders for the fauna-59 great
// spotted woodpecker. Chassis: fauna57-render-magpi.ts (module-scope
// render law). TWO scenes: LONE (woodp_a envelope on the ground-plane
// reference — anatomy judging at aimed cameras) and SNAG COMPOSITE
// (world-frame, SERVED snag bytes /tmp/fauna59-snag-served.glb sha16
// 75cec14c — struct-104 served-bytes law; the served re-encode is
// structure-preserving) at the LIVE host tuple (60.6,-0.0461,-30) yaw
// -2.3562 (hard-gated in the placer), woodp at the frame-copy tuple
// (60.6,-0.0461,-30) yaw -2.3562 — the world read verbatim. The bird is
// authored SEATED in the GLB (woodp_a at snag-local (0.4239,1.726,
// -0.2382) ry 0.7752) — the composite IS the placement preview.
// Ground = meadow #4a5d33 (robin rig law). Motion driven by the REAL
// client closed forms — motioneval.js pendulumTheta + evalPart bob
// VERBATIM, incl THE DRUM (woodp_head Z-pendulum at the bill strike
// arc) and THE SIDLE (woodp Y-pendulum about the grip). NO night pass
// (zero emissives; night-read law n/a).
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const wpBytes = readFileSync("agents/arthur/assets/village_dress_woodp1.glb");
const wpSha = createHash("sha256").update(wpBytes).digest("hex");
if (wpSha !== "5b7e177e282446f989e96c94776173525b6f325b3ee2628fc754309c08fc4113") throw new Error(`woodp bytes drift ${wpSha}`);
const snagBytes = readFileSync("/tmp/fauna59-snag-served.glb");
const snagSha = createHash("sha256").update(snagBytes).digest("hex").slice(0, 16);
if (snagSha !== "75cec14c8c1642bc") throw new Error(`snag served bytes drift ${snagSha}`);
const outDir = resolve("agents/arthur/reviews/fauna59-woodp");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const ME = readFileSync("client/lib/motioneval.js", "utf8"); // unmodified evaluator

// the exact comp payloads the placer sends (mirrored in fauna59-place-woodp.ts)
const COMPS = [
  { part: "woodp", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.10, period: 9.0, phase: 0.0, t0: 1 } },        // THE SIDLE
  { part: "woodp_body", m: { type: "bob", amp: 0.003, period: 4.2, phase: 0.6, t0: 1 } },                                          // cling breath
  { part: "woodp_head", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0.0717, 0.0759, 0], amp: 0.16, period: 4.8, phase: 1.2, t0: 1 } }, // THE DRUM
  { part: "woodp_tail", m: { type: "pendulum", axis: [1, 0, 0], pivot: [-0.0043, -0.0608, 0], amp: 0.05, period: 3.1, phase: 2.1, t0: 1 } }, // prop flex
];

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
const camera=new THREE.PerspectiveCamera(42,960/720,0.05,400);
const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2.0); scene.add(hemi);
const ambient=new THREE.AmbientLight(0xffffff,0.45); scene.add(ambient);
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(8,12,6); sun.castShadow=true; scene.add(sun);
const fill=new THREE.DirectionalLight(0xffffff,0); fill.position.set(-6,4,10); scene.add(fill);
window.setFill=(on)=>{fill.intensity=on?1.4:0;};
const ground=new THREE.Mesh(new THREE.PlaneGeometry(400,400),new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:1})); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const draco=new DRACOLoader().setDecoderPath('/draco/');
const loader=new GLTFLoader(); loader.setDRACOLoader(draco);
const shade=(root)=>root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
// LONE: the seated envelope, dropped to the ground plane for anatomy
const lone=(await loader.loadAsync('/model-woodp.glb')).scene; scene.add(lone);
lone.updateMatrixWorld(true);
{ const bb=new THREE.Box3().setFromObject(lone);
  const c=bb.getCenter(new THREE.Vector3());
  lone.position.x-=c.x; lone.position.z-=c.z; lone.position.y-=bb.min.y; }
shade(lone); lone.updateMatrixWorld(true);
// SNAG COMPOSITE: world-frame, SERVED bytes at the LIVE host tuple
const snag=(await loader.loadAsync('/model-snag.glb')).scene; snag.position.set(60.6,-0.0461,-30); snag.rotation.y=-2.3562; snag.visible=false; scene.add(snag); shade(snag);
const snWp=(await loader.loadAsync('/model-woodp.glb')).scene; snWp.position.set(60.6,-0.0461,-30); snWp.rotation.y=-2.3562; snWp.visible=false; scene.add(snWp); shade(snWp);
const LONE_ON=()=>{lone.visible=true;snag.visible=false;snWp.visible=false;};
const SNAG_ON=()=>{lone.visible=false;snag.visible=true;snWp.visible=true;};
const parts={};
for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(snWp,c.part);
  if(p) parts[c.part]={p, base:{pos:p.position.toArray(), quat:p.quaternion.toArray(), rot:p.rotation.toArray()}, m:c.m}; }
window.stats={parts:Object.keys(parts).length};
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
  camera.fov=42; camera.updateProjectionMatrix();
  // the bird sits on the snag's WSW face at world (60.6+dx,-30+dz); the
  // reader approaches from the plaza at NW (−0.897,+0.442)·d. Bird local
  // seat (0.4239,·,−0.2382) ry(host −2.3562) → world offset ≈ (+0.30,−0.34)
  // → bird world ≈ (60.90, 1.68, −30.34).
  const BW=[60.90,1.68,-30.34];
  const views={
    // LONE anatomy: the seated bird dropped to the ground — aimed at the
    // true envelope (H 0.333, head at top; lookAt y ≈ 0.2 mid-bird)
    lone_gameplay:()=>{LONE_ON();camera.position.set(0.7,1.65,18);camera.lookAt(0,0.3,0);},
    lone_near:()=>{LONE_ON();camera.position.set(1.0,0.42,0.6);camera.lookAt(0.0,0.22,0);},
    // the contract profile: the OUT face (back/scapular/wing-spots) —
    // camera on the +x−z quadrant (the yawed out-face direction)
    lone_profile:()=>{LONE_ON();camera.position.set(1.1,0.5,-0.5);camera.lookAt(0.0,0.2,0);},
    // the face: hatch/bill/malar (the head sits at the envelope top)
    lone_face:()=>{LONE_ON();camera.position.set(1.35,0.55,-0.4);camera.lookAt(0.06,0.27,-0.02);},
    // SNAG COMPOSITE, world frame — the plaza reader's 18m approach
    snag_gameplay:()=>{SNAG_ON();camera.position.set(60.90-16.1,1.65,-30.34+7.9);camera.lookAt(60.9,1.6,-30.35);},
    // 18m scope (narrow FOV identity read on the trunk band)
    snag_scope:()=>{SNAG_ON();camera.fov=7;camera.position.set(60.90-16.1,1.65,-30.34+7.9);camera.lookAt(60.75,1.68,-30.28);camera.updateProjectionMatrix();},
    // discover: 4m stop on the spoke
    snag_near:()=>{SNAG_ON();camera.position.set(60.90-3.6,1.55,-30.34+1.8);camera.lookAt(60.85,1.7,-30.32);},
    // composition: snag foreground, SE treeline context
    snag_compose:()=>{SNAG_ON();camera.position.set(60.90-13,2.2,-30.34+9);camera.lookAt(61.5,2.0,-30.5);},
    // tail-prop check: close on the tail/bark contact, from below-left
    snag_tail:()=>{SNAG_ON();camera.position.set(60.90-2.2,1.25,-30.34+1.4);camera.lookAt(60.78,1.56,-30.30);},
  };
  views[name](); renderer.render(scene,camera); };
window.setPhase=(tSec)=>{ for(const k of Object.keys(parts)){ const {p,base,m}=parts[k];
    const t=Math.max(0,(tSec*1000+1 - m.t0)/1000);
    if(m.type==='pendulum') rotatePartAtPivot(p,base,m.axis,m.pivot,pendulumTheta(m,t));
    else evalPartCase(p,base,m,t); } };
window.snap=()=>{renderer.render(scene,camera); return renderer.domElement.toDataURL('image/png'); }
window.frame=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  return x.getImageData(0,0,c.width,c.height).data.slice(); }
window.frameDiff=(a,b)=>{ if(!a||!b||a.length!==b.length) return -1;
  let n=0; const row=[];
  for(let i=0;i<a.length;i+=4){ if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>18){
    n++; row.push(Math.floor((i/4)%960)); } } window.lastDiffRows=row; return n; }
window.rinfo=()=>({tri:renderer.info.render.triangles,calls:renderer.info.render.calls});
// woodpecker probes: WHITE markers (cheek/shoulder spots/wing bars/rump),
// RED vent, BUFF face — calibrated from topColors at the profile view
window.whiteProbe=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const img=x.getImageData(0,0,c.width,c.height).data; let n=0;
  for(let i=0;i<img.length;i+=4){ const r=img[i],g=img[i+1],b=img[i+2];
    if(r>185&&g>178&&b>155) n++; }
  return n; }
window.redProbe=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const img=x.getImageData(0,0,c.width,c.height).data; let n=0;
  for(let i=0;i<img.length;i+=4){ const r=img[i],g=img[i+1],b=img[i+2];
    if(r>110&&r>g*1.9&&r>b*2.2&&g<95) n++; }
  return n; }
window.topColors=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const img=x.getImageData(0,0,c.width,c.height).data; const m=new Map();
  for(let i=0;i<img.length;i+=4){ const k=(img[i]<<16)|(img[i+1]<<8)|img[i+2];
    m.set(k,(m.get(k)??0)+1); }
  const out=[];
  for(const [k,n] of [...m.entries()].sort((a,b)=>b[1]-a[1]).slice(0,30))
    out.push((((k>>16)&255))+','+(((k>>8)&255))+','+(k&255)+':'+n);
  return out; }
window.setView('snag_gameplay'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/model-woodp.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(wpBytes); }
    if (url === "/model-snag.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(snagBytes); }
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
for (const v of ["lone_gameplay", "lone_near", "lone_profile", "lone_face", "snag_gameplay", "snag_scope", "snag_near", "snag_compose", "snag_tail"]) {
  await page.evaluate(() => (window as any).setFill(false));
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  await grab(`new-${v}.png`);
}
// probes at the contract views
await page.evaluate(() => (window as any).setView("lone_profile"));
const wProf = await page.evaluate(() => (window as any).whiteProbe());
const rProf = await page.evaluate(() => (window as any).redProbe());
const topProf: any = await page.evaluate(() => (window as any).topColors());
console.log("top colors profile:", JSON.stringify(topProf.slice(0, 14)));
await page.evaluate(() => (window as any).setView("lone_face"));
const wFace = await page.evaluate(() => (window as any).whiteProbe());
const rFace = await page.evaluate(() => (window as any).redProbe());
await page.evaluate(() => (window as any).setView("snag_scope"));
const wScope = await page.evaluate(() => (window as any).whiteProbe());
const rScope = await page.evaluate(() => (window as any).redProbe());
await page.evaluate(() => (window as any).setView("snag_gameplay"));
const w18 = await page.evaluate(() => (window as any).whiteProbe());
const r18 = await page.evaluate(() => (window as any).redProbe());
console.log(`probes: white prof ${wProf} face ${wFace} scope18 ${wScope} 18m ${w18} | red prof ${rProf} face ${rFace} scope18 ${rScope} 18m ${r18}`);
if (wProf < 60) throw new Error(`white markers absent at profile (${wProf})`);
if (w18 < 8) throw new Error(`white absent at 18m (${w18})`);
// motion pair at the composition framing: t=1.1s vs t=9.4s
await page.evaluate(() => (window as any).setView("snag_compose"));
await page.evaluate((t: any) => (window as any).setPhase(t), 1.1);
await grab("new-motion-snag_compose-a.png");
const fa: any = await page.evaluate(() => (window as any).frame());
await page.evaluate((t: any) => (window as any).setPhase(t), 9.4);
await grab("new-motion-snag_compose-b.png");
const fb: any = await page.evaluate(() => (window as any).frame());
const diff = await page.evaluate(([a, b]: any) => (window as any).frameDiff(a, b), [fa, fb] as any);
const rows: any = await page.evaluate(() => (window as any).lastDiffRows);
const band = rows.length ? `${Math.min(...rows)}-${Math.max(...rows)} (of 960)` : "none";
console.log(`motion pair snag_compose: ${diff} px differ, x band ${band}`);
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close();
server.close();
console.log(`wrote fauna59 woodp renders -> ${outDir}`);
