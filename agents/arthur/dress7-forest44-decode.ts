// dress7-forest44-decode.ts — decode per-tree trunk base positions from the
// live forest-0044 GLB (local frame), then report world-frame clearance for
// cairn candidates along the az-315 corridor. READ-ONLY.
import { readFileSync } from "node:fs";

const buf = readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/mason/glb-retex/work_1664_forest.glb");
const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
let off = 12, json: any = null, binOff = -1, binLen = 0;
while (off < buf.length) {
  const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true);
  if (type === 0x4e4f534a) json = JSON.parse(Buffer.from(buf.subarray(off + 8, off + 8 + len)).toString());
  else if (type === 0x004e4942) { binOff = off + 8; binLen = len; }
  off += 8 + len;
}
const CT_SIZE: Record<number, number> = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
const NUM_COMP: Record<string, number> = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
// decode ONLY float POSITION accessors (indices/other types stay undecoded —
// blanket decoding hit out-of-bounds on later accessors)
const acc = json.accessors.map((a: any) => {
  if (!(a.componentType === 5126 && a.type === "VEC3")) return null;
  const start = json.bufferViews[a.bufferView].byteOffset + (a.byteOffset ?? 0);
  const out: number[] = [];
  for (let i = 0; i < a.count * 3; i++) out.push(dv.getFloat32(binOff + start + i * 4, true));
  return out;
});

// walk node tree accumulating translation
const nodes = json.nodes;
const world: Record<number, number[]> = {};
function walk(i: number, px: number, py: number, pz: number) {
  const n = nodes[i], t = n.translation ?? [0, 0, 0];
  const x = px + t[0], y = py + t[1], z = pz + t[2];
  world[i] = [x, y, z];
  for (const c of n.children ?? []) walk(c, x, y, z);
}
const roots = new Set(nodes.map((_: any, i: number) => i));
for (const n of nodes) for (const c of n.children ?? []) roots.delete(c);
for (const r of roots) walk(r, 0, 0, 0);

// per mesh: vertex cloud + TRUNK extents (y < 2.5m band — canopy is overhead,
// not a walking-plane solid; the 1.4m pinch law is trunk-based)
const trees: { x: number, z: number, r: number, h: number, tx: number, tz: number, tr: number }[] = [];
for (const mesh of json.meshes ?? []) {
  for (const prim of mesh.primitives ?? []) {
    const posA = prim.attributes.POSITION;
    const verts = acc[posA];
    let minx = Infinity, maxx = -Infinity, minz = Infinity, maxz = -Infinity, maxy = -Infinity;
    let tminx = Infinity, tmaxx = -Infinity, tminz = Infinity, tmaxz = -Infinity;
    for (let i = 0; i < verts.length; i += 3) {
      minx = Math.min(minx, verts[i]); maxx = Math.max(maxx, verts[i]);
      minz = Math.min(minz, verts[i + 2]); maxz = Math.max(maxz, verts[i + 2]);
      maxy = Math.max(maxy, verts[i + 1]);
      if (verts[i + 1] < 2.5) {
        tminx = Math.min(tminx, verts[i]); tmaxx = Math.max(tmaxx, verts[i]);
        tminz = Math.min(tminz, verts[i + 2]); tmaxz = Math.max(tmaxz, verts[i + 2]);
      }
    }
    let owner = -1;
    for (let i = 0; i < nodes.length; i++) if (nodes[i].mesh === json.meshes.indexOf(mesh)) { owner = i; break; }
    const w = world[owner] ?? [0, 0, 0];
    trees.push({
      x: w[0] + (minx + maxx) / 2, z: w[2] + (minz + maxz) / 2,
      r: Math.max(maxx - minx, maxz - minz) / 2, h: maxy + w[1],
      tx: w[0] + (tminx + tmaxx) / 2, tz: w[2] + (tminz + tmaxz) / 2,
      tr: Math.max(tmaxx - tminx, tmaxz - tminz) / 2,
    });
  }
}
console.log("mesh clusters:", trees.length);
for (const t of trees) console.log(`tree local (${t.x.toFixed(2)}, ${t.z.toFixed(2)}) r${t.r.toFixed(2)} h${t.h.toFixed(1)}`);

// transform to world: entity pos [48.851858, -0.0203, -58.219378], yaw -2.35619
const EP = [48.851858, -58.219378], YAW = -2.35619449;
const cos = Math.cos(YAW), sin = Math.sin(YAW);
const wtrees = trees.map(t => ({ x: t.x, z: t.z, r: t.r, h: t.h, tx: t.tx, tz: t.tz, tr: t.tr }));
console.log("\nworld-frame trees (canopy disc + trunk column):");
for (const t of wtrees) console.log(`  canopy (${t.x.toFixed(2)}, ${t.z.toFixed(2)}) r${t.r.toFixed(2)} h${t.h.toFixed(1)} | trunk (${t.tx.toFixed(2)}, ${t.tz.toFixed(2)}) r${t.tr.toFixed(2)}`);

// cairn candidates on az-315: trunk-column clearance (1.4m pinch law) AND
// canopy-disc clearance reported (informational for overhead geometry)
console.log("\ncandidate clearances (trunk column + 1.4m pinch; canopy informational):");
const AZ = 315 * Math.PI / 180, dx = Math.cos(AZ), dz = Math.sin(AZ), nx = dz, nz = -dx;
for (const R of [70, 72, 74, 76, 78, 80]) {
  for (const OFF of [-3.4, -2.2, -1.1, 0, 1.1, 2.2, 3.4]) {
    const PX = R * dx + nx * OFF, PZ = R * dz + nz * OFF;
    let bestT = Infinity, btid = "", bestC = Infinity, bcid = "";
    for (const t of wtrees) {
      const dt = Math.hypot(PX - t.tx, PZ - t.tz) - t.tr - 0.9;
      if (dt < bestT) { bestT = dt; btid = `trunk(${t.tx.toFixed(1)},${t.tz.toFixed(1)})`; }
      const dc = Math.hypot(PX - t.x, PZ - t.z) - t.r - 0.9;
      if (dc < bestC) { bestC = dc; bcid = `canopy(${t.x.toFixed(1)},${t.z.toFixed(1)})`; }
    }
    console.log(`R${R} OFF${OFF} (${PX.toFixed(1)},${PZ.toFixed(1)}) trunk ${bestT.toFixed(2)}m vs ${btid} | canopy ${bestC.toFixed(2)}m vs ${bcid} ${bestT >= 1.4 ? "LAWFUL" : ""}`);
  }
}
