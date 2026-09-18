// fauna16-orchard33-trunkdecode.ts — decode live orchard-0033 bytes (served
// via /library/store/, DRACO re-encode — struct-104 law: served bytes decode)
// for a source-true WORLD trunk map. Chassis: dress100-orchard33-decode.ts.
// Output: trunk columns in WORLD coords (host pos + yaw 2.356 transform) so
// the dovecote seat scan can treat the orchard as its true solids (trunks),
// not the 14.5m crown bbox that spans overhead.
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve, join, normalize } from "node:path";
import { chromium } from "playwright";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const cr = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!cr.ok) throw Error(`geom ${cr.status}`);
const cd: any = await cr.json();
const host = (cd.entities as any[]).find((e) => e.id === "nx-cultivation-orchard-0033");
if (!host) throw Error("orchard-0033 missing");
if (host.lib !== "store/55fdc827f0bbcbf4.glb") throw Error(`lib drift: ${host.lib}`);
console.log(`census ${cd.entities.length}; orchard-0033 pos ${host.pos.map((v: number) => v.toFixed(2))} yaw ${host.yaw}`);

const glb = await (await fetch(`${base}/library/${host.lib}`, { signal: AbortSignal.timeout(20_000) })).arrayBuffer();
console.log(`live bytes: ${glb.byteLength}`);

const THREE_ROOT = resolve("node_modules/three");
const DRACO_DIR = join(THREE_ROOT, "examples/jsm/libs/draco/gltf/");
const threeModule = join(THREE_ROOT, "build/three.module.js");
const html = `<!doctype html><meta charset="utf-8"><script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '/examples/jsm/loaders/DRACOLoader.js';
const draco=new DRACOLoader(); draco.setDecoderPath('/draco/');
const loader=new GLTFLoader(); loader.setDRACOLoader(draco);
const buf=await (await fetch('/model.glb')).arrayBuffer();
const ab=buf.slice(0);
loader.parse(ab, '', (g)=>{
  const root=g.scene; root.updateMatrixWorld(true);
  const out=[];
  root.traverse(o=>{
    if(!o.isMesh) return;
    const pos=o.geometry.getAttribute('position');
    const vs=[];
    for(let i=0;i<pos.count;i++){
      const p=new THREE.Vector3().fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);
      vs.push([p.x,p.y,p.z]);
    }
    out.push({name:o.name, n:pos.count, vs});
  });
  window.__meshes=out; window.__ready=true;
}, (e)=>{window.__ready='ERR:'+String(e)});
</script>`;
const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/") { res.setHeader("content-type", "text/html"); res.end(html); return; }
    if (url === "/model.glb") { res.setHeader("content-type", "model/gltf-binary"); res.end(Buffer.from(glb)); return; }
    if (url === "/three.module.js") { res.setHeader("content-type", "text/javascript"); res.end(readFileSync(threeModule)); return; }
    if (url === "/three.core.js") { res.setHeader("content-type", "text/javascript"); res.end(readFileSync(join(THREE_ROOT, "build/three.core.js"))); return; }
    if (url.startsWith("/draco/")) { const f = url.slice("/draco/".length); const p = join(DRACO_DIR, f); if (!p.startsWith(DRACO_DIR)) throw new Error("escape"); res.setHeader("content-type", f.endsWith(".wasm") ? "application/wasm" : "text/javascript"); res.end(readFileSync(p)); return; }
    if (url.startsWith("/examples/jsm/")) {
      const rel = normalize(url.slice(1)); const p = join(THREE_ROOT, rel);
      if (!p.startsWith(THREE_ROOT)) throw new Error("path escape");
      let s = readFileSync(p, "utf8").replaceAll("from 'three'", "from '/three.module.js'").replaceAll('from "three"', 'from "/three.module.js"');
      res.setHeader("content-type", "text/javascript"); res.end(s); return;
    }
    res.statusCode = 404; res.end("not found");
  } catch (e: any) { res.statusCode = 500; res.end(String(e?.message ?? e)); }
});
await new Promise<void>(r => server.listen(0, "127.0.0.1", r));
const addr: any = server.address();
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 960, height: 720 } });
  page.on("pageerror", e => console.error("PAGEERROR", e.message));
  await page.goto(`http://127.0.0.1:${addr.port}/`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => (window as any).__ready === true, undefined, { timeout: 60_000 });
  const meshes: { name: string, n: number, vs: number[][] }[] = await page.evaluate(() => (window as any).__meshes);
  server.close();
  // trunk clustering in LOCAL frame, then host transform to WORLD
  const yaw = host.yaw, c = Math.cos(yaw), s = Math.sin(yaw);
  const [hx, , hz] = host.pos;
  const trunks: Array<[number, number, number]> = []; // wx, wz, n
  for (const m of meshes) {
    const ys = m.vs.map(v => v[1]);
    const band = m.vs.filter(v => 0.4 <= v[1] && v[1] <= 1.6);
    console.log(`mesh ${m.name} n=${m.n} y ${Math.min(...ys).toFixed(2)}..${Math.max(...ys).toFixed(2)} band ${band.length}`);
    // pitfall-1 law: merged trunk cylinders have ring verts ONLY at their
    // end faces — cluster the LOW ring (y < 0.3) of the merged trunk mesh
    // (the one spanning y 0..2.46) instead of a mid-height band.
    const low = m.vs.filter(v => v[1] < 0.3);
    if (low.length < 50) continue;
    for (const v of low) {
      let hit = false;
      for (const t of trunks) {
        if (Math.hypot(t[0] - v[0], t[1] - v[2]) < 0.8) { t[0] = (t[0] * t[2] + v[0]) / (t[2] + 1); t[1] = (t[1] * t[2] + v[2]) / (t[2] + 1); t[2]++; hit = true; break; }
      }
      if (!hit) trunks.push([v[0], v[2], 1]);
    }
  }
  const big = trunks.filter(t => t[2] >= 12); // 8-seg ring ≈ 9-18 low verts/trunk
  console.log(`trunk clusters (>=30v): ${big.length}`);
  console.log("WORLD trunks (x, z, votes):");
  for (const t of big.sort((a, b) => a[0] - b[0])) {
    const wx = hx + t[0] * c + t[1] * s;
    const wz = hz - t[0] * s + t[1] * c;
    console.log(`  (${wx.toFixed(2)}, ${wz.toFixed(2)}) n=${t[2]}`);
  }
} finally { await browser.close(); server.close(); }
