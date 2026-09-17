// fauna5-render-fox.ts — review renders for the fauna-5 den fox.
// Chassis: fauna4-render-hutch.ts (module-scope render law — async loadAsync
// at top level, evaluate only calls sync setters).
// TWO scenes: LONE (fox recentred — identity/anatomy judging) and COMPOSITE
// (den GLB at origin unrotated + fox at den-local (0.84, 0.012, 0.38)
// yaw 0.34 — the REAL placement read: warm curl beside the dark mouth,
// back to the anchor stone, spoil fanning -z).
// Motion pairs at comp-gameplay + comp-near driven by the REAL client
// closed forms — motioneval.js pendulumTheta for head/tail, evalPart bob
// VERBATIM from client/lib/motion.js for the breathing body.
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const foxBytes = readFileSync("agents/arthur/assets/village_dress_se_fox2.glb");
const denBytes = readFileSync("agents/arthur/assets/village_dress_se_foxden1.glb");
const outDir = resolve("agents/arthur/reviews/fauna5-fox");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const ME = readFileSync("client/lib/motioneval.js", "utf8"); // unmodified evaluator

// the exact comp payloads the placer sends (mirrored in fauna5-place-fox.ts)
const COMPS = [
  { part: "fox", m: { type: "bob", amp: 0.006, period: 3.4, phase: 0.0, t0: 1 } },
  { part: "fox_head", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.07, period: 5.2, phase: 1.7, t0: 1 } },
  { part: "fox_tail", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.10, period: 2.8, phase: 2.6, t0: 1 } },
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
const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.MeshStandardMaterial({color:0x3d3a29,roughness:1})); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const loader=new GLTFLoader();
const shade=(root)=>root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
// LONE: fox recentred on the ground (identity judging)
const lone=(await loader.loadAsync('/model-fox.glb')).scene; scene.add(lone);
lone.updateMatrixWorld(true);
{ const bb=new THREE.Box3().setFromObject(lone);
  const c=bb.getCenter(new THREE.Vector3());
  lone.position.x-=c.x; lone.position.z-=c.z; lone.position.y-=bb.min.y; }
shade(lone); lone.updateMatrixWorld(true);
// COMPOSITE: den at origin (its own local frame = placement frame), fox at
// den-local (0.84, 0.012, 0.38) yaw 0.34 — the anchor-math placement read
const den=(await loader.loadAsync('/model-den.glb')).scene; den.visible=false; scene.add(den); shade(den);
const compFox=(await loader.loadAsync('/model-fox.glb')).scene; compFox.visible=false; scene.add(compFox);
compFox.position.set(0.84,0.012,0.38); compFox.rotation.y=0.34; shade(compFox);
const LONE_ON=()=>{lone.visible=true;den.visible=false;compFox.visible=false;};
const COMP_ON=()=>{lone.visible=false;den.visible=true;compFox.visible=true;};
window.stats={foxNodes:(await loader.loadAsync('/model-fox.glb')).scene.children.length};
// bind part bases on the COMPOSITE fox (the placement read drives motion)
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts={};
for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(compFox,c.part);
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
    lone_gameplay:()=>{LONE_ON();camera.position.set(0,1.65,18);camera.lookAt(0,0.15,0);},
    lone_near:()=>{LONE_ON();camera.position.set(0,0.9,5);camera.lookAt(0,0.15,0);},
    lone_ultra:()=>{LONE_ON();camera.position.set(0,0.4,1.2);camera.lookAt(0,0.16,0);},
    lone_closeface:()=>{LONE_ON();camera.position.set(0.9,0.35,0.9);camera.lookAt(0,0.16,0);},
    lone_back:()=>{LONE_ON();camera.position.set(0,0.5,-1.6);camera.lookAt(0,0.15,0);},
    // composite: den local frame; visitor approach = +x (the meadow side)
    comp_gameplay:()=>{COMP_ON();camera.position.set(18,1.65,0.2);camera.lookAt(0.6,0.3,0.2);},
    comp_near:()=>{COMP_ON();camera.position.set(5,0.9,0.4);camera.lookAt(0.6,0.25,0.3);},
    comp_ultraface:()=>{COMP_ON();camera.position.set(1.95,0.35,0.42);camera.lookAt(0.84,0.15,0.38);},
  };
  views[name](); renderer.render(scene,camera); };
window.setNight=(on)=>{scene.background.set(on?0x111827:0xcbd6df);hemi.intensity=on?.18:2;ambient.intensity=on?.04:.45;sun.intensity=on?.15:3.2;};
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
window.setView('comp_gameplay'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/model-fox.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(foxBytes); }
    if (url === "/model-den.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(denBytes); }
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
await page.evaluate(() => (window as any).setNight(false));
const counts: any = {};
for (const v of ["lone_gameplay", "lone_near", "lone_ultra", "lone_closeface", "lone_back", "comp_gameplay", "comp_near", "comp_ultraface"]) {
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  counts[v] = await page.evaluate(() => (window as any).colorCount());
  await grab(`new-${v}.png`);
}
console.log("unique colors:", JSON.stringify(counts));
// lone_gameplay: a 0.75m fox ALONE at 18m is sub-2% of frame (struct-45
// framing law) — the contract 18m read for this subject is the COMPOSITE
// (fox at its den). Gate the lone 18m at >100 (rendered, not blank).
for (const [v, n] of Object.entries(counts)) {
  const floor = v === "lone_gameplay" ? 100 : 400;
  if ((n as number) < floor) throw new Error(`view ${v} looks blank (${n} colors)`);
}
// motion pairs at both composite framings: t=5.0s vs t=19.0s — head sway
// 5.2s and tail flick 2.8s both land far from phase; breathing moved too.
for (const framing of ["comp_gameplay", "comp_near"]) {
  await page.evaluate((s: any) => (window as any).setView(s), framing);
  await page.evaluate((t: any) => (window as any).setPhase(t), 5.0);
  await grab(`new-motion-${framing}-a.png`);
  const fa: any = await page.evaluate(() => (window as any).frame());
  await page.evaluate((t: any) => (window as any).setPhase(t), 19.0);
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
console.log(`wrote fauna5 fox renders -> ${outDir}`);
