// fauna52-render-yham.ts — review renders for the fauna-52 yellowhammers.
// Chassis: fauna48-render-sparrow.ts (module-scope render law). TWO
// scenes: LONE (pair recentred — identity/anatomy judging) and HEDGE
// COMPOSITE (world-frame): LIVE local bytes village_dress_nw_hedge1.glb
// sha 3d5c7d44… == live lib prefix EXACT + the lavender field context
// (mason bytes work_1660_lavender.glb 5e04ce4b… == live lib EXACT) at
// their live tuples — hedge (-35.34,0.04,62.14) yaw -2.36, lavender
// (-39.58,0.04,62.89) yaw 2.36 — and the yham entity at the frame-copy
// seat (hedge-local (-1.65, +0.62), crown 1.44 → world (-34.603, 1.48,
// 60.539) yaw -2.36; entity-local == hedge-local verbatim). Reader lines
// (fauna-40 law f: cameras derive from the true approach): the stile
// (-45.25,54.45) is the nearest reader stop 12.3m SW; the orchard stroll
// continues stile→dovecote W of the hedge. Ground = meadow #4a5d33.
// Motion pairs at hedge_near driven by the REAL client closed forms.
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const yhBytes = readFileSync("agents/arthur/assets/village_dress_yham1.glb");
const yhSha = createHash("sha256").update(yhBytes).digest("hex");
if (yhSha !== "0f7fdfeac8e3379aa9803e26689847bd58d494091519d40ee91c6e6cfd089c4f") throw new Error(`yham bytes drift ${yhSha}`); // v4 — bill/gape/crown/rump cures
const hedgeBytes = readFileSync("agents/arthur/assets/village_dress_nw_hedge1.glb");
const hedgeSha = createHash("sha256").update(hedgeBytes).digest("hex");
if (hedgeSha !== "3d5c7d44351e5076ddbe7ac785a1d904633c16f5d70eb5bb118c03ce31c713ce") throw new Error(`hedge bytes drift ${hedgeSha}`);
const lavBytes = readFileSync("agents/arthur/mason/glb-retex/work_1660_lavender.glb");
const lavSha = createHash("sha256").update(lavBytes).digest("hex");
if (lavSha !== "5e04ce4b2ad6e90c8b76c811788e73783a995d642aad554c6d5fd43316a2d7ae") throw new Error(`lavender bytes drift ${lavSha}`);
const outDir = resolve("agents/arthur/reviews/fauna52-yham");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const ME = readFileSync("client/lib/motioneval.js", "utf8"); // unmodified evaluator

// the exact comp payloads the placer sends (mirrored in fauna52-place-yham.ts)
const COMPS = [
  { part: "yham_a", m: { type: "bob", amp: 0.004, period: 3.6, phase: 0.0, t0: 1 } },
  { part: "yham_a_head", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.16, period: 1.3, phase: 0.2, t0: 1 } },
  { part: "yham_a_tail", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.14, period: 2.2, phase: 1.2, t0: 1 } },
  { part: "yham_b", m: { type: "bob", amp: 0.004, period: 4.2, phase: 1.7, t0: 1 } },
  { part: "yham_b_head", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.22, period: 6.5, phase: 0.6, t0: 1 } },
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
const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:1})); ground.rotation.x=-Math.PI/2; ground.position.set(-40,0,58); ground.receiveShadow=true; scene.add(ground);
const loader=new GLTFLoader(); const shade=(root)=>root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
// LONE: pair recentred on the ground (identity judging)
const lone=(await loader.loadAsync('/model-yham.glb')).scene; scene.add(lone);
lone.updateMatrixWorld(true);
{ const bb=new THREE.Box3().setFromObject(lone);
  const c=bb.getCenter(new THREE.Vector3());
  lone.position.x-=c.x; lone.position.z-=c.z; lone.position.y-=bb.min.y; }
shade(lone); lone.updateMatrixWorld(true);
// HEDGE COMPOSITE: world-frame, live tuples (frame-copy seat)
const hedge=(await loader.loadAsync('/model-hedge.glb')).scene; hedge.position.set(-35.34,0.04,62.14); hedge.rotation.y=-2.36; hedge.visible=false; scene.add(hedge); shade(hedge);
const lav=(await loader.loadAsync('/model-lav.glb')).scene; lav.position.set(-39.58,0.04,62.89); lav.rotation.y=2.36; lav.visible=false; scene.add(lav); shade(lav);
const hedYh=(await loader.loadAsync('/model-yham.glb')).scene; hedYh.position.set(-34.603,1.48,60.539); hedYh.rotation.y=-2.36; hedYh.visible=false; scene.add(hedYh); shade(hedYh);
const LONE_ON=()=>{lone.visible=true;hedge.visible=false;lav.visible=false;hedYh.visible=false;};
const HEDGE_ON=()=>{lone.visible=false;hedge.visible=true;lav.visible=true;hedYh.visible=true;};
// bind part bases on the COMPOSITE pair (the placement read drives motion)
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts={};
for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(hedYh,c.part);
  if(p) parts[c.part]={p, base:{pos:p.position.toArray(), quat:p.quaternion.toArray(), rot:p.rotation.toArray()}, m:c.m}; }
