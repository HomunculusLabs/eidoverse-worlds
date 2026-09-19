// fauna44-render-sqrl.ts — review renders for the fauna-44 red squirrel.
// Chassis: fauna42-render-hog.ts (module-scope render law). TWO scenes:
// LONE (squirrel recentred — identity/anatomy judging) and COMPOSITE
// (world-frame: the LIVE NE-woodstack bytes — sha-verified == live lib
// 692bc54e… — at their live tuple (59.708,-0.032,51.781) yaw -2.3562 +
// the squirrel at the swept seat (59.602, 0.616, 52.028) yaw -3.927 —
// the REAL placement read: squirrels working the timberyard's log
// crown). Ground = meadow #4a5d33 (robin rig law: match the WORLD
// ground). Motion pairs at composite_near driven by the REAL client
// closed forms — motioneval.js pendulumTheta for head/ears/tail/paws,
// evalPart bob VERBATIM from client/lib/motion.js for the breathing.
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const sqrlBytes = readFileSync("agents/arthur/assets/village_dress_sqrl1.glb");
const sqrlSha = createHash("sha256").update(sqrlBytes).digest("hex");
if (sqrlSha !== "186f227d9a407e340a186d82336f01ab9b7103e836c658a1eb59aede33126a70") throw new Error(`sqrl bytes drift ${sqrlSha}`);
const woodBytes = readFileSync("agents/arthur/assets/village_dress_ne_woodstack1.glb");
const woodSha = createHash("sha256").update(woodBytes).digest("hex");
if (woodSha.slice(0, 16) !== "692bc54e02358cc1") throw new Error(`woodstack bytes drift ${woodSha.slice(0, 16)}`);
const outDir = resolve("agents/arthur/reviews/fauna44-sqrl");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const ME = readFileSync("client/lib/motioneval.js", "utf8"); // unmodified evaluator

// the exact comp payloads the placer sends (mirrored in fauna44-place-sqrl.ts)
const COMPS = [
  { part: "sqrl_a", m: { type: "bob", amp: 0.005, period: 4.2, phase: 0.0, t0: 1 } },
  { part: "sqrl_a_head", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.26, period: 7.0, phase: 0.2, t0: 1 } },
  { part: "sqrl_a_ears", m: { type: "pendulum", axis: [2, 0, 1], pivot: [0, 0, 0], amp: 0.16, period: 2.3, phase: 0.9, t0: 1 } },
  { part: "sqrl_a_paws", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.12, period: 2.8, phase: 1.3, t0: 1 } },
  { part: "sqrl_a_tail", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.10, period: 3.4, phase: 0.4, t0: 1 } },
  { part: "sqrl_b", m: { type: "bob", amp: 0.004, period: 4.8, phase: 0.5, t0: 1 } },
  { part: "sqrl_b_head", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.20, period: 2.9, phase: 0.2, t0: 1 } },
  { part: "sqrl_b_ears", m: { type: "pendulum", axis: [2, 0, 1], pivot: [0, 0, 0], amp: 0.12, period: 2.5, phase: 0.6, t0: 1 } },
  { part: "sqrl_b_tail", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.14, period: 2.2, phase: 0.1, t0: 1 } },
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
// probe fill (fauna-7 law b): anatomy probes get a camera-side fill so
// materials judge true; gameplay/near placement reads keep world light.
const fill=new THREE.DirectionalLight(0xffffff,0); fill.position.set(-6,4,10); scene.add(fill);
window.setFill=(on)=>{fill.intensity=on?1.4:0;};
// meadow ground — the WORLD's ground (robin rig law a: #4a5d33)
const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:1})); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const loader=new GLTFLoader(); const shade=(root)=>root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
// LONE: squirrel recentred on the ground (identity judging)
const lone=(await loader.loadAsync('/model-sqrl.glb')).scene; scene.add(lone);
lone.updateMatrixWorld(true);
{ const bb=new THREE.Box3().setFromObject(lone);
  const c=bb.getCenter(new THREE.Vector3());
  lone.position.x-=c.x; lone.position.z-=c.z; lone.position.y-=bb.min.y; }
shade(lone); lone.updateMatrixWorld(true);
// COMPOSITE: world-frame, live tuples (host + swept seat)
const wood=(await loader.loadAsync('/model-wood.glb')).scene; wood.position.set(59.708,-0.032,51.781); wood.rotation.y=-2.3562; wood.visible=false; scene.add(wood); shade(wood);
const compSqrl=(await loader.loadAsync('/model-sqrl.glb')).scene; compSqrl.position.set(59.602,0.616,52.028); compSqrl.rotation.y=-3.927; compSqrl.visible=false; scene.add(compSqrl); shade(compSqrl);
const LONE_ON=()=>{lone.visible=true;wood.visible=false;compSqrl.visible=false;};
const COMP_ON=()=>{lone.visible=false;wood.visible=true;compSqrl.visible=true;};
window.stats={sqrlNodes:(await loader.loadAsync('/model-sqrl.glb')).scene.children.length};
// bind part bases on the COMPOSITE squirrel (the placement read drives motion)
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts={};
for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(compSqrl,c.part);
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
  camera.fov=42; camera.updateProjectionMatrix(); // scope views narrow it; reset every call
  const views={
    lone_gameplay:()=>{LONE_ON();camera.position.set(0,1.65,18);camera.lookAt(0,0.15,0);},
    lone_near:()=>{LONE_ON();camera.position.set(0,0.42,2.2);camera.lookAt(0,0.15,0);},
    lone_face:()=>{LONE_ON();camera.position.set(0.34,0.34,1.05);camera.lookAt(0.0,0.20,0.42);},
    lone_profile:()=>{LONE_ON();camera.position.set(-0.02,0.26,1.25);camera.lookAt(-0.02,0.14,0);},
    // v3: AIMED runner view (fauna-19 law d — a two-animal entity needs
    // per-subject probes; lone_near faces the pair centroid and the runner
    // sits 0.9m behind it, occluded + perspective-shrunk)
    // v4: camera from the READER side (+x, the entity facing axis) at an
    // angle that puts the runner FOREGROUND-left — the r3 camera looked
    // along the pair line, the worst possible angle
    lone_runner:()=>{LONE_ON();camera.position.set(1.45,0.30,0.55);camera.lookAt(-0.25,-0.02,-0.45);},
    // composite, world frame; reader approach = plaza->timberyard line
    comp_gameplay:()=>{COMP_ON();camera.position.set(46.07,1.65,40.22);camera.lookAt(59.6,0.8,52.0);},
    // spotting scope: SAME camera position, narrow FOV — falsifies
    // "absent" vs "present but small" (robin-law disclosure tool)
    comp_scope:()=>{COMP_ON();camera.fov=7;camera.position.set(46.07,1.65,40.22);camera.lookAt(59.62,0.72,52.02);camera.updateProjectionMatrix();},
    comp_near:()=>{COMP_ON();camera.position.set(56.9,1.35,49.7);camera.lookAt(59.65,0.72,52.0);},
    comp_face:()=>{COMP_ON();camera.position.set(58.59,0.95,50.93);camera.lookAt(59.71,0.80,51.91);},
  };
  views[name](); renderer.render(scene,camera); };
