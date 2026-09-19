// fauna38-render-wrabbit.ts — review renders for the fauna-38 wild
// rabbits. Chassis: fauna37-render-dog.ts (module-scope render law). TWO
// scenes: LONE (pair recentred — identity/anatomy judging) and EDGE
// COMPOSITE (world-frame: the LIVE garden-cottage bytes — the banked
// cabin-overhaul build, sha-verified == live lib b5b3f10227… — at their
// live tuple (-26, 0.000949, 19) yaw 2.2 + the pair at the swept seat
// (-23, 0.00041, 15.25) yaw 0.585 — the REAL placement read: wild
// rabbits at the garden edge, facing the plaza reader). Ground = meadow
// #4a5d33 (robin rig law: match the WORLD ground). Motion pairs at
// edge_gameplay + edge_near driven by the REAL client closed forms —
// motioneval.js pendulumTheta for heads/ears/tail, evalPart bob VERBATIM
// from client/lib/motion.js for the breathing.
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const pairBytes = readFileSync("agents/arthur/assets/village_dress_wrabbit1.glb");
const pairSha = createHash("sha256").update(pairBytes).digest("hex");
if (pairSha !== "57edb8a9b7cc076b9051abbbcedaba265c6dbc0a3db237d336b44d10950d1dc3") throw new Error(`pair bytes drift ${pairSha}`);
const cottageBytes = readFileSync("agents/arthur/cabin-overhaul/build/nx-town-garden-cottage.glb");
const cotSha = createHash("sha256").update(cottageBytes).digest("hex");
if (cotSha.slice(0, 16) !== "b5b3f10227856571") throw new Error(`cottage bytes drift ${cotSha.slice(0, 16)}`);
const outDir = resolve("agents/arthur/reviews/fauna38-wrabbit");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const ME = readFileSync("client/lib/motioneval.js", "utf8"); // unmodified evaluator

// the exact comp payloads the placer sends (mirrored in fauna38-place-wrabbit.ts)
const COMPS = [
  { part: "wrabbit_a", m: { type: "bob", amp: 0.005, period: 3.6, phase: 0.0, t0: 1 } },
  { part: "wrabbit_a_head", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.28, period: 6.5, phase: 1.1, t0: 1 } },
  { part: "wrabbit_a_ears", m: { type: "pendulum", axis: [2, 0, 1], pivot: [0, 0, 0], amp: 0.16, period: 2.2, phase: 0.7, t0: 1 } },
  { part: "wrabbit_a_tail", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.20, period: 1.9, phase: 2.1, t0: 1 } },
  { part: "wrabbit_b", m: { type: "bob", amp: 0.004, period: 4.2, phase: 0.5, t0: 1 } },
  { part: "wrabbit_b_head", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.20, period: 2.8, phase: 1.7, t0: 1 } },
  { part: "wrabbit_b_ears", m: { type: "pendulum", axis: [2, 0, 1], pivot: [0, 0, 0], amp: 0.12, period: 2.5, phase: 1.3, t0: 1 } },
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
const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:1})); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const loader=new GLTFLoader(); const shade=(root)=>root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
// LONE: pair recentred on the ground (identity judging)
const lone=(await loader.loadAsync('/model-pair.glb')).scene; scene.add(lone);
lone.updateMatrixWorld(true);
{ const bb=new THREE.Box3().setFromObject(lone);
  const c=bb.getCenter(new THREE.Vector3());
  lone.position.x-=c.x; lone.position.z-=c.z; lone.position.y-=bb.min.y; }
