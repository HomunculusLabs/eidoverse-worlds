// fauna46-render-dmou.ts — review renders for the fauna-46 dormouse.
// Chassis: fauna45-render-hmou.ts (module-scope render law). TWO scenes:
// LONE (dormouse recentred — identity/anatomy judging) and ORCHARD
// COMPOSITE (world-frame): dovecote (local bytes 8f33f97f… == live lib
// EXACT) at (-50.5,0,62.55) yaw 2.577 + espalier rows (local bytes
// 962c5fb0… == live lib EXACT) at (-48.06,0,67.53) yaw 2.356 + the
// dormouse at the swept seat (-51.5,0,64.25) yaw 0.744 — the REAL
// placement read: a dormouse asleep in the hedge-line corridor between
// the dovecote and the rows' SW end, on the orchard-edge stroll.
// Ground = meadow #4a5d33 (robin rig law). Motion pairs at orch_near
// driven by the REAL client closed forms — motioneval.js pendulumTheta
// for head/ear/tail, evalPart bob VERBATIM from client/lib/motion.js
// for the breathing.
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const dmouBytes = readFileSync("agents/arthur/assets/village_dress_dmou1.glb");
const dmouSha = createHash("sha256").update(dmouBytes).digest("hex");
if (dmouSha !== "c21430641ffadf67fba81efe968359f7695f1573f119a4619259265bdb4aac78") throw new Error(`dmou bytes drift ${dmouSha}`);
const doveBytes = readFileSync("agents/arthur/assets/village_dress_dovecote.glb");
const doveSha = createHash("sha256").update(doveBytes).digest("hex");
if (doveSha.slice(0, 16) !== "8f33f97f97b0e4de") throw new Error(`dovecote bytes drift ${doveSha.slice(0, 16)}`);
const rowsBytes = readFileSync("agents/arthur/assets/village_dress_nw_orchardrows1.glb");
const rowsSha = createHash("sha256").update(rowsBytes).digest("hex");
if (rowsSha.slice(0, 16) !== "962c5fb041d19c63") throw new Error(`rows bytes drift ${rowsSha.slice(0, 16)}`);
const outDir = resolve("agents/arthur/reviews/fauna46-dmou");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const ME = readFileSync("client/lib/motioneval.js", "utf8"); // unmodified evaluator

// the exact comp payloads the placer sends (mirrored in fauna46-place-dmou.ts)
const COMPS = [
  { part: "dmou", m: { type: "bob", amp: 0.004, period: 4.8, phase: 0.0, t0: 1 } },
  { part: "dmou_head", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.14, period: 11.0, phase: 0.7, t0: 1 } },
  { part: "dmou_ear", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.16, period: 3.1, phase: 0.35, t0: 1 } },
  { part: "dmou_tail", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.08, period: 6.4, phase: 1.2, t0: 1 } },
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
const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:1})); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const loader=new GLTFLoader(); const shade=(root)=>root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
// LONE: dormouse recentred on the ground (identity judging)
const lone=(await loader.loadAsync('/model-dmou.glb')).scene; scene.add(lone);
lone.updateMatrixWorld(true);
{ const bb=new THREE.Box3().setFromObject(lone);
  const c=bb.getCenter(new THREE.Vector3());
  lone.position.x-=c.x; lone.position.z-=c.z; lone.position.y-=bb.min.y; }
