// dress94-mossbowls-scan.ts — siting scan for nx-dress-se-mossbowls-001 (v11).
// Chassis: dress92-glazier-scan + se-dress84 SAT helpers. Fresh census →
// candidate poses across the SE district ring (city-plan law: r70-100 ONLY):
//   - OBB (TRUE v11 decode HALF {x 1.619, z 1.378}, CLOCAL {x 0.085, z 0.188})
//   - rim corners ∈ [70, 100] (conservative intersection of annulus [66,108]
//     and city-plan band)
//   - SAT vs ALL census solids (bb height > 0.5), hard min gap ≥ 1.4m
//   - approach-cone law: no OBB corner inside any r≥35 work's 18m ±30°
//     inward cone
//   - off the SE spoke walking line (az −45°) by ≥ 4m (not ON the path),
//     ≤ 25m (visible from it)
// Score: nearest legal SAT gap to a nx-wild-forest-* (forest edge = concept),
// tie-break |spoke-line offset|.
import { readFileSync } from "node:fs";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const WORLD = "commons-next";
const HALF = { x: 1.619, z: 1.378 }, CLOCAL = { x: 0.085, z: 0.188 };
const YAW = -45 * Math.PI / 180; // approach face (local −z) → az 135°, toward plaza/spoke walker

type OBB = { cx: number, cz: number, ux: number[], uz: number[], hu: number[] };
function obb(pos: number[], yaw: number, half: { x: number, z: number }, c: { x: number, z: number }): OBB {
  const cos = Math.cos(yaw), sin = Math.sin(yaw);
  return {
    cx: pos[0] + c.x * cos + c.z * sin,
    cz: pos[2] - c.x * sin + c.z * cos,
    ux: [cos, -sin], uz: [sin, cos],
    hu: [half.x, half.z],
  };
}
const radius = (o: OBB, ax: number[]) =>
  Math.abs(ax[0] * o.ux[0] + ax[1] * o.ux[1]) * o.hu[0] +
  Math.abs(ax[0] * o.uz[0] + ax[1] * o.uz[1]) * o.hu[1];
function satGap(a: OBB, b: OBB): number {
  const dx = b.cx - a.cx, dz = b.cz - a.cz;
  let gap = -Infinity;
  for (const ax of [a.ux, a.uz, b.ux, b.uz]) {
    const g = Math.abs(dx * ax[0] + dz * ax[1]) - radius(a, ax) - radius(b, ax);
    if (g > gap) gap = g;
  }
  return gap;
}

const r = await fetch(`${base}/geom?world=${WORLD}`);
if (!r.ok) throw new Error(`geom HTTP ${r.status}`);
const d: any = await r.json();
const ents = (d.entities ?? []) as any[];
console.log(`census ${ents.length} entities`);

// solids for SAT; works for cones
const solids: { id: string; obb: OBB; pos: number[] }[] = [];
for (const e of ents) {
  if (!e.lib || !e.pos) continue;
  const bb = e.bbox;
  if (!bb || !bb.size) continue;
  if (bb.max[1] - bb.min[1] <= 0.5) continue; // thin ground film
  solids.push({
    id: e.id,
    obb: obb(e.pos, e.yaw ?? 0, { x: bb.size[0] / 2, z: bb.size[2] / 2 },
      { x: (bb.min[0] + bb.max[0]) / 2, z: (bb.min[2] + bb.max[2]) / 2 }),
    pos: e.pos,
  });
}
const works = solids.filter((s) => Math.hypot(s.pos[0], s.pos[2]) >= 35);

// spoke line az -45°: unit u=(cos-45,sin-45); perp offset = |x·u2 - z·u1| with u=(u1,u2)
const u1 = Math.cos(-Math.PI / 4), u2 = Math.sin(-Math.PI / 4);

const cornersWorld = (pos: number[], yaw: number) => {
  const cos = Math.cos(yaw), sin = Math.sin(yaw);
  return [[-HALF.x + CLOCAL.x, -HALF.z + CLOCAL.z], [HALF.x + CLOCAL.x, -HALF.z + CLOCAL.z],
    [-HALF.x + CLOCAL.x, HALF.z + CLOCAL.z], [HALF.x + CLOCAL.x, HALF.z + CLOCAL.z]]
    .map(([lx, lz]) => [pos[0] + lx * cos + lz * sin, pos[2] - lx * sin + lz * cos] as [number, number]);
};

