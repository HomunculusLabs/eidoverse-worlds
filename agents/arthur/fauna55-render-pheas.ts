// fauna55-render-pheas.ts — review renders for the fauna-55 pheasants.
// Chassis: fauna50-render-kfish.ts (module-scope render law). TWO
// scenes: LONE (pheas envelope-recentred on the ground — identity/
// anatomy judging, per-bird AIMED cameras) and SNAG COMPOSITE
// (world-frame, local snag bytes village_dress_se_snagdead1.glb —
// sha16 7ac83203… == live lib prefix EXACT, hash-verified in-script)
// at the live tuple (60.60,-0.046,-30.00) yaw -2.356 + the pheasants
// at the swept seat (55.75,-0.03754,-30.5) yaw -1.835 — the REAL
// placement read on the plaza reader spoke. Ground = meadow #4a5d33
// (robin rig law). Motion pairs at snag_compose driven by the REAL
// client closed forms — motioneval.js pendulumTheta + evalPart bob
// VERBATIM. NO night pass (zero emissives — night-read law n/a).
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const phBytes = readFileSync("agents/arthur/assets/village_dress_pheas1.glb");
const phSha = createHash("sha256").update(phBytes).digest("hex");
if (phSha !== "793f6fabad825b88aa639353a775a430b1fe768f538640a7ac1c9a00f1bcb744") throw new Error(`pheas bytes drift ${phSha}`);
const snagBytes = readFileSync("agents/arthur/assets/village_dress_se_snagdead1.glb");
const snagSha = createHash("sha256").update(snagBytes).digest("hex");
if (!snagSha.startsWith("7ac8320374482a3c")) throw new Error(`snag bytes drift ${snagSha.slice(0, 16)}`);
const outDir = resolve("agents/arthur/reviews/fauna55-pheas");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const ME = readFileSync("client/lib/motioneval.js", "utf8"); // unmodified evaluator

// the exact comp payloads the placer sends (mirrored in fauna55-place-pheas.ts)
const COMPS = [
  { part: "pheas_a", m: { type: "bob", amp: 0.005, period: 4.4, phase: 0.0, t0: 1 } },
  { part: "pheas_a_head", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.26, period: 7.5, phase: 0.8, t0: 1 } },
  { part: "pheas_a_tail", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0.14, 0], amp: 0.06, period: 5.5, phase: 1.4, t0: 1 } },
  { part: "pheas_b", m: { type: "bob", amp: 0.004, period: 5.0, phase: 2.1, t0: 1 } },
  { part: "pheas_b_head", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.20, period: 8.5, phase: 1.9, t0: 1 } },
  { part: "pheas_b_tail", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0.16, 0], amp: 0.05, period: 6.2, phase: 0.5, t0: 1 } },
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
const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:1})); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const loader=new GLTFLoader(); const shade=(root)=>root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
// LONE: envelope-recentred on the ground (fauna-4 law c: cameras aimed
// at the SUBJECTS, not the centroid — the pair is 0.7m apart, both get
// aimed views)
const lone=(await loader.loadAsync('/model-pheas.glb')).scene; scene.add(lone);
lone.updateMatrixWorld(true);
{ const bb=new THREE.Box3().setFromObject(lone);
  const c=bb.getCenter(new THREE.Vector3());
  lone.position.x-=c.x; lone.position.z-=c.z; lone.position.y-=bb.min.y; }
shade(lone); lone.updateMatrixWorld(true);
// recompute bird world centers AFTER recentre for aimed cameras
const loneBox=()=>new THREE.Box3().setFromObject(lone);
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const cockC=(()=>{const p=findPart(lone,'pheas_a');const b=new THREE.Box3().setFromObject(p);return b.getCenter(new THREE.Vector3());})();
const henC=(()=>{const p=findPart(lone,'pheas_b');const b=new THREE.Box3().setFromObject(p);return b.getCenter(new THREE.Vector3());})();
// SNAG COMPOSITE: world-frame, live tuples
const snag=(await loader.loadAsync('/model-snag.glb')).scene; snag.position.set(60.60,-0.046,-30.00); snag.rotation.y=-2.356; snag.visible=false; scene.add(snag); shade(snag);
const snagPh=(await loader.loadAsync('/model-pheas.glb')).scene; snagPh.position.set(55.75,-0.03754,-30.5); snagPh.rotation.y=-1.835; snagPh.visible=false; scene.add(snagPh); shade(snagPh);
const LONE_ON=()=>{lone.visible=true;snag.visible=false;snagPh.visible=false;};
const SNAG_ON=()=>{lone.visible=false;snag.visible=true;snagPh.visible=true;};
const parts={};
for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(snagPh,c.part);
  if(p) parts[c.part]={p, base:{pos:p.position.toArray(), quat:p.quaternion.toArray(), rot:p.rotation.toArray()}, m:c.m}; }
