// dress92-glazier-scan.ts — siting scan for nx-dress-ne-glazier-001.
// Band: the mosaic-0036 (39.0,22.5) <-> kiln (31,39) connector, offsets
// both sides; fallback full NE annulus scan (dress-83 law).
// Gates per candidate: rotated SAT vs live solids (gap>=0 hard, <1.4
// recorded as pinch), thin-film walking surfaces (lane/path/road class)
// need >=1.5m clearance, 18m plaza-facing approach cones (piece 1.47m tall
// > knee height — loop law: never inside a work's arrival cone).
// TRUE decode dims (v5 53b31cfd): local x -1.9..1.42, z -0.66..0.66
// -> half 1.66 x 0.66, center (-0.24, 0).
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

// approach cones: apex at work center, axis toward plaza (0,0), 18m, ±30°
function inCone(px: number, pz: number, wx: number, wz: number): boolean {
  const dx = px - wx, dz = pz - wz;
  const dist = Math.hypot(dx, dz);
  if (dist > 18) return false;
  // angle between (work->candidate) and (work->plaza)
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
  const pinches: string[] = [];
  for (const [id, ent] of Object.entries(ents)) {
    if (id === "nx-dress-ne-glazier-001" || !ent.lib || !ent.pos) continue;
    const bb = ent.bbox;
    if (!bb || !bb.size) continue;
    const thin = bb.max[1] - bb.min[1] <= 0.5;
    const B = obb(ent.pos, ent.yaw ?? 0,
      { x: bb.size[0] / 2, z: bb.size[2] / 2 },
      { x: (bb.min[0] + bb.max[0]) / 2, z: (bb.min[2] + bb.max[2]) / 2 });
    const g = satGap(A, B);
    const laneClass = thin && (bb.size[0] > 4 || bb.size[2] > 4); // long thin film = walking surface
    if (laneClass) {
      if (g < 1.5) return { ok: false, why: `lane/path clearance ${g.toFixed(2)} vs ${id}` };
    } else if (!thin) {
      if (g < 0) return { ok: false, why: `SAT overlap ${g.toFixed(2)} vs ${id}` };
      if (g < 1.4) return { ok: false, why: `pinch ${g.toFixed(2)} vs ${id}` };
    } else {
      if (g < 0) return { ok: false, why: `small-film overlap ${g.toFixed(2)} vs ${id}` };
    }
    if (!thin && g < worst) { worst = g; worstId = id; }
  }
  for (const [id, wx, wz] of WORKS) {
    if (inCone(px, pz, wx, wz)) return { ok: false, why: `inside 18m approach cone of ${id}` };
  }
  return { ok: true, worst, worstId };
}

// band scan: mosaic -> kiln connector
const M = { x: 39.0, z: 22.5 }, K = { x: 31.0, z: 39.0 };
const dir = { x: K.x - M.x, z: K.z - M.z };
const len = Math.hypot(dir.x, dir.z);
const perp = { x: -dir.z / len, z: dir.x / len };
const results: string[] = [];
const yaws = [2.35, -0.79, 0.785, 3.93]; // lane-parallel family grid + perpendicular
for (let t = 0.1; t <= 0.9; t += 0.1) {
  const cx = M.x + dir.x * t, cz = M.z + dir.z * t;
  for (let off = -9; off <= 9; off += 0.5) {
    const px = cx + perp.x * off, pz = cz + perp.z * off;
    for (const yaw of yaws) {
      const ev = evaluate(px, pz, yaw);
      if (ev.ok) results.push(`t=${t.toFixed(1)} off=${off.toFixed(1)} (${px.toFixed(2)},${pz.toFixed(2)}) yaw=${yaw} worst=${ev.worst?.toFixed(2)} vs ${ev.worstId}`);
    }
  }
}
console.log("band legal cells:", results.length);
for (const rr of results.slice(0, 25)) console.log(" ", rr);

// print the approach/lane entities near the band for context
for (const [id, e] of Object.entries(ents)) {
  if ((id.includes("approach-ne") || id.includes("mile-ne")) && e.pos) {
    console.log("lane-ctx:", id, `(${e.pos[0].toFixed(1)},${e.pos[2].toFixed(1)})`, e.bbox ? `bbox ${e.bbox.size.map((v: number) => v.toFixed(1)).join("x")}` : "");
  }
}