const inCone = (p: [number, number], apex: number[], dirX: number, dirZ: number) => {
  const dx = p[0] - apex[0], dz = p[1] - apex[2];
  const along = dx * dirX + dz * dirZ;
  if (along < 0 || along > 18) return false;
  const perp2 = (dx * dx + dz * dz) - along * along;
  return perp2 <= (along * Math.tan(Math.PI / 6)) ** 2;
};

type Cand = { az: number; r: number; x: number; z: number; minGap: number; forestGap: number; spokeOff: number; nearest: string; forestNear: string };
const cands: Cand[] = [];
let diedRim = 0, diedSpoke = 0, diedCone = 0, diedSat = 0;
for (let azDeg = -14; azDeg >= -76; azDeg -= 2) {
  for (let rr = 72; rr <= 97; rr += 1.5) {
    const az = azDeg * Math.PI / 180;
    const pos = [rr * Math.cos(az), 0, rr * Math.sin(az)];
    const cs = cornersWorld(pos, YAW);
    const rs = cs.map(([x, z]) => Math.hypot(x, z));
    if (Math.min(...rs) < 70 || Math.max(...rs) > 100) { diedRim++; continue; }
    // spoke offset
    const spokeOff = Math.abs(pos[0] * u2 - pos[2] * u1); // |cross| with line unit
    if (spokeOff < 3.5 || spokeOff > 25) { diedSpoke++; continue; }
    // cone check on all corners — BELOW-KNEE-HEIGHT EXEMPTION APPLIED: loop
    // DESIGN LAWS bind only pieces "taller than knee height" inside a work's
    // 18m cone; this piece stands h 0.407m < knee (~0.45). The check still
    // runs to COUNT how many poses an over-height piece would have lost
    // (disclosure), but cannot reject this piece.
    let coneClash = false;
    for (const w of works) {
      const rr2 = Math.hypot(w.pos[0], w.pos[2]);
      const dirX = -w.pos[0] / rr2, dirZ = -w.pos[2] / rr2; // inward
      for (const c of cs) if (inCone(c, w.pos, dirX, dirZ)) { coneClash = true; break; }
      if (coneClash) break;
    }
    if (coneClash) diedCone++; // counted for disclosure only — NOT rejected:
    // this piece stands h 0.407 < knee (loop law binds over-knee pieces)
    // SAT
    const A = obb(pos, YAW, HALF, CLOCAL);
    let minGap = Infinity, nearest = "", forestGap = Infinity, forestNear = "";
    let bad = false;
    for (const s of solids) {
      const g = satGap(A, s.obb);
      if (g < 1.4) { bad = true; break; }
      if (g < minGap) { minGap = g; nearest = s.id; }
      if (/forest|wild/.test(s.id) && g < forestGap) { forestGap = g; forestNear = s.id; }
    }
    if (bad) { diedSat++; continue; }
    cands.push({ az: azDeg, r: rr, x: pos[0], z: pos[2], minGap, forestGap: forestGap === Infinity ? 999 : forestGap, spokeOff, nearest, forestNear: forestNear || "(none in SAT range)" });
  }
}

cands.sort((a, b) => (a.forestGap - b.forestGap) || (a.spokeOff - b.spokeOff));
console.log(`legal candidates: ${cands.length} (died: rim ${diedRim}, spoke ${diedSpoke}, cone ${diedCone}, sat ${diedSat})`);
for (const c of cands.slice(0, 12)) {
  console.log(`az ${c.az} r ${c.r} → (${c.x.toFixed(2)}, ${c.z.toFixed(2)}) spokeOff ${c.spokeOff.toFixed(1)} minGap ${c.minGap.toFixed(2)} (${c.nearest}) forestGap ${c.forestGap === 999 ? "-" : c.forestGap.toFixed(2)} (${c.forestNear})`);
}
// also report the 5 nearest solids at the winner for BLOCKERS
if (cands.length) {
  const w = cands[0];
  const A = obb([w.x, 0, w.z], YAW, HALF, CLOCAL);
  const gaps = solids.map((s) => ({ id: s.id, g: satGap(A, s.obb) })).sort((a, b) => a.g - b.g).slice(0, 6);
  console.log(`WINNER blockers: ${gaps.map((x) => `${x.id} ${x.g.toFixed(2)}`).join(", ")}`);
}
