// fauna42-render-hog.ts — review renders for the fauna-42 hedgehog.
// Chassis: fauna38-render-wrabbit.ts (module-scope render law). TWO
// scenes: LONE (hog recentred — identity/anatomy judging) and MARGIN
// COMPOSITE (world-frame: the LIVE garden-cottage bytes — sha-verified
// == live lib b5b3f10227… — at their live tuple (-26, 0, 19) yaw 2.2 +
// the hog at the swept seat (-27.5, 0, 26.5) yaw 0.767 — the REAL
// placement read: a hedgehog rootling the cottage's quiet NW back
// margin). Ground = meadow #4a5d33 (robin rig law: match the WORLD
// ground). Motion pairs at margin_near driven by the REAL client closed
// forms — motioneval.js pendulumTheta for head/snout, evalPart bob
// VERBATIM from client/lib/motion.js for the breathing.
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const hogBytes = readFileSync("agents/arthur/assets/village_dress_hog1.glb");
const hogSha = createHash("sha256").update(hogBytes).digest("hex");
if (hogSha !== "5fcd8dcec44ee2e3fea43e98cdc403f7e1f3f8573d5bc09896791e5dbbc24826") throw new Error(`hog bytes drift ${hogSha}`);
const cottageBytes = readFileSync("agents/arthur/cabin-overhaul/build/nx-town-garden-cottage.glb");
const cotSha = createHash("sha256").update(cottageBytes).digest("hex");
if (cotSha.slice(0, 16) !== "b5b3f10227856571") throw new Error(`cottage bytes drift ${cotSha.slice(0, 16)}`);
const outDir = resolve("agents/arthur/reviews/fauna42-hog");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const ME = readFileSync("client/lib/motioneval.js", "utf8"); // unmodified evaluator

// the exact comp payloads the placer sends (mirrored in fauna42-place-hog.ts)
const COMPS = [
  { part: "hog", m: { type: "bob", amp: 0.006, period: 4.4, phase: 0.0, t0: 1 } },
  { part: "hog_head", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.25, period: 9.5, phase: 0.3, t0: 1 } },
  { part: "hog_snout", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.18, period: 2.6, phase: 1.2, t0: 1 } },
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
// LONE: hog recentred on the ground (identity judging)
const lone=(await loader.loadAsync('/model-hog.glb')).scene; scene.add(lone);
lone.updateMatrixWorld(true);
{ const bb=new THREE.Box3().setFromObject(lone);
  const c=bb.getCenter(new THREE.Vector3());
  lone.position.x-=c.x; lone.position.z-=c.z; lone.position.y-=bb.min.y; }
shade(lone); lone.updateMatrixWorld(true);
// MARGIN COMPOSITE: world-frame, live tuples (y quashed to grade)
const cottage=(await loader.loadAsync('/model-cottage.glb')).scene; cottage.position.set(-26,0,19); cottage.rotation.y=2.2; cottage.visible=false; scene.add(cottage); shade(cottage);
const marginHog=(await loader.loadAsync('/model-hog.glb')).scene; marginHog.position.set(-27.5,0,26.5); marginHog.rotation.y=0.767; marginHog.visible=false; scene.add(marginHog); shade(marginHog);
const LONE_ON=()=>{lone.visible=true;cottage.visible=false;marginHog.visible=false;};
const MARGIN_ON=()=>{lone.visible=false;cottage.visible=true;marginHog.visible=true;};
window.stats={hogNodes:(await loader.loadAsync('/model-hog.glb')).scene.children.length};
// bind part bases on the MARGIN hog (the placement read drives motion)
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts={};
for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(marginHog,c.part);
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
    lone_gameplay:()=>{LONE_ON();camera.position.set(0,1.65,18);camera.lookAt(0,0.05,0);},
    lone_near:()=>{LONE_ON();camera.position.set(0,0.32,2.0);camera.lookAt(0.02,0.07,0);},
    lone_face:()=>{LONE_ON();camera.position.set(0.38,0.16,0.30);camera.lookAt(0.16,0.07,0);},
    lone_profile:()=>{LONE_ON();camera.position.set(-0.05,0.22,1.15);camera.lookAt(0.02,0.07,0);},
    lone_top:()=>{LONE_ON();camera.position.set(0.25,0.85,0.9);camera.lookAt(0,0,0);},
    // margin composite, world frame; reader approach = plaza->cottage line
    margin_gameplay:()=>{MARGIN_ON();camera.fov=42;camera.updateProjectionMatrix();camera.position.set(-42.2,1.65,35.3);camera.lookAt(-27.5,0.1,26.5);},
    // spotting scope: SAME camera position, narrow FOV — falsifies
    // "absent" vs "present but small" (robin-law disclosure tool).
    // vantage = the NW gallery-ring walker (mosaic 0052 E edge is 1m from
    // the hog); the plaza line runs THROUGH the carousel (judge r18m catch)
    margin_scope:()=>{MARGIN_ON();camera.fov=7;camera.position.set(-42.2,1.65,35.3);camera.lookAt(-27.5,0.09,26.5);camera.updateProjectionMatrix();},
    margin_near:()=>{MARGIN_ON();camera.position.set(-26.4,0.5,25.4);camera.lookAt(-27.55,0.08,26.55);},
    margin_face:()=>{MARGIN_ON();camera.position.set(-26.9,0.25,26.9);camera.lookAt(-27.55,0.08,26.55);},
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
window.domeProbe=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const img=x.getImageData(0,0,c.width,c.height).data;
  let n=0;
  for(let i=0;i<img.length;i+=4){ const r=img[i],g=img[i+1],b=img[i+2];
    if(r>40&&r<130&&g>28&&g<100&&b<70&&r>g&&g>=b-6) n++; }
  return n; };