window.setPhase=(tSec)=>{ for(const k of Object.keys(parts)){ const {p,base,m}=parts[k];
    const t=Math.max(0,(tSec*1000+1 - m.t0)/1000);
    if(m.type==='pendulum') rotatePartAtPivot(p,base,m.axis,m.pivot,pendulumTheta(m,t));
    else evalPartCase(p,base,m,t); } };
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
window.frameDiff=(a,b)=>{ if(!a||!b||a.length!==b.length) return -1;
  let n=0; const row=[];
  for(let i=0;i<a.length;i+=4){ if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>18){
    n++; row.push(Math.floor((i/4)%960)); } } window.lastDiffRows=row; return n; };
window.rinfo=()=>({tri:renderer.info.render.triangles,calls:renderer.info.render.calls});
window.russetProbe=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const img=x.getImageData(0,0,c.width,c.height).data;
  let n=0;
  for(let i=0;i<img.length;i+=4){ const r=img[i],g=img[i+1],b=img[i+2];
    if(r>100&&r<215&&g>35&&g<115&&b>20&&b<95&&r>g+35&&g>=b-8) n++; }
  return n; }
window.setView('comp_gameplay'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/model-sqrl.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(sqrlBytes); }
    if (url === "/model-wood.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(woodBytes); }
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
if (stats.parts !== 9) throw new Error(`expected 9 parts, got ${stats.parts}`);

const grab = async (name: string) => {
  const dataUrl: string = await page.evaluate(() => (window as any).snap());
  writeFileSync(resolve(outDir, name), Buffer.from(dataUrl.split(",")[1], "base64"));
};
const counts: any = {};
for (const v of ["lone_gameplay", "lone_near", "lone_face", "lone_profile", "lone_runner", "comp_gameplay", "comp_scope", "comp_near", "comp_face"]) {
  await page.evaluate(() => (window as any).setFill(false));
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  counts[v] = await page.evaluate(() => (window as any).colorCount());
  await grab(`new-${v}.png`);
}
console.log("unique colors:", JSON.stringify(counts));
// fill-lit anatomy probes (fauna-7 law b, disclosed)
for (const v of ["lone_face", "comp_face"]) {
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.evaluate(() => (window as any).setFill(true));
  await page.waitForTimeout(40);
  await grab(`new-${v}-fill.png`);
  await page.evaluate(() => (window as any).setFill(false));
}
// lone_gameplay: a 0.38m squirrel ALONE at 18m is framing-limited
// (struct-45 law) — the contract read is the encounter; floor lone at >60.
// comp_gameplay: 18m composite (stack + distant trees) carries plenty.
for (const [v, n] of Object.entries(counts)) {
  const floor = v === "lone_gameplay" ? 60 : 300;
  if ((n as number) < floor) throw new Error(`view ${v} looks blank (${n} colors)`);
}
// russet presence probe at comp_near: russet-red pixels distinct from
// the meadow/log palette (mechanical squirrel-presence proof)
await page.evaluate(() => (window as any).setView("comp_near"));
const rusPx = await page.evaluate(() => (window as any).russetProbe());
console.log("russet presence probe (comp_near russet px):", rusPx);
if (rusPx < 200) throw new Error(`squirrel russet not present in comp_near (${rusPx} px)`);
// motion pair at the encounter framing: t=2.1s vs t=12.7s — all 9 comps
// far from phase coincidence
await page.evaluate(() => (window as any).setView("comp_near"));
await page.evaluate((t: any) => (window as any).setPhase(t), 2.1);
await grab("new-motion-comp_near-a.png");
const fa: any = await page.evaluate(() => (window as any).frame());
await page.evaluate((t: any) => (window as any).setPhase(t), 12.7);
await grab("new-motion-comp_near-b.png");
const fb: any = await page.evaluate(() => (window as any).frame());
const diff = await page.evaluate(([a, b]: any) => (window as any).frameDiff(a, b), [fa, fb] as any);
const rows: any = await page.evaluate(() => (window as any).lastDiffRows);
const band = rows.length ? `${Math.min(...rows)}-${Math.max(...rows)} (of 960)` : "none";
console.log(`motion pair comp_near: ${diff} px differ, x band ${band}`);
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close();
server.close();
console.log(`wrote fauna44 sqrl renders -> ${outDir}`);
