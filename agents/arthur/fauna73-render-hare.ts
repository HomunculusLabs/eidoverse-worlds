// fauna73-render-hare.ts — review renders for the fauna-73 brown hare.
// Chassis: fauna38-render-wrabbit.ts (module-scope render law). TWO
// scenes: LONE (pair recentred — identity/anatomy judging) and SEAT
// COMPOSITE (world-frame: the pair at the swept seat (-24,-42) yaw
// 2.622 — the open SW meadow S reach; the habitat IS the composition,
// zero host props by the plan's own zoo-dump law). Ground = meadow
// #4a5d33 (robin rig law: match the WORLD ground). Motion pairs at
// seat_gameplay + seat_near driven by the REAL client closed forms —
// motioneval.js pendulumTheta for heads/ears, evalPart bob VERBATIM
// from client/lib/motion.js for the breathing.
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const pairBytes = readFileSync("agents/arthur/assets/village_dress_hare1.glb");
const pairSha = createHash("sha256").update(pairBytes).digest("hex");
if (pairSha !== "79ce2c97253bc33e18c69f8e71ce51ad24210c2ae4e821ab28e2c7a5a54d88d5") throw new Error(`pair bytes drift ${pairSha}`);
const outDir = resolve("agents/arthur/reviews/fauna73-hare");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const ME = readFileSync("client/lib/motioneval.js", "utf8"); // unmodified evaluator

// the exact comp payloads the placer sends (mirrored in fauna73-place-hare.ts)
const COMPS = [
  { part: "hare_a", m: { type: "bob", amp: 0.006, period: 4.4, phase: 0.0, t0: 1 } },
  { part: "hare_a_head", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.30, period: 10.0, phase: 1.1, t0: 1 } },
  { part: "hare_a_ears", m: { type: "pendulum", axis: [2, 0, 1], pivot: [0, 0, 0], amp: 0.16, period: 2.4, phase: 0.7, t0: 1 } },
  { part: "hare_b", m: { type: "bob", amp: 0.003, period: 6.0, phase: 0.5, t0: 1 } },
  { part: "hare_b_head", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.22, period: 12.0, phase: 1.7, t0: 1 } },
  { part: "hare_b_ears", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.06, period: 3.1, phase: 1.3, t0: 1 } },
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
window.setFill=(on)=>{fill.intensity=on?1.4:0; fill.target=camera;};
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
// SEAT COMPOSITE: world-frame, the swept seat tuple (y quashed to grade)
// hare_a stands W (local -0.45,0.15 rotated by yaw 2.622) and faces the
// plaza line — the reader approaches from NE along that line.
const seatPair=(await loader.loadAsync('/model-pair.glb')).scene; seatPair.position.set(-24,0,-42); seatPair.rotation.y=2.622; seatPair.visible=false; scene.add(seatPair); shade(seatPair);
const LONE_ON=()=>{lone.visible=true;seatPair.visible=false;};
const SEAT_ON=()=>{lone.visible=false;seatPair.visible=true;};
window.stats={pairNodes:(await loader.loadAsync('/model-pair.glb')).scene.children.length};
// bind part bases on the SEAT pair (the placement read drives motion)
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts={};
for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(seatPair,c.part);
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
    lone_near:()=>{LONE_ON();camera.position.set(0,0.7,3.4);camera.lookAt(0,0.25,0);},
    lone_sentinel:()=>{LONE_ON();camera.position.set(-0.5,0.75,1.6);camera.lookAt(-0.42,0.5,0.12);},
    lone_sentface:()=>{LONE_ON();camera.position.set(-0.05,0.62,0.42);camera.lookAt(-0.40,0.56,0.14);},
    lone_profile:()=>{LONE_ON();camera.position.set(-0.45,0.45,1.3);camera.lookAt(-0.42,0.35,0.05);},
    lone_form:()=>{LONE_ON();camera.position.set(0.55,1.05,0.75);camera.lookAt(0.40,0.02,-0.16);},
    lone_formface:()=>{LONE_ON();camera.position.set(0.85,0.30,0.05);camera.lookAt(0.62,0.06,-0.17);},
    // seat composite, world frame; reader approach = the plaza line (bearing
    // 60.3° to plaza, fauna-72's own walk-up discover line)
    seat_gameplay:()=>{SEAT_ON();camera.position.set(-15.07,1.65,-26.36);camera.lookAt(-24,0.25,-42);},
    seat_near:()=>{SEAT_ON();camera.position.set(-22.51,0.75,-39.39);camera.lookAt(-24,0.12,-42);},
    seat_form:()=>{SEAT_ON();camera.position.set(-22.85,1.35,-40.25);camera.lookAt(-23.8,0.02,-41.9);},
    seat_sentinel:()=>{SEAT_ON();camera.position.set(-22.6,0.6,-40.0);camera.lookAt(-23.7,0.5,-41.7);},
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
window.setView('seat_gameplay'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/model-pair.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(pairBytes); }
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
for (const v of ["lone_gameplay", "lone_near", "lone_sentinel", "lone_sentface", "lone_profile", "lone_form", "lone_formface", "seat_gameplay", "seat_near", "seat_form", "seat_sentinel"]) {
  await page.evaluate(() => (window as any).setFill(false));
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  counts[v] = await page.evaluate(() => (window as any).colorCount());
  await grab(`v2-${v}.png`);
}
console.log("unique colors:", JSON.stringify(counts));
// fill-lit anatomy probes (fauna-7 law b, disclosed)
for (const v of ["lone_sentface", "lone_formface"]) {
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.evaluate(() => (window as any).setFill(true));
  await page.waitForTimeout(40);
  await grab(`v2-${v}-fill.png`);
  await page.evaluate(() => (window as any).setFill(false));
}
// lone_gameplay: a 0.8m hare pair ALONE at 18m is small (struct-45
// framing law) — the contract 18m read is the SEAT composite; floor
// lone at >60.
for (const [v, n] of Object.entries(counts)) {
  const floor = v === "lone_gameplay" ? 60 : 300;
  if ((n as number) < floor) throw new Error(`view ${v} looks blank (${n} colors)`);
}
// motion pairs at both seat framings: t=4.1s vs t=17.3s — all 6 comps
// far from phase coincidence
for (const framing of ["seat_gameplay", "seat_near"]) {
  await page.evaluate((s: any) => (window as any).setView(s), framing);
  await page.evaluate((t: any) => (window as any).setPhase(t), 4.1);
  await grab(`v2-motion-${framing}-a.png`);
  const fa: any = await page.evaluate(() => (window as any).frame());
  await page.evaluate((t: any) => (window as any).setPhase(t), 17.3);
  await grab(`v2-motion-${framing}-b.png`);
  const fb: any = await page.evaluate(() => (window as any).frame());
  const diff = await page.evaluate(([a, b]: any) => (window as any).frameDiff(a, b), [fa, fb] as any);
  const rows: any = await page.evaluate(() => (window as any).lastDiffRows);
  const band = rows.length ? `${Math.min(...rows)}-${Math.max(...rows)} (of 960)` : "none";
  console.log(`motion pair ${framing}: ${diff} px differ, x band ${band}`);
}
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close();
server.close();
console.log(`wrote fauna73 hare renders -> ${outDir}`);