window.stats={phNodes:(await loader.loadAsync('/model-pheas.glb')).scene.children.length};
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
  camera.fov=42; camera.updateProjectionMatrix();
  const views={
    lone_gameplay:()=>{LONE_ON();camera.position.set(0,1.65,18);camera.lookAt(0,0.3,0);},
    lone_near:()=>{LONE_ON();camera.position.set(-0.25,0.55,1.7);camera.lookAt(0.0,0.24,0.0);},
    // cock profile — the tail's contract view (fauna-4 law: judge the
    // tail from the side): camera ⊥ to the cock's body axis. His body
    // axis after internal yaw -0.85 is local dir (cos,-sin(-0.85)) =
    // (0.660, 0.751); the ⊥ direction is (0.751, -0.660) — camera on
    // the +z*⊥ side, lookAt down his body axis toward the tail
    lone_profile:()=>{LONE_ON();camera.position.set(cockC.x+0.751*1.3,0.42,cockC.z-0.660*1.3);camera.lookAt(cockC.x-0.660*0.45,0.2,cockC.z+0.751*0.45);},
    // cock face — the ring/wattle/green-head contract view (camera on
    // his facing line: facing dir (0.660,0.751) in his local x,z; camera
    // stands 0.85m out along facing, looks back at his head)
    lone_cockface:()=>{LONE_ON();camera.position.set(cockC.x+0.660*0.85,0.42,cockC.z+0.751*0.85);camera.lookAt(cockC.x+0.660*0.12,0.33,cockC.z+0.751*0.12);},
    // hen aimed — her skulk + mottle + eye-stripe
    lone_hen:()=>{LONE_ON();camera.position.set(henC.x,0.45,henC.z+1.0);camera.lookAt(henC.x,0.18,henC.z);},
    // SNAG COMPOSITE, world frame — VANTAGE LAW CORRECTED (v1 cameras
    // sat SE = BEHIND the pair: seat MINUS 18·U; the plaza reader stands
    // NW, seat PLUS 18·U, with the cock's FACE and the tail in profile
    // — the rear view foreshortened the tail to a shaft at the lens,
    // fauna-45 camera-axis law). U = plaza dir = (-0.897,+0.442).
    // - 18m dead-spoke: camera at seat+18U = (39.60,-22.54)
    snag_gameplay:()=>{SNAG_ON();camera.position.set(39.60,1.65,-22.54);camera.lookAt(55.75,0.2,-30.5);},
    // - 18m front-oblique (spoke+35°): U rotated -35° = (-0.481,+0.877)
    //   → camera (47.09,-14.71): the cock's face at 35°, tail broadside
    snag_gameplay_obl:()=>{SNAG_ON();camera.position.set(47.09,1.65,-14.71);camera.lookAt(55.75,0.2,-30.5);},
    // - 18m scope at the same front-oblique bearing (narrow FOV)
    snag_scope:()=>{SNAG_ON();camera.fov=7;camera.position.set(47.09,1.65,-14.71);camera.lookAt(55.75,0.25,-30.5);camera.updateProjectionMatrix();},
    // - composition: pair mid-ground, snag right-background (camera NW)
    snag_compose:()=>{SNAG_ON();camera.position.set(48.25,1.5,-26.0);camera.lookAt(58.0,0.3,-30.3);},
    // - discover: 3.2m stop at the reader quarter — 25° OFF the cock's
    //   facing axis (v1 sat dead-front: the ring foreshortened to a
    //   sliver edge-on, rooster-comb law; a quarter view reads bill +
    //   ring arc + both eyes)
    snag_near:()=>{SNAG_ON();camera.position.set(52.55,1.1,-30.30);camera.lookAt(55.62,0.20,-30.45);},
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
// pheasant probes at fill-lit lone views: COPPER body (warm r>g>b),
// PALE ring/bars/belly (near-white), dark-green head (g>r, g>b, dark)
window.copperProbe=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const img=x.getImageData(0,0,c.width,c.height).data;
  let n=0;
  for(let i=0;i<img.length;i+=4){ const r=img[i],g=img[i+1],b=img[i+2];
    if(r>110&&r>g+25&&g>b+8) n++; }
  return n; }
window.paleProbe=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const img=x.getImageData(0,0,c.width,c.height).data;
  let n=0;
  for(let i=0;i<img.length;i+=4){ const r=img[i],g=img[i+1],b=img[i+2];
    // warm-tan TAILLT bars (render ~152,136,108) AND near-white ring/
    // belly — two windows (hmou law d: calibrate to RENDERED values)
    if((r>165&&g>155&&b>135&&r>=g&&g>=b-8)||(r>128&&r<215&&r>b+28&&g>112&&g<200&&b<160)) n++; }
  return n; }
