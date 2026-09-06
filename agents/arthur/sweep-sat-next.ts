// sweep-sat-next.ts — sweep-N lane standing overlap sweep for commons-next.
// Adapted from sweep-align.ts (align lane) with the hard-won conventions:
//  - fetch PLAIN /geom (no &boxes=0 — that strips bboxes)
//  - world = pos + lx*(c,-s) + lz*(s,c)   [corrected axis convention, align-1]
//  - OBB half-extents from bbox size, bbox CENTER transform (bbox is not
//    origin-centered for directional works)
//  - overlap iff EVERY separating-axis gap < 0 (max gap, never min)
// Exemption ladder (documented, in this order):
//  E1 lights (kind === "light") — not geometry
//  E2 thin film / ground layer: bbox height <= 0.5 on EITHER side
//  E3 suspended decor: pos.y >= 2.0 on EITHER side
//  E4 ALLOWED pairs (sorted keys) — designed contacts, seeded sweep-1
// Exit 0 + "SWEEP ALL CLEAR" = no unclassified overlaps.
// Any UNCLASSIFIED line is a finding candidate — decode at source first.
const URL_ = "https://eidoverse.billding.dev/geom?world=commons-next";
type Ent = {
  id: string; kind?: string; pos: number[]; yaw: number; lib?: string;
  bbox?: { min: number[]; max: number[] };
};
export {}; // module marker

// E2b ground-film compounds (standing class): road/lamp/path MESHES and the
// three approach lanes (thin paver films with lamp keep-trees — compound bbox
// spans the whole walk; per-stone clearance proven at placement, approach-1/2/3).
const GROUND_FILM = new Set([
  "nx-town-roads", "nx-town-streetlamps", "nx-core-paths",
  "nx-approach-nw-lane-001", "nx-approach-ne-lane-002", "nx-approach-sw-lane-003",
]);
// E4b riders on their own hosts (standing class): artwalk b-series and
// shutters/signs are mounted works whose bbox envelopes the host seam.
const RIDER = /^nx-artwalk-b\d+-|^nx-shutters$|^nx-sign-/;

// E4 — designed contacts, classified at sweep-1 (see SWEEP-PLAN.md register
// for evidence and precedent). Keys are SORTED "idA|idB".
const ALLOWED = new Set<string>([
  "nx-cistern|nx-court",          // nvp-22 intended set (bakery cistern at court)
  "nx-court|nx-sign-bakery",      // nvp-22 intended set (sign proud of face)
  "nx-court|nx-sign-smithy",      // nvp-22 intended set
  "nx-hearth|nx-struct-crossing", // struct-34 named exception: apron edge seat,
                                   //   hearth compound bbox wraps the corner
  "nx-town-monument|nx-welcome",  // R-114 idiom carried to commons-next:
                                   //   welcome arm points at monument; bbox kiss
  // sweep-8: dress-7 cairn past forest-0044's fat compound bbox — same class
  // as hearth|struct-crossing. Source-true walking-band occupancy decode of
  // the LIVE lib (sha 43e4c8c3a843881d verified == live, dress7-forest44-
  // occupancy.ts, re-run sweep-8): cairn center R83 OFF0 cell-clearance
  // 2.58m MINUS cairn radius already applied => 2.58m effective >= 1.4m pinch
  // law. SAT gap -0.105 is dead bbox corner, no solid contact. NAMED
  // exemption also carried in se-dress7-place.ts placer header.
  "nx-dress-se-cairn-001|nx-wild-forest-0044",
]);

const r = await fetch(URL_, { headers: { "User-Agent": "curl/8.7.1" } });
if (!r.ok) throw new Error(`GET -> HTTP ${r.status}`);
const data: any = await r.json();
const ents: Ent[] = (data.entities ?? []).filter(
  (e: any) => e.kind !== "light" && e.bbox && e.lib
);

function obb(e: Ent) {
  const bb = e.bbox!;
  const c = Math.cos(e.yaw || 0), s = Math.sin(e.yaw || 0);
  const cx = (bb.min[0] + bb.max[0]) / 2, cz = (bb.min[2] + bb.max[2]) / 2;
  const wx = e.pos[0] + cx * c + cz * s;
  const wz = e.pos[2] - cx * s + cz * c;
  const hx = (bb.max[0] - bb.min[0]) / 2, hz = (bb.max[2] - bb.min[2]) / 2;
  const h = bb.max[1] - bb.min[1];
  return { x: wx, z: wz, hx, hz, h, ax: [c, -s] as const, az: [s, c] as const };
}
function gap(a: ReturnType<typeof obb>, b: ReturnType<typeof obb>) {
  const dx = b.x - a.x, dz = b.z - a.z;
  const axes = [a.ax, a.az, b.ax, b.az];
  let best = -Infinity;
  for (const [ux, uz] of axes) {
    const dist = Math.abs(dx * ux + dz * uz);
    const projA = a.hx * Math.abs(a.ax[0] * ux + a.ax[1] * uz) + a.hz * Math.abs(a.az[0] * ux + a.az[1] * uz);
    const projB = b.hx * Math.abs(b.ax[0] * ux + b.ax[1] * uz) + b.hz * Math.abs(b.az[0] * ux + b.az[1] * uz);
    best = Math.max(best, dist - projA - projB);
  }
  return best;
}
const thin = (o: ReturnType<typeof obb>) => o.h <= 0.5;
const suspended = (e: Ent) => (e.pos[1] ?? 0) >= 2.0;

const boxes = ents.map((e) => ({ e, o: obb(e) }));
let unclassified = 0, classified = 0;
const rows: string[] = [];
for (let i = 0; i < boxes.length; i++) {
  for (let j = i + 1; j < boxes.length; j++) {
    const A = boxes[i], B = boxes[j];
    const g = gap(A.o, B.o);
    if (g >= 0) continue; // separated
    const key = [A.e.id, B.e.id].sort().join("|");
    let why = "";
    if (thin(A.o) || thin(B.o)) why = "E2-thin-film/ground";
    else if (suspended(A.e) || suspended(B.e)) why = "E3-suspended";
    else if (GROUND_FILM.has(A.e.id) || GROUND_FILM.has(B.e.id)) why = "E2b-ground-film";
    else if (RIDER.test(A.e.id) || RIDER.test(B.e.id)) why = "E4b-rider";
    else if (ALLOWED.has(key)) why = "E4-allowed";
    if (why) { classified++; continue; }
    unclassified++;
    rows.push(`UNCLASSIFIED ${key} gap=${g.toFixed(3)} yA=${A.e.pos[1]?.toFixed(1)} yB=${B.e.pos[1]?.toFixed(1)}`);
  }
}
console.log(`entities(with bbox, non-light): ${boxes.length}`);
console.log(`exempt-classified contacts: ${classified}`);
console.log(`unclassified overlaps: ${unclassified}`);
for (const row of rows) console.log(row);
console.log(unclassified === 0 ? "SWEEP ALL CLEAR" : "SWEEP HAS FINDINGS");
process.exit(unclassified === 0 ? 0 : 3);
