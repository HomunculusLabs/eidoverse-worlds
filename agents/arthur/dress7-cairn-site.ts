// dress7-cairn-site.ts — siting probe: fresh live census, SAT/rim/arrival-cone
// math for the SE cairn candidate pose. READ-ONLY (no upload, no verbs).
import { readFileSync } from "node:fs";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
// candidate: az-315 corridor, r 80, offset 2.2m SW of axis (same side as
// dress-3's 3.4m run offset, but closer to axis — a waymark wants the eye)
const R = 80, AZ = 315 * Math.PI / 180, OFF = 2.2;
const axisX = R * Math.cos(AZ), axisZ = R * Math.sin(AZ);
// SW-side normal of the corridor direction (dx,dz)=(.7071,-.7071): normal = (-dz,dx)? check quadrant
const dx = Math.cos(AZ), dz = Math.sin(AZ);
// corridor runs outward az-315; SW side of the walking line. Outward dir (dx,dz).
// Left-hand normal (looking outward along dir): (dz, -dx) = (-.7071,-.7071) → that's az-225 (SW). Yes.
const nx = dz, nz = -dx;
const PX = axisX + nx * OFF, PZ = axisZ + nz * OFF;
const YAW = AZ; // local +x faces outward along the corridor
// local bbox: x -0.641..0.987 (c +0.173, h 0.814), z -0.599..0.664 (c +0.033, h 0.632)
const HALF = { x: 0.814, z: 0.632 }, CLOCAL = { x: 0.173, z: 0.033 };

console.log("candidate center", PX.toFixed(2), PZ.toFixed(2), "yaw", (YAW * 180 / Math.PI).toFixed(1));

const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const r = await fetch(`${base}/geom?world=${WORLD}`);
if (!r.ok) throw new Error(`geom HTTP ${r.status}`);
const d: any = await r.json();
const ents = (d.entities ?? []) as any[];
console.log("census", ents.length);

type OBB = { cx: number, cz: number, ux: number[], uz: number[], hu: number[] };
function obb(pos: number[], yaw: number, half: { x: number, z: number }, c: { x: number, z: number }): OBB {
  const cos = Math.cos(yaw), sin = Math.sin(yaw);
  return { cx: pos[0] + c.x * cos + c.z * sin, cz: pos[2] - c.x * sin + c.z * cos, ux: [cos, -sin], uz: [sin, cos], hu: [half.x, half.z] };
}
const radius = (o: OBB, ax: number[]) =>
  Math.abs(ax[0] * o.ux[0] + ax[1] * o.ux[1]) * o.hu[0] + Math.abs(ax[0] * o.uz[0] + ax[1] * o.uz[1]) * o.hu[1];
function satGap(a: OBB, b: OBB): number {
  const dx2 = b.cx - a.cx, dz2 = b.cz - a.cz;
  let gap = -Infinity;
  for (const ax of [a.ux, a.uz, b.ux, b.uz]) {
    const g = Math.abs(dx2 * ax[0] + dz2 * ax[1]) - radius(a, ax) - radius(b, ax);
    if (g > gap) gap = g;
  }
  return gap;
}

const A = obb([PX, 0, PZ], YAW, HALF, CLOCAL);
// rim corners
{
  const cos = Math.cos(YAW), sin = Math.sin(YAW);
  for (const [su, sv] of [[-1, -1], [-1, 1], [1, -1], [1, 1]] as const) {
    const lx = CLOCAL.x + su * HALF.x, lz = CLOCAL.z + sv * HALF.z;
    const wx = PX + lx * cos + lz * sin, wz = PZ - lx * sin + lz * cos;
    const rr = Math.hypot(wx, wz);
    if (rr < 66 || rr > 108) console.log("RIM VIOLATION", wx.toFixed(2), wz.toFixed(2), rr.toFixed(2));
  }
  console.log("rim corners checked");
}
// nearest 12 entities by center distance (diagnostic context)
const near = ents.filter(e => e.pos).map(e => ({ id: e.id, dist: Math.hypot(e.pos[0] - PX, e.pos[2] - PZ), r: Math.hypot(e.pos[0], e.pos[2]) })).sort((a, b) => a.dist - b.dist).slice(0, 12);
for (const n of near) console.log(`near ${n.id} dist ${n.dist.toFixed(2)} r ${n.r.toFixed(2)}`);
// SAT vs all solids
let worst: string[] = [];
for (const e of ents) {
  if (!e.lib || !e.pos) continue;
  const bb = e.bbox;
  if (!bb || !bb.size) continue;
  if (bb.max[1] - bb.min[1] <= 0.5) continue; // ground film exempt
  const B = obb(e.pos, e.yaw ?? 0, { x: bb.size[0] / 2, z: bb.size[2] / 2 }, { x: (bb.min[0] + bb.max[0]) / 2, z: (bb.min[2] + bb.max[2]) / 2 });
  const g = satGap(A, B);
  if (g < 0) worst.push(`OVERLAP ${e.id} ${g.toFixed(3)}`);
  else if (g < 1.4) worst.push(`sub1.4 ${e.id} ${g.toFixed(3)}`);
}
console.log(worst.length ? worst.join(" | ") : "SAT clear, no sub-1.4m adjacency");
// arrival cone
for (const e of ents) {
  if (!e.lib || !e.pos) continue;
  const bb = e.bbox;
  if (!bb || !bb.size || bb.max[1] - bb.min[1] <= 0.5) continue;
  const px = e.pos[0], pz = e.pos[2], L = Math.hypot(px, pz);
  if (L < 1e-6) continue;
  const wx = PX - px, wz = PZ - pz;
  if (Math.hypot(wx, wz) > 18) continue;
  const dot = (wx * (-px / L) + wz * (-pz / L)) / Math.hypot(wx, wz);
  const ang = Math.acos(Math.max(-1, Math.min(1, dot))) * 180 / Math.PI;
  if (ang <= 25) console.log("ARRIVAL-CONE violation vs", e.id, ang.toFixed(1));
}
console.log("arrival cones checked");
// census capture for the record
// (write to /tmp for this tick's placer cross-check only)
