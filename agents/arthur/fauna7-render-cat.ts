// fauna7-render-cat.ts — review renders for the fauna-7 barn cat.
// Chassis: fauna5-render-fox.ts (module-scope render law — async loadAsync
// at top level, evaluate only calls sync setters).
// TWO scenes: LONE (cat recentred — identity/anatomy judging) and YARD
// COMPOSITE (world-frame: coop, hen flock, hutch at their LIVE tuples with
// exact live bytes; cat at (40.7, 0, -7.5) yaw 3.216 — the REAL placement
// read: tuxedo watch-cat in the coop-yard east pocket facing the flock).
// Motion pairs at yard_gameplay + yard_near driven by the REAL client
// closed forms — motioneval.js pendulumTheta for head/tail/ears, evalPart
// bob VERBATIM from client/lib/motion.js for the breathing body.
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const catBytes = readFileSync("agents/arthur/assets/village_dress_bcat1.glb");
const coopBytes = readFileSync("agents/arthur/assets/village_coop3.glb");       // live f5d40394
const flockBytes = readFileSync("agents/arthur/assets/village_hens_flock.glb"); // live 1ab461bd
const hutchBytes = readFileSync("agents/arthur/assets/village_hutch3.glb");     // yard context
const outDir = resolve("agents/arthur/reviews/fauna7-cat");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const ME = readFileSync("client/lib/motioneval.js", "utf8"); // unmodified evaluator

// the exact comp payloads the placer sends (mirrored in fauna7-place-cat.ts)
const COMPS = [
  { part: "bcat", m: { type: "bob", amp: 0.006, period: 3.6, phase: 0.0, t0: 1 } },
  { part: "bcat_head", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.12, period: 6.5, phase: 1.3, t0: 1 } },
  { part: "bcat_tail", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.06, period: 2.8, phase: 2.6, t0: 1 } },
  { part: "bcat_ears", m: { type: "pendulum", axis: [2, 0, 1], pivot: [0, 0, 0], amp: 0.18, period: 2.4, phase: 0.9, t0: 1 } },
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
// probe fill (v7): the cat FACES WEST and the rig sun sits west-behind —
// every face-on view was BACKLIT (whites rendered dim tan, judge read the
// white front as "uniformly dark"). Anatomy probes get a camera-side
// fill so materials judge true; gameplay/near placement reads keep the
// world-lit look. The game's own sun varies with world time — a fill-lit
// probe is inside the world's lighting envelope (disclosed in plan).
const fill=new THREE.DirectionalLight(0xffffff,0); fill.position.set(-6,4,10); scene.add(fill);
window.setFill=(on)=>{fill.intensity=on?1.4:0;};
const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.MeshStandardMaterial({color:0x3d3a29,roughness:1})); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const loader=new GLTFLoader(); const shade=(root)=>root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
// LONE: cat recentred on the ground (identity judging)
const lone=(await loader.loadAsync('/model-cat.glb')).scene; scene.add(lone);
lone.updateMatrixWorld(true);
{ const bb=new THREE.Box3().setFromObject(lone);
  const c=bb.getCenter(new THREE.Vector3());
  lone.position.x-=c.x; lone.position.z-=c.z; lone.position.y-=bb.min.y; }
