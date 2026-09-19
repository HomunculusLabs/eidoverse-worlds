// fauna31-render-duckseat.ts — falsification renders for the fauna-31 duck
// waterline re-seat (BEFORE any live mutation — struct-104/152 law; fauna-27
// re-seat precedent). Two candidates on the TRUE decoded water plane:
//   CAND  = ducks at PY +0.06093 (water top 0.08093 − WL 0.02, build law)
//   CTRL  = ducks at PY −0.139 (the LIVE defect tuple — hulls buried)
// Discriminating vantage = the bank reader (walk-up N/NE approach, the
// walk-probe vantage family). Chassis: fauna3-render-ducks.ts verbatim
// (module-scope render law; engine water material; motion parts live at a
// mid-phase t=8.0s so the pair presents its ordinary idle life).
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const duckBytes = readFileSync("agents/arthur/assets/village_duckpair.glb");
const poolBytes = readFileSync("agents/arthur/assets/village_reedpool3.glb");
const outDir = resolve("agents/arthur/reviews/fauna31-duckseat");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const ME = readFileSync("client/lib/motioneval.js", "utf8");

// the exact comp payloads the placer sends (fauna3-place-ducks.ts)
const COMPS = [
  { part: "duck_a", m: { type: "bob", amp: 0.018, period: 3.8, phase: 0.0, t0: 1 } },
  { part: "duck_a_head", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.16, period: 3.1, phase: 1.3, t0: 1 } },
  { part: "duck_a_tail", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.28, period: 1.6, phase: 0.4, t0: 1 } },
  { part: "duck_b", m: { type: "orbit", center: [-2.3, 0.02, -0.75], radius: 0.55, degPerSec: 7, phase: Math.PI / 2, t0: 1 } },
  { part: "duck_b_head", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.22, period: 4.4, phase: 2.8, t0: 1 } },
  { part: "duck_b_tail", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.24, period: 1.9, phase: 1.1, t0: 1 } },
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
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x4a5d33);
const camera=new THREE.PerspectiveCamera(42,960/720,0.05,300);
const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2.0); scene.add(hemi);
const ambient=new THREE.AmbientLight(0xffffff,0.45); scene.add(ambient);
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(8,12,6); sun.castShadow=true; scene.add(sun);
// rig ground OUTSIDE the pool radius (bank meadow #4a5d33 — robin law (a))
const gmat=new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:0.95,metalness:0});
const ground=new THREE.Mesh(new THREE.PlaneGeometry(220,220),gmat); ground.rotation.x=-Math.PI/2; ground.position.y=0.058; ground.receiveShadow=true; scene.add(ground);
const loader=new GLTFLoader();
const prep=async(url)=>{ const gltf=await loader.loadAsync(url); const root=gltf.scene; scene.add(root);
  root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}}); root.updateMatrixWorld(true);
  return root; };
const POOL=await prep('/pool.glb');   // world reedpool host (water top y 0.140 local)
// TWO duck instances, candidate + control, SAME bytes
const CAND=await prep('/duck.glb');
const CTRL=await prep('/duck.glb');
// bind part bases (findPart semantics = world.js: exact name)
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts=[];
for(const root of [CAND,CTRL]){
  const bag={};
  for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(root,c.part);
    if(p) bag[c.part]={p, base:{pos:p.position.toArray(), quat:p.quaternion.toArray(), rot:p.rotation.toArray()}, m:c.m}; }
  parts.push(bag);
}
// rotatePartAtPivot — VERBATIM from client/lib/motion.js
const _q=new THREE.Quaternion(), _ax=new THREE.Vector3(), _pv=new THREE.Vector3(), _rp=new THREE.Vector3(), _qb=new THREE.Quaternion();
function rotatePartAtPivot(obj,pbase,axis,pivot,theta){
  _ax.set(...(axis??[0,1,0])).normalize(); _q.setFromAxisAngle(_ax,theta);
  _qb.fromArray(pbase.quat); obj.quaternion.copy(_qb).multiply(_q);
  _pv.set(...(pivot??[0,0,0])); _rp.copy(_pv).applyQuaternion(_q);
  _pv.sub(_rp).applyQuaternion(_qb); obj.position.set(...pbase.pos).add(_pv);
}
// evalPart bob + orbit cases — VERBATIM math from client/lib/motion.js
function evalPartCase(p, base, m, t){
  if(m.type==='bob'){
    const off=Math.sin((2*Math.PI/(m.period??4))*t+(m.phase??0))*ampOf(m,0.3);
    _ax.set(...axisOf(m,[0,1,0])).normalize();
    p.position.set(...base.pos).addScaledVector(_ax,off); return;
  }
  if(m.type==='orbit'){
    const c=m.center??base.pos; const r=m.radius??1;
    const a=(m.phase??0)+((m.degPerSec??12)*Math.PI/180)*t;
    p.position.set(c[0]+r*Math.sin(a),(c[1]??base.pos[1]),c[2]+r*Math.cos(a));
    if(m.face!==false) p.rotation.set(0,a+Math.PI/2,0); return;
  }
}
// rig frame == world frame: pool at world pose, ducks at world pose.
// CAND: PY +0.06093 (WL 0.02 below the true water top 0.08093).
// CTRL: PY -0.139 (live defect tuple).
POOL.position.set(9.723,-0.05907,-90.982); POOL.rotation.y=0;
CAND.position.set(8,0.06093,-91); CAND.rotation.y=0;
CTRL.position.set(8,-0.139,-91); CTRL.rotation.y=0;
scene.updateMatrixWorld(true);
window.stats={cand:[...CAND.position], ctrl:[...CTRL.position], pool:[...POOL.position]};
// bank vantage: eye 1.65m on the N/NE bank at ~7m stand-off, looking down at the water
window.setView=(which,name)=>{ const S=which==='cand'?CAND:CTRL;
  CAND.visible=(which==='cand'); CTRL.visible=(which==='ctrl'); // isolate: one pair per shot
  const cx=S.position.x, cz=S.position.z;
  const views={
    bank:[cx+3.0,1.65,cz+6.5],       // the walk-up bank reader, 7m stand-off, oblique
    bank_far:[cx+3.0,1.65,cz+11.0],  // 11.7m — the longer approach read
    bank_close:[cx+2.0,1.50,cz+4.0], // 4.5m encounter
    side:[cx+7,1.2,cz+0],
  };
  camera.position.fromArray(views[name]); camera.lookAt(new THREE.Vector3(cx,0.05,cz)); renderer.render(scene,camera); };
