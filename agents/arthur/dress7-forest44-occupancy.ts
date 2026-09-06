// dress7-forest44-occupancy.ts — cluster the y<2.5m vertex cloud of the live
// forest-0044 GLB into solid-at-walking-height clusters (grid-based), report
// world-frame clearance for cairn candidates. READ-ONLY.
import { readFileSync } from "node:fs";

const buf = readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/mason/glb-retex/work_1664_forest.glb");
const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
let off = 12, json: any = null, binOff = -1;
while (off < buf.length) {
  const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true);
  if (type === 0x4e4f534a) json = JSON.parse(Buffer.from(buf.subarray(off + 8, off + 8 + len)).toString());
  else if (type === 0x004e4942) binOff = off + 8;
  off += 8 + len;
}
// collect y<2.5 vertices (local frame — merge bakes everything into meshes)
const pts: [number, number][] = [];
for (const mesh of json.meshes ?? []) {
  for (const prim of mesh.primitives ?? []) {
    const a = json.accessors[prim.attributes.POSITION];
    if (!(a.componentType === 5126 && a.type === "VEC3")) continue;
    const start = json.bufferViews[a.bufferView].byteOffset + (a.byteOffset ?? 0);
    for (let i = 0; i < a.count; i++) {
      const o = binOff + start + i * 12;
      const x = dv.getFloat32(o, true), y = dv.getFloat32(o + 4, true), z = dv.getFloat32(o + 8, true);
      if (y < 2.5) pts.push([x, z]);
    }
  }
}
console.log("walking-band verts:", pts.length);

// 1m grid occupancy
const grid = new Map<string, number>();
for (const [x, z] of pts) { const k = `${Math.round(x)},${Math.round(z)}`; grid.set(k, (grid.get(k) ?? 0) + 1); }
console.log("occupied 1m cells:", grid.size);

// cluster occupied cells (flood fill 8-neighborhood)
const seen = new Set<string>(), clusters: { cells: [number, number][], n: number }[] = [];
const nbrs = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
for (const k of grid.keys()) {
  if (seen.has(k)) continue;
  const [sx, sz] = k.split(",").map(Number);
  const q: [number, number][] = [[sx, sz]]; seen.add(k);
  const cells: [number, number][] = []; let n = 0;
  while (q.length) {
    const [cx, cz] = q.pop()!; cells.push([cx, cz]); n += grid.get(`${cx},${cz}`)!;
    for (const [dx, dz] of nbrs) {
      const k2 = `${cx + dx},${cz + dz}`;
      if (grid.has(k2) && !seen.has(k2)) { seen.add(k2); q.push([cx + dx, cz + dz]); }
    }
  }
  clusters.push({ cells, n });
}
clusters.sort((a, b) => b.n - a.n);
// to world
const EP = [48.851858, -58.219378], YAW = -2.35619449;
const cos = Math.cos(YAW), sin = Math.sin(YAW);
const wcs = clusters.slice(0, 8).map(c => {
  let mnx = Infinity, mxx = -Infinity, mnz = Infinity, mxz = -Infinity;
  const wcells: [number, number][] = [];
  for (const [cx, cz] of c.cells) {
    const wx = EP[0] + cx * cos + cz * sin, wz = EP[1] - cx * sin + cz * cos;
    mnx = Math.min(mnx, wx); mxx = Math.max(mxx, wx); mnz = Math.min(mnz, wz); mxz = Math.max(mxz, wz);
    wcells.push([wx, wz]);
  }
  const ccx = (mnx + mxx) / 2, ccz = (mnz + mxz) / 2;
  const rmax = Math.max(...wcells.map(([x, z]) => Math.hypot(x - ccx, z - ccz)));
  return { n: c.n, cells: c.cells.length, cx: ccx, cz: ccz, r: rmax, wcells };
});
for (const c of wcs) console.log(`cluster n${c.n} cells${c.cells} world-center (${c.cx.toFixed(2)}, ${c.cz.toFixed(2)}) rmax ${c.r.toFixed(2)}`);

// candidate clearance: distance from candidate to nearest occupied CELL (1m cells)
const AZ = 315 * Math.PI / 180, dx = Math.cos(AZ), dz = Math.sin(AZ), nx = dz, nz = -dx;
const allCells = wcs.flatMap(c => c.wcells);
// standing works whose plaza-ward cones matter near the corridor end
const cairns: [string, number, number][] = [["nx-wild-cairn-0043", 71.242133, -59.779248], ["nx-wild-cairn-0048", 52.00494, -77.100494]];
console.log("\ncandidate clearance to nearest occupied walking-band cell (minus cairn radius 0.9):");
for (const R of [82, 83, 84, 85, 86]) {
  for (const OFF of [-1.1, 0, 1.1]) {
    const PX = R * dx + nx * OFF, PZ = R * dz + nz * OFF;
    let best = Infinity, bid = "";
    for (const [cx, cz] of allCells) {
      const d = Math.hypot(PX - cx, PZ - cz) - 0.9;
      if (d < best) { best = d; bid = `(${cx.toFixed(1)},${cz.toFixed(1)})`; }
    }
    // plaza-ward cone check vs the two cairnfields (25deg / 18m)
    const cones = cairns.map(([id, wx, wz]) => {
      const L = Math.hypot(wx, wz), rx = PX - wx, rz = PZ - wz, D = Math.hypot(rx, rz);
      if (D > 18) return `${id}:far(${D.toFixed(1)}m)`;
      const dot = (rx * (-wx / L) + rz * (-wz / L)) / D;
      return `${id}:${(Math.acos(Math.max(-1, Math.min(1, dot))) * 180 / Math.PI).toFixed(0)}deg`;
    }).join(" ");
    const rim = Math.hypot(PX, PZ);
    console.log(`R${R} OFF${OFF} (${PX.toFixed(1)},${PZ.toFixed(1)}) cell-clear ${best.toFixed(2)}m vs ${bid} r${rim.toFixed(1)} | cones ${cones} ${best >= 1.4 && rim <= 108 ? "LAWFUL" : ""}`);
  }
}
