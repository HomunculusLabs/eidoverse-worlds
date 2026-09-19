// fauna50-render-kfish.ts — review renders for the fauna-50 kingfisher.
// Chassis: fauna48-render-sparrow.ts (module-scope render law). TWO
// scenes: LONE (kfish recentred — identity/anatomy judging) and RACE
// COMPOSITE (world-frame, local millrace bytes village_millrace3.glb
// sha 6e82dd2e… == live lib prefix EXACT, hash-verified in-script) at
// the live tuple (-76.707,-0.0256,6.711) yaw 1.7516247 + the kfish at
// the swept seat (-70.05,-0.02224,4.48) yaw 4.8932 — the REAL
// placement read: snag leaning out over step-6's water, bird SSE of
// the vantage. Ground = meadow #4a5d33 (robin rig law). Motion pairs
// at race_near driven by the REAL client closed forms — motioneval.js
// pendulumTheta for the lean/scan/flick, evalPart bob VERBATIM from
// client/lib/motion.js for the breathing.
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const kfBytes = readFileSync("agents/arthur/assets/village_dress_kfish1.glb");
const kfSha = createHash("sha256").update(kfBytes).digest("hex");
if (kfSha !== "cdf3bf7a4020b34e1f200ed92e024fa96b7403df1bff2b6c791e225bdb2af147") throw new Error(`kfish bytes drift ${kfSha}`);
const raceBytes = readFileSync("agents/arthur/assets/village_millrace3.glb");
const raceSha = createHash("sha256").update(raceBytes).digest("hex");
if (raceSha !== "6e82dd2e1eb8403e15a8f1de1a024f4249cdcb41f32d952d57fa2e66b27fee70") throw new Error(`race bytes drift ${raceSha}`);
const outDir = resolve("agents/arthur/reviews/fauna50-kfish");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const ME = readFileSync("client/lib/motioneval.js", "utf8"); // unmodified evaluator

// the exact comp payloads the placer sends (mirrored in fauna50-place-kfish.ts)
const COMPS = [
  { part: "kfish", m: { type: "bob", amp: 0.005, period: 4.6, phase: 0.0, t0: 1 } },
  { part: "kfish_body", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.10, period: 5.8, phase: 0.4, t0: 1 } },
  { part: "kfish_head", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.24, period: 7.5, phase: 0.9, t0: 1 } },
  { part: "kfish_tail", m: { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.14, period: 2.2, phase: 1.5, t0: 1 } },
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
// LONE: ENVELOPE-recentred on the ground, with the cameras aimed at
// the BIRD (which rides the snag's +x end ≈ +0.36 of the envelope
// center — fauna-4 law c framing + the r2 judge's "snag missing" was
// THIS framing burying it below ground; envelope ground + bird-aimed
// cameras show snag AND bird)
const lone=(await loader.loadAsync('/model-kfish.glb')).scene; scene.add(lone);
lone.updateMatrixWorld(true);
{ const bb=new THREE.Box3().setFromObject(lone);
  const c=bb.getCenter(new THREE.Vector3());
  lone.position.x-=c.x; lone.position.z-=c.z; lone.position.y-=bb.min.y; }
shade(lone); lone.updateMatrixWorld(true);
// RACE COMPOSITE: world-frame, live tuples
const race=(await loader.loadAsync('/model-race.glb')).scene; race.position.set(-76.707,-0.0256,6.711); race.rotation.y=1.7516247; race.visible=false; scene.add(race); shade(race);
const raceKf=(await loader.loadAsync('/model-kfish.glb')).scene; raceKf.position.set(-70.05,-0.02224,4.48); raceKf.rotation.y=4.8932; raceKf.visible=false; scene.add(raceKf); shade(raceKf);
const LONE_ON=()=>{lone.visible=true;race.visible=false;raceKf.visible=false;};
const RACE_ON=()=>{lone.visible=false;race.visible=true;raceKf.visible=true;};
// bind part bases on the COMPOSITE kfish (the placement read drives motion)
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
const parts={};
for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(raceKf,c.part);
  if(p) parts[c.part]={p, base:{pos:p.position.toArray(), quat:p.quaternion.toArray(), rot:p.rotation.toArray()}, m:c.m}; }
