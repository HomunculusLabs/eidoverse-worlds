// fauna87-render-lizd.ts — review renders for the fauna-87 common
// lizard. Chassis: fauna59-render-woodp.ts (module-scope render law).
// TWO scenes: LONE (lizd_a envelope dropped to the ground plane —
// anatomy at aimed cameras; the lizard reads VERTICAL: head up, tail
// draping, back facing +x) and KILN COMPOSITE (world frame, SERVED
// kiln bytes /tmp/fauna87-kiln-served.glb sha16 668692f7 — struct-104
// served-bytes law) at the LIVE host tuple (19.158717,-0.02065,
// 22.431976) yaw -2.443242 (hard-gated in the placer), lizd entity at
// the FRAME-COPY tuple verbatim — the composite IS the placement
// preview. Lizard world center ≈ (19.82, 1.40, 23.17); the reader
// spoke runs from the pig-sty meadow S-by-W: 18m vantage (15.1, 39.9)
// ≈ the sty itself (15.0, 40.2). Ground = meadow #4a5d33 (robin rig
// law). Motion driven by the REAL client closed forms — motioneval.js
// pendulumTheta + evalPart bob VERBATIM. Night pass: the kiln's own
// emissives (fire+glow) + a dark rig — the lizard must read as a quiet
// dark speck, never a glow.
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const lizdBytes = readFileSync("agents/arthur/assets/village_dress_lizd1.glb");
const lizdSha = createHash("sha256").update(lizdBytes).digest("hex");
if (lizdSha !== "4866e1a371ab13f53652101547e9e811b3bf2f8029481644b24b9cc71b6da2d6") throw new Error(`lizd bytes drift ${lizdSha}`);
const kilnBytes = readFileSync("/tmp/fauna87-kiln-served.glb");
const kilnSha = createHash("sha256").update(kilnBytes).digest("hex").slice(0, 16);
if (kilnSha !== "668692f76251e460") throw new Error(`kiln served bytes drift ${kilnSha}`);
const signBytes = readFileSync("/tmp/fauna87-nx-sign-kiln-001.glb");
const signSha = createHash("sha256").update(signBytes).digest("hex").slice(0, 16);
if (signSha !== "9e44d6b269516817") throw new Error(`sign served bytes drift ${signSha}`);
const heatBytes = readFileSync("/tmp/fauna87-nx-artwalk-b12-kiln-heat-contours.glb");
const heatSha = createHash("sha256").update(heatBytes).digest("hex").slice(0, 16);
if (heatSha !== "29e932d59cc9f57b") throw new Error(`heat served bytes drift ${heatSha}`);
const outDir = resolve("agents/arthur/reviews/fauna87-lizd");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const ME = readFileSync("client/lib/motioneval.js", "utf8"); // unmodified evaluator

// the exact comp payloads the placer sends (mirrored in fauna87-place-lizd.ts)
const COMPS = [
  { part: "lizd_body", m: { type: "bob", axis: [1, 0, 0], amp: 0.0016, period: 3.8, phase: 0.3, t0: 1 } },       // throat breath (off-the-face shift)
  { part: "lizd_head", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0.0099, 0.044, 0], amp: 0.22, period: 8.5, phase: 1.1, t0: 1 } }, // the flat watch
  { part: "lizd_tail", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0.0121, -0.066, 0], amp: 0.10, period: 6.5, phase: 2.2, t0: 1 } }, // tail settle-curl
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
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(9,13,-13); sun.castShadow=true; scene.add(sun);
const fill=new THREE.DirectionalLight(0xffffff,0); fill.position.set(-9,4,11); scene.add(fill);
window.setFill=(on)=>{fill.intensity=on?1.4:0;};
window.setNight=(on)=>{ if(on){sun.intensity=0.12;sun.color.set(0x8fa8c8);hemi.intensity=0.30;ambient.intensity=0.14;scene.background.set(0x1a2028);}
  else {sun.intensity=3.2;sun.color.set(0xfff1d4);hemi.intensity=2.0;ambient.intensity=0.45;scene.background.set(0xcbd6df);} };
const ground=new THREE.Mesh(new THREE.PlaneGeometry(400,400),new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:1})); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const draco=new DRACOLoader().setDecoderPath('/draco/');
const loader=new GLTFLoader(); loader.setDRACOLoader(draco);
const shade=(root)=>root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
// LONE: the seated envelope, dropped to the ground plane for anatomy
const lone=(await loader.loadAsync('/model-lizd.glb')).scene; scene.add(lone);
lone.updateMatrixWorld(true);
{ const bb=new THREE.Box3().setFromObject(lone);
  const c=bb.getCenter(new THREE.Vector3());
  lone.position.x-=c.x; lone.position.z-=c.z; lone.position.y-=bb.min.y; }
