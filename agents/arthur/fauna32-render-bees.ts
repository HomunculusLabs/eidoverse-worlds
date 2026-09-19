// fauna32-render-bees.ts — review renders for the fauna-32 skep bees.
// Chassis: fauna3-render-ducks.ts (module-scope render law). Serves the
// bees TOGETHER WITH the standing skeps row at the shared origin (frame
// copy — both roots at 0) plus simplified lavender field context (the
// subject lives OVER the lavender; robin rig-ground law applied to the
// actual ground cover: purple-topped clumps at plant-top 0.538, uniform
// density per the a9076cee decode), on the meadow ground #4a5d33.
// Views: gameplay 18m from the plaza side (local +z, the flight-hole face
// — the reader's vantage), near 4m, encounter 2m aimed at ring B, close
// 1.2m on bee_2 (anatomy), night. MOTION PAIRS at gameplay + near driven
// by the REAL closed forms (motion.js evalPart orbit/bob verbatim).
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const beesBytes = readFileSync("agents/arthur/assets/village_fauna32_bees.glb");
const skepBytes = readFileSync("agents/arthur/assets/village_dress_nw_skeps1.glb");
const BEES_SHA = "e6ac8fac5e1d4228d3df4a51ba0fb11faf63b402b35eb104db8972efc061f84d";
if (createHash("sha256").update(beesBytes).digest("hex") !== BEES_SHA) throw new Error("bees bytes drift");
const outDir = resolve("agents/arthur/reviews/fauna32-bees");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const ME = readFileSync("client/lib/motioneval.js", "utf8");

// the exact comp payloads the placer sends (mirrored in fauna32-place-bees.ts)
const COMPS = [
  { part: "bee_1", m: { type: "orbit", center: [-1.9, 0.62, 0], radius: 0.8, degPerSec: 24, phase: 0, t0: 1 } },
  { part: "bee_2", m: { type: "orbit", center: [-0.6, 0.68, 0.15], radius: 0.8, degPerSec: 28, phase: 2.1, t0: 1 } },
  { part: "bee_3", m: { type: "orbit", center: [0.7, 0.64, -0.1], radius: 0.8, degPerSec: 22, phase: 4.0, t0: 1 } },
  { part: "bee_4", m: { type: "orbit", center: [2.0, 0.72, 0.05], radius: 0.8, degPerSec: 26, phase: 5.2, t0: 1 } },
  { part: "bee_5", m: { type: "bob", amp: 0.05, period: 1.4, phase: 0.3, t0: 1 } },
  { part: "bee_6", m: { type: "bob", amp: 0.06, period: 1.2, phase: 2.2, t0: 1 } },
  { part: "bee_7", m: { type: "bob", amp: 0.04, period: 1.6, phase: 4.4, t0: 1 } },
];

