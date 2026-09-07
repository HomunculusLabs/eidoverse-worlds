// dress92-glazier-scan2.ts — full NE annulus scan (dress-83/88 law) after
// the mosaic<->kiln band proved cone-saturated (mosaic/kiln/spiralfolly
// plaza-facing 18m cones blanket the connector — the gallery edge is
// approach territory). Same gates as scan1.
import { readFileSync } from "node:fs";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const HALF = { x: 1.66, z: 0.66 };
const CLOCAL = { x: -0.24, z: 0 };

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

const r = await fetch(`${base}/geom?world=commons-next`);
if (!r.ok) throw new Error(`geom HTTP ${r.status}`);
const d: any = await r.json();
const ents = Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
console.log("census entities:", Object.keys(ents).length);

function inCone(px: number, pz: number, wx: number, wz: number): boolean {
  const dx = px - wx, dz = pz - wz;
  const dist = Math.hypot(dx, dz);
  if (dist > 18) return false;
  const ax = -wx, az = -wz;
  const cosA = (dx * ax + dz * az) / (dist * Math.hypot(ax, az));
  return cosA > Math.cos((30 * Math.PI) / 180);
}

const WORKS: [string, number, number][] = [];
for (const [id, e] of Object.entries(ents)) {
  if (!e.lib || !e.pos) continue;
  const rr = Math.hypot(e.pos[0], e.pos[2]);
  if (rr >= 28 && rr <= 112 && id !== "nx-dress-ne-glazier-001") WORKS.push([id, e.pos[0], e.pos[2]]);
}

function evaluate(px: number, pz: number, yaw: number) {
  const A = obb([px, 0, pz], yaw, HALF, CLOCAL);
  let worst = Infinity, worstId = "";
  for (const [id, ent] of Object.entries(ents)) {
    if (id === "nx-dress-ne-glazier-001" || !ent.lib || !ent.pos) continue;
    const bb = ent.bbox;
    if (!bb || !bb.size) continue;
    const thin = bb.max[1] - bb.min[1] <= 0.5;
    const B = obb(ent.pos, ent.yaw ?? 0,
      { x: bb.size[0] / 2, z: bb.size[2] / 2 },
      { x: (bb.min[0] + bb.max[0]) / 2, z: (bb.min[2] + bb.max[2]) / 2 });
    const g = satGap(A, B);
    const laneClass = thin && (bb.size[0] > 4 || bb.size[2] > 4);
    if (laneClass) {
      if (g < 1.5) return { ok: false, why: `lane` };
    } else if (!thin) {
      if (g < 1.4) return { ok: false, why: `solid ${g.toFixed(2)} ${id}` };
    } else {
      if (g < 0) return { ok: false, why: `film ${id}` };
    }
    if (!thin && g < worst) { worst = g; worstId = id; }
  }
  for (const [id, wx, wz] of WORKS) {
    if (inCone(px, pz, wx, wz)) return { ok: false, why: `cone ${id}` };
  }
  return { ok: true, worst, worstId };
}

// full NE annulus: az 5..85 deg, r 40..107, grid 0.5deg x 0.75m
const legal: string[] = [];
let tested = 0;
const yaws = [2.356, -0.785, 0.785, -2.356, 3.93, 0.0];
for (let az = 5; az <= 85; az += 0.5) {
  const a = (az * Math.PI) / 180;
  for (let rr = 40; rr <= 107; rr += 0.75) {
    const px = rr * Math.cos(a), pz = rr * Math.sin(a);
    for (const yaw of yaws) {
      tested++;
      const ev = evaluate(px, pz, yaw);
      if (ev.ok) legal.push(`az${az.toFixed(1)} r${rr.toFixed(2)} (${px.toFixed(2)},${pz.toFixed(2)}) yaw${yaw} worst=${ev.worst?.toFixed(2)} ${ev.worstId}`);
    }
  }
}
console.log(`tested ${tested}, legal ${legal.length}`);
// prefer cells closest to the az-45 gallery spoke (identity proximity)
legal.sort((a, b) => {
  const pa = /az([\d.]+)/.exec(a)![1], pb = /az([\d.]+)/.exec(b)![1];
  return Math.abs(parseFloat(pa) - 45) - Math.abs(parseFloat(pb) - 45);
});
for (const l of legal.slice(0, 30)) console.log(" ", l);
