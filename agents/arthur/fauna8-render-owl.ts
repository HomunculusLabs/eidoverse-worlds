// fauna8-render-owl.ts — review renders for the fauna-8 barn owl.
// Chassis: fauna7-render-cat.ts (module-scope render law — async loadAsync
// at top level, evaluate only calls sync setters).
// TWO scenes: LONE (owl recentred — identity/anatomy judging) and YARD
// COMPOSITE (world-frame: stable at its LIVE tuple with local bytes at
// the live-equivalent build — NOTE: local stable GLB is stale vs live
// lib 0658345c; the stable is CONTEXT ONLY here (massing/silhouette),
// not a rider anchor — the owl is a freestanding post entity; no
// host-anchored claim rides on these renders) + the sign + bench for
// the yard read. Owl at (47.6, 0, 1.6) yaw 3.201 — the REAL placement
// read: owl-post on the livery east lawn watching the mowing margin.
// Motion pairs at yard_gameplay + yard_near driven by the REAL client
// closed forms — motioneval.js pendulumTheta for head/tail, evalPart
// bob VERBATIM from client/lib/motion.js for the breathing body.
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const owlBytes = readFileSync("agents/arthur/assets/village_dress_barnowl1.glb");
const stableBytes = readFileSync("agents/arthur/assets/village_stable3.glb");   // context massing
const benchBytes = readFileSync("agents/arthur/assets/village_stablebench3.glb");
const towerBytes = readFileSync("agents/arthur/assets/village_ruledtower3.glb"); // the TRUE east backdrop
const pergolaBytes = readFileSync("agents/arthur/assets/village_wavepergola3.glb"); // NE neighbor
const signBytes = readFileSync("agents/arthur/assets/village_sign_stable3.glb");  // live afee37dd9a5b5d67
const outDir = resolve("agents/arthur/reviews/fauna8-owl");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const ME = readFileSync("client/lib/motioneval.js", "utf8"); // unmodified evaluator

// the exact comp payloads the placer sends (mirrored in fauna8-place-owl.ts)
const COMPS = [
  { part: "barnowl", m: { type: "bob", amp: 0.006, period: 4.0, phase: 0.0, t0: 1 } },
  { part: "barnowl_head", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.35, period: 9.0, phase: 1.1, t0: 1 } },
  { part: "barnowl_tail", m: { type: "pendulum", axis: [2, 0, 1], pivot: [0, 0, 0], amp: 0.10, period: 3.1, phase: 2.2, t0: 1 } },
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
// sun variant (fauna-8): the live world runs a rated day cycle — an
// approach-facing surface is sunlit in the afternoon, shaded at morning.
// Gameplay gates judge BOTH positions; the range is the world's own.
window.setSunPM=(on)=>{sun.position.set(on?-8:8,12,on?-6:6);};
const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.MeshStandardMaterial({color:0x3d3a29,roughness:1})); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const loader=new GLTFLoader(); const shade=(root)=>root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
// LONE: owl recentred on the ground (identity judging)
const lone=(await loader.loadAsync('/model-owl.glb')).scene; scene.add(lone);
lone.updateMatrixWorld(true);
{ const bb=new THREE.Box3().setFromObject(lone);
  const c=bb.getCenter(new THREE.Vector3());
  lone.position.x-=c.x; lone.position.z-=c.z; lone.position.y-=bb.min.y; }
