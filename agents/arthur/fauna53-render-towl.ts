// fauna53-render-towl.ts — review renders for the fauna-53 tawny owls.
// Chassis: fauna52-render-yham.ts (module-scope render law). TWO
// scenes: LONE (pair recentred — identity/anatomy judging) and ROWS
// COMPOSITE (world-frame): LIVE local bytes village_dress_nw_orchardrows1.glb
// sha 962c5fb0… == live lib prefix EXACT + the dovecote + lavender field
// context at their live tuples — rows (-48.062,0.034,67.53) yaw 2.3562,
// dovecote (-50.5,0.0367,62.55) yaw 2.577, lavender (-39.58,0.0402,62.89)
// yaw 2.36 — and the towl entity at the frame-copy seat (rows-host-local
// (2.10, +1.50, 0.13) → world (-49.455, 1.534, 65.953) yaw 2.3562;
// entity-local == rows-host-local verbatim). Reader lines (fauna-40 law
// f): the dovecote stop (-50.5,63.3) 4.4m WNW is the nearest approach
// reader; the stile (-45.25,54.45) is the long 18m line. Ground = meadow
// #4a5d33. Motion pairs at rows_near driven by the REAL client closed
// forms. Night view (the night-voice species) with the rig's PM sun
// dropped to a moon read.
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const towlBytes = readFileSync("agents/arthur/assets/village_dress_towl1.glb");
const towlSha = createHash("sha256").update(towlBytes).digest("hex");
if (towlSha !== "4e8d09972f2cc811a210887c395d51eee2efd8e2b4ccc3b4c4a7d1ce647c49d9") throw new Error(`towl bytes drift ${towlSha}`); // v8 — sleeper clean-plumage (spot noise cure)
const rowsBytes = readFileSync("agents/arthur/assets/village_dress_nw_orchardrows1.glb");
const rowsSha = createHash("sha256").update(rowsBytes).digest("hex");
if (rowsSha.slice(0, 16) !== "962c5fb041d19c63") throw new Error(`rows bytes drift ${rowsSha}`);
const dovBytes = readFileSync("agents/arthur/assets/village_dress_dovecote.glb");
const dovSha = createHash("sha256").update(dovBytes).digest("hex");
if (dovSha.slice(0, 16) !== "8f33f97f97b0e4de") throw new Error(`dovecote bytes drift ${dovSha}`);
const lavBytes = readFileSync("agents/arthur/mason/glb-retex/work_1660_lavender.glb");
const lavSha = createHash("sha256").update(lavBytes).digest("hex");
if (lavSha.slice(0, 16) !== "5e04ce4b2ad6e90c") throw new Error(`lavender bytes drift ${lavSha}`);
const outDir = resolve("agents/arthur/reviews/fauna53-towl");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const ME = readFileSync("client/lib/motioneval.js", "utf8"); // unmodified evaluator

// the exact comp payloads the placer sends (mirrored in fauna53-place-towl.ts)
const COMPS = [
  { part: "towl_a", m: { type: "bob", amp: 0.004, period: 5.2, phase: 0.0, t0: 1 } },
  { part: "towl_a_head", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.30, period: 9.0, phase: 0.3, t0: 1 } },
  { part: "towl_a_tail", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.10, period: 3.1, phase: 1.2, t0: 1 } },
  { part: "towl_b", m: { type: "bob", amp: 0.003, period: 7.0, phase: 2.1, t0: 1 } },
  { part: "towl_b_head", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.10, period: 11.0, phase: 0.8, t0: 1 } },
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
const fill=new THREE.DirectionalLight(0xffffff,0); fill.position.set(-6,4,10); scene.add(fill);
window.setFill=(on)=>{fill.intensity=on?1.4:0;};
window.setNight=(on)=>{ if(on){hemi.intensity=0.25;hemi.color.set(0x8ea0c0);ambient.intensity=0.10;
  sun.intensity=0.5;sun.color.set(0xbcc8e8);} else {hemi.intensity=2.0;hemi.color.set(0xffffff);ambient.intensity=0.45;
  sun.intensity=3.2;sun.color.set(0xfff1d4);} };
const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:1})); ground.rotation.x=-Math.PI/2; ground.position.set(-40,0,58); ground.receiveShadow=true; scene.add(ground);
const loader=new GLTFLoader(); const shade=(root)=>root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
// LONE: pair recentred on the ground (identity judging)
const lone=(await loader.loadAsync('/model-towl.glb')).scene; scene.add(lone);
lone.updateMatrixWorld(true);
{ const bb=new THREE.Box3().setFromObject(lone);
  const c=bb.getCenter(new THREE.Vector3());
  lone.position.x-=c.x; lone.position.z-=c.z; lone.position.y-=bb.min.y; }
