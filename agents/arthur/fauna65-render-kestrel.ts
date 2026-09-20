// fauna65-render-kestrel.ts — review renders for the fauna-65 kestrel.
// Chassis: fauna34-render-swallows.ts (module-scope render law). Serves the
// kestrel entity AT ITS SEAT FRAME (root at local 0 == world (57.5, PY≈−0.02,
// −24) yaw −2.4) with the SE-edge context at world-true RELATIVE poses:
// pheasants + snag + woodpecker + deer (exact-live local bytes), chainvault
// + northneedle as decoded envelope blocks (disclosed). Meadow ground
// #4a5d33 (robin rig law a).
// Views: spoke18 — the TRUE 18m plaza-spoke vantage world (40.9,−17.1);
// encounter 4.2m; side plan; ground view looking UP; aimed face/rear probes
// along ±front; night. HEAD-LOCK PROOF: project kestr_head to screen px at
// bob-phase +1 and −1 — identical px while the body anchor moves. MOTION
// PAIRS at spoke18/encounter/ground, t=6.0 vs 6.6 — REAL closed forms
// (orbit face:false + bob + pendulum flap + tail wag, rotatePartAtPivot
// verbatim; kestr_head carries NO comp — the stillness IS the lock).
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const birdBytes = readFileSync("agents/arthur/assets/village_fauna65_kestrel.glb");
const SHA = createHash("sha256").update(birdBytes).digest("hex");
console.log("kestrel sha256:", SHA);
const pheasBytes = readFileSync("agents/arthur/assets/village_dress_pheas1.glb");
const snagBytes = readFileSync("agents/arthur/assets/village_dress_se_snagdead1.glb");
const woodpBytes = readFileSync("agents/arthur/assets/village_dress_woodp1.glb");
const deerBytes = readFileSync("agents/arthur/assets/village_dress_deer1.glb");
const outDir = resolve("agents/arthur/reviews/fauna65-kestrel");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const ME = readFileSync("client/lib/motioneval.js", "utf8");

// the exact comp payloads the placer sends (mirrored in fauna65-place-kestrel.ts)
const COMPS = [
  { part: "kestr", m: { type: "orbit", center: [0, 6.0, 0], radius: 0.4, degPerSec: 6, phase: 0, face: false, t0: 1 } },
  { part: "kestr_body", m: { type: "bob", amp: 0.035, period: 0.52, phase: 0, t0: 1 } },
  { part: "kestr_wingL", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: -0.40, period: 0.48, phase: 0, t0: 1 } },
  { part: "kestr_wingR", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.40, period: 0.48, phase: 0, t0: 1 } },
  { part: "kestr_tail", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.06, period: 0.9, phase: 1.2, t0: 1 } },
];

