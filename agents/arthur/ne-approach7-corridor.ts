// ne-approach7-corridor.ts — fresh SAT/rim preflight for the D2 rebuild of
// nx-approach-ne-lane-002. Fetches the LIVE census, computes exact OBB
// clearance from the lane polyline (3 segments, approach-2 siting) with the
// approach-7 envelope (verge 1.45m + pillar 1.55m max lateral → 1.6m law),
// and lists every entity whose OBB comes within 3.5m of the centerline —
// the keep-out candidate set for the mk script's per-stone neighbor check.
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const d2r = (d: number) => (d * Math.PI) / 180;
const pol = (r: number, azd: number): [number, number] => [r * Math.sin(d2r(azd)), r * Math.cos(d2r(azd))];
const SEGS: Array<[[number, number], [number, number]]> = [
  [pol(24, 54), pol(48, 54)],
  [pol(48, 54), pol(54, 48)],
  [pol(54, 48), pol(72, 15)],
];
const ENV = 1.6; // new-envelope lateral half-width (verge 1.45 + stone half ~0.15)

const r = await fetch(`${base}/geom?world=commons-next`);
if (!r.ok) throw new Error(`geom HTTP ${r.status}`);
const d: any = await r.json();
const ents: any[] = d.entities ?? [];
console.log("census entities:", ents.length);

// point-to-segment distance
function segDist(px: number, pz: number, a: [number, number], b: [number, number]): number {
  const dx = b[0] - a[0], dz = b[1] - a[1];
  const L2 = dx * dx + dz * dz;
  let t = ((px - a[0]) * dx + (pz - a[1]) * dz) / L2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (a[0] + dx * t), pz - (a[1] + dz * t));
}

// OBB in world: center from pos + local bbox center offset rotated by yaw.
// axis vectors (align-1 law): local-x -> (cos, -sin), local-z -> (sin, cos)
function obbClear(px: number, pz: number, e: any): number | null {
  if (!e.bbox) return null;
  const yaw = e.yaw ?? 0, c = Math.cos(yaw), s = Math.sin(yaw);
  const cxL = (e.bbox.min[0] + e.bbox.max[0]) / 2, czL = (e.bbox.min[2] + e.bbox.max[2]) / 2;
  const wx = e.pos[0] + cxL * c + czL * s;
  const wz = e.pos[2] - cxL * s + czL * c;
  const hx = (e.bbox.max[0] - e.bbox.min[0]) / 2, hz = (e.bbox.max[2] - e.bbox.min[2]) / 2;
  const dx = px - wx, dz = pz - wz;
  const lu = dx * c - dz * s, lv = dx * s + dz * c;
  // signed distance from point to OBB boundary (outside positive)
  const du = Math.abs(lu) - hx, dv = Math.abs(lv) - hz;
  return Math.hypot(Math.max(du, 0), Math.max(dv, 0));
}

type Row = { id: string; minSeg: number; minClear: number; pos: number[]; yaw: number; size: number[]; thin: boolean };
const rows: Row[] = [];
for (const e of ents) {
  const id = e.id as string;
  if (id === "nx-approach-ne-lane-002" || id.startsWith("nx-approach-ne-lamp")) continue;
  if (!e.pos) continue;
  const thin = e.bbox ? e.bbox.max[1] - e.bbox.min[1] <= 0.5 : false; // ground-layer exemption
  let bestSeg = 1e9, bestClear = 1e9;
  for (const [a, b] of SEGS) {
    const sd = segDist(e.pos[0], e.pos[2], a, b);
    if (sd < bestSeg) bestSeg = sd;
    // clearance measured at the closest point on the segment to the entity center
    // — approximate the corridor test at sample points along all segments for OBB accuracy
  }
  // dense sample along all segments for exact OBB nearest approach
  for (const [a, b] of SEGS) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = Math.max(8, Math.ceil(L / 0.5));
    for (let i = 0; i <= n; i++) {
      const t = i / n, sx = a[0] + (b[0] - a[0]) * t, sz = a[1] + (b[1] - a[1]) * t;
      const cl = obbClear(sx, sz, e);
      if (cl !== null && cl < bestClear) bestClear = cl;
    }
  }
  if (bestSeg < 3.5 || bestClear < 3.5) {
    rows.push({ id, minSeg: +bestSeg.toFixed(2), minClear: +bestClear.toFixed(2), pos: e.pos, yaw: +(e.yaw ?? 0).toFixed(3), size: e.bbox?.size ?? [], thin });
  }
}
rows.sort((a, b) => a.minClear - b.minClear);
console.log("entities within 3.5m of the corridor (sorted by OBB clearance to centerline):");
for (const q of rows) {
  const verdict = q.thin ? "THIN(exempt)" : q.minClear - ENV < 1.4 ? "PINCH-CHECK" : "ok";
  console.log(`  ${q.id}  center-dist ${q.minSeg}  obb-clear ${q.minClear}  env-gap ${(q.minClear - ENV).toFixed(2)}  ${verdict}  pos [${q.pos.map((v: number) => +v.toFixed(2))}] yaw ${q.yaw} size [${q.size.map((v: number) => +v.toFixed(2))}]`);
}
