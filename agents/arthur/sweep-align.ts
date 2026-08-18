// sweep-align.ts — THE STANDING live-yaw rotated-SAT intersection sweep for the
// align lane (and audit depth-1). Promoted from per-wakeup one-shots after the
// align-8 table-regression bug: the classification table now lives HERE, in a
// tracked file, never in an agent's compactable context.
//
// Usage: bun agents/arthur/sweep-align.ts
// Exit 0 + "SWEEP ALL CLEAR" = no unclassified hits. Any UNCLASSIFIED line is a
// find — decode at source (mk script / placement-plan.ts) before registering;
// probes lie, the village doesn't.
//
// Conventions (hard-won):
//  - fetch PLAIN /geom (no &boxes=0 — that strips bboxes → 0-entity artifact)
//  - world = pos + lx*(c,-s) + lz*(s,c)   [corrected axis convention, align-1]
//  - pair keys are SORTED "idA|idB" (align-8 bug: hand-sorted keys never fire)
//  - mason field works (av-mason-NNNN) are excluded — audit-era class
//  - 2D SAT is y-BLIND: a surviving hit needs a y-band check + source decode
//    before it's a defect (monument×welcome / woodyard×charcoal artifacts)

type Ent = { id: string; lib?: string; pos: number[]; yaw: number; bbox?: { min: number[]; max: number[] } };
export {}; // module marker for top-level await

// ---- designed pairs (SORTED keys) ----
const DESIGNED = new Set([
  "av-kiln|av-quarry",                          // kiln beside quarry — plan comment
  "av-longhouse|av-rainbarrel-l",               // barrel at wall
  "av-bunkhouse|av-rainbarrel-b",               // barrel at wall
  "av-coop|av-fence",                           // R-107 expected
  "av-bakery|av-sign-bakery", "av-court|av-sign-bakery", // sign proud of face — family language
  "av-inn|av-stable",                           // eaves seam
  "av-inn|av-sign-livery", "av-stable|av-sign-livery",   // align-2: board over the seam, head height
  "arthur-house|av-rainbarrel-h",               // align-1: under-eave flush kiss
  "av-row-cottage|av-sign-weaver",              // sign family at wall (y-band separated)
  "av-millbench|av-millyard",                   // R-114: bench inside the mill yard — farbench idiom (SORTED: 'b'<'y')
  "av-monument|av-welcome",                     // R-114: welcome SW arm points AT the monument; knot swing + paver tail inflate bboxes
  "av-tower-house|av-shutters",                 // rides the tower frame — plan comment
  "av-fieldpond|av-flax", "av-fieldpond|av-pondlife", "av-flax|av-pondlife", // R-114 family: pond between grain+flax fields
  "av-grainfield|av-harvestcart",               // R-114 family: cart between field and road
]);
// ---- deliberate abutments ----
const ABUT = new Set([
  "av-bellbase|av-belltower",
  "av-garden-cottage|av-garden-fence",
  "av-court|av-watchpost", "av-court|av-forge", "av-bcistern|av-court",
  "av-millyard|av-windmill",
]);
// ---- known compound-bbox artifacts (depth < 0.15m) ----
const ARTIFACTS = new Set([
  "av-court|av-watchpost",                      // align-3: empty corner vs scaffold
  "av-charcoal|av-woodyard",                    // R-114: heap under roof overhang, y-separated (d<0.15 gate)
]);
// ---- family classifiers (regex on ids) ----
const RIDER = [/^av-shutters$/, /^av-pondlife$/, /^av-inndoor$/, /^av-hen-[ab]$/, /^av-goats$/, /^av-ducks?/, /^av-mallard/, /^av-rabbit/, /^av-cat/, /^av-dog/, /^av-horse-/, /^av-chicken/];
const INN_DRESS = [/^av-rainbarrel-i$/, /^av-giftshelf$/, /^av-churn$/, /^av-stablebench$/, /^av-milkstand$/, /^av-cartstop$/, /^av-cart$/, /^av-crates/, /^av-hay/, /^av-sign-smithy$/, /^av-sign-dyer$/];
const FIELD = [/^av-grainfield$/, /^av-flax$/, /^av-fieldpond$/, /^av-harvestcart$/, /^av-woodyard$/, /^av-charcoal$/, /^av-quarry$/, /^av-kiln$/, /^av-potter$/, /^av-waystone$/, /^av-hutch$/, /^av-run$/, /^av-chopblock$/, /^av-dyehouse$/, /^av-dyelaundry$/];
const SIGN = [/^av-sign-/];
const GROUND = [/^av-roads/, /^av-door-paths/, /^av-treeline/, /^av-streetlamps/, /^av-paths/];

function classify(a: string, b: string, d: number): string | null {
  const key = [a, b].sort().join("|");
  if (DESIGNED.has(key)) return "designed";
  if (ABUT.has(key)) return "abutment";
  if (ARTIFACTS.has(key) && d < 0.15) return "known-artifact";
  for (const [res, cls] of [[RIDER, "rider"], [INN_DRESS, "inn-dressing"], [FIELD, "field-cluster"], [SIGN, "sign-family"], [GROUND, "ground-layer"]] as [RegExp[], string][]) {
    if (res.some((re) => re.test(a)) || res.some((re) => re.test(b))) return cls;
  }
  return null;
}

// ---- fetch + transform ----
const r = await fetch("https://eidoverse.billding.dev/geom?world=commons", { headers: { "User-Agent": "curl/8.7.1" } });
if (!r.ok) { console.error(`FETCH FAIL ${r.status}`); process.exit(1); }
const snap = (await r.json()) as { entities?: Ent[] };
const ents = (snap.entities ?? []).filter((e) => e.lib && e.bbox && !/^av-mason-\d{4}$/.test(e.id));
console.log(`village footprint entities (lib+bbox, masons excluded): ${ents.length}`);

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

const boxes = ents.map(obb);
let pairs = 0, uncls = 0;
for (let i = 0; i < boxes.length; i++) {
  for (let j = i + 1; j < boxes.length; j++) {
    const d = satDepth(boxes[i], boxes[j]);
    if (d < 0) continue;
    pairs++;
    const cls = classify(boxes[i].id, boxes[j].id, d);
    if (!cls) {
      uncls++;
      console.log(`UNCLASSIFIED HIT: ${boxes[i].id} × ${boxes[j].id} depth ${d.toFixed(3)}m  [${boxes[i].id} pos(${boxes[i].pos.map((v) => v.toFixed(2))}) y-band ${boxes[i].y0.toFixed(2)}..${boxes[i].y1.toFixed(2)}] [${boxes[j].id} pos(${boxes[j].pos.map((v) => v.toFixed(2))}) y-band ${boxes[j].y0.toFixed(2)}..${boxes[j].y1.toFixed(2)}]`);
    }
  }
}
console.log(`candidate pairs: ${pairs}, unclassified: ${uncls}`);
if (uncls > 0) {
  console.log("SWEEP HAS FINDS — decode at source before registering");
  process.exit(2);
}
console.log("SWEEP ALL CLEAR");
