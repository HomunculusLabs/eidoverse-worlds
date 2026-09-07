// dress100-orchard33-decode.ts — decode live orchard-0033 bytes (served via
// /library/store/) for a source-true trunk map. Playwright+DRACO chassis
// (dress98 pattern). Read-only probe. Prints per-mesh vertex stats and
// clusters trunk-band verts into candidate trunk columns.
// Usage: bun agents/arthur/dress100-orchard33-decode.ts
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve, join, normalize } from "node:path";
import { chromium } from "playwright";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

// fresh census → host pin
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
  // analysis in node: per-mesh envelope + trunk clustering
  interface Cluster { sx: number; sz: number; n: number; }
  for (const m of meshes) {
    const ys = m.vs.map(v => v[1]);
    const xs = m.vs.map(v => v[0]);
    const zs = m.vs.map(v => v[2]);
    console.log(`mesh ${m.name} n=${m.n} x ${Math.min(...xs).toFixed(2)}..${Math.max(...xs).toFixed(2)} z ${Math.min(...zs).toFixed(2)}..${Math.max(...zs).toFixed(2)} y ${Math.min(...ys).toFixed(2)}..${Math.max(...ys).toFixed(2)}`);
    const band = m.vs.filter(v => 0.4 <= v[1] && v[1] <= 1.6);
    if (band.length < 50) continue;
    const cls: Cluster[] = [];
    for (const v of band) {
      let hit = false;
      for (const c of cls) {
        if (Math.hypot(c.sx / c.n - v[0], c.sz / c.n - v[2]) < 0.8) { c.sx += v[0]; c.sz += v[2]; c.n++; hit = true; break; }
      }
      if (!hit) cls.push({ sx: v[0], sz: v[2], n: 1 });
    }
    const big = cls.filter(c => c.n >= 30).sort((a, b) => (a.sx / a.n) - (b.sx / b.n));
    console.log(`  trunk clusters (>=30v): ${big.length}`);
    for (const c of big) console.log(`  trunk (${(c.sx / c.n).toFixed(2)}, ${(c.sz / c.n).toFixed(2)}) n=${c.n}`);
  }
} finally { await browser.close(); server.close(); }