shade(lone); lone.updateMatrixWorld(true);
// ROWS COMPOSITE: world-frame, live tuples (frame-copy seat)
const rows=(await loader.loadAsync('/model-rows.glb')).scene; rows.position.set(-48.062,0.034,67.53); rows.rotation.y=2.3562; rows.visible=false; scene.add(rows); shade(rows);
const dov=(await loader.loadAsync('/model-dov.glb')).scene; dov.position.set(-50.5,0.0367,62.55); dov.rotation.y=2.577; dov.visible=false; scene.add(dov); shade(dov);
const lav=(await loader.loadAsync('/model-lav.glb')).scene; lav.position.set(-39.58,0.0402,62.89); lav.rotation.y=2.36; lav.visible=false; scene.add(lav); shade(lav);
const rowsTowl=(await loader.loadAsync('/model-towl.glb')).scene; rowsTowl.position.set(-49.455,1.534,65.953); rowsTowl.rotation.y=2.3562; rowsTowl.visible=false; scene.add(rowsTowl); shade(rowsTowl);
const LONE_ON=()=>{lone.visible=true;rows.visible=false;dov.visible=false;lav.visible=false;rowsTowl.visible=false;calib.visible=false;};
const ROWS_ON=()=>{lone.visible=false;rows.visible=true;dov.visible=true;lav.visible=true;rowsTowl.visible=true;calib.visible=false;};
// CALIB post — a row-matched timber post (0.10×1.45×0.10) planted at
// the OWL'S OWN DEPTH, 0.9m beside it: a same-depth 1.45m ruler. The
// r3 judge measured the owl against posts 5-7m deep (perspective
// inflation) — this frame settles true-size in one look.
const calib=new THREE.Mesh(new THREE.BoxGeometry(0.10,1.45,0.10),new THREE.MeshStandardMaterial({color:0x9c8a6a,roughness:0.9}));
calib.position.set(-48.55,0.034+0.725,65.6); calib.castShadow=true; calib.visible=false; scene.add(calib);
// bind part bases on the COMPOSITE owls (the placement read drives motion)
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts={};
for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(rowsTowl,c.part);
  if(p) parts[c.part]={p, base:{pos:p.position.toArray(), quat:p.quaternion.toArray(), rot:p.rotation.toArray()}, m:c.m}; }
window.stats={towlNodes:(await loader.loadAsync('/model-towl.glb')).scene.children.length};
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
    lone_gameplay:()=>{LONE_ON();camera.position.set(0,1.65,18);camera.lookAt(0,0.15,0);},
    lone_near:()=>{LONE_ON();camera.position.set(0,0.42,1.7);camera.lookAt(0,0.22,0);},
    lone_profile:()=>{LONE_ON();camera.position.set(0.0,0.28,0.62);camera.lookAt(0,0.20,0);},
    // aimed per-subject probes (fauna-4 law; reader-side approach)
    lone_sentface:()=>{LONE_ON();camera.position.set(-1.02,0.32,0.42);camera.lookAt(-0.46,0.22,0.11);},
    lone_sleepface:()=>{LONE_ON();camera.position.set(1.30,0.22,0.55);camera.lookAt(0.46,0.13,-0.08);},
    // ROWS composite, world frame. Reader lines (fauna-40 law f):
    // - the dovecote stop (-50.5,63.3) is the nearest approach reader,
    //   4.4m WNW — the encounter vantage at owl-eye height.
    rows_near:()=>{ROWS_ON();camera.position.set(-50.5,1.62,63.3);camera.lookAt(-49.455,1.62,65.953);},
    // - the discover stop: 3m NE on the stroll line, looking SW at the
    //   crown (the parting view from the espalier display end).
    rows_discover:()=>{ROWS_ON();camera.position.set(-48.2,1.65,68.0);camera.lookAt(-49.455,1.60,65.953);},
    // - 18m on the stile line (the long read).
    rows_gameplay:()=>{ROWS_ON();camera.position.set(-45.9,1.65,60.3);camera.lookAt(-49.455,1.55,65.953);},
    rows_scope:()=>{ROWS_ON();camera.fov=7;camera.position.set(-45.9,1.65,60.3);camera.lookAt(-49.455,1.53,65.953);camera.updateProjectionMatrix();},
    // - calib frame: same rows_near vantage + the same-depth 1.45m post
    rows_calib:()=>{ROWS_ON();calib.visible=true;camera.position.set(-50.5,1.62,63.3);camera.lookAt(-49.0,1.35,65.8);},
    // - night read (the night-voice species): moon rig, rows_near.
    rows_night:()=>{ROWS_ON();setNight(true);camera.position.set(-50.5,1.62,63.3);camera.lookAt(-49.455,1.58,65.953);},
  };
  views[name](); renderer.render(scene,camera); }
window.setPhase=(tSec)=>{ for(const k of Object.keys(parts)){ const {p,base,m}=parts[k];
    const t=Math.max(0,(tSec*1000+1 - m.t0)/1000);
    if(m.type==='pendulum') rotatePartAtPivot(p,base,m.axis,m.pivot,pendulumTheta(m,t));
    else evalPartCase(p,base,m,t); } }
