// fauna24-render-turkey.ts — review renders for the fauna-24 turkeys.
// Chassis: fauna23-render-donkey.ts (module-scope render law — async
// loadAsync at top level, evaluate only calls sync setters). Ground =
// the WORLD MEADOW #4a5d33 (fauna-9 law). Views: gameplay 18m, four
// angles, near 5m, ultra 1.4m, closeface, top + AIMED tomface (strut
// head), fanprobe (the arc from a rear 3/4), henface (foraging head) —
// fauna-19 law d. MOTION PAIRS at gameplay + near driven by the REAL
// client closed forms — motioneval.js pendulumTheta, evalPart bob.
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const newBytes = readFileSync("agents/arthur/assets/village_dress_turkeys.glb");
const outDir = resolve("agents/arthur/reviews/fauna24-turkey");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const ME = readFileSync("client/lib/motioneval.js", "utf8"); // unmodified evaluator

// the exact comp payloads the placer sends (mirrored in fauna24-place-turkey.ts)
const COMPS = [
  { part: "turkey_a", m: { type: "bob", amp: 0.006, period: 4.3, phase: 0.3, t0: 1 } },
  { part: "turkey_a_head", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.28, period: 7.5, phase: 0.0, t0: 1 } },
  { part: "turkey_a_fan", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.05, period: 5.5, phase: 1.2, t0: 1 } },
  { part: "turkey_a_wings", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.05, period: 1.1, phase: 0.7, t0: 1 } },
  { part: "turkey_b", m: { type: "bob", amp: 0.005, period: 4.7, phase: 2.2, t0: 1 } },
  { part: "turkey_b_head", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.22, period: 2.9, phase: 0.8, t0: 1 } },
  { part: "turkey_b_tail", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.18, period: 2.2, phase: 1.5, t0: 1 } },
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
const gmat=new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:0.95,metalness:0});
const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),gmat); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const loader=new GLTFLoader();
const prep=async(url)=>{ const gltf=await loader.loadAsync(url); const root=gltf.scene; scene.add(root);
  root.updateMatrixWorld(true); const bb=new THREE.Box3().setFromObject(root);
  const size=bb.getSize(new THREE.Vector3()); const center=bb.getCenter(new THREE.Vector3());
  root.position.x-=center.x; root.position.z-=center.z; root.position.y-=bb.min.y;
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
// per-part lowest-vertex probe (fauna-13 v3 instrument: find WHO dips)
window.lowProbe=()=>{ const out={};
  const names=['turkey_a','turkey_a_head','turkey_a_fan','turkey_a_wings','turkey_b','turkey_b_head','turkey_b_tail'];
  for(const n of names){ const p=findPart(NEW.root,n); if(!p){out[n]='MISSING';continue;}
    const bb=new THREE.Box3().setFromObject(p); out[n]=+bb.min.y.toFixed(4); }
  return out; };
// motion sweep probe (fauna-19 law a): compose the comp transform at BOTH
// extremes offline — min/max x/z of each part's box across the sweep, to
// prove no furniture clipping at full amplitude before placement.
window.sweepProbe=()=>{ const out={};
  for(const k of Object.keys(parts)){ const {p,base,m}=parts[k];
    if(m.type!=='pendulum') continue;
    const ext={};
    for(const [label,theta] of [['min',-m.amp],['max',m.amp]]){
      rotatePartAtPivot(p,base,m.axis,m.pivot,theta);
      const bb=new THREE.Box3().setFromObject(p);
      ext[label]=[bb.min.x.toFixed(3),bb.min.z.toFixed(3),bb.max.x.toFixed(3),bb.max.z.toFixed(3)];
    }
    rotatePartAtPivot(p,base,m.axis,m.pivot,0); // restore base
    out[k]=ext; }
  return out; };
window.setView=(name)=>{ const size=NEW.bounds.size;
  const r=Math.max(size[0],size[2],1.2); const target=new THREE.Vector3(0,Math.max(0.45,size[1]*0.45),0);
  const views={ front:[0,1.3,r*2.6], right:[r*2.6,1.3,0],
    back:[0,1.3,-r*2.6], left:[-r*2.6,1.3,0],
    gameplay:[0,1.65,18], near:[0,1.3,5], ultra:[0,0.9,1.4],
    top:[0,Math.max(6,r*2.6),0.001], closeface:[0,1.0,4.2]};
  // aimed per-subject views (fauna-19 law d). Rig centering subtracts
  // bbox center (0.05, 0.10) → rig coords. Tom head entity (0.40,0.72,
  // 0.30) → rig (0.35, 0.72, 0.20); fan root rig (0.35, 0.60, −0.46);
  // hen head rig (−0.55, 0.12, 0.44).
  if(name==='tomface'){ camera.position.set(0.35,0.92,2.2); camera.lookAt(0.35,0.76,0.25); renderer.render(scene,camera); return; }
  if(name==='fanprobe'){ camera.position.set(1.9,0.95,-1.35); camera.lookAt(0.30,0.75,-0.35); renderer.render(scene,camera); return; }
  if(name==='henface'){ camera.position.set(-0.55,0.35,1.7); camera.lookAt(-0.55,0.10,0.44); renderer.render(scene,camera); return; }
  camera.position.fromArray(views[name]); camera.lookAt(target); renderer.render(scene,camera); };
window.setNight=(on)=>{scene.background.set(on?0x111827:0xcbd6df);hemi.intensity=on?.18:2;ambient.intensity=on?.04:.45;sun.intensity=on?.15:3.2;};
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
      res.writeHead(200, { "content-type": "text/javascript" });
      end: res.end(s); return;
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
console.log("lowProbe (ground=0; negative = digs):", JSON.stringify(await page.evaluate(() => (window as any).lowProbe())));
console.log("sweepProbe (part boxes at pendulum extremes):", JSON.stringify(await page.evaluate(() => (window as any).sweepProbe())));
if (stats.parts !== 7) throw new Error(`expected 7 parts, got ${stats.parts}`);

const grab = async (name: string) => {
  const dataUrl: string = await page.evaluate(() => (window as any).snap());
  writeFileSync(resolve(outDir, name), Buffer.from(dataUrl.split(",")[1], "base64"));
};
await page.evaluate(() => (window as any).setNight(false));
const counts: any = {};
for (const v of ["gameplay", "front", "right", "back", "left", "near", "ultra", "closeface", "top", "tomface", "fanprobe", "henface"]) {
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  counts[v] = await page.evaluate(() => (window as any).colorCount());
  await grab(`new-${v}.png`);
}
console.log("unique colors:", JSON.stringify(counts));
for (const [v, n] of Object.entries(counts)) if ((n as number) < 400) throw new Error(`view ${v} looks blank (${n} colors)`);
// motion pairs at both framings: t=4.0s vs t=16.0s (engine closed forms).
for (const framing of ["gameplay", "near"]) {
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
await page.evaluate(() => (window as any).setNight(true));
await page.evaluate(() => (window as any).setView("gameplay"));
await grab("new-night.png");
await page.evaluate(() => (window as any).setView("near"));
await grab("new-night-near.png");
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close();
server.close();
console.log(`wrote fauna24 turkey renders -> ${outDir}`);
