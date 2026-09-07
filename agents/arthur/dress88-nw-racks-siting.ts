// dress88-nw-racks-siting.ts — dress-88 siting verification + fallback scan
// for nx-dress-nw-dryingracks-001 (dress-87 build v2, sha f0343efb…).
//
// dress-87 queued a HAND-DERIVED pocket (~(-36.5, 57.5) yaw 2.3562) vs census
// 271 with mandatory fresh re-verification (dress-85/86 law). This script:
//   (a) tests the queued pocket against the FRESH census, and
//   (b) if dead, scans the lavender-0040 headland band for legal poses.
//
// Constraints (all on fresh live set):
//   - rotated SAT gap >= 1.4m vs every solid (thin ground films h<=0.5 exempt)
//   - rack OBB >= 0.3m OUTSIDE every cultivation plot OBB (headland piece,
//     not on crop rows) — plots are films so SAT won't catch this; explicit
//   - rim corners in [66,108]
//   - cone law: no r>=35 solid with h>0.5 may have the rack inside its 18m
//     approach cone at <25deg off the plaza-ward axis (stile additionally
//     judged against the NW spoke axis, both directions — walkers pass
//     through gates along the spoke)
//   - >= 3.0m from the stile point (gate arrival), >= 2.5m from the NW spoke
//     line x=-z (walking corridor), >= 2.5m from the stile->field corner path
//   - yaw locked 2.3562 rad (rack long axis parallel to field rows)
//
// Rack v2 decode (TRUE dims): envelope x -2.244..2.032, z -0.724..0.731,
// y -0.033..1.666; local center (-0.106, +0.0035); half (2.138, 0.7275).
import { readFileSync } from "node:fs";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const HALF = { x: 2.138, z: 0.7275 }, CLOCAL = { x: -0.106, z: 0.0035 };
const YAW = 2.3562;

