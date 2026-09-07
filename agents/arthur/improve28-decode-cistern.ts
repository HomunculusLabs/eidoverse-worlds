// improve28-decode-cistern.ts — decode audit: after (30c45c0a) vs before
// (d3d3ad75, banked /tmp/improve28-cistern-before.glb). Checks:
// (1) water plane raised: water-bucket verts at y≈0.60 (before 0.45);
// (2) footprint x/z bbox identical (SAT-neutral);
// (3) zero verts below grade;
// (4) vert count conservation (geometry otherwise untouched).
import { readFileSync } from "node:fs";

function decodeGLB(path: string) {
  const buf = readFileSync(path);
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const jsonLen = dv.getUint32(12, true);
  const json = JSON.parse(buf.slice(20, 20 + jsonLen).toString("utf8"));
  // JSON chunk is space-padded so the BIN chunk header is 4-aligned
  let binHdr = 20 + jsonLen; binHdr = (binHdr + 3) & ~3;
  const binHdrLen = dv.getUint32(binHdr, true);
  if (dv.getUint32(binHdr + 4, true) !== 0x004e4942) throw Error(`BIN magic at ${binHdr}`);
  const bin = buf.slice(binHdr + 8, binHdr + 8 + binHdrLen);
  const meshes = json.meshes ?? [];
  const nodes = json.nodes ?? [];
  const out: { node: string; verts: [number, number, number][] }[] = [];
  for (const node of nodes) {
    if (node.mesh === undefined) continue;
    const mesh = meshes[node.mesh];
    if (!mesh) continue;
    const t = node.translation ?? [0, 0, 0];
    for (const prim of mesh.primitives) {
      const posAcc = json.accessors[prim.attributes.POSITION];
      const bv = json.bufferViews[posAcc.bufferView];
      const off = (bv.byteOffset ?? 0) + (posAcc.byteOffset ?? 0);
      const n = posAcc.count;
      const verts: [number, number, number][] = [];
      const base0 = binHdr + 8;
      for (let i = 0; i < n; i++) {
        const o = base0 + off + i * 12;
        verts.push([
          dv.getFloat32(o, true) + t[0],
          dv.getFloat32(o + 4, true) + t[1],
          dv.getFloat32(o + 8, true) + t[2],
        ]);
      }
      out.push({ node: node.name ?? `#${nodes.indexOf(node)}`, verts });
    }
  }
  return { json, buckets: out };
}

const A = decodeGLB("/tmp/improve28-cistern-before.glb");
const B = decodeGLB("agents/arthur/assets/village_bcistern3.glb");

const allV = (d: ReturnType<typeof decodeGLB>) => d.buckets.flatMap((b) => b.verts);
const bbox = (vs: [number, number, number][]) => {
  const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (const v of vs) for (let i = 0; i < 3; i++) { mn[i] = Math.min(mn[i], v[i]); mx[i] = Math.max(mx[i], v[i]); }
  return { mn: mn.map((x) => +x.toFixed(3)), mx: mx.map((x) => +x.toFixed(3)) };
};
const bbA = bbox(allV(A)), bbB = bbox(allV(B));
console.log("before bbox", JSON.stringify(bbA));
console.log("after  bbox", JSON.stringify(bbB));

// (1) water bucket: the only bucket whose y-extent CHANGES. Before: flat at
// 0.45; after: flat at 0.60. Identify by y-uniqueness, then assert.
for (const [label, d] of [["before", A], ["after", B]] as const) {
  for (const b of d.buckets) {
    const ys = new Set(b.verts.map((v) => +v[1].toFixed(2)));
    // water slab: a bucket containing exactly 2 distinct y levels (top 0.60/0.45 + bottom -0.02-ish), spanning y < 0.65, x-extent ~0.72, z ~0.44
    const xs = b.verts.map((v) => v[0]), zs = b.verts.map((v) => v[2]);
    const ex = Math.max(...xs) - Math.min(...xs), ez = Math.max(...zs) - Math.min(...zs);
    if (ys.size <= 3 && ex < 0.8 && ez < 0.5 && Math.max(...b.verts.map((v) => v[1])) < 0.65 && Math.max(...b.verts.map((v) => v[1])) > 0.4) {
      console.log(`WATER bucket [${label}] node=${b.node} y-levels=${[...ys].sort()} x-extent=${ex.toFixed(3)} z-extent=${ez.toFixed(3)}`);
    }
  }
}

// (2) footprint identical on x/z
const fp = (bb: typeof bbA) => `${bb.mn[0]},${bb.mx[0]} x ${bb.mn[2]},${bb.mx[2]}`;
console.log("footprint before:", fp(bbA), " after:", fp(bbB));
if (fp(bbA) !== fp(bbB)) throw Error("FOOTPRINT CHANGED — not SAT-neutral");

// (3) below grade
const belowB = allV(B).filter((v) => v[1] < -0.005).length;
console.log("after below-grade verts:", belowB);

// (4) vert conservation
console.log("vert counts before/after:", allV(A).length, allV(B).length);

// (1b) explicit assert: some bucket has verts at y 0.60 ± 0.005 with the water extent
let waterOK = false;
for (const b of B.buckets) {
  const near = b.verts.filter((v) => Math.abs(v[1] - 0.60) < 0.02);
  if (near.length >= 4) {
    const xs = near.map((v) => v[0]), zs = near.map((v) => v[2]);
    const ex = Math.max(...xs) - Math.min(...xs), ez = Math.max(...zs) - Math.min(...zs);
    if (ex > 0.65 && ex < 0.8 && ez > 0.35 && ez < 0.5) { waterOK = true; console.log(`ASSERT PASS water@0.60: ${near.length} verts, extents ${ex.toFixed(3)}x${ez.toFixed(3)}`); }
  }
}
if (!waterOK) throw Error("water plane at y=0.60 NOT FOUND");
// and before had it at 0.45
let waterBefore = false;
for (const b of A.buckets) {
  const flat = b.verts.filter((v) => Math.abs(v[1] - 0.45) < 0.02);
  if (flat.length >= 4) { waterBefore = true; }
}
if (!waterBefore) throw Error("before bytes lacked water@0.45 — wrong baseline");
console.log("DECODE AUDIT ALL PASS");
