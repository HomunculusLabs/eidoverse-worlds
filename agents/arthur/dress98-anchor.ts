// dress98-anchor.ts — derive the exact ring-7 gap-edge anchor for the
// offering-niche rider from SERVED maze bytes + FRESH census (host epoch
// guard). Read-only. Prints: host tuple check, true gap angular bounds at
// r>6.5 (outer ring only), gap-edge stone center, world anchor + yaw, band
// and cone numbers. Usage: bun agents/arthur/dress98-anchor.ts
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve, join, normalize } from "node:path";
import { chromium } from "playwright";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

// 1. fresh census — host epoch guard
const cr = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!cr.ok) throw Error(`geom ${cr.status}`);
const ents: any[] = (await cr.json()).entities ?? [];
const host = ents.find(e => e.id === "nx-temple-labyrinth-0038");
if (!host) throw Error("host missing from census");
if (host.lib !== "store/2d3d2032d3e806f8.glb") throw Error(`host lib drift: ${host.lib}`);
console.log("HOST:", JSON.stringify({ id: host.id, lib: host.lib, pos: host.pos, yaw: host.yaw }));
console.log("census:", ents.length);

// 2. served bytes
const glb = await (await fetch(`${base}/library/${host.lib}`, { signal: AbortSignal.timeout(20_000) })).arrayBuffer();
const bytes = Buffer.from(glb);
if (bytes.subarray(0, 2).toString() !== "gl") throw Error("not glb");

const THREE_ROOT = resolve("node_modules/three");
const DRACO_DIR = join(THREE_ROOT, "examples/jsm/libs/draco/gltf/");
const threeModule = join(THREE_ROOT, "build/three.module.js");
const html = `<!doctype html><meta charset="utf-8">
<script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '/examples/jsm/loaders/DRACOLoader.js';
const draco=new DRACOLoader(); draco.setDecoderPath('/draco/');
const loader=new GLTFLoader(); loader.setDRACOLoader(draco);
const gltf=await loader.loadAsync('/model.glb');
const root=gltf.scene; root.updateMatrixWorld(true);
const outer=[];
root.traverse(o=>{
  if(!o.isMesh||o.name!=='_l$_0') return;
  const pos=o.geometry.getAttribute('position');
  for(let i=0;i<pos.count;i++){
    const p=new THREE.Vector3().fromBufferAttribute(pos,i);
    outer.push([p.x,p.z]);
  }
});
// outer ring only: r>6.5; angular bounds of the gap (deg in [0,360))
let lo=Infinity,hi=-Infinity; const nearEdge=[];
for(const [x,z] of outer){
  const r=Math.hypot(x,z); if(r<6.5) continue;
  let a=Math.atan2(z,x)*180/Math.PI; if(a<0)a+=360;
  lo=Math.min(lo,a); hi=Math.max(hi,a);
}
// gap = the empty span; ring-7 gap centered at 180 per mason source.
// collect vertices near the gap ends: a in [140,165] and [195,220]
let eCW={a:0,r:0},eCCW={a:360,r:0};
for(const [x,z] of outer){
  const r=Math.hypot(x,z); if(r<6.5) continue;
  let a=Math.atan2(z,x)*180/Math.PI; if(a<0)a+=360;
  if(a>=140&&a<=175&&a>eCW.a) eCW={a,r};
  if(a>=185&&a<=220&&a<eCCW.a) eCCW={a,r};
}
// stone-center estimate: gap-edge stone center ~ a_edge +/- ~2.3deg inward of the run
window.__out={eCW,eCCW,angMin:lo,angMax:hi};
window.__ready=true;
</script>`;
const server = createServer((req, res) => {
  const url = (req.url ?? "").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.setHeader("content-type", "text/html"); res.end(html); return; }
    if (url === "/model.glb") { res.setHeader("content-type", "model/gltf-binary"); res.end(bytes); return; }
    if (url === "/three.module.js") { res.setHeader("content-type", "text/javascript"); res.end(readFileSync(threeModule)); return; }
    if (url === "/three.core.js") { res.setHeader("content-type", "text/javascript"); res.end(readFileSync(join(THREE_ROOT, "build/three.core.js"))); return; }
    if (url.startsWith("/draco/")) { const f = url.slice("/draco/".length); const p = join(DRACO_DIR, f); if (!p.startsWith(DRACO_DIR)) throw new Error("escape"); res.setHeader("content-type", f.endsWith(".wasm") ? "application/wasm" : "text/javascript"); res.end(readFileSync(p)); return; }
    if (url.startsWith("/examples/jsm/")) {
      const rel = normalize(url.slice(1)); const p = join(THREE_ROOT, rel);
      if (!p.startsWith(THREE_ROOT)) throw new Error("path escape");
      const s = readFileSync(p, "utf8").replaceAll("from 'three'", "from '/three.module.js'").replaceAll('from "three"', 'from "/three.module.js"');
      res.setHeader("content-type", "text/javascript"); res.end(s); return;
    }
    res.statusCode = 404; res.end("not found");
  } catch (e: any) { res.statusCode = 500; res.end(String(e?.message ?? e)); }
});
await new Promise<void>(r => server.listen(0, "127.0.0.1", r));
const addr = server.address(); if (!addr || typeof addr === "string") throw new Error("no addr");
const browser = await chromium.launch({ headless: true });
let out: any;
try {
  const page = await browser.newPage({ viewport: { width: 400, height: 300 } });
  page.on("pageerror", e => console.error("PAGEERROR", e.message));
  await page.goto(`http://127.0.0.1:${addr.port}/`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => (window as any).__ready === true, undefined, { timeout: 60_000 });
  out = await page.evaluate(() => (window as any).__out);
} finally { await browser.close(); server.close(); }

