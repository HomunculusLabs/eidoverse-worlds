// dress7-cairn-scan.ts — scan (R, OFF) along az-315 for a lawful cairn pose.
// READ-ONLY. Reports min SAT gap per solid, rim corners, dress-3 separation.
import { readFileSync } from "node:fs";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const AZ = 315 * Math.PI / 180;
const HALF = { x: 0.814, z: 0.632 }, CLOCAL = { x: 0.173, z: 0.033 };

const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const r = await fetch(`${base}/geom?world=${WORLD}`);
if (!r.ok) throw new Error(`geom HTTP ${r.status}`);
const d: any = await r.json();
const ents = (d.entities ?? []) as any[];

type OBB = { cx: number, cz: number, ux: number[], uz: number[], hu: number[] };
function obb(pos: number[], yaw: number, half: { x: number, z: number }, c: { x: number, z: number }): OBB {
  const cos = Math.cos(yaw), sin = Math.sin(yaw);
  return { cx: pos[0] + c.x * cos + c.z * sin, cz: pos[2] - c.x * sin + c.z * cos, ux: [cos, -sin], uz: [sin, cos], hu: [half.x, half.z] };
}
const radius = (o: OBB, ax: number[]) =>
  Math.abs(ax[0] * o.ux[0] + ax[1] * o.ux[1]) * o.hu[0] + Math.abs(ax[0] * o.uz[0] + ax[1] * o.uz[1]) * o.hu[1];
function satGap(a: OBB, b: OBB): number {
  const dx = b.cx - a.cx, dz = b.cz - a.cz;
  let gap = -Infinity;
  for (const ax of [a.ux, a.uz, b.ux, b.uz]) {
    const g = Math.abs(dx * ax[0] + dz * ax[1]) - radius(a, ax) - radius(b, ax);
    if (g > gap) gap = g;
  }
  return gap;
}
const solids = ents.filter(e => e.lib && e.pos && e.bbox?.size && (e.bbox.max[1] - e.bbox.min[1]) > 0.5)
  .map(e => ({ id: e.id, B: obb(e.pos, e.yaw ?? 0, { x: e.bbox.size[0] / 2, z: e.bbox.size[2] / 2 }, { x: (e.bbox.min[0] + e.bbox.max[0]) / 2, z: (e.bbox.min[2] + e.bbox.max[2]) / 2 }) }));

const dx = Math.cos(AZ), dz = Math.sin(AZ), nx = dz, nz = -dx;
for (const R of [72, 74, 76, 78, 80, 82]) {
  for (const OFF of [2.2, 3.0, 3.4, 4.0]) {
    const PX = R * dx + nx * OFF, PZ = R * dz + nz * OFF;
    const YAW = AZ;
    const A = obb([PX, 0, PZ], YAW, HALF, CLOCAL);
    let minGap = Infinity, minId = "";
    let rimBad = false;
    const cos = Math.cos(YAW), sin = Math.sin(YAW);
    for (const [su, sv] of [[-1, -1], [-1, 1], [1, -1], [1, 1]] as const) {
      const lx = CLOCAL.x + su * HALF.x, lz = CLOCAL.z + sv * HALF.z;
      const rr = Math.hypot(PX + lx * cos + lz * sin, PZ - lx * sin + lz * cos);
      if (rr < 66 || rr > 108) rimBad = true;
    }
    for (const s of solids) {
      const g = satGap(A, s.B);
      if (g < minGap) { minGap = g; minId = s.id; }
    }
    const ok = !rimBad && minGap >= 1.4;
    console.log(`R${R} OFF${OFF} pos(${PX.toFixed(2)},${PZ.toFixed(2)}) minGap ${minGap.toFixed(2)} vs ${minId} rim${rimBad ? "BAD" : "ok"} ${ok ? "LAWFUL" : ""}`);
  }
}
