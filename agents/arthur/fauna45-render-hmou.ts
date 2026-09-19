// fauna45-render-hmou.ts — review renders for the fauna-45 harvest mouse.
// Chassis: fauna42-render-hog.ts (module-scope render law). TWO scenes:
// LONE (mouse recentred — identity/anatomy judging) and CART COMPOSITE
// CART COMPOSITE: world-frame, LIVE upload bytes (village_harvestcart3.glb,
// sha ee30d670… == the live lib prefix EXACTLY — this lib is served
// UN-re-encoded; the /library fetch returned the DRACO re-encode
// 2be1cb89 and needed DRACOLoader, so the rig uses the local upload
// bytes = pixel-identical to live) at the live tuple (12,0,36) yaw −2.6.
// the mouse at the swept seat (11, 0, 33.5) yaw 0.193 — the REAL
// placement read: a harvest mouse in its grass tuft beside the grain
// cart, on the NE meadow). Ground = meadow #4a5d33 (robin rig law).
// Motion pairs at cart_near driven by the REAL client closed forms —
// motioneval.js pendulumTheta for head/snout, evalPart bob VERBATIM
// from client/lib/motion.js for the breathing.
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const hmouBytes = readFileSync("agents/arthur/assets/village_dress_hmou1.glb");
const hmouSha = createHash("sha256").update(hmouBytes).digest("hex");
if (hmouSha !== "93ebddcbbda82774e51c535c12288fbc153f0151bf0a8de3bb612085ac332fa5") throw new Error(`hmou bytes drift ${hmouSha}`);
const cartBytes = readFileSync("agents/arthur/assets/village_harvestcart3.glb");
const cartSha = createHash("sha256").update(cartBytes).digest("hex");
if (cartSha.slice(0, 16) !== "ee30d6709625bf2f") throw new Error(`cart bytes drift ${cartSha.slice(0, 16)}`);
const outDir = resolve("agents/arthur/reviews/fauna45-hmou");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const ME = readFileSync("client/lib/motioneval.js", "utf8"); // unmodified evaluator

// the exact comp payloads the placer sends (mirrored in fauna45-place-hmou.ts)
const COMPS = [
  { part: "hmou", m: { type: "bob", amp: 0.004, period: 3.2, phase: 0.0, t0: 1 } },
  { part: "hmou_head", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.22, period: 8.0, phase: 0.4, t0: 1 } },
  { part: "hmou_snout", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.15, period: 2.2, phase: 1.0, t0: 1 } },
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
const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:1})); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const loader=new GLTFLoader(); const shade=(root)=>root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
// LONE: mouse recentred on the ground (identity judging)
const lone=(await loader.loadAsync('/model-hmou.glb')).scene; scene.add(lone);
lone.updateMatrixWorld(true);
{ const bb=new THREE.Box3().setFromObject(lone);
  const c=bb.getCenter(new THREE.Vector3());
  lone.position.x-=c.x; lone.position.z-=c.z; lone.position.y-=bb.min.y; }
shade(lone); lone.updateMatrixWorld(true);
// CART COMPOSITE: world-frame, live tuples (y quashed to grade)
const cart=(await loader.loadAsync('/model-cart.glb')).scene; cart.position.set(12,0,36); cart.rotation.y=-2.6; cart.visible=false; scene.add(cart); shade(cart);
const cartHmou=(await loader.loadAsync('/model-hmou.glb')).scene; cartHmou.position.set(11,0,31.5); cartHmou.rotation.y=-1.41; cartHmou.visible=false; scene.add(cartHmou); shade(cartHmou);
const LONE_ON=()=>{lone.visible=true;cart.visible=false;cartHmou.visible=false;};
const CART_ON=()=>{lone.visible=false;cart.visible=true;cartHmou.visible=true;};
// bind part bases on the COMPOSITE mouse (the placement read drives motion)
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts={};
for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(cartHmou,c.part);
  if(p) parts[c.part]={p, base:{pos:p.position.toArray(), quat:p.quaternion.toArray(), rot:p.rotation.toArray()}, m:c.m}; }
