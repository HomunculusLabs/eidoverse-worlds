// dress106-foxden-forest-scan.ts — source-true occupancy siting for the SE
// fox den (round-3 item 14, v10 sha d7875544). Chassis: dress77-forest44-
// deadfall-siting. The SE ring is SAT-saturated against the five forest
// blobs' fat compound bboxes (3106 cell-fails); source-true trunk cells
// replace them. All five forest GLBs verified: local retex copies sha ==
// live lib prefixes (fresh census this tick):
//   0010 e7d130f7 (10.58,-75.26) · 0018 546718f8 (30.91,-69.43) ·
//   0031 f61645b4 (72.28,-23.49) · 0044 43e4c8c3 (48.85,-58.22) ·
//   0057 18ea1385 (63.01,-42.50), all yaw -2.3562.
// Gates per pose: cell clearance >= 1.4m from every occupied trunk cell;
// SAT >= 1.4m vs non-thin NON-forest entities (fresh census); rim [70,100]
// (CITY-PLAN district band); cone law BINDS (piece h 0.682 > knee 0.45);
// spoke walking-line clearance >= 3.5m. READ-ONLY.
import { readFileSync } from "node:fs";

type P = [number, number];
const FORESTS: { id: string; file: string; ep: P; yaw: number }[] = [
  { id: "nx-wild-forest-0010", file: "work_1690_forest.glb", ep: [10.58, -75.26], yaw: -2.3562 },
  { id: "nx-wild-forest-0018", file: "work_1638_forest.glb", ep: [30.91, -69.43], yaw: -2.3562 },
  { id: "nx-wild-forest-0031", file: "work_1651_forest.glb", ep: [72.28, -23.49], yaw: -2.3562 },
  { id: "nx-wild-forest-0044", file: "work_1664_forest.glb", ep: [48.85, -58.22], yaw: -2.3562 },
  { id: "nx-wild-forest-0057", file: "work_1677_forest.glb", ep: [63.01, -42.50], yaw: -2.3562 },
];

const cells: P[] = [];
const forestCenters: P[] = [];
for (const F of FORESTS) {
  const buf = readFileSync(`/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/mason/glb-retex/${F.file}`);
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let off = 12, json: any = null, binOff = -1;
  while (off < buf.length) {
    const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true);
    if (type === 0x4e4f534a) json = JSON.parse(Buffer.from(buf.subarray(off + 8, off + 8 + len)).toString());
    else if (type === 0x004e4942) binOff = off + 8;
    off += 8 + len;
  }
  const pts: P[] = [];
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
  const grid = new Map<string, number>();
  for (const [x, z] of pts) { const k = `${Math.round(x)},${Math.round(z)}`; grid.set(k, (grid.get(k) ?? 0) + 1); }
  const cos = Math.cos(F.yaw), sin = Math.sin(F.yaw);
  for (const k of grid.keys()) {
    const [cx, cz] = k.split(",").map(Number);
    cells.push([F.ep[0] + cx * cos + cz * sin, F.ep[1] - cx * sin + cz * cos]);
  }
  forestCenters.push(F.ep);
  console.log(`${F.id}: ${grid.size} occupied cells`);
}
console.log(`total trunk cells: ${cells.length}`);

const census = JSON.parse(readFileSync("/tmp/foxden-census.json", "utf8"));
const ents: any[] = (census.entities ?? census);
type OBB = { cx: number, cz: number, ux: [number, number], uz: [number, number], hu: [number, number] };
const obb = (pos: number[], yaw: number, hx: number, hz: number, cx: number, cz: number): OBB => {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  return { cx: pos[0] + cx * c + cz * s, cz: pos[2] - cx * s + cz * c, ux: [c, -s], uz: [s, c], hu: [hx, hz] };
};
const rad = (o: OBB, ax: [number, number]) =>
  Math.abs(ax[0] * o.ux[0] + ax[1] * o.ux[1]) * o.hu[0] + Math.abs(ax[0] * o.uz[0] + ax[1] * o.uz[1]) * o.hu[1];
const satgap = (a: OBB, b: OBB) => {
  const dx = b.cx - a.cx, dz = b.cz - a.cz;
  let g = -Infinity;
  for (const ax of [a.ux, a.uz, b.ux, b.uz] as [number, number][]) {
    g = Math.max(g, Math.abs(dx * ax[0] + dz * ax[1]) - rad(a, ax) - rad(b, ax));
  }
  return g;
};
const others: [string, OBB][] = [];
const cones: [string, number, number][] = [];
const fatForests: [string, OBB][] = [];
for (const e of ents) {
  if (!e.lib || !e.pos) continue;
  if (/nx-wild-forest-/.test(e.id)) {
    // fat forest bboxes: kept SEPARATE — they envelope their own empty
    // margin (dress-77/84/92/94 class). Cell clearance proves the real
    // trunks; the placer's hard SAT needs the fat gap too, so poses are
    // gated here by fat SAT >= 1.4 and ranked by it when concept-tied.
    const bb = e.bbox;
    if (bb?.size) fatForests.push([e.id, obb(e.pos, e.yaw ?? 0, bb.size[0] / 2, bb.size[2] / 2, (bb.min[0] + bb.max[0]) / 2, (bb.min[2] + bb.max[2]) / 2)]);
    const L = Math.hypot(e.pos[0], e.pos[2]);
    if (L >= 35) cones.push([e.id, e.pos[0], e.pos[2]]);
    continue;
  }
  const bb = e.bbox;
  if (!bb || !bb.size) continue;
  if (bb.max[1] - bb.min[1] <= 0.5) continue;
  others.push([e.id, obb(e.pos, e.yaw ?? 0, bb.size[0] / 2, bb.size[2] / 2, (bb.min[0] + bb.max[0]) / 2, (bb.min[2] + bb.max[2]) / 2)]);
  const L = Math.hypot(e.pos[0], e.pos[2]);
  if (L >= 35) cones.push([e.id, e.pos[0], e.pos[2]]);
}