shade(lone); lone.updateMatrixWorld(true);
// YARD COMPOSITE: world-frame, live tuples (y quashed to 0 — flat grade;
// PY from terrain preflight seats the placed entity, not the render)
const stable=(await loader.loadAsync('/model-stable.glb')).scene; stable.position.set(43,0,0); stable.rotation.y=-1.571; stable.visible=false; scene.add(stable); shade(stable);
const bench=(await loader.loadAsync('/model-bench.glb')).scene; bench.position.set(42,0,6); bench.rotation.y=-1.571; bench.visible=false; scene.add(bench); shade(bench);
const tower=(await loader.loadAsync('/model-tower.glb')).scene; tower.position.set(58,0,0); tower.visible=false; scene.add(tower); shade(tower);
const pergola=(await loader.loadAsync('/model-pergola.glb')).scene; pergola.position.set(51,0,9); pergola.visible=false; scene.add(pergola); shade(pergola);
const sign=(await loader.loadAsync('/model-sign.glb')).scene; sign.position.set(40.9,0,0); sign.rotation.y=-1.571; sign.visible=false; scene.add(sign); shade(sign);
const yardOwl=(await loader.loadAsync('/model-owl.glb')).scene; yardOwl.position.set(48.8,0,4.2); yardOwl.rotation.y=2.89; yardOwl.visible=false; scene.add(yardOwl); shade(yardOwl);
const LONE_ON=()=>{lone.visible=true;stable.visible=false;bench.visible=false;tower.visible=false;pergola.visible=false;sign.visible=false;yardOwl.visible=false;};
const YARD_ON=()=>{lone.visible=false;stable.visible=true;bench.visible=true;tower.visible=true;pergola.visible=true;sign.visible=true;yardOwl.visible=true;};
window.stats={owlNodes:(await loader.loadAsync('/model-owl.glb')).scene.children.length};
// bind part bases on the YARD owl (the placement read drives motion)
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts={};
for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(yardOwl,c.part);
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
    lone_gameplay:()=>{LONE_ON();camera.position.set(0,1.65,18);camera.lookAt(0,1.4,0);},
    lone_near:()=>{LONE_ON();camera.position.set(1.5,2.9,5);camera.lookAt(0,2.7,0);},
    lone_face:()=>{LONE_ON();setFill(true);camera.position.set(0.75,2.66,0.75);camera.lookAt(0.06,2.66,0.12);},
    lone_side:()=>{LONE_ON();setFill(true);camera.position.set(0.0,2.75,1.4);camera.lookAt(-0.02,2.6,0.12);},
    lone_back:()=>{LONE_ON();camera.position.set(-1.1,2.9,0.0);camera.lookAt(0.0,2.55,0.12);},
    // yard composite, world frame, TRUE east-edge backdrop (ruledtower 58,0;
    // wavepergola 51,9; stable sign 40.9,0). Owl at the sky-lane seat
    // (48.8,4.2) yaw 2.89 — face/breast SW toward the road-end arrival.
    yard_gameplay:()=>{YARD_ON();camera.position.set(41.0,1.65,2.0);camera.lookAt(48.8,1.7,4.2);},
    yard_gameplay_pm:()=>{YARD_ON();camera.position.set(41.0,1.65,2.0);camera.lookAt(48.8,1.7,4.2);},
    yard_bench:()=>{YARD_ON();camera.position.set(42.3,1.2,5.4);camera.lookAt(48.8,2.5,4.2);},
    yard_bench_pm:()=>{YARD_ON();camera.position.set(42.3,1.2,5.4);camera.lookAt(48.8,2.5,4.2);},
    yard_near:()=>{YARD_ON();camera.position.set(46.3,1.65,4.2);camera.lookAt(48.8,2.4,4.2);},
    yard_near_pm:()=>{YARD_ON();camera.position.set(46.3,1.65,4.2);camera.lookAt(48.8,2.4,4.2);},
    yard_face:()=>{YARD_ON();setFill(true);camera.position.set(47.75,2.72,4.15);camera.lookAt(48.9,2.72,4.2);},
    yard_side:()=>{YARD_ON();setFill(true);camera.position.set(48.9,2.75,5.6);camera.lookAt(48.85,2.62,4.3);},
    yard_back:()=>{YARD_ON();camera.position.set(50.5,2.8,4.1);camera.lookAt(48.7,2.5,4.2);},
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
window.setView('yard_gameplay'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/model-owl.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(owlBytes); }
    if (url === "/model-stable.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(stableBytes); }
    if (url === "/model-bench.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(benchBytes); }
    if (url === "/model-tower.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(towerBytes); }
    if (url === "/model-pergola.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(pergolaBytes); }
    if (url === "/model-sign.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(signBytes); }
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
const SUNVIEWS = new Set(["yard_gameplay_pm", "yard_bench_pm", "yard_near_pm"]);
for (const v of ["lone_gameplay", "lone_near", "lone_face", "lone_side", "lone_back", "yard_gameplay", "yard_gameplay_pm", "yard_bench", "yard_bench_pm", "yard_near", "yard_near_pm", "yard_face", "yard_side", "yard_back"]) {
  await page.evaluate(() => (window as any).setFill(false));
  await page.evaluate((on: any) => (window as any).setSunPM(on), SUNVIEWS.has(v));
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  counts[v] = await page.evaluate(() => (window as any).colorCount());
  await grab(`new-${v}.png`);
}
console.log("unique colors:", JSON.stringify(counts));
for (const [v, n] of Object.entries(counts)) {
  const floor = v === "lone_gameplay" ? 100 : 400;
  if ((n as number) < floor) throw new Error(`view ${v} looks blank (${n} colors)`);
}
// motion pairs at both yard framings: t=3.7s vs t=17.3s — head scan 9.0s
// (amp .35: near-opposite yaw), tail 3.1s, breathing 4.0s
for (const framing of ["yard_gameplay", "yard_near"]) {
  await page.evaluate((s: any) => (window as any).setView(s), framing);
  await page.evaluate((t: any) => (window as any).setPhase(t), 3.7);
  await grab(`new-motion-${framing}-a.png`);
  const fa: any = await page.evaluate(() => (window as any).frame());
  await page.evaluate((t: any) => (window as any).setPhase(t), 17.3);
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
console.log(`wrote fauna8 owl renders -> ${outDir}`);