window.stats={kfNodes:(await loader.loadAsync('/model-kfish.glb')).scene.children.length};
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
    lone_gameplay:()=>{LONE_ON();camera.position.set(0,1.65,18);camera.lookAt(0.2,0.4,0);},
    lone_near:()=>{LONE_ON();camera.position.set(-0.25,0.55,1.45);camera.lookAt(0.38,0.72,0);},
    lone_profile:()=>{LONE_ON();camera.position.set(0.38,0.75,0.8);camera.lookAt(0.38,0.72,0);},
    lone_face:()=>{LONE_ON();camera.position.set(1.0,0.8,0.10);camera.lookAt(0.46,0.75,0);},
    // RACE composite, world frame. Reader lines (fauna-40 law f: cameras
    // derive from the seat's true approach): the race is LINEAR — visitors
    // walk the SSW bank ALONG it (WSW→ENE), reading the bird in PROFILE
    // (~90° to the lean; the first race_near aimed ALONG the lean axis and
    // foreshortened the snag to a post + showed the bird dead-rear —
    // struct-104 face-on law, rig defect, fixed).
    race_gameplay:()=>{RACE_ON();camera.position.set(-87.7,1.65,7.6);camera.lookAt(-70.05,0.5,4.48);},
    race_scope:()=>{RACE_ON();camera.fov=7;camera.position.set(-87.7,1.65,7.6);camera.lookAt(-70.05,0.6,4.48);camera.updateProjectionMatrix();},
    // - the discover vantage: the profile stop ~2.6m WSW along the bank
    //   from the seat — snag lean shows in profile, bird over the water.
    race_near:()=>{RACE_ON();camera.position.set(-72.6,1.30,4.95);camera.lookAt(-69.92,0.8,5.15);},
    // - the walk-down: mid bank, race descending toward the snag.
    race_approach:()=>{RACE_ON();camera.position.set(-78.0,1.65,6.3);camera.lookAt(-70.05,0.5,4.48);},
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
// kingfisher probes at lone_near: the ELECTRIC-BLUE back (cobalt/azure:
// strong blue channel dominant) and the ORANGE breast (warm, r>>b) —
// both must separate from the meadow ground (99,116,66) and the race
// water (80,106,120) when the composite is up
window.blueProbe=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const img=x.getImageData(0,0,c.width,c.height).data;
  let n=0;
  for(let i=0;i<img.length;i+=4){ const r=img[i],g=img[i+1],b=img[i+2];
    if(b>120&&b>r+30&&b>g+15&&r<140) n++; }
  return n; }
window.orangeProbe=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const img=x.getImageData(0,0,c.width,c.height).data;
  let n=0;
  for(let i=0;i<img.length;i+=4){ const r=img[i],g=img[i+1],b=img[i+2];
    if(r>150&&r>b+60&&g>70&&g<150&&b<90) n++; }
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
window.warmDump=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const img=x.getImageData(0,0,c.width,c.height).data; const m=new Map();
  for(let i=0;i<img.length;i+=4){ const r=img[i],g=img[i+1],b=img[i+2];
    if(r>130&&r>b+40&&g>50) { const k=(r<<16)|(g<<8)|b; m.set(k,(m.get(k)??0)+1); } }
  const out=[]; let tot=0;
  for(const [k,n] of [...m.entries()].sort((a,b)=>b[1]-a[1]).slice(0,20)){
    out.push((((k>>16)&255))+','+(((k>>8)&255))+','+(k&255)+':'+n); tot+=n; }
  out.push('TOTAL:'+tot); return out; }
window.setNight=(on)=>{ if(on){ sun.intensity=0.05; hemi.intensity=0.15; ambient.intensity=0.06;
    scene.background=new THREE.Color(0x0c1118); }
  else { sun.intensity=3.2; hemi.intensity=2.0; ambient.intensity=0.45;
    scene.background=new THREE.Color(0xcbd6df); } };
