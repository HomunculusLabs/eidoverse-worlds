// dress100-lav40-decode.ts — decode live lavender-0040 cure bytes (improve-45)
// for furrow geometry: ridge orientation, pitch, trench positions, plant mass
// heights. Playwright+DRACO chassis. Read-only.
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve, join, normalize } from "node:path";
import { chromium } from "playwright";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const cr = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!cr.ok) throw Error(`geom ${cr.status}`);
const cd: any = await cr.json();
const host = (cd.entities as any[]).find((e) => e.id === "nx-cultivation-lavender-0040");
if (!host) throw Error("lavender-0040 missing");
if (host.lib !== "store/5e04ce4b2ad6e90c.glb") throw Error(`lib drift: ${host.lib}`);
console.log(`census ${cd.entities.length}; lavender-0040 pos ${host.pos.map((v: number) => v.toFixed(2))} yaw ${host.yaw}`);

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
  for (const m of meshes) {
    const ys = m.vs.map(v => v[1]);
    console.log(`mesh ${m.name} n=${m.n} y ${Math.min(...ys).toFixed(3)}..${Math.max(...ys).toFixed(3)}`);
    // soil/ridge signature: bucket verts by (x rounded 0.25) and report per-column max y
    // for the soil mesh (low y), and plant stems (higher)
    if (m.n > 400) {
      const cols = new Map<string, number[]>();
      for (const v of m.vs) {
        const k = `${Math.round(v[0] * 4) / 4},${Math.round(v[2] * 4) / 4}`;
        const arr = cols.get(k) ?? []; arr.push(v[1]); cols.set(k, arr);
      }
      const keys = [...cols.keys()].slice(0, 8);
      for (const k of keys) {
        const ys2 = cols.get(k)!;
        console.log(`  col(${k}) maxY ${Math.max(...ys2).toFixed(2)} minY ${Math.min(...ys2).toFixed(2)} n=${ys2.length}`);
      }
      // ridge profile along local z at x=0: max y per z-bucket
      const zprof = new Map<number, number>();
      for (const v of m.vs) {
        if (Math.abs(v[0]) > 0.5) continue;
        const zk = Math.round(v[2] * 10) / 10;
        zprof.set(zk, Math.max(zprof.get(zk) ?? -9, v[1]));
      }
      const zk = [...zprof.keys()].sort((a, b) => a - b);
      console.log(`  z-profile at |x|<0.5 (z:maxY): ${zk.slice(0, 60).map(z => `${z.toFixed(1)}:${zprof.get(z)!.toFixed(2)}`).join(" ")}`);
    }
  }
} finally { await browser.close(); server.close(); }