const html = `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#cbd6df}canvas{display:block}
</style><script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1); renderer.setSize(960,720); renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true; document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene(); scene.background=new THREE.Color(0xcbd6df);
const camera=new THREE.PerspectiveCamera(42,960/720,0.05,300);
const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2.0); scene.add(hemi);
const ambient=new THREE.AmbientLight(0xffffff,0.45); scene.add(ambient);
// sun high SW-of-vantage (front-lights the bird from the plaza side)
const sun=new THREE.DirectionalLight(0xfff1d4,3.0); sun.position.set(6,11,5); sun.castShadow=true; scene.add(sun);
const fill=new THREE.DirectionalLight(0xffffff,1.3); fill.position.set(-4,6,-8); scene.add(fill);
window.__fill=fill;
const fillT=new THREE.Object3D(); scene.add(fillT); fill.target=fillT; window.__fillT=fillT;
const gmat=new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:1,metalness:0});
const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),gmat); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
// envelope context blocks (disclosed: boxes, not meshes)
const cv=new THREE.Mesh(new THREE.BoxGeometry(7.6,2.83,7.24),new THREE.MeshStandardMaterial({color:0x6f6a62,roughness:.95}));
cv.position.set(6.86,2.83/2-0.028,-0.23); cv.rotation.y=1.178; cv.castShadow=true; scene.add(cv);
const nn=new THREE.Mesh(new THREE.BoxGeometry(3.46,13.34,4.0),new THREE.MeshStandardMaterial({color:0x6b6f6a,roughness:.95}));
nn.position.set(2.19,13.34/2-0.014,12.71); nn.rotation.y=2.4; nn.castShadow=true; scene.add(nn);
const loader=new GLTFLoader();
const load=async(url)=>{ const gltf=await loader.loadAsync(url); const root=gltf.scene; scene.add(root);
  root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}}); root.updateMatrixWorld(true); return root; };
const BIRD=await load('/kestrel.glb');
const PHEAS=await load('/pheas.glb'); PHEAS.position.set(-3.10,-0.0185,5.98); PHEAS.rotation.y=0.565;
const SNAG=await load('/snag.glb'); SNAG.position.set(-6.34,-0.026,2.33); SNAG.rotation.y=0.044;
const WOODP=await load('/woodp.glb'); WOODP.position.set(-6.34,-0.026,2.33); WOODP.rotation.y=0.044;
const DEER=await load('/deer.glb'); DEER.position.set(-5.02,-0.003,14.73); DEER.rotation.y=-0.1;
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts={};
for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(BIRD,c.part);
  if(p) parts[c.part]={p, base:{pos:p.position.toArray(), quat:p.quaternion.toArray()}, m:c.m}; }
window.stats={parts:Object.keys(parts).length};
const _ax=new THREE.Vector3(); const _q=new THREE.Quaternion(); const _qb=new THREE.Quaternion();
const _pv=new THREE.Vector3(); const _rp=new THREE.Vector3();
function evalPartCase(p, base, m, t){
  if(m.type==='orbit'){
    const c=m.center??base.pos; const r=m.radius??1;
    const a=(m.phase??0)+((m.degPerSec??12)*Math.PI/180)*t;
    p.position.set(c[0]+r*Math.sin(a),(c[1]??base.pos[1]),c[2]+r*Math.cos(a));
    if(m.face!==false) p.rotation.set(0,a+Math.PI/2,0); return;
  }
  if(m.type==='bob'){
    const off=Math.sin((2*Math.PI/(m.period??4))*t+(m.phase??0))*(m.amp??0.3);
    p.position.set(...base.pos); p.position.y+=off; return;
  }
  if(m.type==='pendulum'){
    const w0=(2*Math.PI)/(m.period??3.5);
    const theta=(m.amp??0.3)*Math.cos(w0*t+(m.phase??0));
    _ax.set(...(m.axis??[1,0,0])).normalize();
    _q.setFromAxisAngle(_ax,theta);
    _qb.fromArray(base.quat);
    p.quaternion.copy(_qb).multiply(_q);
    _pv.set(...(m.pivot??[0,0,0]));
    _rp.copy(_pv).applyQuaternion(_q);
    _pv.sub(_rp).applyQuaternion(_qb);
    p.position.set(...base.pos).add(_pv); return;
  }
}
// the bird's authored facing (front dir in rig frame) for aimed probes
const FRONT=new THREE.Vector3(0.937,0,0.348);
window.aimAtPart=(name,dist,mode)=>{ const pt=BIRD.getObjectByName(name); if(!pt) return false;
  pt.updateMatrixWorld(true); const wp=new THREE.Vector3(); pt.getWorldPosition(wp);
  const dir=mode==='face'?FRONT.clone():mode==='rear'?FRONT.clone().negate():new THREE.Vector3(-FRONT.z,0,FRONT.x);
  camera.position.copy(wp).addScaledVector(dir,dist); camera.position.y=wp.y+(mode==='face'?0.04:0.14);
  camera.lookAt(wp);
  if(window.__fill&&window.__fillT){ window.__fillT.position.copy(wp);
    window.__fill.position.copy(wp).addScaledVector(dir,3); window.__fill.position.y+=1.0; }
  renderer.render(scene,camera); return wp.toArray(); };
window.setView=(name)=>{ const views={
  spoke18:[16.90,1.63,6.13],
  encounter:[3.83,1.63,1.74],
  side:[0.4,8.0,4.5],
  ground:[1.6,0.9,2.6] };
  const tgt={spoke18:[0.4,5.2,0],encounter:[0.4,5.4,0],side:[0.4,6.0,0],ground:[0.4,6.0,0]}[name];
  camera.position.fromArray(views[name]); camera.lookAt(...tgt); renderer.render(scene,camera); };
window.setNight=(on)=>{scene.background.set(on?0x111827:0xcbd6df);hemi.intensity=on?.18:2;ambient.intensity=on?.04:.45;sun.intensity=on?.15:3;};
window.setPhase=(tSec)=>{ for(const k of Object.keys(parts)){ const {p,base,m}=parts[k];
  const t=Math.max(0,(tSec*1000+1 - m.t0)/1000);
  evalPartCase(p,base,m,t); } };
window.projOf=(name)=>{ const pt=BIRD.getObjectByName(name); if(!pt) return null;
  pt.updateMatrixWorld(true); const wp=new THREE.Vector3(); pt.getWorldPosition(wp);
  const sp=wp.project(camera); return [(sp.x*0.5+0.5)*960,( -sp.y*0.5+0.5)*720]; };
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
window.setView('spoke18'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/kestrel.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(birdBytes); }
    if (url === "/pheas.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(pheasBytes); }
    if (url === "/snag.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(snagBytes); }
    if (url === "/woodp.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(woodpBytes); }
    if (url === "/deer.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(deerBytes); }
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
if (stats.parts !== 5) throw new Error(`expected 5 moving parts (head carries NONE — the lock), got ${stats.parts}`);

const grab = async (name: string) => {
  const dataUrl: string = await page.evaluate(() => (window as any).snap());
  writeFileSync(resolve(outDir, name), Buffer.from(dataUrl.split(",")[1], "base64"));
};
await page.evaluate(() => (window as any).setPhase(6.0));
const counts: any = {};
for (const v of ["spoke18", "encounter", "side", "ground"]) {
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  counts[v] = await page.evaluate(() => (window as any).colorCount());
  await grab(`new-${v}.png`);
}
// aimed probes: face (mustache/cere), rear (tail fan + band), side (span+dihedral)
for (const [mode, dist] of [["face", 0.8], ["rear", 0.9], ["side", 0.85]] as [string, number][]) {
  const wp: any = await page.evaluate(([m, d]: any) => (window as any).aimAtPart("kestr_head", d, m), [mode, dist] as any);
  await page.waitForTimeout(60);
  await grab(`new-${mode}-kestrel.png`);
  counts[mode] = await page.evaluate(() => (window as any).colorCount());
  console.log(`aimed ${mode} at ${JSON.stringify(wp.map((v: number) => +v.toFixed(2)))}`);
}
// HEAD-LOCK PROOF: head screen-px identical at bob extremes; body anchor moves
await page.evaluate(() => (window as any).setView("encounter"));
const lock: any = {};
for (const [label, t] of [["bobUp", 0.13], ["bobDown", 0.39]] as [string, number][]) {
  await page.evaluate((tt: any) => (window as any).setPhase(tt), t);
  lock[label] = await page.evaluate(() => ({
    head: (window as any).projOf("kestr_head"),
    body: (window as any).projOf("kestr_body"),
  }));
}
const dh = Math.hypot(lock.bobUp.head[0] - lock.bobDown.head[0], lock.bobUp.head[1] - lock.bobDown.head[1]);
const db = Math.hypot(lock.bobUp.body[0] - lock.bobDown.body[0], lock.bobUp.body[1] - lock.bobDown.body[1]);
console.log(`HEAD-LOCK: head px shift ${dh.toFixed(2)} (want <0.5) | body px shift ${db.toFixed(2)} (want >2)`);
console.log(JSON.stringify(lock));
// motion pairs: t=6.0 vs 6.6 (orbit 3.6°, bob ~1.15 cycles, wings ~1.25)
await page.evaluate(() => (window as any).setPhase(6.0));
for (const framing of ["spoke18", "encounter", "ground"]) {
  await page.evaluate((s: any) => (window as any).setView(s), framing);
  await page.evaluate((t: any) => (window as any).setPhase(t), 6.0);
  await grab(`new-motion-${framing}-a.png`);
  const fa: any = await page.evaluate(() => (window as any).frame());
  await page.evaluate((t: any) => (window as any).setPhase(t), 6.6);
  await grab(`new-motion-${framing}-b.png`);
  const fb: any = await page.evaluate(() => (window as any).frame());
  const diff = await page.evaluate(([a, b]: any) => (window as any).frameDiff(a, b), [fa, fb] as any);
  const rows: any = await page.evaluate(() => (window as any).lastDiffRows);
  const band = rows.length ? `${Math.min(...rows)}-${Math.max(...rows)} (of 720)` : "none";
  console.log(`motion pair ${framing}: ${diff} px differ, row band ${band}`);
}
await page.evaluate(() => (window as any).setNight(true));
await page.evaluate(() => (window as any).setView("spoke18"));
await grab("new-night.png");
console.log("unique colors:", JSON.stringify(counts));
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close();
server.close();
console.log(`wrote fauna65 kestrel renders -> ${outDir}`);
console.log("SHA256=" + SHA);