window.stats={yhNodes:(await loader.loadAsync('/model-yham.glb')).scene.children.length};
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
    lone_near:()=>{LONE_ON();camera.position.set(0,0.34,1.7);camera.lookAt(0,0.10,0);},
    lone_profile:()=>{LONE_ON();camera.position.set(0.0,0.18,0.55);camera.lookAt(0,0.10,0);},
    // aimed per-subject probes (fauna-4 law; camera from the reader side —
    // the composite reader is local +z, so probes stand +z and look -z)
    lone_cockface:()=>{LONE_ON();camera.position.set(0.86,0.22,0.55);camera.lookAt(0.35,0.13,-0.05);},
    lone_henface:()=>{LONE_ON();camera.position.set(-0.55,0.22,0.72);camera.lookAt(-0.35,0.12,0.06);},
    // HEDGE composite, world frame. Reader lines (fauna-40 law f):
    // - the stile stop (-45.25,54.45) is the nearest approach reader,
    //   12.3m SW of the seat — the walk-up vantage.
    hedge_approach:()=>{HEDGE_ON();camera.position.set(-45.25,1.65,54.45);camera.lookAt(-34.603,1.55,60.539);},
    // - 18m on the same line, behind the stile (the long read).
    hedge_gameplay:()=>{HEDGE_ON();camera.position.set(-50.2,1.65,51.6);camera.lookAt(-34.603,1.55,60.539);},
    hedge_scope:()=>{HEDGE_ON();camera.fov=7;camera.position.set(-50.2,1.65,51.6);camera.lookAt(-34.603,1.52,60.539);camera.updateProjectionMatrix();},
    // - the discover stop: 3m NW of the seat on the stroll side, eye at
    //   crown height — birds at eye level against the canopy.
    hedge_near:()=>{HEDGE_ON();camera.position.set(-36.9,1.62,58.4);camera.lookAt(-34.603,1.58,60.539);},
    // - the dovecote-stroll read: from the dovecote side looking NE back
    //   at the hedge crown (the stroll reader's parting view).
    hedge_stroll:()=>{HEDGE_ON();camera.position.set(-47.5,1.65,63.5);camera.lookAt(-34.603,1.5,60.539);},
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
window.frameDiff=(a,b)=>{ if(!a||b&&a.length!==b.length) return -1;
  let n=0; const row=[];
  for(let i=0;i<a.length;i+=4){ if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>18){
    n++; row.push(Math.floor((i/4)%960)); } } window.lastDiffRows=row; return n; };
window.rinfo=()=>({tri:renderer.info.render.triangles,calls:renderer.info.render.calls});
// warm-yellow presence probe at hedge_scope: the cock's head-yellow reads
// against canopy greens (mechanical presence proof; canopy greens run
// g≥r, the yellow runs r>g strongly)
window.yellowProbe=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const img=x.getImageData(0,0,c.width,c.height).data;
  let n=0;
  for(let i=0;i<img.length;i+=4){ const r=img[i],g=img[i+1],b=img[i+2];
    if(r>150&&g>120&&b<110&&r>b+70&&g>b+50&&Math.abs(r-g)<70) n++; }
  return n; }
window.setView('hedge_gameplay'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/model-yham.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(yhBytes); }
    if (url === "/model-hedge.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(hedgeBytes); }
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
for (const v of ["lone_gameplay", "lone_near", "lone_profile", "lone_cockface", "lone_henface", "hedge_approach", "hedge_gameplay", "hedge_scope", "hedge_near", "hedge_stroll"]) {
  await page.evaluate(() => (window as any).setFill(false));
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  counts[v] = await page.evaluate(() => (window as any).colorCount());
  await grab(`new-${v}.png`);
}
console.log("unique colors:", JSON.stringify(counts));
// fill-lit anatomy probes (fauna-7 law b, disclosed)
for (const v of ["lone_cockface", "lone_henface"]) {
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.evaluate(() => (window as any).setFill(true));
  await page.waitForTimeout(40);
  await grab(`new-${v}-fill.png`);
  await page.evaluate(() => (window as any).setFill(false));
}
for (const [v, n] of Object.entries(counts)) {
  const floor = (v === "lone_gameplay" || v.startsWith("hedge_")) ? 60 : 300;
  if ((n as number) < floor) throw new Error(`view ${v} looks blank (${n} colors)`);
}
// yellow presence probe at hedge_scope (18m long read): the cock's head
// must carry distinguishable warm-yellow px against the canopy
await page.evaluate(() => (window as any).setView("hedge_scope"));
const yellowPx = await page.evaluate(() => (window as any).yellowProbe());
console.log("yellow presence probe (hedge_scope):", yellowPx);
if (yellowPx < 40) throw new Error(`cock yellow not present at 18m scope (${yellowPx} px)`);
// motion pair at the discover framing: t=0.9s vs t=8.3s — all 5 comps far
// from phase coincidence
await page.evaluate(() => (window as any).setView("hedge_near"));
await page.evaluate((t: any) => (window as any).setPhase(t), 0.9);
await grab("new-motion-hedge_near-a.png");
const fa: any = await page.evaluate(() => (window as any).frame());
await page.evaluate((t: any) => (window as any).setPhase(t), 8.3);
await grab("new-motion-hedge_near-b.png");
const fb: any = await page.evaluate(() => (window as any).frame());
const diff = await page.evaluate(([a, b]: any) => (window as any).frameDiff(a, b), [fa, fb] as any);
const rows: any = await page.evaluate(() => (window as any).lastDiffRows);
const band = rows.length ? `${Math.min(...rows)}-${Math.max(...rows)} (of 960)` : "none";
console.log(`motion pair hedge_near: ${diff} px differ, x band ${band}`);
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close();
server.close();
console.log(`wrote fauna52 yham renders -> ${outDir}`);
