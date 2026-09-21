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
  // sweep-42: struct-46 angler re-place (b3dfb28a->6bf06a35, committed
  // c87d502) seats the angler ON the pool's W bank with bobber re-aimed
  // into the water — DESIGNED contact, named in the placer
  // (next-place-struct46-angler.ts:68) and re-proven this sweep: fresh
  // 4-leg MCPL circuit ALL_PASS max 0.397m; pool compound bbox (h2.65,
  // reeds) defeats the auto film exemption, so standing-precedent tier
  // applies (same class as hearth|struct-crossing).
  "nx-struct-angler|nx-struct-reedpool",
  // sweep-74 (R-124): improve-45's lavender furrow cure raised bed bbox height
  // 0.482 -> 0.550, crossing the frozen E2 film threshold (<=0.5), so six
  // pre-existing garden-edge adjacencies surfaced in square-SAT. Source-true
  // decode of the EXACT live bytes (sweep74-lavender-contacts-decode.ts;
  // local sha16 == live lib prefix on all six libs): every contact is a
  // POSITIVE separation — no interpenetration anywhere; the square-SAT gaps
  // are dead bbox corners over a ~20x12m planting-bed envelope (pitfall-0b).
  // True walking-band (y<2.5) plan-view mins:
  //   lav-0027|mile-nw-007: sq -3.557 -> TRUE 0.098m (wide grid)
  //   lav-0027|mile-nw-008: sq -3.557 -> TRUE 0.165m (wide grid)
  //   lav-0027|skeps:       sq -2.333 -> TRUE 0.001m
  //   lav-0040|hedge:       sq -5.795 -> TRUE 0.013m
  //   lav-0027|stile:       sq -0.507 -> TRUE 0.015m
  //   lav-0040|stile:       sq -1.086 -> TRUE 0.024m
  // All are district-edge bedding meets (farm furniture at field edge is the
  // NW cultivation design: skeps/rainbarrel apiary beside lavender; stile at
  // the field gate). Cure footprints were strict-subsets (x/z shrank), so the
  // true clearances IMPROVED under the cure; the contacts are newly VISIBLE,
  // not new in the world. NW route threads lav-0027's band by design — first
  // post-cure NW walk 5/5 ALL_PASS @ 0.38 (sweep-74). Evidence in SWEEP-PLAN
  // R-124. Any pos/lib drift on these seven ids re-surfaces as census drift
  // at 16-hex precision and re-derives this class.
  "nx-cultivation-lavender-0027|nx-mile-nw-007",
  "nx-cultivation-lavender-0027|nx-mile-nw-008",
  "nx-cultivation-lavender-0027|nx-dress-nw-skeps-001",
  "nx-cultivation-lavender-0027|nx-dress-nw-stile-001",
  "nx-cultivation-lavender-0040|nx-dress-nw-hedge-001",
  "nx-cultivation-lavender-0040|nx-dress-nw-stile-001",
  // sweep-308 (decode-of-record): fauna-17 dovecote seated at the orchard-
  // edge meadow (-50.5, 62.55) yaw 2.577; the lavender-0040 bed's ~20x12m
  // compound bbox (h 0.550, defeats E2 film threshold by 50mm) kisses the
  // dovecote's full-envelope OBB at -0.016 (max separating-axis). Source-
  // true decode of the EXACT live bytes (sweep308-dovecote-contact-decode
  // chassis, sweep-74 law; local sha16 5e04ce4b (lavender) + 8f33f97f
  // (dovecote) both prefix-verified == live lib): TRUE plan-view min
  // separation 0.378m POSITIVE (wide-grid), no interpenetration anywhere;
  // NW route true-footprint clearance: dovecote 10.952m, lavender 6.582m.
  // Same farm-furniture-at-field-edge bedding class as the six sweep-74
  // contacts (R-124). Evidence: SWEEP-PLAN sweep-308 row. Any pos/lib
  // drift on either id re-surfaces as census drift at 16-hex precision
  // and re-derives this class.
  "nx-cultivation-lavender-0040|nx-dress-dovecote-001",
  // sweep-76: dress-99 offering niche seated flush against the labyrinth's
  // east outer wall — DESIGNED adjacency, declared in the placer/ledger
  // ("rider designed mount", anchor re-derived vs live host 2d3d2032).
  // Source-true decode of EXACT live bytes (sweep76-offering-contacts-decode.ts,
  // hash-gated 2/2: offering b41efb63746c2450 + labyrinth 2d3d2032d3e806f8
  // == live prefixes): TRUE plan-view wall separation +0.010m POSITIVE, no
  // interpenetration; SAT gap -0.690 is the fat 13x14m compound-bbox artifact
  // (pitfall-0b). Flush wall-mount seam (1cm), not a threadable corridor —
  // roads-run-past-walls class. The offering bbox height 1.09m defeats the
  // auto film exemption, so standing-precedent tier applies (angler|reedpool
  // sweep-42 / welcome|monument R-114 class). Evidence: SWEEP-PLAN sweep-76.
  "nx-dress-sw-offering-001|nx-temple-labyrinth-0038",
  // sweep-86 (decode-of-record): struct-82 whisperhorn SW r89 vs temple
  // terrace-0040's elevated deck. The terrace census bbox carries local
  // center offset (0,2.175,5.805) at yaw -3pi/4, so its y3-4 deck
  // overhangs its own ground footprint ~4.1m toward the horn's seat —
  // the OBB -1.514 is the elevated-deck envelope artifact (pitfall-0b
  // class, kin to struct-19's disc-vs-square). Source-true decode of the
  // EXACT live bytes (work_1641_terrace.glb sha e8417696 prefix-verified
  // == live; whisperhorn lib b6e48e46 == live): nearest terrace vertex
  // to the horn axis 2.254m at y4.00 (ABOVE the horn's 2.755 top), ZERO
  // verts inside the dais disc r2.05, ZERO plan-view triangles covering
  // the horn axis, MIN 3D distance horn-axis-segment to terrace surface
  // 2.376m => dais-edge clearance +0.326m conservative, walk-band
  // (y<=2.755) dais-edge gap 2.332m >= 1.4m pinch law. Decode chassis
  // validated against struct-82's committed disc-vs-skymirror +2.36.
  // Evidence: SWEEP-PLAN sweep-86 row. Any pos/lib drift on either id
  // re-surfaces as census drift at 16-hex precision and re-derives this
  // class. Horn bbox height 2.755 defeats the auto film exemption, so
  // standing-precedent tier applies (angler|reedpool sweep-42 class).
  "nx-struct-whisperhorn|nx-temple-terrace-0040",
  // sweep-330 (decode-of-record): fauna-34 barn swallows — three true-size
  // birds circling the livery yard in airborne rings (A y2.40 r2.6, B y2.50
  // r1.8, C y3.60 r3.0; entity is the yard-center AIR SEAT (49.5,-0.039,0)
  // yaw 0, lib 9e3f6b05f1f41ab8 — bees fauna-32 kin, but the ring envelope
  // bbox h1.263 defeats the E2 film tier and the ground-seated entity pos
  // defeats E3). This pair is NOT a contact at all: the 2D SAT is blind to
  // y, and the two bboxes are VERTICALLY DISJOINT — swallows geometry min
  // world y = 2.38 + (-0.0391) = 2.341 (all three rings + wings live above
  // it), shorse top world y = 1.958 + (-0.0356) = 1.922, conservative
  // vertical gap +0.419m POSITIVE with bbox-level disjointness (true min
  // distance can only exceed it). The -2.436 square gap is the plan-view
  // projection artifact of ring A sweeping over the horses — fauna-34's own
  // placement decode documented exactly this vertical clearance ("cleared
  // vertically 0.40m" — bbox math here is the stricter 0.419). Ring center
  // A sits 0.425m inside the horse's nearest plan point; only ring A
  // reaches the horse footprint at all. Not walkable-corridor geometry:
  // non-colliding motion fauna above rider head-height class (bees at
  // 0.583+ over walked lavender is the standing kin). Evidence: SWEEP-PLAN
  // sweep-330 row. Any pos/lib drift on either id re-surfaces as census
  // drift at 16-hex precision and re-derives this class.
  "nx-dress-shorse-001|nx-dress-swallows-001",
  // sweep-332 (standing-precedent class, angler|reedpool tier): fauna-35
  // grey heron wades the reedpool E-bank open water — DESIGNED contact,
  // named in its own placement (frog-PY witness + pool tuple hard-gated,
  // t=0.522 ellipse membership INSIDE the water ellipse; fauna-35 @
  // 4849c5f1). Heron geometry (local x 3.02..3.34, z -0.83..0.01 vs pool
  // footprint +/-5.187/+/-4) sits fully inside the pool COMPOUND bbox
  // (h 2.655, reeds ring the water) — the fat-bbox class where the auto
  // film exemption is defeated and the water-rider is the design. Same
  // tier as nx-struct-angler|nx-struct-reedpool and the resident frog.
  "nx-dress-heron-001|nx-struct-reedpool",
  // sweep-351 (standing-precedent class, angler|reedpool + heron|reedpool
  // tier): fauna-50 kingfisher — single bird on a freestanding dead-branch
  // snag at the millrace bank, the snag DELIBERATELY LEANING OVER the
  // channel (mkv3-kfish1.ts v2: base-anchored at entity origin, 0.75 rad
  // lean toward +x, length 1.05, tip +0.713/+0.768 — "a kingfisher
  // perches OUT OVER the water"; v1 was re-authored precisely because the
  // bird sat 0.4m landward). DESIGNED adjacency, declared in its own
  // placement ("the race gets the designed-adjacency exemption in the
  // seat sweep — source-decoded member gates: base >=0.15 clear of the
  // step edge, snag vertical clearance over the step top >=0.15, bird
  // over the film band") = fauna-50 ledger entry. Re-verified fresh at
  // sweep-351 against the LIVE bytes: local asset sha16 cdf3bf7a4020b34e
  // == live lib prefix exact (content-addressed identity);
  // fauna50-decode-kfish.ts re-run GREEN (envelope x -0.151..0.898,
  // solid OBB center (0.3734,-0.0078) half (0.5248,0.1156), anchors 4/4,
  // perch tip y 0.768); fauna50-walk-kfish.ts re-walked 3/3 ALL_PASS
  // (0.00/0.37/0.31) over the live seat. The SAT -1.634 is the
  // over-water design itself (2D SAT is blind to the fact that the snag
  // crosses ABOVE the race's open channel — the member-gate decode is
  // the vertical evidence). Evidence: SWEEP-PLAN sweep-351 row. Any
  // pos/lib drift on either id re-surfaces as census drift at 16-hex
  // precision and re-derives this class.
  "nx-dress-kfish-001|nx-struct-millrace",
  // sweep-368 (standing-precedent class, kfish|millrace sweep-351 +
  // angler|reedpool sweep-42 + heron|reedpool sweep-332 tier): fauna-61
  // white stork PAIR at the millrace channel-margin SSW mid-race —
  // DESIGNED adjacency, declared in its own placement contract
  // (fauna61-place-stork.ts header + FAUNA-PLAN stork CLOSED block +
  // fauna-61 ledger @ 8da7b0bd): seat = fauna61-seat-sweep best of 966
  // qualifying at race-local (1.85, 2.3), race margin gap 0.634m = the
  // channel-margin designed adjacency, MEMBER-GATED from mkv3-millrace.ts
  // source (steps/head/launder/basin), worst other solid 4.178m; PY =
  // live heightAt (9pt spread 4.4mm). The storks stand IN the grass
  // margin beside the channel — the water-rider/margin-dweller design,
  // same tier as the heron at the reedpool bank. Re-verified fresh at
  // sweep-368 against the LIVE seat: fauna61-walk-stork.ts re-walked
  // 5/5 ALL_PASS (0.00/0.25/0.31/0.35/0.31). The SAT -0.970 is the
  // designed channel-margin overlap itself (2D SAT is blind to the
  // member-gated source decode that proves the birds clear the race
  // solids). Evidence: SWEEP-PLAN sweep-368 row. Any pos/lib drift on
  // either id re-surfaces as census drift at 16-hex precision and
  // re-derives this class.
  "nx-dress-stork-001|nx-struct-millrace",
  // sweep-370 (standing-precedent class, angler|reedpool sweep-42 +
  // heron|reedpool sweep-332 tier): fauna-63 mute swan PEN+COB pair in
  // the reedpool S-lobe open water — DESIGNED concentric water-rider
  // contact, declared in the sibling placement contract
  // (fauna63-place-swan.ts header: FRAME-COPY WATER-RIDER seat, ducks
  // fauna-3 / frog fauna-29 class, entity origin == reedpool host
  // origin + host-local seat (-1.6,-1.5), PY = water top 0.08093 −
  // baked WL 0.026 = 0.05493 duck/fauna-31 waterline law; host-gated
  // at 7d770620 artwalk-39 law). Re-verified fresh at sweep-370 against
  // the LIVE seat + LOCAL bytes: local sha16 9206edbedd472f61 == live
  // lib prefix EXACT (content-addressed identity); fauna63-decode-swan
  // re-run GREEN (6 anchors, keel breaks waterline, hull above water,
  // cocked tail, RED stork control); MEMBER-GATE decode: the only
  // geometry reaching the bridge-deck x-band (x > -0.95) is the
  // ripple-wake waterline at y 0.028..0.045 vs deck band y 0.175..0.265
  // = 0.130m vertical clearance, NO overlap; worst OTHER solid gap
  // 0.591m (S sill), reed clusters ≥0.810m, masts ≥2.325m. The SAT
  // -1.687 is the concentric water-rider design itself (bird floats IN
  // the pool film — 2D SAT is blind to the member-gated vertical
  // evidence). Evidence: SWEEP-PLAN sweep-370 row. Any pos/lib drift on
  // either id re-surfaces as census drift at 16-hex precision and
  // re-derives this class.
  "nx-dress-swan-001|nx-struct-reedpool",
  // sweep-393: fauna-79 pipistrelle bats AIR-RIDER concentric contact —
  // pure-motion swarm (bees/swallows class, zero ground geometry) over
  // the reedpool open water. SAT -5.025 is the designed concentric air
  // seat (2D SAT height-blind); member-gate decode THIS sweep against
  // the LIVE host lib (local village_reedpool3.glb sha16 7d770620bb1b7bdc
  // == live lib prefix EXACT, content-addressed identity): bats rest bbox
  // world y 2.469..3.073 (entity y 0.06093 + local 2.408..3.012); swept
  // annulus = five concentric rings r 0.50..1.80 (ledger), in-annulus
  // pool top = reed cluster world y 1.227 (reedpool_2 @ rho 1.11) =>
  // VERTICAL CLEARANCE 1.242m at band bottom (1.16m vs ledger motion
  // band 2.39); the ONLY members reaching the band are the rim cross
  // arms (reedpool_5, world top 2.576) at rho 3.90..4.00 — >=2.1m
  // outside the outermost ring, ZERO tris within rho<=2.05. Same class
  // as swan|reedpool (sweep-370 concentric water-rider). Any pos/lib
  // drift on either id re-surfaces as census drift and re-derives this
  // class. Evidence: SWEEP-PLAN sweep-393 row.
  "nx-dress-bats-001|nx-struct-reedpool",
]);

