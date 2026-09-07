// struct-77 NE threshold scan — conservative rotation-grown AABB SAT vs live census
// Gate TRUE envelope: half-x 2.93, half-z 0.82 (local frame; opening axis = local z)
// Seat: gate depth axis RADIAL -> yaw = 90 - alpha (deg). Scan alpha 36-54, r 66-72.
// Rim law: all 4 corners in [66,108]. Pinch law: min conservative gap >= 1.4.
import { readFileSync } from "fs";
const C = JSON.parse(readFileSync("/tmp/struct77-census.json", "utf8"));
const ents = (C.entities || []).filter((e: any) => e.bbox && e.bbox.size);
const D2R = Math.PI / 180;
const HX = 2.93, HZ = 0.82; // gate half extents (local x = tangential width, local z = depth)
const corners = (px: number, pz: number, yawDeg: number) => {
  const y = yawDeg * D2R, c = Math.cos(y), s = Math.sin(y);
  const out: [number, number][] = [];
  for (const lx of [-HX, HX]) for (const lz of [-HZ, HZ])
    out.push([px + lx * c + lz * s, pz - lx * s + lz * c]);
  return out;
};
// neighbor conservative rotation-grown half-extents at its own yaw
const grown = (e: any): { cx: number; cz: number; hx: number; hz: number } | null => {
  const bb = e.bbox; if (!bb || !bb.size) return null;
  const hx = (bb.size[0] ?? 0) / 2, hz = (bb.size[2] ?? 0) / 2;
  const cxo = (bb.center?.[0] ?? e.pos[0]) - e.pos[0];
  const czo = (bb.center?.[2] ?? e.pos[2]) - e.pos[2];
  const g = Math.abs((e.yaw ?? 0) * D2R);
  return { cx: e.pos[0] + cxo, cz: e.pos[2] + czo, hx: Math.abs(Math.cos(g)) * hx + Math.abs(Math.sin(g)) * hz, hz: Math.abs(Math.sin(g)) * hx + Math.abs(Math.cos(g)) * hz };
};
// gate conservative AABB (rotation-grown at seat yaw) vs neighbor grown AABB
const gapAABB = (gc: [number, number][], e: any) => {
  const n = grown(e); if (!n) return Infinity;
  const gxs = gc.map(p => p[0]), gzs = gc.map(p => p[1]);
  const gx0 = Math.min(...gxs), gx1 = Math.max(...gxs), gz0 = Math.min(...gzs), gz1 = Math.max(...gzs);
  const dx = Math.max(gx0 - (n.cx + n.hx), (n.cx - n.hx) - gx1);
  const dz = Math.max(gz0 - (n.cz + n.hz), (n.cz - n.hz) - gz1);
  return Math.max(dx, dz); // >0 separated
};
const rows: { a: number; r: number; mingap: number; worst: string; rim: [number, number] }[] = [];
for (let a = 36; a <= 54; a++) {
  for (let r = 66; r <= 72; r++) {
    const px = r * Math.cos(a * D2R), pz = r * Math.sin(a * D2R);
    const yaw = 90 - a;
    const gc = corners(px, pz, yaw);
    const radii = gc.map(p => Math.hypot(p[0], p[1]));
    const rim: [number, number] = [Math.min(...radii), Math.max(...radii)];
    if (rim[0] < 66 || rim[1] > 108) continue;
    let mingap = Infinity, worst = "";
    for (const e of ents) { const g = gapAABB(gc, e); if (g < mingap) { mingap = g; worst = e.id; } }
    rows.push({ a, r, mingap, worst, rim });
  }
}
rows.sort((x, y) => (y.mingap - x.mingap));
console.log("candidates passing rim law:", rows.length);
console.log("TOP 12 by conservative min-gap:");
for (const row of rows.slice(0, 12))
  console.log(`a=${row.a} r=${row.r} yaw=${90 - row.a} pos=(${(row.r * Math.cos(row.a * D2R)).toFixed(2)},${(row.r * Math.sin(row.a * D2R)).toFixed(2)}) gap=${row.mingap.toFixed(2)} worst=${row.worst} rim=[${row.rim[0].toFixed(1)},${row.rim[1].toFixed(1)}]`);
const onSpoke = rows.filter(x => x.a === 45);
console.log("ON-SPOKE a=45:");
for (const row of onSpoke)
  console.log(`a=45 r=${row.r} yaw=45 pos=(${(row.r * Math.cos(Math.PI / 4)).toFixed(2)},${(row.r * Math.sin(Math.PI / 4)).toFixed(2)}) gap=${row.mingap.toFixed(2)} worst=${row.worst} rim=[${row.rim[0].toFixed(1)},${row.rim[1].toFixed(1)}]`);