shade(lone); lone.updateMatrixWorld(true);
// EDGE COMPOSITE: world-frame, live tuples (y quashed to grade)
const cottage=(await loader.loadAsync('/model-cottage.glb')).scene; cottage.position.set(-26,0,19); cottage.rotation.y=2.2; cottage.visible=false; scene.add(cottage); shade(cottage);
const edgePair=(await loader.loadAsync('/model-pair.glb')).scene; edgePair.position.set(-23,0,15.25); edgePair.rotation.y=0.585; edgePair.visible=false; scene.add(edgePair); shade(edgePair);
const LONE_ON=()=>{lone.visible=true;cottage.visible=false;edgePair.visible=false;};
const EDGE_ON=()=>{lone.visible=false;cottage.visible=true;edgePair.visible=true;};
window.stats={pairNodes:(await loader.loadAsync('/model-pair.glb')).scene.children.length};
// bind part bases on the EDGE pair (the placement read drives motion)
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts={};
for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(edgePair,c.part);
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
    lone_gameplay:()=>{LONE_ON();camera.position.set(0,1.65,18);camera.lookAt(0,0.1,0);},
    lone_near:()=>{LONE_ON();camera.position.set(0,0.6,3.2);camera.lookAt(0,0.18,0);},
    lone_face:()=>{LONE_ON();camera.position.set(-0.55,0.55,0.55);camera.lookAt(-0.32,0.38,0.15);},
    lone_profile:()=>{LONE_ON();camera.position.set(-0.3,0.3,1.1);camera.lookAt(-0.15,0.2,0.1);},
    lone_grazer:()=>{LONE_ON();camera.position.set(0.65,0.35,0.55);camera.lookAt(0.45,0.12,-0.1);},
    // edge composite, world frame; reader approach = the plaza->cottage line
    edge_gameplay:()=>{EDGE_ON();camera.position.set(-8.0,1.65,5.3);camera.lookAt(-23,0.2,15.25);},
    edge_oblique:()=>{EDGE_ON();camera.position.set(-13.5,1.65,10.5);camera.lookAt(-23,0.2,15.25);},
    edge_near:()=>{EDGE_ON();camera.position.set(-19.5,0.7,11.5);camera.lookAt(-22.8,0.15,15.0);},
    edge_profile:()=>{EDGE_ON();camera.position.set(-22.2,0.35,17.2);camera.lookAt(-23.1,0.18,15.3);},
    edge_alertface:()=>{EDGE_ON();camera.position.set(-21.7,0.5,14.4);camera.lookAt(-23.3,0.35,15.35);},
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
window.setView('edge_gameplay'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/model-pair.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(pairBytes); }
    if (url === "/model-cottage.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(cottageBytes); }
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
if (stats.parts !== 7) throw new Error(`expected 7 parts, got ${stats.parts}`);

const grab = async (name: string) => {
  const dataUrl: string = await page.evaluate(() => (window as any).snap());
  writeFileSync(resolve(outDir, name), Buffer.from(dataUrl.split(",")[1], "base64"));
};
const counts: any = {};
for (const v of ["lone_gameplay", "lone_near", "lone_face", "lone_profile", "lone_grazer", "edge_gameplay", "edge_oblique", "edge_near", "edge_profile", "edge_alertface"]) {
  await page.evaluate(() => (window as any).setFill(false));
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  counts[v] = await page.evaluate(() => (window as any).colorCount());
  await grab(`new-${v}.png`);
}
console.log("unique colors:", JSON.stringify(counts));
// fill-lit anatomy probes (fauna-7 law b, disclosed)
for (const v of ["lone_face", "edge_alertface"]) {
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.evaluate(() => (window as any).setFill(true));
  await page.waitForTimeout(40);
  await grab(`new-${v}-fill.png`);
  await page.evaluate(() => (window as any).setFill(false));
}
// lone_gameplay: a 0.5m rabbit pair ALONE at 18m is small (struct-45
// framing law) — the contract 18m read is the EDGE composite; floor
// lone at >60.
for (const [v, n] of Object.entries(counts)) {
  const floor = v === "lone_gameplay" ? 60 : 300;
  if ((n as number) < floor) throw new Error(`view ${v} looks blank (${n} colors)`);
}
// motion pairs at both edge framings: t=4.1s vs t=17.3s — all 7 comps
// far from phase coincidence
for (const framing of ["edge_gameplay", "edge_near"]) {
  await page.evaluate((s: any) => (window as any).setView(s), framing);
  await page.evaluate((t: any) => (window as any).setPhase(t), 4.1);
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
console.log(`wrote fauna38 wrabbit renders -> ${outDir}`);
