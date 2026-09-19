// fauna48-render-sparrow.ts — review renders for the fauna-48 house
// sparrows. Chassis: fauna45-render-hmou.ts (module-scope render law).
// TWO scenes: LONE (pair recentred — identity/anatomy judging) and MILL
// COMPOSITE (world-frame, LIVE upload bytes village_windmill_overhaul.glb
// sha a557d918… == live lib prefix EXACT, local bytes hash-verified) at
// the live tuple (−40,0,0) yaw π/2 + the sparrows at the swept seat
// (−34.9,0,−1.45) yaw −2.616 — the REAL placement read: sparrows on the
// south apron of the open east door). Ground = meadow #4a5d33 (robin
// rig law). Motion pairs at mill_near driven by the REAL client closed
// forms — motioneval.js pendulumTheta for the peck/scan/flick, evalPart
// bob VERBATIM from client/lib/motion.js for the breathing.
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const spBytes = readFileSync("agents/arthur/assets/village_dress_sparrow1.glb");
const spSha = createHash("sha256").update(spBytes).digest("hex");
if (spSha !== "0ed41633502eea52a59820162b453241d971f92b9429c23f742bd0f93d18d326") throw new Error(`sparrow bytes drift ${spSha}`);
const millBytes = readFileSync("agents/arthur/assets/village_windmill_overhaul.glb");
const millSha = createHash("sha256").update(millBytes).digest("hex");
if (millSha !== "a557d918b2c14f1ab5f0e0e066f2720d4f16b3364c9ce854971a68310fa6f296") throw new Error(`mill bytes drift ${millSha}`);
const outDir = resolve("agents/arthur/reviews/fauna48-sparrow");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const ME = readFileSync("client/lib/motioneval.js", "utf8"); // unmodified evaluator

// the exact comp payloads the placer sends (mirrored in fauna48-place-sparrow.ts)
const COMPS = [
  { part: "sparrow_a", m: { type: "bob", amp: 0.004, period: 3.4, phase: 0.0, t0: 1 } },
  { part: "sparrow_a_head", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.18, period: 2.3, phase: 0.3, t0: 1 } },
  { part: "sparrow_a_tail", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.16, period: 2.1, phase: 1.2, t0: 1 } },
  { part: "sparrow_b", m: { type: "bob", amp: 0.004, period: 4.0, phase: 1.7, t0: 1 } },
  { part: "sparrow_b_head", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.22, period: 6.5, phase: 0.6, t0: 1 } },
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
// LONE: pair recentred on the ground (identity judging)
const lone=(await loader.loadAsync('/model-sparrow.glb')).scene; scene.add(lone);
lone.updateMatrixWorld(true);
{ const bb=new THREE.Box3().setFromObject(lone);
  const c=bb.getCenter(new THREE.Vector3());
  lone.position.x-=c.x; lone.position.z-=c.z; lone.position.y-=bb.min.y; }
shade(lone); lone.updateMatrixWorld(true);
// MILL COMPOSITE: world-frame, live tuples (y quashed to grade)
const mill=(await loader.loadAsync('/model-mill.glb')).scene; mill.position.set(-40,0,0); mill.rotation.y=Math.PI/2; mill.visible=false; scene.add(mill); shade(mill);
const millSp=(await loader.loadAsync('/model-sparrow.glb')).scene; millSp.position.set(-34.9,0,-1.45); millSp.rotation.y=-2.616; millSp.visible=false; scene.add(millSp); shade(millSp);
const LONE_ON=()=>{lone.visible=true;mill.visible=false;millSp.visible=false;};
const MILL_ON=()=>{lone.visible=false;mill.visible=true;millSp.visible=true;};
// bind part bases on the COMPOSITE pair (the placement read drives motion)
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts={};
for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(millSp,c.part);
  if(p) parts[c.part]={p, base:{pos:p.position.toArray(), quat:p.quaternion.toArray(), rot:p.rotation.toArray()}, m:c.m}; }