shade(lone); lone.updateMatrixWorld(true);
// KILN COMPOSITE: world frame, SERVED bytes at the LIVE host tuple + the
// TRUE co-resident composition (sign + heat contours, fetched served
// bytes — 0b law: the sign's fat census bbox may not describe the actual
// member near the lizard's head)
const KPOS=[19.158717,-0.02065,22.431976], KYAW=-2.443242;
const kiln=(await loader.loadAsync('/model-kiln.glb')).scene; kiln.position.set(...KPOS); kiln.rotation.y=KYAW; kiln.visible=false; scene.add(kiln); shade(kiln);
const sign=(await loader.loadAsync('/model-sign.glb')).scene; sign.position.set(18.605776095530477,2.4293500000000003,21.773298609435155); sign.rotation.y=KYAW; sign.visible=false; scene.add(sign); shade(sign);
const heat=(await loader.loadAsync('/model-heat.glb')).scene; heat.position.set(18.419319135343407,-0.02065,21.55118647109554); heat.rotation.y=KYAW; heat.visible=false; scene.add(heat); shade(heat);
const klz=(await loader.loadAsync('/model-lizd.glb')).scene; klz.position.set(...KPOS); klz.rotation.y=KYAW; klz.visible=false; scene.add(klz); shade(klz);
const LONE_ON=()=>{lone.visible=true;kiln.visible=false;klz.visible=false;sign.visible=false;heat.visible=false;};
const KILN_ON=()=>{lone.visible=false;kiln.visible=true;klz.visible=true;sign.visible=true;heat.visible=true;};
const parts={};
for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(klz,c.part);
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
  camera.fov=42; camera.updateProjectionMatrix(); setNight(false);
  // lizard world center (frame-copy of the host): body band ~y 1.38
  const LC=[19.82,1.40,23.17];
  const views={
    // LONE anatomy: the envelope is 0.377 tall; body band y 0.21..0.34
    lone_near:()=>{LONE_ON();camera.position.set(0.55,0.42,0.28);camera.lookAt(0,0.29,0);},
    lone_profile:()=>{LONE_ON();camera.position.set(0.10,0.42,0.85);camera.lookAt(0.005,0.28,0);},
    // the head close-up: head band y 0.33..0.38, back faces +x
    lone_face:()=>{LONE_ON();camera.position.set(0.42,0.50,0.16);camera.lookAt(0.008,0.36,0);},
    // KILN COMPOSITE, world frame — the sty-meadow reader's 18m approach
    kiln_gameplay:()=>{KILN_ON();camera.position.set(15.1,1.65,39.9);camera.lookAt(19.5,1.5,23.4);},
    // 18m scope (narrow FOV identity read on the lizard band)
    kiln_scope:()=>{KILN_ON();camera.fov=7;camera.position.set(15.1,1.65,39.9);camera.lookAt(19.82,1.42,23.17);camera.updateProjectionMatrix();},
    // discover: 2.6m stop on the spoke
    kiln_near:()=>{KILN_ON();camera.position.set(19.24,1.55,25.70);camera.lookAt(19.82,1.40,23.17);},
    // encounter face: 1.1m off the SSW face, aimed at the head band
    kiln_face:()=>{KILN_ON();camera.position.set(19.15,1.58,23.80);camera.lookAt(19.81,1.46,23.15);},
    // composition: kiln foreground, meadow context
    kiln_compose:()=>{KILN_ON();camera.position.set(15.8,2.2,33.5);camera.lookAt(19.4,1.9,22.8);},
    // night: the quiet dark read (kiln emissives live)
    kiln_night:()=>{KILN_ON();setNight(true);camera.position.set(19.24,1.55,25.70);camera.lookAt(19.82,1.40,23.17);},
  };
  views[name](); renderer.render(scene,camera); };
window.setPhase=(tSec)=>{ for(const k of Object.keys(parts)){ const {p,base,m}=parts[k];
    const t=Math.max(0,(tSec*1000+1 - m.t0)/1000);
    if(m.type==='pendulum') rotatePartAtPivot(p,base,m.axis,m.pivot,pendulumTheta(m,t));
    else evalPartCase(p,base,m,t); } }
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
// lizard probes: BODY warm grey-brown, LID pale, STRIPE dark — windows
// calibrated AFTER topColors at the near view (turkey law a)
window.bodyProbe=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const img=x.getImageData(0,0,c.width,c.height).data; let n=0;
  for(let i=0;i<img.length;i+=4){ const r=img[i],g=img[i+1],b=img[i+2];
    if(r>105&&r<185&&g>90&&g<165&&b>75&&b<145&&r>g&&g>b&&r-b>18) n++; }
  return n; }
window.__hideLizd=(h)=>{klz.visible=!h;}
window.__countBody=(R,G,B)=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const img=x.getImageData(0,0,c.width,c.height).data; let n=0;
  for(let i=0;i<img.length;i+=4){
    if(Math.abs(img[i]-R)<=20&&Math.abs(img[i+1]-G)<=20&&Math.abs(img[i+2]-B)<=20) n++; }
  return n; }
