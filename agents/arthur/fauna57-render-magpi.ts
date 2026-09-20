// fauna57-render-magpi.ts — review renders for the fauna-57 magpie.
// Chassis: fauna55-render-pheas.ts (module-scope render law). TWO
// scenes: LONE (magpi envelope-recentred on the ground — identity/
// anatomy judging, AIMED cameras) and INN COMPOSITE (world-frame,
// SERVED inn bytes /tmp/fauna57-inn-served.glb sha16 85860417 +
// SERVED well bytes 71f7552b — struct-104 served-bytes law; the live
// inn lib is sibling-replaced, so the composite uses the bytes the
// world actually serves) at live tuples (36,0,0) yaw -1.571 /
// (30,0,-4.5) yaw 0, magpie at the swept seat (29.45,-0.02109,2.05)
// yaw -π/2 — the REAL placement read on the plaza reader spoke.
// Ground = meadow #4a5d33 (robin rig law). Motion driven by the REAL
// client closed forms — motioneval.js pendulumTheta + evalPart bob
// VERBATIM, incl THE HOP-STEP (magpi_body X-pendulum pitching the
// body around the planted feet). NO night pass (zero emissives —
// sheens are metallic flat values; night-read law n/a).
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const mgBytes = readFileSync("agents/arthur/assets/village_dress_magpi1.glb");
const mgSha = createHash("sha256").update(mgBytes).digest("hex");
if (mgSha !== "c0cf8da71a6401baae2891d07d92c6b7b556b8c762228097d4f95843559a62d6") throw new Error(`magpi bytes drift ${mgSha}`);
const innBytes = readFileSync("/tmp/fauna57-inn-served.glb");
const wellBytes = readFileSync("/tmp/fauna57-well-served.glb");
const outDir = resolve("agents/arthur/reviews/fauna57-magpi");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const ME = readFileSync("client/lib/motioneval.js", "utf8"); // unmodified evaluator

// the exact comp payloads the placer sends (mirrored in fauna57-place-magpi.ts)
const COMPS = [
  { part: "magpi", m: { type: "bob", amp: 0.004, period: 4.6, phase: 0.0, t0: 1 } },
  { part: "magpi_head", m: { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.24, period: 7.5, phase: 0.9, t0: 1 } },
  { part: "magpi_tail", m: { type: "pendulum", axis: [0, 0, 1], pivot: [-0.0868, 0.098, 0], amp: 0.14, period: 2.6, phase: 1.7, t0: 1 } },
  { part: "magpi_body", m: { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.05, period: 2.2, phase: 0.4, t0: 1 } },
];