const html = `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#cbd6df}canvas{display:block}
</style><script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
import { axisOf, ampOf } from '/motioneval.js';
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1); renderer.setSize(960,720); renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true; document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene(); scene.background=new THREE.Color(0xcbd6df);
const camera=new THREE.PerspectiveCamera(42,960/720,0.05,300);
const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2.0); scene.add(hemi);
const ambient=new THREE.AmbientLight(0xffffff,0.45); scene.add(ambient);
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(8,12,6); sun.castShadow=true; scene.add(sun);
// meadow ground — the world's own #4a5d33 (robin rig law a)
const gmat=new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:1,metalness:0});
const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),gmat); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
// lavender field context — uniform per the a9076cee decode; clumps of
// green mound + purple cap, tops 0.538 (visual context, disclosed)
const lvg=new THREE.MeshStandardMaterial({color:0x536339,roughness:1});
const lvp=new THREE.MeshStandardMaterial({color:0x8a7ba6,roughness:.9});
const rng=(i)=>{const x=Math.sin(i*127.1)*43758.5453;return x-Math.floor(x);};
for(let i=0;i<130;i++){
  const gx=(rng(i)-0.5)*14, gz=(rng(i+500)-0.5)*9;
  if(Math.abs(gz)<1.15 && gx>-2.6 && gx<2.6) continue; // keep the row's own strip clear-ish
  const cl=new THREE.Mesh(new THREE.SphereGeometry(0.22,7,5),lvg);
  cl.scale.set(1,0.62,1); cl.position.set(gx,0.13,gz); cl.castShadow=false; scene.add(cl);
  const cap=new THREE.Mesh(new THREE.SphereGeometry(0.17,7,5),lvp);
  cap.scale.set(1,0.66,1); cap.position.set(gx,0.40,gz); scene.add(cap);
}
const loader=new GLTFLoader();
const load=async(url)=>{ const gltf=await loader.loadAsync(url); const root=gltf.scene; scene.add(root);
  root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}}); root.updateMatrixWorld(true); return root; };
// frame copy: BOTH roots at the shared origin — bees entity seats at the
// skeps' exact origin+yaw, so rig-relative == entity-relative verbatim.
const SKEPS=await load('/skeps.glb');
const BEES=await load('/bees.glb');
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts={};
for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(BEES,c.part);
  if(p) parts[c.part]={p, base:{pos:p.position.toArray(), rot:p.rotation.toArray()}, m:c.m}; }
window.stats={beesParts:Object.keys(parts).length};
// evalPart orbit + bob cases — VERBATIM math from client/lib/motion.js
const _ax=new THREE.Vector3();
function evalPartCase(p, base, m, t){
  if(m.type==='bob'){
    const off=Math.sin((2*Math.PI/(m.period??4))*t+(m.phase??0))*ampOf(m,0.3);
    _ax.set(...axisOf(m,[0,1,0])).normalize();
    p.position.set(base.pos[0]+_ax.x*off, base.pos[1]+_ax.y*off, base.pos[2]+_ax.z*off); return;
  }
  if(m.type==='orbit'){
    const c=m.center??base.pos; const r=m.radius??1;
    const a=(m.phase??0)+((m.degPerSec??12)*Math.PI/180)*t;
    p.position.set(c[0]+r*Math.sin(a),(c[1]??base.pos[1]),c[2]+r*Math.cos(a));
    if(m.face!==false) p.rotation.set(0,a+Math.PI/2,0); return;
  }
}
const rowC=new THREE.Vector3(0.05,0.55,0); // row visual center
window.aimAtBee=(name,dist)=>{ const pt=parts[name]; if(!pt) return false;
  pt.p.updateMatrixWorld(true); const wp=new THREE.Vector3(); pt.p.getWorldPosition(wp);
  // pure +z profile camera at blossom height (hive behind camera at
  // a=0; background = far meadow/lavender, never straw)
  camera.position.set(wp.x,wp.y+0.06,wp.z+dist); camera.lookAt(wp); renderer.render(scene,camera); return wp.toArray(); };
window.setView=(name)=>{ const views={
  gameplay:[0,1.65,18],      // plaza side, 18m, eye height
  near:[0,1.3,4],            // 4m
  encounter:[0.4,1.15,2.0],  // 2m aimed low at the rings
  close:[0,0.85,1.2],        // 1.2m anatomy framing on the row center
  side:[9,1.4,2],            // lateral composition
  top:[0.5,7,0.001] };       // plan view: rings + workers over the field
  camera.position.fromArray(views[name]); camera.lookAt(rowC); renderer.render(scene,camera); };
window.setNight=(on)=>{scene.background.set(on?0x111827:0xcbd6df);hemi.intensity=on?.18:2;ambient.intensity=on?.04:.45;sun.intensity=on?.15:3.2;};
window.setPhase=(tSec)=>{ for(const k of Object.keys(parts)){ const {p,base,m}=parts[k];
  const t=Math.max(0,(tSec*1000+1 - m.t0)/1000);
  evalPartCase(p,base,m,t); } };
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
window.setView('gameplay'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/bees.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(beesBytes); }
    if (url === "/skeps.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(skepBytes); }
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
if (stats.beesParts !== 7) throw new Error(`expected 7 bee parts, got ${stats.beesParts}`);

const grab = async (name: string) => {
  const dataUrl: string = await page.evaluate(() => (window as any).snap());
  writeFileSync(resolve(outDir, name), Buffer.from(dataUrl.split(",")[1], "base64"));
};
// render at a mid-flight phase (t=6.0s) so flyers are ON their rings visibly
await page.evaluate(() => (window as any).setPhase(6.0));
await page.evaluate(() => (window as any).setNight(false));
const counts: any = {};
for (const v of ["gameplay", "near", "encounter", "close", "side", "top"]) {
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  counts[v] = await page.evaluate(() => (window as any).colorCount());
  await grab(`new-${v}.png`);
}
// aimed bee probes (fauna-4 law): render at t=8.56s so bee_2 sits at ring
// angle a=0 — due S of its hive, velocity +x — giving a +z camera the FULL
// PROFILE (bands/wings read; head-on collapses them to rings). Camera pure
// +z at blossom height: meadow/lavender behind, hive context off-axis.
await page.evaluate((t: any) => (window as any).setPhase(t), 8.56);
const beeAims: [string, number][] = [["bee_2", 0.8], ["bee_5", 0.8], ["bee_4", 0.8]];
for (const [bn, dist] of beeAims) {
  const wp: any = await page.evaluate(([n, d]: any) => (window as any).aimAtBee(n, d), [bn, dist] as any);
  await page.waitForTimeout(60);
  await grab(`new-bee-${bn}.png`);
  counts[`bee-${bn}`] = await page.evaluate(() => (window as any).colorCount());
  console.log(`aimed ${bn} at world ${JSON.stringify(wp.map((v: number) => +v.toFixed(2)))}`);
}
console.log("unique colors:", JSON.stringify(counts));
// motion pairs: t=6.0 vs t=6.6 (orbits advance 13-17°, bobs near-opposite)
for (const framing of ["gameplay", "near", "encounter"]) {
  await page.evaluate((s: any) => (window as any).setView(s), framing);
  await page.evaluate((t: any) => (window as any).setPhase(t), 6.0);
  await grab(`new-motion-${framing}-a.png`);
  const fa: any = await page.evaluate(() => (window as any).frame());
  await page.evaluate((t: any) => (window as any).setPhase(t), 6.6);
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
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close();
server.close();
console.log(`wrote fauna32 bees renders -> ${outDir}`);