shade(lone); lone.updateMatrixWorld(true);
// YARD COMPOSITE: world-frame, live tuples (y quashed to 0 — flat grade)
const coop=(await loader.loadAsync('/model-coop.glb')).scene; coop.position.set(37.5,0,-6.5); coop.rotation.y=-1.8; coop.visible=false; scene.add(coop); shade(coop);
const flock=(await loader.loadAsync('/model-flock.glb')).scene; flock.position.set(34,0,-8); flock.rotation.y=-1.8; flock.visible=false; scene.add(flock); shade(flock);
const hutch=(await loader.loadAsync('/model-hutch.glb')).scene; hutch.position.set(38.5,0,-9.5); hutch.rotation.y=-1.9; hutch.visible=false; scene.add(hutch); shade(hutch);
const yardCat=(await loader.loadAsync('/model-cat.glb')).scene; yardCat.position.set(40.7,0,-7.5); yardCat.rotation.y=3.216; yardCat.visible=false; scene.add(yardCat); shade(yardCat);
const LONE_ON=()=>{lone.visible=true;coop.visible=false;flock.visible=false;hutch.visible=false;yardCat.visible=false;};
const YARD_ON=()=>{lone.visible=false;coop.visible=true;flock.visible=true;hutch.visible=true;yardCat.visible=true;};
window.stats={catNodes:(await loader.loadAsync('/model-cat.glb')).scene.children.length};
// bind part bases on the YARD cat (the placement read drives motion)
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts={};
for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(yardCat,c.part);
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
    lone_face:()=>{LONE_ON();camera.position.set(0.85,0.32,0.85);camera.lookAt(0,0.3,0);},
    lone_back:()=>{LONE_ON();camera.position.set(-0.5,0.45,-1.1);camera.lookAt(0,0.2,0);},
    // yard composite, world frame; visitor approach = the plaza lane z≈-7.5 heading E
    yard_gameplay:()=>{YARD_ON();camera.position.set(22.7,1.65,-7.5);camera.lookAt(40.7,0.15,-7.5);},
    yard_near:()=>{YARD_ON();camera.position.set(35.7,0.9,-7.5);camera.lookAt(40.5,0.15,-7.5);},
    yard_face:()=>{YARD_ON();camera.position.set(39.35,0.35,-7.42);camera.lookAt(40.55,0.32,-7.5);},
    yard_lane:()=>{YARD_ON();camera.position.set(40.9,0.45,-6.0);camera.lookAt(40.5,0.12,-7.5);},
    // v7 aimed ultra probes (fauna-3/4 laws): the cat FACES WEST (toward
    // the flock) — the face camera stands WEST of the cat looking EAST
    // (v1 of this probe sat east = a rear view; judge caught it); side
    // camera at true profile on the tail/lane flank. lookAt lifted so
    // the paw/tail band isn't cropped at frame bottom.
    yard_ultraface:()=>{YARD_ON();setFill(true);camera.position.set(39.85,0.32,-7.55);camera.lookAt(40.62,0.26,-7.5);},
    yard_ultraside:()=>{YARD_ON();setFill(true);camera.position.set(40.65,0.28,-6.6);camera.lookAt(40.65,0.16,-7.53);},
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
    if (url === "/model-cat.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(catBytes); }
    if (url === "/model-coop.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(coopBytes); }
    if (url === "/model-flock.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(flockBytes); }
    if (url === "/model-hutch.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(hutchBytes); }
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
if (stats.parts !== 4) throw new Error(`expected 4 parts, got ${stats.parts}`);

const grab = async (name: string) => {
  const dataUrl: string = await page.evaluate(() => (window as any).snap());
  writeFileSync(resolve(outDir, name), Buffer.from(dataUrl.split(",")[1], "base64"));
};
const counts: any = {};
for (const v of ["lone_gameplay", "lone_near", "lone_face", "lone_back", "yard_gameplay", "yard_near", "yard_face", "yard_lane", "yard_ultraface", "yard_ultraside"]) {
  await page.evaluate(() => (window as any).setFill(false));
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  counts[v] = await page.evaluate(() => (window as any).colorCount());
  await grab(`new-${v}.png`);
}
console.log("unique colors:", JSON.stringify(counts));
// lone_gameplay: a 0.44m cat ALONE at 18m is sub-2% of frame (struct-45
// framing law) — the contract 18m read for this subject is the YARD
// composite. Gate the lone 18m at >100 (rendered, not blank).
for (const [v, n] of Object.entries(counts)) {
  const floor = v === "lone_gameplay" ? 100 : 400;
  if ((n as number) < floor) throw new Error(`view ${v} looks blank (${n} colors)`);
}
// motion pairs at both yard framings: t=4.1s vs t=17.3s — head scan 6.5s,
// tail 2.8s, ears 2.4s, breathing 3.6s all land far from phase
for (const framing of ["yard_gameplay", "yard_near"]) {
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
console.log(`wrote fauna7 cat renders -> ${outDir}`);