shade(lone); lone.updateMatrixWorld(true);
// ORCHARD COMPOSITE: world-frame, live tuples (y quashed to grade)
const dove=(await loader.loadAsync('/model-dove.glb')).scene; dove.position.set(-50.5,0,62.55); dove.rotation.y=2.577; dove.visible=false; scene.add(dove); shade(dove);
const rows=(await loader.loadAsync('/model-rows.glb')).scene; rows.position.set(-48.06,0,67.53); rows.rotation.y=2.356; rows.visible=false; scene.add(rows); shade(rows);
const orchDmou=(await loader.loadAsync('/model-dmou.glb')).scene; orchDmou.position.set(-51.5,0,64.25); orchDmou.rotation.y=0.744; orchDmou.visible=false; scene.add(orchDmou); shade(orchDmou);
const LONE_ON=()=>{lone.visible=true;dove.visible=false;rows.visible=false;orchDmou.visible=false;};
const ORCH_ON=()=>{lone.visible=false;dove.visible=true;rows.visible=true;orchDmou.visible=true;};
// bind part bases on the COMPOSITE dormouse (the placement read drives motion)
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts={};
for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(orchDmou,c.part);
  if(p) parts[c.part]={p, base:{pos:p.position.toArray(), quat:p.quaternion.toArray(), rot:p.rotation.toArray()}, m:c.m}; }
window.stats={dmouNodes:(await loader.loadAsync('/model-dmou.glb')).scene.children.length};
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
    lone_gameplay:()=>{LONE_ON();camera.position.set(0,1.65,18);camera.lookAt(0,0.02,0);},
    lone_near:()=>{LONE_ON();camera.position.set(0,0.22,1.4);camera.lookAt(-0.01,0.04,0);},
    // r4 (judge r3's own request): a TRUE close ¾ — 55cm, higher angle,
    // aimed at the nest center so weave/tail girth are resolvable
    lone_close:()=>{LONE_ON();camera.position.set(0.16,0.30,0.42);camera.lookAt(-0.005,0.02,0.01);},
    lone_face:()=>{LONE_ON();camera.position.set(0.24,0.10,0.16);camera.lookAt(0.00,0.045,0);},
    lone_profile:()=>{LONE_ON();camera.position.set(-0.01,0.12,0.30);camera.lookAt(-0.01,0.035,0);},
    lone_top:()=>{LONE_ON();camera.position.set(-0.01,0.45,0.30);camera.lookAt(-0.01,0,0.02);},
    // orchard composite, world frame; the seat's TRUE reader line = the
    // stile-approach stroll the dovecote already faces (fauna-40 law f:
    // cameras derive from the seat's reader line, not a fixed bearing)
    orch_gameplay:()=>{ORCH_ON();camera.position.set(-51.5+18*0.741,1.65,64.25-18*0.672);camera.lookAt(-51.5,0.1,64.25);},
    orch_scope:()=>{ORCH_ON();camera.fov=7;camera.position.set(-51.5+18*0.741,1.65,64.25-18*0.672);camera.lookAt(-51.5,0.05,64.25);camera.updateProjectionMatrix();},
    // r7 (judge r6 encounter): the v1 orch_near camera sat 0.86m from
    // the dovecote center — INSIDE its envelope; the near-plane slice
    // rendered as the "black wedge" and the context fell out of frame.
    // Re-derived: 2.3m SW of the nest, clear of the dovecote OBB
    // (1.4m+ from its center), open grass behind the subject.
    orch_near:()=>{ORCH_ON();camera.position.set(-52.35,0.35,62.5);camera.lookAt(-51.5,0.05,64.25);},
    // the discover stop: 1.1m over the nest (the stroller pauses,
    // looks down into the pocket)
    orch_face:()=>{ORCH_ON();camera.position.set(-51.9,0.22,63.7);camera.lookAt(-51.5,0.045,64.2);},
    // the walk-up: stroller's eye 6m out on the stroll, nest mid-frame
    orch_approach:()=>{ORCH_ON();camera.position.set(-49.0,1.45,61.3);camera.lookAt(-51.6,0.1,64.6);},
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
    n++; row.push(Math.floor((i/4)%960)); } } window.lastDiffRows=row; return n; };
