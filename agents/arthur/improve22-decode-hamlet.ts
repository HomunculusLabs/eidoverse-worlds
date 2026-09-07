// improve22-decode-hamlet.ts — decode audit of the LIVE hamlet-0007 bytes
// (mason/glb-retex/work_1687_hamlet.glb, sha e2f134cf, byte-identical to the
// source rebuild proven this tick). Purpose: resolve the survey-9 Sev-2
// findings at source BEFORE any edit — vertex-true y-ranges per merged
// material bucket, named-node census, and the truth about the live bbox
// y-range [-7.569, +5.511] (composer builds nothing below y=0).
// Read-only. Pitfall laws honored: mesh index 0 legal, node translations
// baked per-bucket, iterative index-stack walk.
import { readFileSync } from "node:fs";

function decodeGLB(path: string) {
  const buf = readFileSync(path);
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const jsonLen = dv.getUint32(12, true);
  const json = JSON.parse(buf.slice(20, 20 + jsonLen).toString("utf8"));
  let binHdr = 20 + jsonLen; binHdr = (binHdr + 3) & ~3;
  const binHdrLen = dv.getUint32(binHdr, true);
  if (dv.getUint32(binHdr + 4, true) !== 0x004e4942) throw Error(`BIN magic at ${binHdr}`);
  const base0 = binHdr + 8;
  const meshes = json.meshes ?? [];
  const nodes = json.nodes ?? [];
  const out: { node: string; mat: number; verts: [number, number, number][] }[] = [];
  for (const node of nodes) {
    if (node.mesh === undefined) continue; // === undefined, never falsy (mesh 0 legal)
    const mesh = meshes[node.mesh];
    if (!mesh) continue;
    const t = node.translation ?? [0, 0, 0];
    for (const prim of mesh.primitives) {
      const posAcc = json.accessors[prim.attributes.POSITION];
      const bv = json.bufferViews[posAcc.bufferView];
      const off = (bv.byteOffset ?? 0) + (posAcc.byteOffset ?? 0);
      const n = posAcc.count;
      const verts: [number, number, number][] = [];
      for (let i = 0; i < n; i++) {
        const o = base0 + off + i * 12;
        verts.push([
          dv.getFloat32(o, true) + t[0],
          dv.getFloat32(o + 4, true) + t[1],
          dv.getFloat32(o + 8, true) + t[2],
        ]);
      }
      out.push({ node: node.name ?? `#${nodes.indexOf(node)}`, mat: prim.material ?? -1, verts });
    }
  }
  return { json, buckets: out };
}

const d = decodeGLB("agents/arthur/mason/glb-retex/work_1687_hamlet.glb");
const mats = (d.json.materials ?? []).map((m: any, i: number) => ({
  i,
  name: m.name ?? `mat${i}`,
  base: m.pbrMetallicRoughness?.baseColorFactor ?? null,
  emissive: m.emissiveFactor ?? null,
}));
console.log(`nodes: ${d.json.nodes.length}, meshes: ${d.json.meshes.length}, buckets: ${d.buckets.length}`);
console.log("materials:", JSON.stringify(mats));

// per-bucket y-range + x/z extent, sorted worst y-min first
const rows = d.buckets.map((b) => {
  let yMin = Infinity, yMax = -Infinity, xMin = Infinity, xMax = -Infinity, zMin = Infinity, zMax = -Infinity;
  for (const [x, y, z] of b.verts) {
    if (y < yMin) yMin = y; if (y > yMax) yMax = y;
    if (x < xMin) xMin = x; if (x > xMax) xMax = x;
    if (z < zMin) zMin = z; if (z > zMax) zMax = z;
  }
  return { node: b.node, mat: b.mat, n: b.verts.length, yMin: +yMin.toFixed(3), yMax: +yMax.toFixed(3), xMin: +xMin.toFixed(3), xMax: +xMax.toFixed(3), zMin: +zMin.toFixed(3), zMax: +zMax.toFixed(3) };
});
rows.sort((a, b) => a.yMin - b.yMin);
console.log("buckets (worst y-min first):");
for (const r of rows) console.log(`  ${r.node.padEnd(28)} n=${String(r.n).padStart(5)} y=[${r.yMin}, ${r.yMax}] x=[${r.xMin}, ${r.xMax}] z=[${r.zMin}, ${r.zMax}] mat=${r.mat}`);

// named-node census (KEEP survivors + singles)
const named = d.json.nodes.filter((n: any) => n.name && !/^\d/.test(n.name) === false ? false : !!n.name);
console.log(`named nodes: ${d.json.nodes.filter((n: any) => !!n.name).length}`);
console.log(d.json.nodes.filter((n: any) => !!n.name).map((n: any) => n.name).join(", "));

// verts below grade (y < -0.05): count + min
let below = 0, belowMin = 0, belowSamples: [number, number, number][] = [];
for (const b of d.buckets) for (const v of b.verts) if (v[1] < -0.05) { below++; if (v[1] < belowMin) belowMin = v[1]; if (belowSamples.length < 12 && below % 97 === 0) belowSamples.push(v); }
console.log(`verts below y<-0.05: ${below}, min y = ${belowMin.toFixed(3)}, samples: ${JSON.stringify(belowSamples)}`);

// verts above y=4.6 (above composer max ~4.5): count + max + samples
let above = 0, aboveMax = 0;
const aboveSamples: [number, number, number][] = [];
for (const b of d.buckets) for (const v of b.verts) if (v[1] > 4.6) { above++; if (v[1] > aboveMax) { aboveMax = v[1]; aboveSamples.length = 0; aboveSamples.push(v); } }
console.log(`verts above y>4.6: ${above}, max y = ${aboveMax.toFixed(3)}, topmost samples: ${JSON.stringify(aboveSamples)}`);
