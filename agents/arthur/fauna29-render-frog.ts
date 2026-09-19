// fauna29-render-frog.ts — review renders for the fauna-29 pond frog.
// Chassis: fauna28-render-peahen.ts (module-scope render law — async
// loadAsync at top level, evaluate only calls sync setters). Ground = the
// WORLD'S OWN WATER (fauna-9 rig-ground law, applied to a surface species:
// the frog's ground IS the pool palette 0x506a78 + the same faint same-hue
// emissive the live water carries — a grass rig would fabricate the read).
// Views: gameplay 18m (framing-limited for a 0.07m-tall subject — robin
// law, pre-disclosed in the plan), encounter 4m (THE identity gate — the
// bank vantage the plan names), near 2m, ultra 0.8m, top 1.2m (the bridge
// reader looks DOWN — the pad's contract vantage), closeface, faceprobe
// (aimed at the eye bumps) + sideprofile (the crouch silhouette contract
// view — fauna-4 law b). MOTION PAIRS at gameplay + encounter driven by
// the REAL client closed forms — motioneval.js pendulumTheta, evalPart bob.
// No night pass: the frog carries no emissive/lamp companions (loop step
// 2c night law applies only to emissive species).
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const newBytes = readFileSync("agents/arthur/assets/village_dress_frog.glb");
const outDir = resolve("agents/arthur/reviews/fauna29-frog");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const ME = readFileSync("client/lib/motioneval.js", "utf8"); // unmodified evaluator

// the exact comp payloads the placer sends (mirrored in fauna29-place-frog.ts)
const COMPS = [
  { part: "frog", m: { type: "bob", amp: 0.004, period: 4.6, phase: 0.5, t0: 1 } },
  { part: "frog_head", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.20, period: 7.5, phase: 0.2, t0: 1 } },
  { part: "frog_throat", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.06, period: 2.1, phase: 1.1, t0: 1 } },
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
const fill=new THREE.DirectionalLight(0xffffff,0.85); fill.position.set(0,4,10); scene.add(fill);
// THE GROUND IS THE POOL WATER (live material mirrored: canon hue + the
// faint same-hue emissive the reedpool water carries — mkv3-reedpool.ts)
const wmat=new THREE.MeshStandardMaterial({color:0x506a78,roughness:0.25,metalness:0.5});
wmat.emissive=new THREE.Color(0x2e4a58); wmat.emissiveIntensity=0.45;
const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),wmat); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const loader=new GLTFLoader();
const prep=async(url)=>{ const gltf=await loader.loadAsync(url); const root=gltf.scene; scene.add(root);
  root.updateMatrixWorld(true); const bb=new THREE.Box3().setFromObject(root);
  const size=bb.getSize(new THREE.Vector3()); const center=bb.getCenter(new THREE.Vector3());
  root.position.x-=center.x; root.position.z-=center.z; // NO y shift —
  // the authored pad face y=0 IS the waterline (the slab cheek submerges)
  root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}}); root.updateMatrixWorld(true);
  return {root,bounds:{min:bb.min.toArray(),max:bb.max.toArray(),size:size.toArray(),center:center.toArray()}}; };
const NEW=await prep('/model-new.glb');
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts={};
for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(NEW.root,c.part);
  if(p) parts[c.part]={p, base:{pos:p.position.toArray(), quat:p.quaternion.toArray(), rot:p.rotation.toArray()}, m:c.m}; }
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
window.stats={newBounds:NEW.bounds, parts:Object.keys(parts).length};
// per-part lowest-vertex probe
window.lowProbe=()=>{ const out={};
  const names=['frog','frog_head','frog_throat'];
  for(const n of names){ const p=findPart(NEW.root,n); if(!p){out[n]='MISSING';continue;}
    const bb=new THREE.Box3().setFromObject(p); out[n]=+bb.min.y.toFixed(4); }
  return out; };
// motion sweep probe (fauna-19 law a): the head Y-scan + throat pulse must
// keep every element above the pad face (0) — no dig, no pad clip
window.sweepProbe=()=>{ const out={};
  for(const k of Object.keys(parts)){ const {p,base,m}=parts[k];
    if(m.type!=='pendulum') continue;
    const ext={};
    for(const [label,theta] of [['min',-m.amp],['max',m.amp]]){
      rotatePartAtPivot(p,base,m.axis,m.pivot,theta);
      const bb=new THREE.Box3().setFromObject(p);
      ext[label]=[bb.min.x.toFixed(3),bb.min.y.toFixed(3),bb.min.z.toFixed(3),bb.max.x.toFixed(3),bb.max.y.toFixed(3),bb.max.z.toFixed(3)];
    }
    rotatePartAtPivot(p,base,m.axis,m.pivot,0); // restore base
    out[k]=ext; }
  return out; };