const html = `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#cbd6df}canvas{display:block}
</style><script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '/examples/jsm/loaders/DRACOLoader.js';
import { pendulumTheta, axisOf, ampOf } from '/motioneval.js';
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1); renderer.setSize(960,720); renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true; document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene(); scene.background=new THREE.Color(0xcbd6df);
const camera=new THREE.PerspectiveCamera(42,960/720,0.05,400);
const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2.0); scene.add(hemi);
const ambient=new THREE.AmbientLight(0xffffff,0.45); scene.add(ambient);
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(8,12,6); sun.castShadow=true; scene.add(sun);
const fill=new THREE.DirectionalLight(0xffffff,0); fill.position.set(-6,4,10); scene.add(fill);
window.setFill=(on)=>{fill.intensity=on?1.4:0;};
const ground=new THREE.Mesh(new THREE.PlaneGeometry(400,400),new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:1})); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const draco=new DRACOLoader().setDecoderPath('/draco/');
const loader=new GLTFLoader(); loader.setDRACOLoader(draco);
const shade=(root)=>root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
const findPart=(root,name)=>{ let found=null; root.traverse(c=>{if(!found&&c!==root&&c.name===name)found=c;}); return found; };
// LONE: envelope-recentred on the ground
const lone=(await loader.loadAsync('/model-magpi.glb')).scene; scene.add(lone);
lone.updateMatrixWorld(true);
{ const bb=new THREE.Box3().setFromObject(lone);
  const c=bb.getCenter(new THREE.Vector3());
  lone.position.x-=c.x; lone.position.z-=c.z; lone.position.y-=bb.min.y; }
shade(lone); lone.updateMatrixWorld(true);
// INN COMPOSITE: world-frame, SERVED bytes at live tuples
const inn=(await loader.loadAsync('/model-inn.glb')).scene; inn.position.set(36,0,0); inn.rotation.y=-1.571; inn.visible=false; scene.add(inn); shade(inn);
const well=(await loader.loadAsync('/model-well.glb')).scene; well.position.set(30,0,-4.5); well.rotation.y=0; well.visible=false; scene.add(well); shade(well);
const innMg=(await loader.loadAsync('/model-magpi.glb')).scene; innMg.position.set(29.45,-0.02109,2.05); innMg.rotation.y=-Math.PI/2; innMg.visible=false; scene.add(innMg); shade(innMg);
const LONE_ON=()=>{lone.visible=true;inn.visible=false;well.visible=false;innMg.visible=false;};
const INN_ON=()=>{lone.visible=false;inn.visible=true;well.visible=true;innMg.visible=true;};
const parts={};
for(const c of ${JSON.stringify(COMPS)}){ const p=findPart(innMg,c.part);
  if(p) parts[c.part]={p, base:{pos:p.position.toArray(), quat:p.quaternion.toArray(), rot:p.rotation.toArray()}, m:c.m}; }
window.stats={parts:Object.keys(parts).length};
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
  // the magpie at the seat faces W (-x world): the plaza reader walks E→W
  // and meets its FRONT. U = plaza dir from seat = (-0.994,-0.110).
  const views={
    lone_gameplay:()=>{LONE_ON();camera.position.set(0,1.65,18);camera.lookAt(0,0.15,0);},
    lone_near:()=>{LONE_ON();camera.position.set(0.1,0.5,1.55);camera.lookAt(-0.02,0.14,0);},
    // profile — the tail's contract view (fauna-4 law): camera ⊥ body axis
    lone_profile:()=>{LONE_ON();camera.position.set(-0.06,0.38,1.35);camera.lookAt(-0.05,0.13,0);},
    // face — the bill/eyes/white-panel contract view (on the facing line)
    lone_face:()=>{LONE_ON();camera.position.set(1.35,0.42,0.3);camera.lookAt(0.05,0.17,0.02);},
    // INN COMPOSITE, world frame — 18m dead-front on the plaza spoke
    inn_gameplay:()=>{INN_ON();camera.position.set(11.56,1.65,0.06);camera.lookAt(29.45,0.12,2.05);},
    // 18m front-oblique (spoke+25° toward S — the walking-line vantage
    // with the inn facade in frame-right background)
    inn_gameplay_obl:()=>{INN_ON();camera.position.set(12.33,1.65,-6.90);camera.lookAt(29.45,0.15,2.05);},
    // 18m scope at the same oblique bearing (narrow FOV — identity read)
    inn_scope:()=>{INN_ON();camera.fov=7;camera.position.set(12.33,1.65,-6.90);camera.lookAt(29.45,0.15,2.05);camera.updateProjectionMatrix();},
    // composition: bird foreground, inn facade mid, yard read
    inn_compose:()=>{INN_ON();camera.position.set(24.5,1.5,-3.5);camera.lookAt(33.5,0.9,1.2);},
    // discover: 3.2m stop on the spoke
    inn_near:()=>{INN_ON();camera.position.set(26.27,1.15,1.70);camera.lookAt(29.45,0.1,2.05);},
    // door-lane: the pedestrian line plaza→inn door — the magpie at the
    // yard margin as the reader approaches the door
    door_lane:()=>{INN_ON();camera.position.set(25.5,1.65,0.6);camera.lookAt(33.2,0.8,0.2);},
  };
  views[name](); renderer.render(scene,camera); };
window.setPhase=(tSec)=>{ for(const k of Object.keys(parts)){ const {p,base,m}=parts[k];
    const t=Math.max(0,(tSec*1000+1 - m.t0)/1000);
    if(m.type==='pendulum') rotatePartAtPivot(p,base,m.axis,m.pivot,pendulumTheta(m,t));
    else evalPartCase(p,base,m,t); } };
window.snap=()=>{renderer.render(scene,camera); return renderer.domElement.toDataURL('image/png'); }
window.frame=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  return x.getImageData(0,0,c.width,c.height).data.slice(); }
window.frameDiff=(a,b)=>{ if(!a||!b||a.length!==b.length) return -1;
  let n=0; const row=[];
  for(let i=0;i<a.length;i+=4){ if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>18){
    n++; row.push(Math.floor((i/4)%960)); } } window.lastDiffRows=row; return n; };
window.rinfo=()=>({tri:renderer.info.render.triangles,calls:renderer.info.render.calls});
// magpie probes: WHITE markers (belly/flanks/panels), GREEN wing sheen,
// PURPLE tail sheen, near-BLACK body
window.whiteProbe=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const img=x.getImageData(0,0,c.width,c.height).data; let n=0;
  for(let i=0;i<img.length;i+=4){ const r=img[i],g=img[i+1],b=img[i+2];
    if(r>185&&g>178&&b>155) n++; }
  return n; }
window.greenProbe=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const img=x.getImageData(0,0,c.width,c.height).data; let n=0;
  for(let i=0;i<img.length;i+=4){ const r=img[i],g=img[i+1],b=img[i+2];
    if(g>40&&g>r+10&&g>b+10&&r<90) n++; }
  return n; }
window.purpleProbe=()=>{renderer.render(scene,camera); const c=document.createElement('canvas');
  c.width=renderer.domElement.width; c.height=renderer.domElement.height;
  const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
  const img=x.getImageData(0,0,c.width,c.height).data; let n=0;
  for(let i=0;i<img.length;i+=4){ const r=img[i],g=img[i+1],b=img[i+2];
    if(b>50&&b>g+12&&r>g+6&&b<160) n++; }
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
window.setView('inn_gameplay'); window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/model-magpi.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(mgBytes); }
    if (url === "/model-inn.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(innBytes); }
    if (url === "/model-well.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(wellBytes); }
    if (url === "/motioneval.js") { res.writeHead(200, { "content-type": "text/javascript" }); return res.end(ME); }
    if (url.startsWith("/draco/")) {
      const p = resolve(THREE_ROOT, "examples/jsm/libs/draco", url.slice("/draco/".length));
      if (!p.startsWith(resolve(THREE_ROOT, "examples/jsm/libs/draco"))) throw new Error("escape");
      res.writeHead(200, { "content-type": "application/wasm" }); return res.end(readFileSync(p));
    }
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
for (const v of ["lone_gameplay", "lone_near", "lone_profile", "lone_face", "inn_gameplay", "inn_gameplay_obl", "inn_scope", "inn_compose", "inn_near", "door_lane"]) {
  await page.evaluate(() => (window as any).setFill(false));
  await page.evaluate((s: any) => (window as any).setView(s), v);
  await page.waitForTimeout(60);
  await grab(`new-${v}.png`);
}
// probes at the contract views (unlit rig sun — calibrate from topColors)
// fill-lit face frame FIRST — the face view is BACKLIT by the rig sun
// (sun +x lights the bird's front? camera at (1.35,·,0.3) looks −x:
// the bird's +x face IS sunlit — but the bill cone's flat root face
// reads black edge-on; the fill frame is the discriminating pair for
// the r1 "no bill / stray teal / asymmetric whites" claims)
await page.evaluate(() => (window as any).setView("lone_face"));
await page.evaluate(() => (window as any).setFill(true));
await page.waitForTimeout(40);
await grab("new-lone_face-fill.png");
await page.evaluate(() => (window as any).setFill(false));
await page.evaluate(() => (window as any).setView("lone_profile"));
const wProf = await page.evaluate(() => (window as any).whiteProbe());
const gProf = await page.evaluate(() => (window as any).greenProbe());
const topProf: any = await page.evaluate(() => (window as any).topColors());
console.log("top colors profile:", JSON.stringify(topProf.slice(0, 14)));
await page.evaluate(() => (window as any).setView("lone_face"));
const wFace = await page.evaluate(() => (window as any).whiteProbe());
await page.evaluate(() => (window as any).setView("inn_scope"));
const wScope = await page.evaluate(() => (window as any).whiteProbe());
const gScope = await page.evaluate(() => (window as any).greenProbe());
await page.evaluate(() => (window as any).setView("lone_gameplay"));
const w18 = await page.evaluate(() => (window as any).whiteProbe());
console.log(`probes: white profile ${wProf} | face ${wFace} | scope18 ${wScope} | 18m broad ${w18} | green profile ${gProf} | scope ${gScope}`);
if (wProf < 60) throw new Error(`white markers absent at profile (${wProf})`);
if (gProf < 15) throw new Error(`green sheen absent at profile (${gProf})`);
if (w18 < 12) throw new Error(`white absent at 18m broadside (${w18})`);
// motion pair at the composition framing: t=0.9s vs t=8.3s
await page.evaluate(() => (window as any).setView("inn_compose"));
await page.evaluate((t: any) => (window as any).setPhase(t), 0.9);
await grab("new-motion-inn_compose-a.png");
const fa: any = await page.evaluate(() => (window as any).frame());
await page.evaluate((t: any) => (window as any).setPhase(t), 8.3);
await grab("new-motion-inn_compose-b.png");
const fb: any = await page.evaluate(() => (window as any).frame());
const diff = await page.evaluate(([a, b]: any) => (window as any).frameDiff(a, b), [fa, fb] as any);
const rows: any = await page.evaluate(() => (window as any).lastDiffRows);
const band = rows.length ? `${Math.min(...rows)}-${Math.max(...rows)} (of 960)` : "none";
console.log(`motion pair inn_compose: ${diff} px differ, x band ${band}`);
console.log("final rinfo:", JSON.stringify(await page.evaluate(() => (window as any).rinfo())));
await browser.close();
server.close();
console.log(`wrote fauna57 magpi renders -> ${outDir}`);