window.snap=()=>{renderer.render(scene,camera); return renderer.domElement.toDataURL('image/png');}
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
window.frameDiff=(a,b)=>{ if(!a||b&&a.length!==b.length) return -1;
  let n=0; const row=[];
  for(let i=0;i<a.length;i+=4){ if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>18){
    n++; row.push(Math.floor((i/4)%960)); } } window.lastDiffRows=row; return n; }
window.rinfo=()=>({tri:renderer.info.render.triangles,calls:renderer.info.render.calls});
// warm-rufous presence probe at rows_scope: the owls' chestnut reads
// against canopy greens (mechanical presence proof; canopy greens run
// g>=r, rufous runs r>g)
window.rufProbe=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const img=x.getImageData(0,0,c.width,c.height).data;
  let n=0;
  for(let i=0;i<img.length;i+=4){ const r=img[i],g=img[i+1],b=img[i+2];
    if(r>90&&r<200&&g>55&&g<130&&b<80&&r>g+25&&g>b+10) n++; }
  return n; }
window.setView('rows_gameplay'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/model-towl.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(towlBytes); }
    if (url === "/model-rows.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(rowsBytes); }
    if (url === "/model-dov.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(dovBytes); }
    if (url === "/model-lav.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(lavBytes); }
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
if (stats.parts !== 5) throw new Error(`expected 5 parts, got ${stats.parts}`);

const grab = async (name: string) => {
  const dataUrl: string = await page.evaluate(() => (window as any).snap());
  writeFileSync(resolve(outDir, name), Buffer.from(dataUrl.split(",")[1], "base64"));
};
const counts: any = {};
for (const v of ["lone_gameplay", "lone_near", "lone_profile", "lone_sentface", "lone_sleepface", "rows_near", "rows_discover", "rows_gameplay", "rows_scope"]) {
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  counts[v] = await page.evaluate(() => (window as any).colorCount());
  await grab(`new-${v}.png`);
}
// night view (separate — must reset the light rig after)
await page.evaluate((s: any) => (window as any).setView(s), "rows_night");
await page.waitForTimeout(60);
counts["rows_night"] = await page.evaluate(() => (window as any).colorCount());
await grab("new-rows_night.png");
await page.evaluate(() => (window as any).setNight(false));
console.log("unique colors:", JSON.stringify(counts));
// fill-lit anatomy probes (fauna-7 law b, disclosed)
for (const v of ["lone_sentface", "lone_sleepface"]) {
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.evaluate(() => (window as any).setFill(true));
  await page.waitForTimeout(40);
  await grab(`new-${v}-fill.png`);
  await page.evaluate(() => (window as any).setFill(false));
}
for (const [v, n] of Object.entries(counts)) {
  const floor = (v === "lone_gameplay" || v.startsWith("rows_")) ? 60 : 300;
  if ((n as number) < floor) throw new Error(`view ${v} looks blank (${n} colors)`);
}
// calibration frame (scale falsification — same-depth ruler)
await page.evaluate((s: any) => (window as any).setView(s), "rows_calib");
await page.waitForTimeout(60);
counts["rows_calib"] = await page.evaluate(() => (window as any).colorCount());
await grab("new-rows_calib.png");
await page.evaluate(() => { (window as any).setView("rows_gameplay"); });
// rufous presence probe at rows_scope (18m long read): the owls' warm
// chestnut must carry distinguishable px against the canopy greens
await page.evaluate(() => (window as any).setView("rows_scope"));
const rufPx = await page.evaluate(() => (window as any).rufProbe());
console.log("rufous presence probe (rows_scope):", rufPx);
if (rufPx < 30) throw new Error(`owls' rufous not present at 18m scope (${rufPx} px)`);
// motion pair at the discover framing: t=2.0s vs t=7.5s — all 5 comps far
// from phase coincidence
await page.evaluate(() => (window as any).setView("rows_discover"));
await page.evaluate((t: any) => (window as any).setPhase(t), 2.0);
await grab("new-motion-rows_discover-a.png");
const fa: any = await page.evaluate(() => (window as any).frame());
await page.evaluate((t: any) => (window as any).setPhase(t), 7.5);
await grab("new-motion-rows_discover-b.png");
const fb: any = await page.evaluate(() => (window as any).frame());
const diff = await page.evaluate(([a, b]: any) => (window as any).frameDiff(a, b), [fa, fb] as any);
const rows_: any = await page.evaluate(() => (window as any).lastDiffRows);
const band = rows_.length ? `${Math.min(...rows_)}-${Math.max(...rows_)} (of 960)` : "none";
console.log(`motion pair rows_discover: ${diff} px differ, x band ${band}`);
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close();
server.close();
console.log(`wrote fauna53 towl renders -> ${outDir}`);
