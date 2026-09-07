// improve26-decode-hamlet.ts — decode audit of the FIXED hamlet-0041 bytes
// (mason/glb-retex/work_1661_hamlet.glb, sha caa851af, rebuild ×2 proven
// deterministic). Improve-22 family cure class: wall Y-slot corruption must
// be GONE — 0 verts below grade, max y ≤ 5.0, stone bucket y-span = true wall
// heights. Also emits the new bbox for the placer BW/BD pin. Read-only.
// Chassis: improve25-decode-hamlet.ts.
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

const d = decodeGLB("agents/arthur/mason/glb-retex/work_1661_hamlet.glb");
const mats = (d.json.materials ?? []).map((m: any, i: number) => ({
  i,
  name: m.name ?? `mat${i}`,
  base: m.pbrMetallicRoughness?.baseColorFactor ?? null,
  emissive: m.emissiveFactor ?? null,
}));

let allMinY = Infinity, allMaxY = -Infinity, minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
let belowGrade = 0;
for (const b of d.buckets) {
  for (const [x, y, z] of b.verts) {
    if (y < -0.35) belowGrade++;
    if (y < allMinY) allMinY = y;
    if (y > allMaxY) allMaxY = y;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }
}
console.log("== GLOBAL ENVELOPE ==");
console.log(JSON.stringify({
  verts: d.buckets.reduce((s: number, b: any) => s + b.verts.length, 0),
  belowGrade,
  minY: +allMinY.toFixed(4), maxY: +allMaxY.toFixed(4),
  bbox: { minX: +minX.toFixed(3), maxX: +maxX.toFixed(3), minZ: +minZ.toFixed(3), maxZ: +maxZ.toFixed(3) },
  bboxSize: { x: +(maxX - minX).toFixed(3), z: +(maxZ - minZ).toFixed(3) },
}));
console.log("== PER-MATERIAL Y-SPANS (walls must be true heights, not ±7) ==");
for (const b of d.buckets) {
  const mn = b.mat; const m = mats[mn];
  const ys = b.verts.map(v => v[1]);
  const xs = b.verts.map(v => v[0]);
  const zs = b.verts.map(v => v[2]);
  console.log(JSON.stringify({
    mat: m?.name ?? mn,
    verts: b.verts.length,
    yMin: +Math.min(...ys).toFixed(3), yMax: +Math.max(...ys).toFixed(3),
    ySpan: +(Math.max(...ys) - Math.min(...ys)).toFixed(3),
    xMin: +Math.min(...xs).toFixed(3), xMax: +Math.max(...xs).toFixed(3),
    zMin: +Math.min(...zs).toFixed(3), zMax: +Math.max(...zs).toFixed(3),
  }));
}
const verdict = belowGrade === 0 && allMaxY <= 5.0;
console.log(verdict ? "DECODE_GREEN" : "DECODE_FAIL");
if (!verdict) process.exit(1);
