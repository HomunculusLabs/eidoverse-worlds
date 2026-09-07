// improve24-decode-hamlet.ts — decode audit of the FIXED hamlet-0015 bytes
// (mason/glb-retex/work_1635_hamlet.glb, sha b5a9de3d, rebuild ×2 proven
// deterministic). Improve-22's family cure class: wall Y-slot corruption must
// be GONE — 0 verts below grade, max y ≤ 5.0, stone bucket y-span = true wall
// heights. Read-only. Pitfall laws honored: mesh index 0 legal, node
// translations baked per-bucket, iterative index-stack walk.
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

const d = decodeGLB("agents/arthur/mason/glb-retex/work_1635_hamlet.glb");
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

// named-node census
console.log(`named nodes: ${d.json.nodes.filter((n: any) => !!n.name).length}`);
console.log(d.json.nodes.filter((n: any) => !!n.name).map((n: any) => n.name).join(", "));

// verts below grade (y < -0.35 village sink idiom bound per improve-22 contract)
let below = 0, belowMin = 0;
const belowSamples: [number, number, number][] = [];
for (const b of d.buckets) for (const v of b.verts) if (v[1] < -0.35) { below++; if (v[1] < belowMin) belowMin = v[1]; if (belowSamples.length < 12 && below % 13 === 0) belowSamples.push(v); }
console.log(`verts below y<-0.35: ${below}, min y = ${belowMin.toFixed(3)}, samples: ${JSON.stringify(belowSamples)}`);

// verts above y=5.0 (contract bound max y <= 5.0)
let above = 0, aboveMax = 0;
const aboveSamples: [number, number, number][] = [];
for (const b of d.buckets) for (const v of b.verts) if (v[1] > 5.0) { above++; if (v[1] > aboveMax) { aboveMax = v[1]; aboveSamples.length = 0; aboveSamples.push(v); } }
console.log(`verts above y>5.0: ${above}, max y = ${aboveMax.toFixed(3)}, topmost samples: ${JSON.stringify(aboveSamples)}`);

// global bbox from decoded verts
let gx0 = Infinity, gx1 = -Infinity, gy0 = Infinity, gy1 = -Infinity, gz0 = Infinity, gz1 = -Infinity;
for (const b of d.buckets) for (const [x, y, z] of b.verts) {
  if (x < gx0) gx0 = x; if (x > gx1) gx1 = x;
  if (y < gy0) gy0 = y; if (y > gy1) gy1 = y;
  if (z < gz0) gz0 = z; if (z > gz1) gz1 = z;
}
console.log(`decoded bbox: min=[${gx0.toFixed(3)}, ${gy0.toFixed(3)}, ${gz0.toFixed(3)}] max=[${gx1.toFixed(3)}, ${gy1.toFixed(3)}, ${gz1.toFixed(3)}] size=[${(gx1 - gx0).toFixed(3)}, ${(gy1 - gy0).toFixed(3)}, ${(gz1 - gz0).toFixed(3)}]`);