// fox den v17 TRUE decode: half x 2.379 z 2.559, center (+0.675, +0.148)
const MY = { hx: 2.379, hz: 2.559, cx: 0.675, cz: 0.148 };
const u1 = Math.cos(-Math.PI / 4), u2 = Math.sin(-Math.PI / 4);

const results: string[] = [];
const evalPose = (px: number, pz: number, yawDeg: number) => {
  const yaw = yawDeg * Math.PI / 180;
  const A = obb([px, 0, pz], yaw, MY.hx, MY.hz, MY.cx, MY.cz);
  const corners: P[] = [-1, 1].flatMap((su) => [-1, 1].map((sv) => {
    const lx = MY.cx + su * MY.hx, lz = MY.cz + sv * MY.hz;
    return [px + lx * Math.cos(yaw) + lz * Math.sin(yaw), pz - lx * Math.sin(yaw) + lz * Math.cos(yaw)] as P;
  }));
  const rim = corners.map(([x, z]) => Math.hypot(x, z));
  if (Math.min(...rim) < 70 || Math.max(...rim) > 100) return;
  const spokeOff = Math.abs(px * u2 - pz * u1);
  if (spokeOff < 3.5) return;
  for (const [id, ox, oz] of cones) {
    const wx = px - ox, wz = pz - oz, D = Math.hypot(wx, wz);
    if (D > 18) continue;
    const L = Math.hypot(ox, oz);
    const dot = (wx * (-ox / L) + wz * (-oz / L)) / D;
    const ang = Math.acos(Math.max(-1, Math.min(1, dot))) * 180 / Math.PI;
    if (ang <= 25) return;
  }
  // cell clearance (footprint corners vs occupied trunk cells)
  let cellMin = Infinity, cellAt = "";
  for (const c of cells) {
    let cornerDist = Infinity;
    for (const [qx, qz] of corners) cornerDist = Math.min(cornerDist, Math.hypot(qx - c[0], qz - c[1]));
    if (cornerDist < cellMin) { cellMin = cornerDist; cellAt = `(${c[0].toFixed(1)},${c[1].toFixed(1)})`; }
  }
  if (cellMin < 1.4) return;
  let worst = Infinity, worstId = "";
  for (const [id, B] of others) {
    const g = satgap(A, B);
    if (g < worst) { worst = g; worstId = id; }
    if (g < 1.4) return;
  }
  let fatGap = Infinity, fatId = "";
  for (const [id, F] of fatForests) {
    const g = satgap(A, F);
    if (g < fatGap) { fatGap = g; fatId = id; }
    if (g < 1.4) return;
  }
  const nearestForest = forestCenters.reduce((best, fc) => {
    const d = Math.hypot(px - fc[0], pz - fc[1]);
    return d < best.d ? { d, id: FORESTS[forestCenters.indexOf(fc)].id } : best;
  }, { d: Infinity, id: "" });
  results.push(`(${px.toFixed(1)},${pz.toFixed(1)}) yaw${yawDeg} | cell ${cellMin.toFixed(2)}m vs ${cellAt} | minSAT ${worst.toFixed(2)} vs ${worstId} | fatForest ${fatGap.toFixed(2)} vs ${fatId} | spokeOff ${spokeOff.toFixed(1)} | rim ${Math.min(...rim).toFixed(1)}-${Math.max(...rim).toFixed(1)} | r${Math.hypot(px, pz).toFixed(1)} | nearForest ${nearestForest.id} ${nearestForest.d.toFixed(1)}m`);
};

for (let px = 5; px <= 78; px += 0.5) {
  for (let pz = -78; pz <= -5; pz += 0.5) {
    const r = Math.hypot(px, pz);
    if (r < 68 || r > 102) continue;
    for (let yaw = 0; yaw < 360; yaw += 15) evalPose(px, pz, yaw);
  }
}
console.log(`lawful foxden poses: ${results.length}`);
// concept score: nearest forest center (tree line behind the bank) ascending
results.sort((a, b) => {
  const pf = (s: string) => parseFloat(s.match(/nearForest \S+ ([\d.]+)m$/)?.[1] ?? "999");
  return pf(a) - pf(b);
});
for (const r of results.slice(0, 14)) console.log(r);