window.setPhase=(tSec)=>{ for(const bag of parts) for(const k of Object.keys(bag)){ const {p,base,m}=bag[k];
    const t=Math.max(0,(tSec*1000+1 - m.t0)/1000);
    if(m.type==='pendulum') rotatePartAtPivot(p,base,m.axis,m.pivot,pendulumTheta(m,t));
    else evalPartCase(p,base,m,t); } };
window.snap=()=>{renderer.render(scene,camera); return renderer.domElement.toDataURL('image/png');};
window.colorCount=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const d=x.getImageData(0,0,c.width,c.height).data; const s=new Set();
  for(let i=0;i<d.length;i+=4) s.add((d[i]<<16)|(d[i+1]<<8)|d[i+2]);
  return s.size; };
// waterline pixel probe: hull-vs-water band in each render
window.probeWaterline=(which)=>{ const S=which==='cand'?CAND:CTRL;
  renderer.render(scene,camera);
  const c=document.createElement('canvas'); c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const d=x.getImageData(0,0,c.width,c.height).data;
  // project the duck world WL point (8, 0.08093, -91) to screen via camera
  const v=new THREE.Vector3(8,0.08093,-91).project(camera);
  const px=Math.round((v.x+1)/2*960), py=Math.round((1-(v.y+1)/2)*720);
  return {px,py}; };
window.setView('cand','bank'); window.reviewReady=true;
</script>`;
const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/duck.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(duckBytes); }
    if (url === "/pool.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(poolBytes); }
    if (url === "/motioneval.js") { res.writeHead(200, { "content-type": "text/javascript" }); return res.end(ME); }
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

const grab = async (name: string) => {
  const dataUrl: string = await page.evaluate(() => (window as any).snap());
  writeFileSync(resolve(outDir, name), Buffer.from(dataUrl.split(",")[1], "base64"));
};
// mid-phase idle life for both instances (t=8.0s — an ordinary moment)
await page.evaluate((t: any) => (window as any).setPhase(t), 8.0);
const counts: any = {};
for (const which of ["cand", "ctrl"]) {
  for (const v of ["bank", "bank_far", "bank_close", "side"]) {
    await page.evaluate(([w, s]: any) => (window as any).setView(w, s), [which, v]);
    await page.waitForTimeout(60);
    counts[`${which}-${v}`] = await page.evaluate(() => (window as any).colorCount());
    await grab(`${which === "cand" ? "cand" : "ctrl"}-${v}.png`);
  }
}
console.log("unique colors:", JSON.stringify(counts));
for (const [v, n] of Object.entries(counts)) if ((n as number) < 400) throw new Error(`view ${v} looks blank (${n} colors)`);
// waterline probe points for the judge reference
for (const which of ["cand", "ctrl"]) {
  await page.evaluate((w: any) => (window as any).setView(w, "bank"), which);
  const p = await page.evaluate((w: any) => (window as any).probeWaterline(w), which);
  console.log(`waterline px (${which}, bank view):`, JSON.stringify(p));
}
await browser.close();
server.close();
console.log(`wrote fauna31 duckseat falsification renders -> ${outDir}`);
