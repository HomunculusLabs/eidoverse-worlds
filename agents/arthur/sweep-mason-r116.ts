// sweep-mason-r116.ts — R-116 lane-collision survey: mason works × village lanes.
// Standing instrument for the mason lane. Measures all 60 av-mason-NNNN works
// against every village footprint entity (lib+bbox), rotated-SAT, corrected
// axis convention (align-1). Exit 0 + "MASON SWEEP ALL CLEAR" = no overlap.
// Any OVERLAP line is a find — decode at source (mason.ts siteFor) before fix.
//
// Law: mason works sit 46-70m from center in a sunflower ring; lanes/landmarks
// (roads, treeline, windmill lane, field cluster) radiate from the village disc.
// Overlap with a WALKABLE lane (roads/paths/treeline) = walk-test before moving.
type Ent = { id: string; lib?: string; pos: number[]; yaw: number; bbox?: { min: number[]; max: number[] } };
export {}; // module marker for top-level await

const r = await fetch("https://eidoverse.billding.dev/geom?world=commons", { headers: { "User-Agent": "curl/8.7.1" } });
if (!r.ok) { console.error(`FETCH FAIL ${r.status}`); process.exit(1); }
const snap = (await r.json()) as { entities?: Ent[] };
const all = snap.entities ?? [];

const masons = all.filter((e) => /^av-mason-\d{4}$/.test(e.id) && e.lib && e.bbox);
const village = all.filter((e) => !/^av-mason-/.test(e.id) && e.lib && e.bbox);
const WALKABLE = [/^av-roads/, /^av-door-paths/, /^av-paths/, /^av-treeline/];
console.log(`mason works (lib+bbox): ${masons.length} | village footprints: ${village.length}`);

function obb(e: Ent) {
  const c = Math.cos(e.yaw), s = Math.sin(e.yaw);
  const cx = (e.bbox!.min[0] + e.bbox!.max[0]) / 2, cz = (e.bbox!.min[2] + e.bbox!.max[2]) / 2;
  return {
    id: e.id, pos: e.pos,
    cx: e.pos[0] + cx * c + cz * s,
    cz: e.pos[2] - cx * s + cz * c,
    ax: [c, -s] as [number, number],
    az: [s, c] as [number, number],
    hx: (e.bbox!.max[0] - e.bbox!.min[0]) / 2,
    hz: (e.bbox!.max[2] - e.bbox!.min[2]) / 2,
    y0: e.pos[1] + e.bbox!.min[1], y1: e.pos[1] + e.bbox!.max[1],
  };
}
const dot = (u: [number, number], v: [number, number]) => u[0] * v[0] + u[1] * v[1];
function satDepth(a: ReturnType<typeof obb>, b: ReturnType<typeof obb>): number {
  let worst = Infinity;
  for (const ax of [a.ax, a.az, b.ax, b.az]) {
    const ra = a.hx * Math.abs(dot(ax, a.ax)) + a.hz * Math.abs(dot(ax, a.az));
    const rb = b.hx * Math.abs(dot(ax, b.ax)) + b.hz * Math.abs(dot(ax, b.az));
    const d = Math.abs(dot(ax, [b.cx - a.cx, b.cz - a.cz]));
    const sep = ra + rb - d;
    if (sep <= 0) return -1;
    worst = Math.min(worst, sep);
  }
  return worst;
}
const edge = (a: number, b: number) => Math.min(a, b); // gap between centers minus half-extents is handled by SAT sep

const mb = masons.map(obb), vb = village.map(obb);
let hits = 0, walk = 0;
const near: { m: string; v: string; gap: number; walkable: boolean }[] = [];
for (const m of mb) {
  for (const v of vb) {
    const d = satDepth(m, v);
    if (d >= 0) {
      hits++;
      const isWalk = WALKABLE.some((re) => re.test(v.id));
      if (isWalk) walk++;
      console.log(`OVERLAP: ${m.id} × ${v.id} depth ${d.toFixed(3)}m ${isWalk ? "[WALKABLE]" : ""}  [${m.id} pos(${m.pos.map((x) => x.toFixed(2))})] [${v.id} pos(${v.pos.map((x) => x.toFixed(2))})]`);
    }
  }
}
// nearest-village-neighbor distances for every work (relocation triage)
for (const m of mb) {
  let best = Infinity, bid = "";
  for (const v of vb) {
    const dx = m.cx - v.cx, dz = m.cz - v.cz;
    const dd = Math.hypot(dx, dz);
    if (dd < best) { best = dd; bid = v.id; }
  }
  near.push({ m: m.id, v: bid, gap: best, walkable: WALKABLE.some((re) => re.test(bid)) });
}
near.sort((a, b) => a.gap - b.gap);
console.log(`\noverlaps: ${hits} (${walk} on walkable lanes)`);
console.log(`closest works to any village footprint (center-to-center, m):`);
for (const n of near.slice(0, 12)) {
  console.log(`  ${n.m} → ${n.v}: ${n.gap.toFixed(1)}m ${n.walkable ? "(lane)" : ""}`);
}
if (hits > 0) { console.log("MASON SWEEP HAS FINDS"); process.exit(2); }
console.log("MASON SWEEP ALL CLEAR");
