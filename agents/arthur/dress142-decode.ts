// dress142-decode.ts — decode audit of timberyard v8 (262a841d)
import { readFileSync } from "node:fs";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_dress_ne_timberyard1.glb`);
const json = JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + new DataView(bytes.buffer, bytes.byteOffset + 12, 4).getUint32(0, true))));
const binOff = 20 + new DataView(bytes.buffer, bytes.byteOffset + 12, 4).getUint32(0, true);
const binLen = new DataView(bytes.buffer, bytes.byteOffset + 12 + 8, 4).getUint32(0, true);
const bin = bytes.subarray(binOff, binOff + binLen);
const dv = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);

// world transforms per node (translations only; no rotations on this asset)
let minX = 1e9, minY = 1e9, minZ = 1e9, maxX = -1e9, maxY = -1e9, maxZ = -1e9;
let totalVerts = 0;
const bucketRows = [];
for (let ni = 0; ni < json.nodes.length; ni++) {
  const n = json.nodes[ni];
  if (n.mesh === undefined) continue;
  const mesh = json.meshes[n.mesh];
  const t = n.translation ?? [0, 0, 0];
  let bminX = 1e9, bminY = 1e9, bminZ = 1e9, bmaxX = -1e9, bmaxY = -1e9, bmaxZ = -1e9, verts = 0;
  for (const prim of mesh.primitives) {
    const posAcc = json.accessors[prim.attributes.POSITION];
    const off = (json.bufferViews[posAcc.bufferView].byteOffset ?? 0) + (posAcc.byteOffset ?? 0);
    for (let i = 0; i < posAcc.count; i++) {
      const x = dv.getFloat32(off + i * 12, true) + t[0];
      const y = dv.getFloat32(off + i * 12 + 4, true) + t[1];
      const z = dv.getFloat32(off + i * 12 + 8, true) + t[2];
      verts++;
      bminX = Math.min(bminX, x); bmaxX = Math.max(bmaxX, x);
      bminY = Math.min(bminY, y); bmaxY = Math.max(bmaxY, y);
      bminZ = Math.min(bminZ, z); bmaxZ = Math.max(bmaxZ, z);
    }
  }
  totalVerts += verts;
  minX = Math.min(minX, bminX); maxX = Math.max(maxX, bmaxX);
  minY = Math.min(minY, bminY); maxY = Math.max(maxY, bmaxY);
  minZ = Math.min(minZ, bminZ); maxZ = Math.max(maxZ, bmaxZ);
  bucketRows.push(`${n.name}: verts ${verts} x ${bminX.toFixed(3)}..${bmaxX.toFixed(3)} y ${bminY.toFixed(3)}..${bmaxY.toFixed(3)} z ${bminZ.toFixed(3)}..${bmaxZ.toFixed(3)}`);
}
console.log(bucketRows.join("\n"));
console.log(`ENVELOPE x ${minX.toFixed(3)}..${maxX.toFixed(3)} y ${minY.toFixed(3)}..${maxY.toFixed(3)} z ${minZ.toFixed(3)}..${maxZ.toFixed(3)}`);
const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;
console.log(`center ${cx.toFixed(3)} ${cz.toFixed(3)} half ${((maxX - minX) / 2).toFixed(3)} ${((maxZ - minZ) / 2).toFixed(3)} height ${(maxY - minY).toFixed(3)} verts ${totalVerts}`);

// structure: pale cap planes at +z (course caps + run caps + post caps)
let paleZMax = -1e9, paleCount = 0;
for (const row of bucketRows) { /* material split below instead */ }
const mats = json.materials?.map((m: any) => m.name).join(",") ?? "(none)";
console.log("materials:", mats);
// crib top must exceed 1.1 (grown courses present) and post caps near 1.63
let cribTop = 0;
for (const row of bucketRows) {
  const m = row.match(/y -?\d+\.\d+\.?(\d+\.\d+)/);
}
// direct: TIMBER bucket (crib) y-max
const timberRow = bucketRows.find(r => r.includes("timber"));
if (timberRow) console.log("timber bucket y-max:", timberRow.match(/y [^ ]+/g)?.at(-1));