// 3. world anchor math (align-1 convention)
const [px, , pz] = host.pos, yaw = host.yaw;
const cos = Math.cos(yaw), sin = Math.sin(yaw);
const toWorld = (lx: number, lz: number) => [px + lx * cos + lz * sin, pz - lx * sin + lz * cos];
// gap edges (local deg): eCCW = the 213-side (walker-side from seats, in band)
for (const [tag, aDeg, rr] of [["gap-end CW (147-side)", out.eCW.a, out.eCW.r], ["gap-end CCW (213-side)", out.eCCW.a, out.eCCW.r]] as [string, number, number][]) {
  const a = aDeg * Math.PI / 180;
  const lx = Math.cos(a) * 6.85, lz = Math.sin(a) * 6.85; // wall radius
  const [wx, wz] = toWorld(lx, lz);
  const rWorld = Math.hypot(wx, wz);
  const bearingFromCenter = Math.atan2(wx - px, wz - pz) * 180 / Math.PI;
  // rider yaw: local +z (rider out-face) points outward radially.
  // outward radial local dir at angle a: (cos a, sin a) in local xz. After
  // entity yaw: world dir = (cos a·cos + sin a·sin, -(cos a)·sin + sin a·cos)
  const ox = Math.cos(a) * cos + Math.sin(a) * sin;
  const oz = -Math.cos(a) * sin + Math.sin(a) * cos;
  const riderYaw = Math.atan2(ox, oz); // yaw whose local +z maps to (ox,oz)
  console.log(`${tag}: edgeVertAngle=${aDeg.toFixed(2)}deg r=${rr.toFixed(2)} -> wallPos local(${lx.toFixed(3)},${lz.toFixed(3)}) world(${wx.toFixed(3)},${wz.toFixed(3)}) rWorld=${rWorld.toFixed(2)} bearingFromCenter=${((bearingFromCenter + 360) % 360).toFixed(1)}deg riderYaw(rad)=${rYaw4(riderYaw)} (${(riderYaw * 180 / Math.PI).toFixed(2)}deg)`);
}
function rYaw4(v: number) { return v.toFixed(4); }
// cones: devotional corridor 12.3deg for labyrinth; seats cone to plaza
const seats = ents.find(e => e.id === "nx-dress-sw-seats-001");
if (seats) {
  const a213 = out.eCCW.a * Math.PI / 180;
  const [wx, wz] = toWorld(Math.cos(a213) * 6.85, Math.sin(a213) * 6.85);
  const dSeat = Math.hypot(wx - seats.pos[0], wz - seats.pos[2]);
  const bSeat = Math.atan2(wx - seats.pos[0], wz - seats.pos[2]) * 180 / Math.PI;
  const seatAxis = Math.atan2(-seats.pos[0], -seats.pos[2]) * 180 / Math.PI;
  console.log(`seats-check: dist=${dSeat.toFixed(2)}m bearingFromSeats=${((bSeat + 360) % 360).toFixed(1)}deg seatApproachAxis(toPlaza)=${((seatAxis + 360) % 360).toFixed(1)}deg coneDiff=${Math.abs(((bSeat - seatAxis + 540) % 360) - 180).toFixed(1)}deg (need >25 if <18m)`);
}
console.log(JSON.stringify(out));