window.setView('margin_gameplay'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/model-hog.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(hogBytes); }
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
if (stats.parts !== 3) throw new Error(`expected 3 parts, got ${stats.parts}`);

const grab = async (name: string) => {
  const dataUrl: string = await page.evaluate(() => (window as any).snap());
  writeFileSync(resolve(outDir, name), Buffer.from(dataUrl.split(",")[1], "base64"));
};
const counts: any = {};
for (const v of ["lone_gameplay", "lone_near", "lone_face", "lone_profile", "lone_top", "margin_gameplay", "margin_scope", "margin_near", "margin_face"]) {
  await page.evaluate(() => (window as any).setFill(false));
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  counts[v] = await page.evaluate(() => (window as any).colorCount());
  await grab(`new-${v}.png`);
}
console.log("unique colors:", JSON.stringify(counts));
// fill-lit anatomy probes (fauna-7 law b, disclosed)
for (const v of ["lone_face", "margin_face"]) {
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.evaluate(() => (window as any).setFill(true));
  await page.waitForTimeout(40);
  await grab(`new-${v}-fill.png`);
  await page.evaluate(() => (window as any).setFill(false));
}
// lone_gameplay: a 0.42m hedgehog ALONE at 18m is framing-limited
// (struct-45 law) — the contract read is the encounter; floor lone at >60.
// margin_near keeps a low camera (the honest walk-up vantage, mostly
// grass) — its floor is the DOME PRESENCE probe below, not raw colors.
for (const [v, n] of Object.entries(counts)) {
  const floor = (v === "lone_gameplay" || v === "margin_near") ? 60 : 300;
  if ((n as number) < floor) throw new Error(`view ${v} looks blank (${n} colors)`);
}
// dome presence probe at margin_near: spine-brown pixels distinct from
// the meadow ground + shadow (mechanical hog-presence proof)
await page.evaluate(() => (window as any).setView("margin_near"));
const domePx = await page.evaluate(() => (window as any).domeProbe());
console.log("dome presence probe (margin_near spine-brown px):", domePx);
if (domePx < 150) throw new Error(`hog dome not present in margin_near (${domePx} px)`);
// motion pair at the encounter framing: t=2.7s vs t=13.4s — all 3 comps
// far from phase coincidence
await page.evaluate(() => (window as any).setView("margin_near"));
await page.evaluate((t: any) => (window as any).setPhase(t), 2.7);
await grab("new-motion-margin_near-a.png");
const fa: any = await page.evaluate(() => (window as any).frame());
await page.evaluate((t: any) => (window as any).setPhase(t), 13.4);
await grab("new-motion-margin_near-b.png");
const fb: any = await page.evaluate(() => (window as any).frame());
const diff = await page.evaluate(([a, b]: any) => (window as any).frameDiff(a, b), [fa, fb] as any);
const rows: any = await page.evaluate(() => (window as any).lastDiffRows);
const band = rows.length ? `${Math.min(...rows)}-${Math.max(...rows)} (of 720)` : "none";
console.log(`motion pair margin_near: ${diff} px differ, row band ${band}`);
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close();
server.close();
console.log(`wrote fauna42 hog renders -> ${outDir}`);
