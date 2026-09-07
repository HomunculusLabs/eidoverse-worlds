// dress77-forest44-deadfall-siting.ts — source-true occupancy siting for the
// SE fungus-log deadfall (round-3 item 10). Adapted from the proven
// dress7-forest44-occupancy.ts chassis: cluster the y<2.5m vertex cloud of
// the LIVE forest-0044 GLB (local retex copy sha 43e4c8c3… == live lib
// prefix, re-verified this tick) into occupied 1m cells, then evaluate
// deadfall candidate poses against: (a) cell clearance ≥ 1.4m from every
// occupied trunk cell, (b) SAT ≥ 1.4m vs all non-thin non-forest entities
// (census bboxes, fresh), (c) rim [66,108], (d) no plaza-ward 25°/18m cone
// violation, (e) corridor walking line clearance ≥ 1.6m. READ-ONLY.
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
const grid = new Map<string, number>();
for (const [x, z] of pts) { const k = `${Math.round(x)},${Math.round(z)}`; grid.set(k, (grid.get(k) ?? 0) + 1); }
console.log("occupied 1m cells:", grid.size);

// to world (forest-0044 live tuple)
const EP = [48.851858, -58.219378], YAW = -2.35619449;
const cos = Math.cos(YAW), sin = Math.sin(YAW);
const cells: [number, number][] = [...grid.keys()].map((k) => {
  const [cx, cz] = k.split(",").map(Number);
  return [EP[0] + cx * cos + cz * sin, EP[1] - cx * sin + cz * cos] as [number, number];
});

// census SAT set (fresh capture /tmp/dress77-census.json; non-thin, non-forest-0044)
const census = JSON.parse(readFileSync("/tmp/dress77-census.json", "utf8"));
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
for (const e of ents) {
  if (!e.lib || !e.pos) continue;
  if (e.id === "nx-wild-forest-0044") continue; // handled source-true below
  const bb = e.bbox;
  if (!bb || !bb.size) continue;
  const thin = bb.max[1] - bb.min[1] <= 0.5;
  if (!thin) {
    others.push([e.id, obb(e.pos, e.yaw ?? 0, bb.size[0] / 2, bb.size[2] / 2, (bb.min[0] + bb.max[0]) / 2, (bb.min[2] + bb.max[2]) / 2)]);
    const L = Math.hypot(e.pos[0], e.pos[2]);
    if (L >= 35) cones.push([e.id, e.pos[0], e.pos[2]]);
  }
}

// deadfall OBB: trunk along local x, root fan -x, cap +x; local bbox approx
// x -1.9..+3.9 (half 2.9, center +1.0), z -1.5..+1.5 — FINAL from the build decode
const MY = { hx: 2.9, hz: 1.5, cx: 1.0, cz: 0.0 };

// candidate scan: ring around forest-0044 center + corridor line
const results: string[] = [];
const evalPose = (px: number, pz: number, yawDeg: number) => {
  const yaw = yawDeg * Math.PI / 180;
  const A = obb([px, 0, pz], yaw, MY.hx, MY.hz, MY.cx, MY.cz);
  const rim = [-1, 1].flatMap((su) => [-1, 1].map((sv) => {
    const lx = MY.cx + su * MY.hx, lz = MY.cz + sv * MY.hz;
    return Math.hypot(px + lx * Math.cos(yaw) + lz * Math.sin(yaw), pz - lx * Math.sin(yaw) + lz * Math.cos(yaw));
  }));
  if (Math.min(...rim) < 66 || Math.max(...rim) > 108) return;
  // cell clearance: nearest occupied cell to footprint CORNERS (conservative)
  const corners: [number, number][] = [-1, 1].flatMap((su) => [-1, 1].map((sv) => {
    const lx = MY.cx + su * MY.hx, lz = MY.cz + sv * MY.hz;
    return [px + lx * Math.cos(yaw) + lz * Math.sin(yaw), pz - lx * Math.sin(yaw) + lz * Math.cos(yaw)] as [number, number];
  }));
  let cellMin = Infinity, cellAt = "";
  for (const c of cells) {
    let cornerDist = Infinity;
    for (const [qx, qz] of corners) cornerDist = Math.min(cornerDist, Math.hypot(qx - c[0], qz - c[1]));
    if (cornerDist < cellMin) { cellMin = cornerDist; cellAt = `(${c[0].toFixed(1)},${c[1].toFixed(1)})`; }
  }
  if (cellMin < 1.4) return;
  // SAT vs others
  let worst = Infinity, worstId = "";
  for (const [id, B] of others) {
    const g = satgap(A, B);
    if (g < worst) { worst = g; worstId = id; }
    if (g < 1.4) return;
  }
  // cones
  for (const [id, ox, oz] of cones) {
    const wx = px - ox, wz = pz - oz, D = Math.hypot(wx, wz);
    if (D > 18) continue;
    const L = Math.hypot(ox, oz);
    const dot = (wx * (-ox / L) + wz * (-oz / L)) / D;
    const ang = Math.acos(Math.max(-1, Math.min(1, dot))) * 180 / Math.PI;
    if (ang <= 25) return;
  }
  // corridor line x+z=0 clearance (footprint edge)
  const nd = (A.cx + A.cz) / Math.SQRT2;
  const cl = Math.abs(nd) - rad(A, [Math.SQRT1_2, Math.SQRT1_2]);
  results.push(`(${px.toFixed(1)},${pz.toFixed(1)}) yaw${yawDeg} | cell ${cellMin.toFixed(2)}m vs ${cellAt} | minSAT ${worst.toFixed(2)} vs ${worstId} | clr ${cl.toFixed(2)} | rim ${Math.min(...rim).toFixed(1)}-${Math.max(...rim).toFixed(1)} | r${Math.hypot(px, pz).toFixed(1)}`);
};

// scan: neighborhood around forest-0044 (open shoulder) and along corridor
for (let px = 40; px <= 68; px += 0.5) {
  for (let pz = -68; pz <= -40; pz += 0.5) {
    const r = Math.hypot(px, pz);
    if (r < 66 || r > 92) continue;
    for (let yaw = 0; yaw < 360; yaw += 15) evalPose(px, pz, yaw);
  }
}
console.log(`lawful deadfall poses around forest-0044: ${results.length}`);
results.sort((a, b) => {
  const pr = (s: string) => parseFloat(s.match(/r([\d.]+)$/)?.[1] ?? "999");
  return pr(a) - pr(b);
});
for (const r of results) console.log(r);