const r = await fetch(URL_, { headers: { "User-Agent": "curl/8.7.1" } });
if (!r.ok) throw new Error(`GET -> HTTP ${r.status}`);
const data: any = await r.json();
// sweep-38 coverage law (pitfall-12 class): a lib-bearing THING without a
// bbox is an entity the server could not classify — silently dropping it
// from the SAT set is a vacuous pass. Fail loud instead: every such entity
// is a finding candidate (sweep-38: the four re-spawned gate lamps came
// back bbox:null on a truncated store lib and left the collision set).
const allThings = (data.entities ?? []).filter((e: any) => e.kind !== "light");
const noBbox = allThings.filter(
  (e: any) => !e.bbox && (e.lib !== undefined && e.lib !== null)
);
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
if (noBbox.length > 0) {
  // Coverage finding, not an overlap finding: these entities are OUTSIDE the
  // SAT set entirely. Report them and fail the sweep (exit 4) so no future
  // tick can call ALL CLEAR over an invisible-entity hole.
  console.log(`NO-BBOX COVERAGE HOLE: ${noBbox.length} lib-bearing thing(s) absent from the SAT set:`);
  for (const e of noBbox) console.log(`  NO_BBOX ${e.id} lib=${e.lib}`);
}
for (const row of rows) console.log(row);
const coverageHole = noBbox.length > 0;
console.log(
  unclassified === 0 && !coverageHole
    ? "SWEEP ALL CLEAR"
    : coverageHole
      ? "SWEEP COVERAGE HOLE (exit 4)"
      : "SWEEP HAS FINDINGS"
);
process.exit(unclassified === 0 && !coverageHole ? 0 : coverageHole ? 4 : 3);