type OBB = { cx: number, cz: number, ux: number[], uz: number[], hu: number[] };
function obbAt(px: number, pz: number, yaw: number, half: { x: number, z: number }, c: { x: number, z: number }): OBB {
  const cos = Math.cos(yaw), sin = Math.sin(yaw);
  return {
    cx: px + c.x * cos + c.z * sin,
    cz: pz - c.x * sin + c.z * cos,
    ux: [cos, -sin], uz: [sin, cos], hu: [half.x, half.z],
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
// signed distance from point to OBB interior boundary (negative = inside)
function obbSignedDist(o: OBB, px: number, pz: number): number {
  const dx = px - o.cx, dz = pz - o.cz;
  const du = Math.abs(dx * o.ux[0] + dz * o.ux[1]) - o.hu[0];
  const dv = Math.abs(dx * o.uz[0] + dz * o.uz[1]) - o.hu[1];
  if (du <= 0 && dv <= 0) return Math.max(du, dv); // inside: most-negative penetration axis
  return Math.hypot(Math.max(du, 0), Math.max(dv, 0));
}

const r = await fetch(`${base}/geom?world=commons-next`);
if (!r.ok) throw new Error(`geom HTTP ${r.status}`);
const d: any = await r.json();
const ents: any[] = d.entities ?? [];
console.log(`fresh census: ${ents.length}`);

const solids = ents.filter(e => e.lib && e.pos && e.bbox?.size && (e.bbox.max[1] - e.bbox.min[1]) > 0.5);
const plots = ents.filter(e => /nx-cultivation-/.test(e.id) && e.bbox?.size);
const stile = ents.find(e => e.id === "nx-dress-nw-stile-001");
if (!stile) throw new Error("stile missing — epoch changed");
const spokeDir = [-Math.SQRT1_2, Math.SQRT1_2]; // NW spoke x=-z line direction

interface Check { ok: boolean; worst: string }
function checkPose(px: number, pz: number): Check {
  const A = obbAt(px, pz, YAW, HALF, CLOCAL);
  // rim
  const cos = Math.cos(YAW), sin = Math.sin(YAW);
  const cs: [number, number][] = [
    [-HALF.x + CLOCAL.x, -HALF.z + CLOCAL.z], [HALF.x + CLOCAL.x, -HALF.z + CLOCAL.z],
    [-HALF.x + CLOCAL.x, HALF.z + CLOCAL.z], [HALF.x + CLOCAL.x, HALF.z + CLOCAL.z]];
  const rs = cs.map(([lx, lz]) => Math.hypot(px + lx * cos + lz * sin, pz - lx * sin + lz * cos));
  const lo = Math.min(...rs), hi = Math.max(...rs);
  if (lo < 66 || hi > 108) return { ok: false, worst: `rim ${lo.toFixed(1)}..${hi.toFixed(1)}` };
  // SAT vs solids
  let worstSAT = Infinity, worstSATid = "";
  for (const e of solids) {
    if (e.id === "nx-dress-nw-dryingracks-001") continue;
    const bb = e.bbox;
    const B = obbAt(e.pos[0], e.pos[2], e.yaw ?? 0,
      { x: bb.size[0] / 2, z: bb.size[2] / 2 },
      { x: (bb.min[0] + bb.max[0]) / 2, z: (bb.min[2] + bb.max[2]) / 2 });
    const g = satGap(A, B);
    if (g < worstSAT) { worstSAT = g; worstSATid = e.id; }
    if (g < 1.4) return { ok: false, worst: `SAT ${e.id} ${g.toFixed(2)}m` };
  }
  // headland: rack corners + center outside every plot by >= 0.3
  for (const p of plots) {
    const bb = p.bbox;
    const P = obbAt(p.pos[0], p.pos[2], p.yaw ?? 0,
      { x: bb.size[0] / 2, z: bb.size[2] / 2 },
      { x: (bb.min[0] + bb.max[0]) / 2, z: (bb.min[2] + bb.max[2]) / 2 });
    // shrink allowed: expand plot by 0.3 and require rack corners outside
    const Pc = { ...P, hu: [P.hu[0] + 0.3, P.hu[1] + 0.3] } as OBB;
    for (const [lx, lz] of cs) {
      const wx = px + lx * cos + lz * sin, wz = pz - lx * sin + lz * cos;
      if (obbSignedDist(Pc, wx, wz) <= 0) return { ok: false, worst: `inside plot ${p.id}` };
    }
  }
  // cone law: r>=35 solids h>0.5, plaza-ward axis, 18m / 25deg
  for (const e of solids) {
    const rr = Math.hypot(e.pos[0], e.pos[2]);
    if (rr < 35) continue;
    const dx = px - e.pos[0], dz = pz - e.pos[2], dist = Math.hypot(dx, dz);
    if (dist >= 18) continue;
    const ux = -e.pos[0] / rr, uz = -e.pos[2] / rr; // plaza-ward unit
    const cosang = (dx * ux + dz * uz) / dist;
    if (cosang > Math.cos(25 * Math.PI / 180))
      return { ok: false, worst: `cone ${e.id} ${dist.toFixed(1)}m ${(Math.acos(Math.min(1, cosang)) * 180 / Math.PI).toFixed(1)}deg` };
    // stile true axis: walkers pass along the spoke — block either direction
    if (e.id === "nx-dress-nw-stile-001") {
      for (const s of [spokeDir, [-spokeDir[0], -spokeDir[1]]] as [number, number][]) {
        const c2 = (dx * s[0] + dz * s[1]) / dist;
        if (c2 > Math.cos(25 * Math.PI / 180))
          return { ok: false, worst: `stile-spoke cone ${dist.toFixed(1)}m` };
      }
    }
  }
  // walking clearances
  if (Math.hypot(px - stile.pos[0], pz - stile.pos[2]) < 3.0) return { ok: false, worst: `stile pt <3m` };
  const t = (px * spokeDir[0] + pz * spokeDir[1]); // projection on spoke line
  const nlx = px - t * spokeDir[0], nlz = pz - t * spokeDir[1];
  if (Math.hypot(nlx, nlz) < 2.5) return { ok: false, worst: `spoke line <2.5m` };
  return { ok: true, worst: `SATmin ${worstSAT.toFixed(2)} (${worstSATid})` };
}

// (a) queued pocket
const queued = checkPose(-36.5, 57.5);
console.log(`queued pocket (-36.5,57.5): ${queued.ok ? "LEGAL — " + queued.worst : "DEAD — " + queued.worst}`);

// (b) scan band: headland around lavender-0040 plaza-facing (+z local) edge,
// localx from -8..+8 along the row axis, localz 6.4..8.0 outside the crop
const lav = plots.find(p => p.id === "nx-cultivation-lavender-0040");
if (!lav) throw new Error("lavender-0040 missing");
const lcos = Math.cos(lav.yaw), lsin = Math.sin(lav.yaw);
const lxDir = [lcos, -lsin], lzDir = [lsin, lcos];
const results: { px: number, pz: number, note: string, dist: number }[] = [];
for (let lx = -9; lx <= 9; lx += 0.3) {
  for (let lz = 6.4; lz <= 8.0; lz += 0.2) {
    const px = lav.pos[0] + lx * lxDir[0] + lz * lzDir[0];
    const pz = lav.pos[2] + lx * lxDir[1] + lz * lzDir[1];
    const c = checkPose(px, pz);
    if (c.ok) results.push({ px, pz, note: c.worst, dist: Math.hypot(px + 36.5, pz - 57.5) });
  }
}
results.sort((a, b) => a.dist - b.dist);
console.log(`legal poses: ${results.length}`);
for (const w of results.slice(0, 8))
  console.log(`  (${w.px.toFixed(2)}, ${w.pz.toFixed(2)}) r=${Math.hypot(w.px, w.pz).toFixed(1)} dConcept=${w.dist.toFixed(2)} ${w.note}`);
if (!results.length) {
  // widen: opposite (-z) headland + both ends of the plot
  const wide: typeof results = [];
  for (let lx = -11; lx <= 11; lx += 0.3) {
    for (const lz of [-8.0, -7.5, -7.0, -6.6, 6.4, 6.8, 7.2, 7.6, 8.0]) {
      const px = lav.pos[0] + lx * lxDir[0] + lz * lzDir[0];
      const pz = lav.pos[2] + lx * lxDir[1] + lz * lzDir[1];
      const c = checkPose(px, pz);
      if (c.ok) wide.push({ px, pz, note: c.worst, dist: Math.hypot(px + 36.5, pz - 57.5) });
    }
  }
  wide.sort((a, b) => a.dist - b.dist);
  console.log(`wide-scan legal poses: ${wide.length}`);
  for (const w of wide.slice(0, 8))
    console.log(`  (${w.px.toFixed(2)}, ${w.pz.toFixed(2)}) r=${Math.hypot(w.px, w.pz).toFixed(1)} dConcept=${w.dist.toFixed(2)} ${w.note}`);
}