window.greenProbe=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const img=x.getImageData(0,0,c.width,c.height).data;
  let n=0;
  for(let i=0;i<img.length;i+=4){ const r=img[i],g=img[i+1],b=img[i+2];
    if(g>35&&g>r+12&&g>b+12&&r<70&&b<70) n++; }
  return n; }
window.topColors=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const img=x.getImageData(0,0,c.width,c.height).data; const m=new Map();
  for(let i=0;i<img.length;i+=4){ const k=(img[i]<<16)|(img[i+1]<<8)|img[i+2];
    m.set(k,(m.get(k)??0)+1); }
  const out=[];
  for(const [k,n] of [...m.entries()].sort((a,b)=>b[1]-a[1]).slice(0,30))
    out.push((((k>>16)&255))+','+(((k>>8)&255))+','+(k&255)+':'+n);
  return out; }
window.setView('snag_gameplay'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/model-pheas.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(phBytes); }
    if (url === "/model-snag.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(snagBytes); }
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
if (stats.parts !== 6) throw new Error(`expected 6 parts, got ${stats.parts}`);

const grab = async (name: string) => {
  const dataUrl: string = await page.evaluate(() => (window as any).snap());
  writeFileSync(resolve(outDir, name), Buffer.from(dataUrl.split(",")[1], "base64"));
};
const counts: any = {};
for (const v of ["lone_gameplay", "lone_near", "lone_profile", "lone_cockface", "lone_hen", "snag_gameplay", "snag_gameplay_obl", "snag_scope", "snag_compose", "snag_near"]) {
  await page.evaluate(() => (window as any).setFill(false));
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  counts[v] = await page.evaluate(() => (window as any).colorCount());
  await grab(`new-${v}.png`);
}
console.log("unique colors:", JSON.stringify(counts));
// fill-lit anatomy probes (fauna-7 law b, disclosed): cockface for the
// ring/wattle/green; profile for the barring
await page.evaluate(() => (window as any).setView("lone_cockface"));
await page.evaluate(() => (window as any).setFill(true));
await page.waitForTimeout(40);
await grab("new-lone_cockface-fill.png");
const topCF: any = await page.evaluate(() => (window as any).topColors());
console.log("top colors cockface (fill):", JSON.stringify(topCF.slice(0, 12)));
const paleFace = await page.evaluate(() => (window as any).paleProbe());
const greenFace = await page.evaluate(() => (window as any).greenProbe());
await page.evaluate(() => (window as any).setView("lone_profile"));
await page.waitForTimeout(40);
const paleProf = await page.evaluate(() => (window as any).paleProbe());
const copperProf = await page.evaluate(() => (window as any).copperProbe());
await grab("new-lone_profile-fill.png");
console.log(`probes: pale(ring) cockface ${paleFace} | green head cockface ${greenFace} | pale(bars+belly) profile ${paleProf} | copper profile ${copperProf}`);
if (paleFace < 60) throw new Error(`white ring not present at cockface (${paleFace} px)`);
if (greenFace < 40) throw new Error(`green head not present at cockface (${greenFace} px)`);
if (paleProf < 120) throw new Error(`pale barring not present at profile (${paleProf} px)`);
if (copperProf < 120) throw new Error(`copper body not present at profile (${copperProf} px)`);
await page.evaluate(() => (window as any).setFill(false));
// FILL-LIT near pass (fauna-7 law b, disclosed): the NW near vantage is
// BACKLIT by the rig sun (lights +x faces; camera sees -x) — the ring
// renders ~0.5x there. The fill is the sanctioned fixture that shows
// what the world's varying sun delivers on lit passes.
await page.evaluate(() => (window as any).setView("snag_near"));
await page.evaluate(() => (window as any).setFill(true));
await page.waitForTimeout(40);
await grab("new-snag_near-fill.png");
const nearFillWhite = await page.evaluate(() => (window as any).paleProbe());
console.log("pale probe snag_near (fill-lit):", nearFillWhite);
await page.evaluate(() => (window as any).setFill(false));
// motion pair at the composition framing: t=0.9s vs t=8.3s
await page.evaluate(() => (window as any).setView("snag_compose"));
await page.evaluate((t: any) => (window as any).setPhase(t), 0.9);
await grab("new-motion-snag_compose-a.png");
const fa: any = await page.evaluate(() => (window as any).frame());
await page.evaluate((t: any) => (window as any).setPhase(t), 8.3);
await grab("new-motion-snag_compose-b.png");
const fb: any = await page.evaluate(() => (window as any).frame());
const diff = await page.evaluate(([a, b]: any) => (window as any).frameDiff(a, b), [fa, fb] as any);
const rows: any = await page.evaluate(() => (window as any).lastDiffRows);
const band = rows.length ? `${Math.min(...rows)}-${Math.max(...rows)} (of 960)` : "none";
console.log(`motion pair snag_compose: ${diff} px differ, x band ${band}`);
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close();
server.close();
console.log(`wrote fauna55 pheas renders -> ${outDir}`);