window.lidProbe=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const img=x.getImageData(0,0,c.width,c.height).data; let n=0;
  for(let i=0;i<img.length;i+=4){ const r=img[i],g=img[i+1],b=img[i+2];
    if(r>175&&g>168&&b>150) n++; }
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
window.setView('kiln_gameplay'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/model-lizd.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(lizdBytes); }
    if (url === "/model-kiln.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(kilnBytes); }
    if (url === "/model-sign.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(signBytes); }
    if (url === "/model-heat.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(heatBytes); }
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
for (const v of ["lone_near", "lone_profile", "lone_face", "kiln_gameplay", "kiln_scope", "kiln_near", "kiln_face", "kiln_compose", "kiln_night"]) {
  await page.evaluate(() => (window as any).setFill(false));
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  await grab(`v2-${v}.png`);
}
// probes: CALIBRATE from topColors at the near view (turkey law a —
// pre-guessed windows read 16px/19k-px noise), then count within ±20 of
// the measured body value; distance presence = present/absent frameDiff
// control (color windows at 18m catch masonry, not lizard)
await page.evaluate(() => (window as any).setView("lone_near"));
const topNear: any = await page.evaluate(() => (window as any).topColors());
console.log("top colors lone_near:", JSON.stringify(topNear.slice(0, 14)));
// body value = warm (r>g>b) non-sky (b<200) non-ground (r>g+6) top entry
let bodyVal: [number, number, number] | null = null;
for (const e of topNear as string[]) {
  const [rs, ns] = e.split(":");
  const [r, g, b] = rs.split(",").map(Number);
  if (r > g && g > b && r - b >= 12 && b < 200 && Number(ns) > 150) { bodyVal = [r, g, b]; break; }
}
if (!bodyVal) throw new Error(`no warm body value found in lone_near top colors: ${JSON.stringify(topNear.slice(0, 8))}`);
console.log("calibrated body value:", bodyVal.join(","));
const countBody = (rgb: [number, number, number]) => page.evaluate(([R, G, B]: any) => (window as any).__countBody(R, G, B), rgb as any);
const bNear = await countBody(bodyVal);
await page.evaluate(() => (window as any).setView("kiln_scope"));
const scopeOn: any = await page.evaluate(() => (window as any).frame());
await page.evaluate(() => { (window as any).__hideLizd(true); });
const scopeOff: any = await page.evaluate(() => (window as any).frame());
await page.evaluate(() => { (window as any).__hideLizd(false); });
const bScope = await page.evaluate(([a, b]: any) => (window as any).frameDiff(a, b), [scopeOn, scopeOff] as any);
await page.evaluate(() => (window as any).setView("kiln_near"));
const nearOn: any = await page.evaluate(() => (window as any).frame());
await page.evaluate(() => { (window as any).__hideLizd(true); });
const nearOff: any = await page.evaluate(() => (window as any).frame());
await page.evaluate(() => { (window as any).__hideLizd(false); });
const bDisc = await page.evaluate(([a, b]: any) => (window as any).frameDiff(a, b), [nearOn, nearOff] as any);
const discRows: any = await page.evaluate(() => (window as any).lastDiffRows);
const discBand = discRows.length ? `${Math.min(...discRows)}-${Math.max(...discRows)} (of 960)` : "none";
console.log(`probes: body near ${bNear}px @${bodyVal.join(",")} | scope18 present/absent diff ${bScope}px | discover diff ${bDisc}px band ${discBand}`);
if (bNear < 150) throw new Error(`body values absent at near (${bNear}px)`);
if (bScope < 5) throw new Error(`lizard not resolvable at 18m scope (${bScope}px diff)`);
if (bDisc < 30) throw new Error(`lizard not present at discover framing (${bDisc}px diff)`);
// motion pair at the discover framing: t=2.0s vs t=5.6s (head scan + tail settle mid-cycle)
await page.evaluate(() => (window as any).setView("kiln_near"));
await page.evaluate((t: any) => (window as any).setPhase(t), 2.0);
await grab("v2-motion-kiln_near-a.png");
const fa: any = await page.evaluate(() => (window as any).frame());
await page.evaluate((t: any) => (window as any).setPhase(t), 5.6);
await grab("v2-motion-kiln_near-b.png");
const fb: any = await page.evaluate(() => (window as any).frame());
const diff = await page.evaluate(([a, b]: any) => (window as any).frameDiff(a, b), [fa, fb] as any);
const rows: any = await page.evaluate(() => (window as any).lastDiffRows);
const band = rows.length ? `${Math.min(...rows)}-${Math.max(...rows)} (of 960)` : "none";
console.log(`motion pair kiln_near: ${diff} px differ, x band ${band}`);
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close(); server.close();
console.log(`wrote fauna87 lizd renders -> ${outDir}`);