window.stats={hmouNodes:(await loader.loadAsync('/model-hmou.glb')).scene.children.length};
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
    lone_near:()=>{LONE_ON();camera.position.set(0,0.30,1.6);camera.lookAt(-0.02,0.06,0);},
    lone_face:()=>{LONE_ON();camera.position.set(0.26,0.12,0.22);camera.lookAt(0.03,0.05,0);},
    lone_profile:()=>{LONE_ON();camera.position.set(-0.02,0.14,0.32);camera.lookAt(-0.02,0.05,0);},
    lone_top:()=>{LONE_ON();camera.position.set(-0.02,0.5,0.4);camera.lookAt(-0.02,0,0.05);},
    // cart composite, world frame; reader approach = the seat's TRUE
    // spoke NNE toward the mosaic-row line (fauna-40 law f: cameras
    // derive from the seat's reader line, not a fixed bearing)
    cart_gameplay:()=>{CART_ON();camera.position.set(11-18*0.160,1.65,31.5-18*0.987);camera.lookAt(11,0.1,31.5);},
    // spotting scope: SAME camera position, narrow FOV — falsifies
    // "absent" vs "present but small" (robin-law disclosure tool).
    cart_scope:()=>{CART_ON();camera.fov=7;camera.position.set(11-18*0.160,1.65,31.5-18*0.987);camera.lookAt(11,0.08,31.5);camera.updateProjectionMatrix();},
    // r6: encounter cameras re-derived as CROSS-SHOT vantages — a spoke
    // camera at 3m inevitably columns the cart (2m beyond, 2.8m wide)
    // behind the vignette ("under the wheel" screen-space read); the
    // E-side cross-shot reads the mouse against open meadow with the
    // cart at frame-edge distance (both are real reader vantages on
    // the mosaic line, fauna-19 law d)
    // r7: encounter cameras re-derived to the TRUE reader line — the
    // mosaic-row visitor walks NNE→SSW: cart FIRST (the landmark), then
    // the vignette 4.5m past it, mouse facing the approach (yaw −1.41
    // faces NNE). The discover vantage stands beside the cart looking
    // S at the tuft (cart behind the viewer); face = the meeting shot.
    // The S-looking spoke camera used in r4-r6 was the WRONG vantage
    // (it stacked the cart's wheel behind the tuft in screen space).
    cart_near:()=>{CART_ON();camera.position.set(11.4,0.45,34.0);camera.lookAt(10.9,0.09,31.5);},
    cart_face:()=>{CART_ON();camera.position.set(10.95,0.22,33.3);camera.lookAt(10.9,0.09,31.45);},
    // the approach mid-frame: walking down from the mosaic row, cart
    // foreground-right at ~2.5m, vignette center-left at ~5m
    cart_approach:()=>{CART_ON();camera.position.set(13.6,1.45,36.6);camera.lookAt(10.5,0.15,31.2);},
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
window.goldProbe=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const img=x.getImageData(0,0,c.width,c.height).data;
  let n=0;
  // calibrated to RENDERED truth (r3 coat 0xe6bd7c: lit ~(199,166,113);
  // v2 dump showed lit values 105-200 with the meadow at (99,116,66) —
  // r>g+8 separates): robin law d — probe the rendered colors, never
  // assume the albedo window
  for(let i=0;i<img.length;i+=4){ const r=img[i],g=img[i+1],b=img[i+2];
    if(r>140&&r<235&&g>100&&g<190&&b<140&&r>g+8&&g>b+15) n++; }
  return n; }
window.setView('cart_gameplay'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/model-hmou.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(hmouBytes); }
    if (url === "/model-cart.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(cartBytes); }
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
for (const v of ["lone_gameplay", "lone_near", "lone_face", "lone_profile", "lone_top", "cart_gameplay", "cart_scope", "cart_near", "cart_face", "cart_approach"]) {
  await page.evaluate(() => (window as any).setFill(false));
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  counts[v] = await page.evaluate(() => (window as any).colorCount());
  await grab(`new-${v}.png`);
}
console.log("unique colors:", JSON.stringify(counts));
// fill-lit anatomy probes (fauna-7 law b, disclosed)
for (const v of ["lone_face", "lone_profile", "cart_face"]) {
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.evaluate(() => (window as any).setFill(true));
  await page.waitForTimeout(40);
  await grab(`new-${v}-fill.png`);
  await page.evaluate(() => (window as any).setFill(false));
}
for (const [v, n] of Object.entries(counts)) {
  const floor = (v === "lone_gameplay" || v === "cart_near" || v === "cart_face") ? 60 : 300;
  if ((n as number) < floor) throw new Error(`view ${v} looks blank (${n} colors)`);
}
// golden-coat presence probe at lone_near (a cart-free frame — the cart's
// straw sheaves share the golden band, so the composite view can't host
// the probe): golden-buff pixels distinct from the meadow ground
// (mechanical mouse-presence proof). Window opened for LIT clipping
// (turkey law a: rig light renders albedo at up to ~1.5x, r can clip).
await page.evaluate(() => (window as any).setView("lone_near"));
const goldPx = await page.evaluate(() => (window as any).goldProbe());
console.log("gold presence probe (lone_near golden-buff px):", goldPx);
if (goldPx < 40) throw new Error(`mouse golden coat not present in lone_near (${goldPx} px)`);
// motion pair at the encounter framing: t=1.3s vs t=9.7s — all 3 comps
// far from phase coincidence
await page.evaluate(() => (window as any).setView("cart_near"));
await page.evaluate((t: any) => (window as any).setPhase(t), 1.3);
await grab("new-motion-cart_near-a.png");
const fa: any = await page.evaluate(() => (window as any).frame());
await page.evaluate((t: any) => (window as any).setPhase(t), 9.7);
await grab("new-motion-cart_near-b.png");
const fb: any = await page.evaluate(() => (window as any).frame());
const diff = await page.evaluate(([a, b]: any) => (window as any).frameDiff(a, b), [fa, fb] as any);
const rows: any = await page.evaluate(() => (window as any).lastDiffRows);
const band = rows.length ? `${Math.min(...rows)}-${Math.max(...rows)} (of 960)` : "none";
console.log(`motion pair cart_near: ${diff} px differ, x band ${band}`);
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close();
server.close();
console.log(`wrote fauna45 hmou renders -> ${outDir}`);