window.setView=(name)=>{ const size=NEW.bounds.size;
  const r=Math.max(size[0],size[2],1.2); const target=new THREE.Vector3(0,0.05,0);
  const views={ front:[0,0.3,r*2.6], right:[r*2.6,0.3,0],
    back:[0,0.3,-r*2.6], left:[-r*2.6,0.3,0],
    gameplay:[0,1.65,18], encounter:[0,1.4,4], near:[0,0.5,2], ultra:[0,0.3,0.8],
    top:[0.001,1.2,0.001], closeface:[0,0.25,1.2]};
  // aimed views (fauna-19 law d). Rig centering subtracts bbox center
  // (0, 0.0145, −0.0045) → head joint (0, 0.030, 0.030) → rig
  // (0, 0.0375, 0.0345) after the +0.022 pad-face reseat. Cameras LOW —
  // the frog is 5cm tall.
  if(name==='faceprobe'){ camera.position.set(0,0.10,0.45); camera.lookAt(0,0.045,0.03); renderer.render(scene,camera); return; }
  if(name==='sideprofile'){ camera.position.set(0.55,0.08,0.05); camera.lookAt(0,0.03,0); renderer.render(scene,camera); return; }
  camera.position.fromArray(views[name]); camera.lookAt(target); renderer.render(scene,camera); };
window.setPhase=(tSec)=>{ for(const k of Object.keys(parts)){ const {p,base,m}=parts[k];
  const t=Math.max(0,(tSec*1000+1 - m.t0)/1000);
  if(m.type==='pendulum') rotatePartAtPivot(p,base,m.axis,m.pivot,pendulumTheta(m,t));
  else evalPartCase(p,base,m,t); } };
window.snap=()=>{renderer.render(scene,camera); return renderer.domElement.toDataURL('image/png'); };
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
window.setView('gameplay'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/model-new.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(newBytes); }
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
console.log("lowProbe (pad face=0; negative = digs):", JSON.stringify(await page.evaluate(() => (window as any).lowProbe())));
console.log("sweepProbe (part boxes at pendulum extremes):", JSON.stringify(await page.evaluate(() => (window as any).sweepProbe())));
if (stats.parts !== 3) throw new Error(`expected 3 parts, got ${stats.parts}`);

const grab = async (name: string) => {
  const dataUrl: string = await page.evaluate(() => (window as any).snap());
  writeFileSync(resolve(outDir, name), Buffer.from(dataUrl.split(",")[1], "base64"));
};
const counts: any = {};
for (const v of ["gameplay", "encounter", "near", "ultra", "top", "closeface", "faceprobe", "sideprofile", "front", "right"]) {
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  counts[v] = await page.evaluate(() => (window as any).colorCount());
  await grab(`new-${v}.png`);
}
console.log("unique colors:", JSON.stringify(counts));
// small-subject law (robin/fauna-28 class): the 18m view is inherently
// low-color (framing-limited, disclosed); blank-check floors per view.
// For the 18m DOT check, count pixels in the center band that differ from
// the background — the dot must EXIST even where detail cannot.
const dotCount: any = await page.evaluate(() => { const f = (window as any).frame();
  let n = 0;
  for (let y = 300; y < 460; y++) for (let x = 380; x < 580; x++) {
    const i = (y * 960 + x) * 4;
    if (Math.abs(f[i] - 81) + Math.abs(f[i + 1] - 106) + Math.abs(f[i + 2] - 120) > 30) n++;
  }
  return n; });
console.log("gameplay dot probe (center band, non-water px):", dotCount);
for (const [v, n] of Object.entries(counts)) {
    const floor = v === "gameplay" ? 40 : 400;
    if ((n as number) < floor) throw new Error(`view ${v} looks blank (${n} colors)`);
}
if (dotCount < 5) throw new Error(`gameplay dot missing (${dotCount} px)`);
// motion pairs at both framings: t=4.0s vs t=16.0s (engine closed forms).
for (const framing of ["gameplay", "encounter"]) {
  await page.evaluate((s: any) => (window as any).setView(s), framing);
  await page.evaluate((t: any) => (window as any).setPhase(t), 4.0);
  await grab(`new-motion-${framing}-a.png`);
  const fa: any = await page.evaluate(() => (window as any).frame());
  await page.evaluate((t: any) => (window as any).setPhase(t), 16.0);
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
console.log(`wrote fauna29 frog renders -> ${outDir}`);