window.stats={spNodes:(await loader.loadAsync('/model-sparrow.glb')).scene.children.length};
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
    lone_near:()=>{LONE_ON();camera.position.set(0,0.32,1.6);camera.lookAt(-0.02,0.07,0);},
    lone_profile:()=>{LONE_ON();camera.position.set(-0.02,0.18,0.5);camera.lookAt(-0.02,0.07,0);},
    lone_cockface:()=>{LONE_ON();camera.position.set(0.32,0.12,0.24);camera.lookAt(0.10,0.06,0.12);},
    lone_henface:()=>{LONE_ON();camera.position.set(-0.02,0.16,0.35);camera.lookAt(-0.08,0.07,-0.06);},
    // MILL composite, world frame. Reader lines (fauna-40 law f: cameras
    // derive from the seat's true approach):
    // - the road reader walks W from the gate end (−19.5,0) toward the
    //   mill door; the 18m vantage stands due E of the seat on its line.
    mill_gameplay:()=>{MILL_ON();camera.position.set(-17.0,1.65,-1.45);camera.lookAt(-34.9,0.2,-1.45);},
    mill_scope:()=>{MILL_ON();camera.fov=7;camera.position.set(-17.0,1.65,-1.45);camera.lookAt(-34.9,0.1,-1.45);camera.updateProjectionMatrix();},
    // - the discover vantage: stepping out of the open door heading E,
    //   then looking BACK — camera EAST of the pair looking W: birds
    //   foreground, mill face + gallery rising behind them (judge r1
    //   caught the inverted camera: the mill-side camera had the mill
    //   behind the LENS, out of frame).
    mill_near:()=>{MILL_ON();camera.position.set(-33.1,1.35,-0.55);camera.lookAt(-34.9,0.25,-1.45);},
    // - the walk-down: mid road, mill looming over the pair's spot.
    mill_approach:()=>{MILL_ON();camera.position.set(-26.5,1.65,0.4);camera.lookAt(-35.2,0.4,-1.2);},
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
// warm-values probe at lone_near: sparrow browns/buffs distinct from the
// meadow ground (mechanical presence proof; meadow (99,116,66) — sparrow
// values run warmer: r>g, both mid-band)
window.warmProbe=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const img=x.getImageData(0,0,c.width,c.height).data;
  let n=0;
  for(let i=0;i<img.length;i+=4){ const r=img[i],g=img[i+1],b=img[i+2];
    if(r>110&&r<215&&g>85&&g<180&&b<130&&r>g+6&&g>b+8) n++; }
  return n; }
window.setView('mill_gameplay'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/model-sparrow.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(spBytes); }
    if (url === "/model-mill.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(millBytes); }
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
for (const v of ["lone_gameplay", "lone_near", "lone_profile", "lone_cockface", "lone_henface", "mill_gameplay", "mill_scope", "mill_near", "mill_approach"]) {
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
  const floor = (v === "lone_gameplay" || v === "mill_near" || v === "mill_approach") ? 60 : 300;
  if ((n as number) < floor) throw new Error(`view ${v} looks blank (${n} colors)`);
}
// warm-coat presence probe at lone_near (a mill-free frame): sparrow
// warm values distinct from the meadow ground (mechanical presence proof)
await page.evaluate(() => (window as any).setView("lone_near"));
const warmPx = await page.evaluate(() => (window as any).warmProbe());
console.log("warm presence probe (lone_near sparrow-brown px):", warmPx);
if (warmPx < 120) throw new Error(`sparrow warm coats not present in lone_near (${warmPx} px)`);
// motion pair at the discover framing: t=0.9s vs t=8.3s — all 5 comps far
// from phase coincidence
await page.evaluate(() => (window as any).setView("mill_near"));
await page.evaluate((t: any) => (window as any).setPhase(t), 0.9);
await grab("new-motion-mill_near-a.png");
const fa: any = await page.evaluate(() => (window as any).frame());
await page.evaluate((t: any) => (window as any).setPhase(t), 8.3);
await grab("new-motion-mill_near-b.png");
const fb: any = await page.evaluate(() => (window as any).frame());
const diff = await page.evaluate(([a, b]: any) => (window as any).frameDiff(a, b), [fa, fb] as any);
const rows: any = await page.evaluate(() => (window as any).lastDiffRows);
const band = rows.length ? `${Math.min(...rows)}-${Math.max(...rows)} (of 960)` : "none";
console.log(`motion pair mill_near: ${diff} px differ, x band ${band}`);
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close();
server.close();
console.log(`wrote fauna48 sparrow renders -> ${outDir}`);