window.setView('race_gameplay'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/model-kfish.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(kfBytes); }
    if (url === "/model-race.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(raceBytes); }
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
for (const v of ["lone_gameplay", "lone_near", "lone_profile", "lone_face", "race_gameplay", "race_scope", "race_near", "race_approach"]) {
  await page.evaluate(() => (window as any).setFill(false));
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  counts[v] = await page.evaluate(() => (window as any).colorCount());
  await grab(`new-${v}.png`);
}
console.log("unique colors:", JSON.stringify(counts));
// fill-lit anatomy probe (fauna-7 law b, disclosed)
await page.evaluate((s: any) => (window as any).setView(s), "lone_face");
await page.evaluate(() => (window as any).setFill(true));
await page.waitForTimeout(40);
await grab("new-lone_face-fill.png");
await page.evaluate(() => (window as any).setFill(false));
for (const [v, n] of Object.entries(counts)) {
  const floor = (v === "lone_gameplay" || v === "race_near" || v === "race_approach") ? 60 : 300;
  if ((n as number) < floor) throw new Error(`view ${v} looks blank (${n} colors)`);
}
// blue/orange presence probes — run FILL-LIT at lone_near (fauna-7 law
// b: the rig sun rides +x; the front-left vantage is backlit and the
// two-tone reads die at ~0.4× albedo — the fill is the sanctioned
// disclosed fixture). Top colors dumped first (hmou law d calibration).
await page.evaluate(() => (window as any).setView("lone_near"));
await page.evaluate(() => (window as any).setFill(true));
await page.waitForTimeout(40);
await grab("new-lone_near-fill.png");
const topColors: any = await page.evaluate(() => (window as any).topColors());
console.log("top colors lone_near (fill-lit):", JSON.stringify(topColors));
const warmDump: any = await page.evaluate(() => (window as any).warmDump());
console.log("warm clusters lone_near (fill-lit):", JSON.stringify(warmDump));
// blue presence at the near vantage (fill-lit)
const bluePx = await page.evaluate(() => (window as any).blueProbe());
// orange presence at the DEAD-FRONT vantage (lone_face: chest + face
// present head-on; the near-level vantage occludes the belly behind
// the flank wing) — warm-cluster TOTAL, window r>130 && r>b+40 && g>50
await page.evaluate(() => (window as any).setView("lone_face"));
const warmFace: any = await page.evaluate(() => (window as any).warmDump());
console.log("warm clusters lone_face (fill-lit):", JSON.stringify(warmFace));
const orangePx = parseInt((warmFace.find((s: string) => s.startsWith("TOTAL:")) ?? "TOTAL:0").split(":")[1], 10);
console.log("blue probe (lone_near fill):", bluePx, "| orange probe (lone_face fill warm-total):", orangePx);
if (bluePx < 80) throw new Error(`cobalt/azure back not present at lone_near (${bluePx} px)`);
if (orangePx < 80) throw new Error(`orange breast not present at lone_face (${orangePx} px)`);
await page.evaluate(() => (window as any).setFill(false));
// NIGHT read (loop law: anything with emissives gets a night check —
// the v5 lift must read as plumage, not a glow) at the profile
// discover vantage
await page.evaluate(() => (window as any).setNight(true));
await page.evaluate((s: any) => (window as any).setView(s), "race_near");
await page.waitForTimeout(60);
await grab("new-race_near-night.png");
await page.evaluate(() => (window as any).setNight(false));
// motion pair at the encounter framing: t=0.9s vs t=8.3s — all 4 comps
// far from phase coincidence
await page.evaluate(() => (window as any).setView("race_near"));
await page.evaluate((t: any) => (window as any).setPhase(t), 0.9);
await grab("new-motion-race_near-a.png");
const fa: any = await page.evaluate(() => (window as any).frame());
await page.evaluate((t: any) => (window as any).setPhase(t), 8.3);
await grab("new-motion-race_near-b.png");
const fb: any = await page.evaluate(() => (window as any).frame());
const diff = await page.evaluate(([a, b]: any) => (window as any).frameDiff(a, b), [fa, fb] as any);
const rows: any = await page.evaluate(() => (window as any).lastDiffRows);
const band = rows.length ? `${Math.min(...rows)}-${Math.max(...rows)} (of 960)` : "none";
console.log(`motion pair race_near: ${diff} px differ, x band ${band}`);
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close();
server.close();
console.log(`wrote fauna50 kfish renders -> ${outDir}`);
