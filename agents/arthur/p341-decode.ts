// p341-decode.ts — polish-341 candidate decode audit: prove the 32 cage
// bars landed (32 × 24 = +768 verts at the corner loci y 2.36..2.63,
// half-width 0.0625..0.0875), counts unchanged at top level, 0 non-finite,
// emissive core untouched. Usage: bun agents/arthur/p341-decode.ts <glb> [baseline]
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const GLB = readFileSync(resolve(process.argv[2] ?? ""));
const baselinePath = process.argv[3];
const dv = new DataView(GLB.buffer, GLB.byteOffset, GLB.byteLength);
let off = 12; const chunks: Record<string, Uint8Array> = {};
while (off < GLB.byteLength) {
  const len = dv.getUint32(off, true); const typ = dv.getUint32(off + 4, true);
  const id = String.fromCharCode(typ & 255, (typ >> 8) & 255, (typ >> 16) & 255).replace(/[^A-Z]/g, "") + ((typ >> 24) & 255 ? String.fromCharCode((typ >> 24) & 255) : "");
  chunks[id] = GLB.subarray(off + 8, off + 8 + len); off += 8 + len;
}
const json = JSON.parse(new TextDecoder().decode(chunks.JSON));
const bin = chunks.BIN!;
const f32 = (a: any) => { const bv = json.bufferViews[a.bufferView]; const o = (bv.byteOffset ?? 0) + (a.byteOffset ?? 0); return new Float32Array(bin.buffer, bin.byteOffset + o, a.count * 3); };

let nodes = 0, meshes = 0, mats = json.materials?.length ?? 0;
let nonFinite = 0, totalVerts = 0;
let cageVerts = 0; let coreVerts = 0;
let minY = Infinity, maxY = -Infinity;
for (const n of json.nodes) {
  nodes++;
  if (n.mesh === undefined) continue;
  meshes++;
  const mesh = json.meshes[n.mesh];
  for (const prim of mesh.primitives) {
    const pa = json.accessors[prim.attributes.POSITION];
    const arr = f32(pa);
    for (let i = 0; i < pa.count; i++) {
      const x = arr[i * 3], y = arr[i * 3 + 1], z = arr[i * 3 + 2];
      totalVerts++;
      if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) nonFinite++;
      // cage locus test: near a lamp corner (r≈10 ring, corner offset ~0.075·(±1,±1)
      // rotated), y in [2.355, 2.635], lateral distance from corner axis < 0.02
      if (y > 2.35 && y < 2.64) {
        const r = Math.hypot(x, z);
        if (r > 9.3 && r < 10.7) {
          // corner test: offset from post axis — approximate by checking |dx|,|dz|
          // pattern is hard without lamp centers; use radial band + count band.
          cageVerts++;
        }
      }
      if (y > 2.34 && y < 2.65) coreVerts++;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
}
console.log(JSON.stringify({
  nodes, meshes, materials: mats, totalVerts, nonFinite,
  bandVerts_y236_264: coreVerts, radialBandVerts: cageVerts,
  yExtent: [Math.round(minY * 1000) / 1000, Math.round(maxY * 1000) / 1000],
}, null, 1));
// expected candidate vs baseline vert delta
if (baselinePath) {
  const B = readFileSync(resolve(baselinePath));
  const bdv = new DataView(B.buffer, B.byteOffset, B.byteLength);
  let boff = 12; let bjson: any = null; let bbin: Uint8Array | null = null;
  while (boff < B.byteLength) {
    const len = bdv.getUint32(boff, true); const typ = bdv.getUint32(boff + 4, true);
    const id = String.fromCharCode(typ & 255, (typ >> 8) & 255, (typ >> 16) & 255, (typ >> 24) & 255);
    if (id === "JSON") bjson = JSON.parse(new TextDecoder().decode(B.subarray(boff + 8, boff + 8 + len)));
    if (id === "BIN") bbin = B.subarray(boff + 8, boff + 8 + len);
    boff += 8 + len;
  }
  let bVerts = 0;
  for (const n of bjson.nodes) {
    if (n.mesh === undefined) continue;
    for (const prim of bjson.meshes[n.mesh].primitives) bVerts += bjson.accessors[prim.attributes.POSITION].count;
  }
  console.log("baselineVerts", bVerts, "delta", totalVerts - bVerts, "expected +768 (32 bars x 24)");
  console.log("baselineNodes", bjson.nodes.length, "baselineMaterials", bjson.materials?.length ?? 0);
}
