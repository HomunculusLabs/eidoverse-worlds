// dress106-foxden-scan.ts — siting scan for nx-dress-se-foxden-001
// (v10, sha d7875544). Chassis: dress105-streamstones-scan. Fresh census →
// candidate poses across the SE district ring (CITY-PLAN law: r70-100):
//   - OBB (TRUE v10 decode HALF {x 2.295, z 2.404}, CLOCAL {x 0.590, z 0.047})
//   - rim corners ∈ [70, 100]
//   - SAT vs ALL census solids (bb height > 0.5), hard min gap ≥ 1.4m
//   - piece h 0.682 > knee (0.45): approach-cone law BINDS — reject cone clash
//   - off the SE spoke walking line (az −45°) by ≥ 4m, ≤ 25m
//   - concept: bank -x side faces the tree line (den digs INTO the edge) —
//     score: nearest legal SAT gap to a nx-wild-forest-* (forest edge =
//     concept head), tie-break |spoke-line offset|; mouth (+x local) faces
//     outward to the meadow = away from forest → yaw points local +x at
//     (az away from nearest forest mass), approximated by outward-radial.
import { readFileSync } from "node:fs";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const WORLD = "commons-next";
const HALF = { x: 2.295, z: 2.404 }, CLOCAL = { x: 0.590, z: 0.047 };

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

type Cand = { az: number; r: number; x: number; z: number; yaw: number; minGap: number; forestGap: number; spokeOff: number; nearest: string; forestNear: string };
const cands: Cand[] = [];
let diedRim = 0, diedSpoke = 0, diedCone = 0, diedSat = 0;
for (let azDeg = -14; azDeg >= -76; azDeg -= 1) {
  for (let rr = 71; rr <= 98; rr += 1) {
  for (const yawDelta of [-90, -45, 0, 45, 90]) {
    const az = azDeg * Math.PI / 180;
    const pos = [rr * Math.cos(az), 0, rr * Math.sin(az)];
    // yaw: local +x (mouth) faces outward-radial + delta variants
    const yaw = az + yawDelta * Math.PI / 180;
    const cs = cornersWorld(pos, yaw);
    const rs = cs.map(([x, z]) => Math.hypot(x, z));
    if (Math.min(...rs) < 70 || Math.max(...rs) > 100) { diedRim++; continue; }
    const spokeOff = Math.abs(pos[0] * u2 - pos[2] * u1);
    if (spokeOff < 3.5) { diedSpoke++; continue; } // walking-line clearance only; no 25m cap (that was dress-105's concept)
    let coneClash = false;
    for (const w of works) {
      const rr2 = Math.hypot(w.pos[0], w.pos[2]);
      const dirX = -w.pos[0] / rr2, dirZ = -w.pos[2] / rr2;
      for (const c of cs) if (inCone(c, w.pos, dirX, dirZ)) { coneClash = true; break; }
      if (coneClash) break;
    }
    if (coneClash) { diedCone++; continue; } // piece h 0.682 > knee: cone law binds
    const A = obb(pos, yaw, HALF, CLOCAL);
    let minGap = Infinity, nearest = "", forestGap = Infinity, forestNear = "";
    let bad = false;
    for (const s of solids) {
      const g = satGap(A, s.obb);
      if (g < 1.4) { bad = true; break; }
      if (g < minGap) { minGap = g; nearest = s.id; }
      if (/forest|wild/.test(s.id) && g < forestGap) { forestGap = g; forestNear = s.id; }
    }
    if (bad) { diedSat++; continue; }
    cands.push({ az: azDeg, r: rr, x: pos[0], z: pos[2], yaw, minGap, forestGap: forestGap === Infinity ? 999 : forestGap, spokeOff, nearest, forestNear: forestNear || "(none)" });
  }
  }
}

cands.sort((a, b) => (a.forestGap - b.forestGap) || (a.spokeOff - b.spokeOff));
console.log(`legal candidates: ${cands.length} (died: rim ${diedRim}, spoke ${diedSpoke}, cone ${diedCone}, sat ${diedSat})`);
for (const c of cands.slice(0, 12)) {
  console.log(`az ${c.az} r ${c.r} → (${c.x.toFixed(2)}, ${c.z.toFixed(2)}) yawDeg ${(c.yaw * 180 / Math.PI).toFixed(1)} spokeOff ${c.spokeOff.toFixed(1)} minGap ${c.minGap.toFixed(2)} (${c.nearest}) forestGap ${c.forestGap === 999 ? "-" : c.forestGap.toFixed(2)} (${c.forestNear})`);
}
if (cands.length) {
  const w = cands[0];
  const A = obb([w.x, 0, w.z], w.yaw, HALF, CLOCAL);
  const gaps = solids.map((s) => ({ id: s.id, g: satGap(A, s.obb) })).sort((a, b) => a.g - b.g).slice(0, 6);
  console.log(`WINNER blockers: ${gaps.map((x) => `${x.id} ${x.g.toFixed(2)}`).join(", ")}`);
}