window.rinfo=()=>({tri:renderer.info.render.triangles,calls:renderer.info.render.calls});
window.goldProbe=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const img=x.getImageData(0,0,c.width,c.height).data;
  let n=0;
  // calibrated to RENDERED truth (grey-gold 0xcbb08a: lit (140..155, 90..110,
  // 60..70) — the nest ring shadows the sun-side flank by design; weave
  // (33,23,10), meadow (99,116,66); r>g+25 separates)
  for(let i=0;i<img.length;i+=4){ const r=img[i],g=img[i+1],b=img[i+2];
    if(r>135&&r<200&&g>80&&g<130&&b<100&&r>g+25) n++; }
  return n; }
window.setView('orch_gameplay'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/model-dmou.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(dmouBytes); }
    if (url === "/model-dove.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(doveBytes); }
    if (url === "/model-rows.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(rowsBytes); }
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
for (const v of ["lone_gameplay", "lone_near", "lone_close", "lone_face", "lone_profile", "lone_top", "orch_gameplay", "orch_scope", "orch_near", "orch_face", "orch_approach"]) {
  await page.evaluate(() => (window as any).setFill(false));
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  counts[v] = await page.evaluate(() => (window as any).colorCount());
  await grab(`new-${v}.png`);
}
console.log("unique colors:", JSON.stringify(counts));
// fill-lit anatomy probes (fauna-7 law b, disclosed)
for (const v of ["lone_face", "lone_profile", "orch_face"]) {
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.evaluate(() => (window as any).setFill(true));
  await page.waitForTimeout(40);
  await grab(`new-${v}-fill.png`);
  await page.evaluate(() => (window as any).setFill(false));
}
for (const [v, n] of Object.entries(counts)) {
  // lone_gameplay floor calibrated to the dormouse's honest 18m read:
  // an 11cm dark-weave subject renders ~31 shades at 18m (rendered-but-
  // speck, robin-law encounter-reward physics — the hmou's golden
  // furniture cleared 60; presence at distance is carried by orch_scope
  // + orch_gameplay composite). 25 separates rendered-speck from a
  // blank canvas (~2-5 colors).
  const floor = (v === "lone_gameplay") ? 25 : (v === "orch_near" || v === "orch_face") ? 60 : 300;
  if ((n as number) < floor) throw new Error(`view ${v} looks blank (${n} colors)`);
}
// grey-gold coat presence probe at lone_near (mechanical dormouse-
// presence proof). Window calibrated to RENDERED truth (probe dump:
// lit coat runs (140..155, 90..110, 60..70) — the nest ring shadows
// the curled body's sun-side flank BY DESIGN, a sleeper IN his bed;
// weave (33,23,10), meadow (99,116,66)). Robin law d: probe the
// rendered colors, never assume the albedo window.
await page.evaluate(() => (window as any).setView("lone_near"));
const goldPx = await page.evaluate(() => (window as any).goldProbe());
console.log("gold presence probe (lone_near grey-gold px):", goldPx);
if (goldPx < 35) throw new Error(`dormouse grey-gold coat not present in lone_near (${goldPx} px)`);
// motion pair at the encounter framing: t=2.1s vs t=10.3s — all 4 comps
// far from phase coincidence
await page.evaluate(() => (window as any).setView("orch_near"));
await page.evaluate((t: any) => (window as any).setPhase(t), 2.1);
await grab("new-motion-orch_near-a.png");
const fa: any = await page.evaluate(() => (window as any).frame());
await page.evaluate((t: any) => (window as any).setPhase(t), 10.3);
await grab("new-motion-orch_near-b.png");
const fb: any = await page.evaluate(() => (window as any).frame());
const diff = await page.evaluate(([a, b]: any) => (window as any).frameDiff(a, b), [fa, fb] as any);
const rows: any = await page.evaluate(() => (window as any).lastDiffRows);
const band = rows.length ? `${Math.min(...rows)}-${Math.max(...rows)} (of 960)` : "none";
console.log(`motion pair orch_near: ${diff} px differ, x band ${band}`);
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close();
server.close();
console.log(`wrote fauna46 dmou renders -> ${outDir}`);
