// fauna9-render-robin.ts — review renders for the fauna-9 robin.
// Chassis: fauna8-render-owl.ts (module-scope render law — async loadAsync
// at top level, evaluate only calls sync setters).
// TWO scenes: LONE (robin recentred — identity/anatomy judging) and POOL
// COMPOSITE (world-frame: reedpool + angler + ducks at their live tuples
// as CONTEXT (local reedpool3/angler3 bytes ≠ live re-encodes — massing/
// backdrop only, no rider claim rides on them; the ducks ARE the exact
// live c156b6a1 bytes). Robin at the FINAL seat (6.323, 0, -88.582) yaw
// -0.6153 (facing the pool center) — the water-margin foraging read.
// Vantages: bridge_near = the encounter face-on read (a pedestrian on
// the crossing looks straight down the robin's facing axis, 4.6m);
// bank18 = the honest 18m gate from the N-bank walk (left flank + cocked
// tail + pool backdrop), AM+PM suns; bank_near = 5m profile.
// Motion pairs at bridge_near + lone_near driven by the REAL client
// closed forms — motioneval.js pendulumTheta for head/tail, evalPart bob
// VERBATIM for the breathing body.
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const robinBytes = readFileSync("agents/arthur/assets/village_dress_robin1.glb");
const poolBytes = readFileSync("agents/arthur/assets/village_reedpool3.glb");     // context massing
const anglerBytes = readFileSync("agents/arthur/assets/village_angler3.glb");     // context massing
const duckBytes = readFileSync("agents/arthur/assets/village_duckpair.glb");      // exact live bytes
const outDir = resolve("agents/arthur/reviews/fauna9-robin");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const ME = readFileSync("client/lib/motioneval.js", "utf8"); // unmodified evaluator

// the exact comp payloads the placer sends (mirrored in fauna9-place-robin.ts)
const COMPS = [
  { part: "robin", m: { type: "bob", amp: 0.006, period: 3.6, phase: 0.0, t0: 1 } },
  { part: "robin_head", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.30, period: 3.8, phase: 0.6, t0: 1 } },
  { part: "robin_tail", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.16, period: 2.4, phase: 1.4, t0: 1 } },
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
// probe fill (fauna-7 law): anatomy probes get a camera-side fill so
// materials judge true; gameplay/near placement reads keep world-lit look.
const fill=new THREE.DirectionalLight(0xffffff,0); fill.position.set(-6,4,10); scene.add(fill);
window.setFill=(on)=>{fill.intensity=on?1.4:0;};
window.setSunPM=(on)=>{sun.position.set(on?-8:8,12,on?-6:6);};
// ground plane 400×400: the reedpool seat (z −88) is OUTSIDE a ±80 plane —
// fauna-9 bank_near judged "floating against sky" on exactly that void
// (rig bug, not model bug — world terrain extends everywhere, heightAt works).
const ground=new THREE.Mesh(new THREE.PlaneGeometry(400,400),new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:1})); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground); // meadow layer #4a5d33 = the REAL village ground color (client/lib/build.js:766) — the old brown rig ground fabricated the brown-on-brown bank failure
const loader=new GLTFLoader(); const shade=(root)=>root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
// LONE: robin recentred on the ground (identity judging)
const lone=(await loader.loadAsync('/model-robin.glb')).scene; scene.add(lone);
lone.updateMatrixWorld(true);
{ const bb=new THREE.Box3().setFromObject(lone);
  const c=bb.getCenter(new THREE.Vector3());
  lone.position.x-=c.x; lone.position.z-=c.z; lone.position.y-=bb.min.y; }
