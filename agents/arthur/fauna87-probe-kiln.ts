// fauna87-probe-kiln.ts — geometry probe of the LIVE served kiln bytes
// (/tmp/fauna87-kiln-served.glb, sha16 668692f7 — served DRACO re-encode of
// live lib 3e96c8b0). READ-ONLY instrument: loads the GLB in chromium with
// the rig chassis's DRACOLoader, then dumps (1) the node table (name, mesh?,
// Box3 world-in-GLB), (2) the VERTEX-AZIMUTH FIT at the reader/sun band
// t in [-2.2, -0.2] (world N-through-E arc — the reader spoke + morning-sun
// side), y in [0, 2.0]: per 0.1-y-bin per 0.2-az-bin the min/max radius, so
// the drum taper + any flat course/plinth reads as data. Vertex-true, not
// union boxes (sweep-319 law). NO renders, NO world mutation.
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const kilnBytes = readFileSync("/tmp/fauna87-kiln-served.glb");
const kilnSha = createHash("sha256").update(kilnBytes).digest("hex").slice(0, 16);
if (kilnSha !== "668692f76251e460") throw new Error(`served kiln drift ${kilnSha}`);
const THREE_ROOT = resolve("node_modules/three");

const html = `<!doctype html><meta charset="utf-8">
<script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '/examples/jsm/loaders/DRACOLoader.js';
const draco=new DRACOLoader().setDecoderPath('/draco/');
const loader=new GLTFLoader(); loader.setDRACOLoader(draco);
const gltf=await loader.loadAsync('/kiln.glb');
const root=gltf.scene; root.updateMatrixWorld(true);
const out={nodes:[],band:null,whole:null};
root.traverse(o=>{ out.nodes.push({name:o.name, mesh:!!o.isMesh, x:+(o.position.x).toFixed(3), y:+(o.position.y).toFixed(3), z:+(o.position.z).toFixed(3)}); });
const v=new THREE.Vector3();
const whole=new THREE.Box3();
// vertex-true azimuth fit on the reader/sun band
const bins=new Map();
root.traverse((o)=>{ if(!o.isMesh) return;
  const pos=o.geometry.attributes.position;
  whole.expandByObject(o);
  for(let i=0;i<pos.count;i++){
    v.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);
    const t=Math.atan2(v.z,v.x);
    const y=v.y;
    if(y<0||y>2.0) continue;
    let tt=t; while(tt<-Math.PI) tt+=2*Math.PI; while(tt>Math.PI) tt-=2*Math.PI;
    if(tt<-2.2||tt>-0.2) continue;
    const bk=(Math.round(y*10)/10).toFixed(1)+'|'+(Math.round(tt*5)/5).toFixed(2);
    const b=bins.get(bk)||{minR:1e9,maxR:-1e9,n:0,y:+(Math.round(y*10)/10).toFixed(1),t:+(Math.round(tt*5)/5).toFixed(2)};
    const r=Math.hypot(v.x,v.z);
    if(r<b.minR)b.minR=r; if(r>b.maxR)b.maxR=r; b.n++;
    bins.set(bk,b);
  }
});
out.band=[...bins.values()].sort((a,b)=>a.y-b.y||a.t-b.t);
out.whole={min:whole.min.toArray().map(n=>+n.toFixed(3)),max:whole.max.toArray().map(n=>+n.toFixed(3))};
window.PROBE=out; window.probeReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/kiln.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(kilnBytes); }
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
      res.writeHead(200, { "content-type": "text/javascript" }); res.end(s); return;
    }
    res.writeHead(404); res.end("not found");
  } catch (e: any) { res.statusCode = 500; res.end(String(e?.message ?? e)); }
});
await new Promise<void>(r => server.listen(0, "127.0.0.1", r));
const port = (server.address() as any).port;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 400, height: 300 } });
page.on("pageerror", e => console.error("PAGEERROR", e.message));
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
await page.waitForFunction(() => (window as any).probeReady === true, undefined, { timeout: 60_000 });
const probe: any = await page.evaluate(() => (window as any).PROBE);
await browser.close(); server.close();

console.log("whole GLB box:", JSON.stringify(probe.whole));
console.log("nodes (name mesh pos):");
for (const n of probe.nodes) console.log("  " + n.name + (n.mesh ? " [mesh]" : "") + " @ " + n.x + "," + n.y + "," + n.z);
console.log("band fit (y | t | minR..maxR | n) — reader/sun arc t in [-2.2,-0.2]:");
for (const b of probe.band) if (b.n >= 3) console.log("  y " + b.y.toFixed(1) + " t " + b.t.toFixed(2) + "  r " + b.minR.toFixed(3) + ".." + b.maxR.toFixed(3) + "  n" + b.n);