shade(lone); lone.updateMatrixWorld(true);
// POOL COMPOSITE: world frame, live tuples (y quashed to 0 — flat grade;
// PY from terrain preflight seats the placed entity, not the render)
const pool=(await loader.loadAsync('/model-pool.glb')).scene; pool.position.set(9.723,0,-90.982); pool.visible=false; scene.add(pool); shade(pool);
const angler=(await loader.loadAsync('/model-angler.glb')).scene; angler.position.set(3.203,0,-90.982); angler.visible=false; scene.add(angler); shade(angler);
const ducks=(await loader.loadAsync('/model-ducks.glb')).scene; ducks.position.set(8,0,-91); ducks.visible=false; scene.add(ducks); shade(ducks);
const poolRobin=(await loader.loadAsync('/model-robin.glb')).scene; poolRobin.position.set(6.3,0,-86.35); poolRobin.rotation.y=3*Math.PI/2; poolRobin.visible=false; scene.add(poolRobin); shade(poolRobin);
// yaw law (checked the hard way, fauna-9): facing = (cos yaw, -sin yaw) — yaw +pi/2 faces -z (SOUTH, water); facing +z (N, the approach) needs 3*pi/2. Two judge rounds read the back.
const LONE_ON=()=>{lone.visible=true;pool.visible=false;angler.visible=false;ducks.visible=false;poolRobin.visible=false;};
const POOL_ON=()=>{lone.visible=false;pool.visible=true;angler.visible=true;ducks.visible=true;poolRobin.visible=true;};
window.stats={robinNodes:(await loader.loadAsync('/model-robin.glb')).scene.children.length};
// bind part bases on the POOL robin (the placement read drives motion)
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts={};
for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(poolRobin,c.part);
  if(p) parts[c.part]={p, base:{pos:p.position.toArray(), quat:p.quaternion.toArray(), rot:p.rotation.toArray()}, m:c.m}; }
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
  const views={
    lone_gameplay:()=>{LONE_ON();camera.position.set(0,1.65,18);camera.lookAt(0,0.25,0);},
    lone_near:()=>{LONE_ON();camera.position.set(0.55,0.95,5);camera.lookAt(0,0.16,0);},
    lone_face:()=>{LONE_ON();setFill(true);camera.position.set(0.34,0.26,0.42);camera.lookAt(0.14,0.13,0);},
    lone_side:()=>{LONE_ON();setFill(true);camera.position.set(-0.02,0.30,0.75);camera.lookAt(0.0,0.14,0);},
    // pool composite, world frame — the FINAL seat (6.3,-86.35) yaw pi/2:
    // grass OUTSIDE the N rim (bank decode fauna-9: the old in-basin seat
    // dangled below the rim — water 0.140-to-r3.0, bank ring r3.5-4.0),
    // facing N so the bib meets the village approach head-on.
    bank18:()=>{POOL_ON();camera.position.set(2.9,1.65,-69.4);camera.lookAt(6.3,0.15,-86.35);},
    bank18_pm:()=>{POOL_ON();camera.position.set(2.9,1.65,-69.4);camera.lookAt(6.3,0.15,-86.35);},
    bank_near:()=>{POOL_ON();camera.position.set(6.4,1.15,-81.85);camera.lookAt(6.3,0.12,-86.4);},
    bridge_near:()=>{POOL_ON();camera.position.set(10.4,1.85,-90.6);camera.lookAt(6.3,0.15,-86.4);},
    gate18:()=>{POOL_ON();camera.position.set(6.3,1.65,-68.35);camera.lookAt(6.3,0.15,-86.35);},
    gate18_pm:()=>{POOL_ON();camera.position.set(6.3,1.65,-68.35);camera.lookAt(6.3,0.15,-86.35);},
    gate_near:()=>{POOL_ON();camera.position.set(5.5,1.15,-82.2);camera.lookAt(6.3,0.12,-86.35);},
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
  return s.size; };
window.frame=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  return x.getImageData(0,0,c.width,c.height).data.slice(); };
window.frameDiff=(a,b)=>{ if(!a||!b||a.length!==b.length) return -1;
  let n=0; const row=[];
  for(let i=0;i<a.length;i+=4){ if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>18){
    n++; row.push(Math.floor((i/4)%960)); } } window.lastDiffRows=row; return n; };
window.rinfo=()=>({tri:renderer.info.render.triangles,calls:renderer.info.render.calls});
window.setView('bank18'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/model-robin.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(robinBytes); }
    if (url === "/model-pool.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(poolBytes); }
    if (url === "/model-angler.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(anglerBytes); }
    if (url === "/model-ducks.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(duckBytes); }
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
const SUNVIEWS = new Set(["bank18_pm", "gate18_pm"]);
for (const v of ["lone_gameplay", "lone_near", "lone_face", "lone_side", "bank18", "bank18_pm", "bank_near", "bridge_near"]) {
  await page.evaluate(() => (window as any).setFill(false));
  await page.evaluate((on: any) => (window as any).setSunPM(on), SUNVIEWS.has(v));
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  counts[v] = await page.evaluate(() => (window as any).colorCount());
  await grab(`new-${v}.png`);
}
console.log("unique colors:", JSON.stringify(counts));
for (const [v, n] of Object.entries(counts)) {
  const floor = v === "lone_gameplay" ? 60 : 300;
  if ((n as number) < floor) throw new Error(`view ${v} looks blank (${n} colors)`);
}
// motion pairs: t=1.0 vs t=3.44 — head theta -0.190 -> +0.300 (MAX swing
// 0.49 rad, solved from pendulumTheta directly; the first attempt used a
// full-period offset which freezes the head by construction — probe bug,
// not model bug). Framings are BOTH pool views (parts bind to poolRobin;
// pairing the lone clone moves an invisible model — second probe bug).
for (const framing of ["bank_near", "bridge_near"]) {
  await page.evaluate((s: any) => (window as any).setView(s), framing);
  await page.evaluate((t: any) => (window as any).setPhase(t), 1.0);
  await grab(`new-motion-${framing}-a.png`);
  const fa: any = await page.evaluate(() => (window as any).frame());
  await page.evaluate((t: any) => (window as any).setPhase(t), 3.44);
  await grab(`new-motion-${framing}-b.png`);
  const fb: any = await page.evaluate(() => (window as any).frame());
  const diff = await page.evaluate(([a, b]: any) => (window as any).frameDiff(a, b), [fa, fb] as any);
  const rows: any = await page.evaluate(() => (window as any).lastDiffRows);
  const band = rows.length ? `${Math.min(...rows)}-${Math.max(...rows)} (of 720)` : "none";
  console.log(`motion pair ${framing}: ${diff} px differ, row band ${band}`);
}
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close();
server.close();
console.log(`wrote fauna9 robin renders -> ${outDir}`);
