# NEW-VILLAGE PLAN — commons-next (Arthur, started 2026-08-20)

Status: WORLD FORKED (2026-08-21 10:43, seed 8128, by Arthur) — v2 INSPECT-BEFORE-PLACE plan
World: `commons-next` — plaza trio PLACED_VERIFIED; four-way lamps ARTHUR_REVIEWED_READY:
https://eidoverse.billding.dev/geom?world=commons-next
Old world stays live and untouched: ?world=commons

## 0. Design thesis

Commons was assembled by hundreds of iterative loops; it carries era-2 geometry
debt, a saturated mason ring (90% packing — R-118), and 3 standing collisions.
Commons-next is a PLANNED village: the same craft, drawn once on purpose.
The old world remains the keeper's home until the new one earns the swap —
maybe forever. Zero risk, full optionality.

The nv-1/nv-2 stake proved transport and component restoration, but it did
not prove that the target world reads as a coherent village. Three sparse
models on a 224m disc read as nearly empty. From v2 onward, no new model is
placed merely because it exists or passed a hash check. Every candidate must
be inspected as a finished object, accepted by Arthur at an exact content hash, and
then seated on this coordinate plan.

What carries over (proven assets): the 12 mason themes, the 7 material
families, housekit idiom, slow-and-calm motion law, placer-FILE comps
protocol, the keeper (resident.ts behaviors + refine-257/258 defenses).

What gets fixed by design: R-118 band math (sized to fleet, not to an era-2
layout), plot layout from one plan instead of hundreds of loop nudges,
era-2 geometry zeroed (every building at current housekit quality), Mai's
district drawn from day one, night lighting budgeted per district.

## 1. Terrain (seeded at fork)

- size 224 (±112m), amplitude 0.16 (gentler than 0.2), flatRadius 24, segments 240.
- Seed: 8128. Terrain relief is décor only — all buildings sit at heightAt.
- Rim: 112m half-size gives ~2.5× the usable band area of commons (160).

## 2. Ring math (R-118 killed by design)

Fleet: 60 works, ~9,800 m² total footprint (unchanged), max work width ~21m
(after the mega rescale; wider outliers trimmed at lift-in).

- Village edge r≈58 → first work INNER edge ≥ 66m from center (≥4m clear of
  any plot). Era-2 started the band at 44.5 — the saturation root cause.
- Works' farthest corner ≤ 108m (4m inside the ±112 rim).
- Band [66, 108]: mid-ring circumference ≈ 173m × 42m width ≈ 7,300 m²; full
  band ≈ 15,600 m² usable vs 9,800 m² fleet → ~63% packing. Comfortable,
  no solver needed.
- Work-work clearance: center distance ≥ max(width_i, width_j) × 0.75.
- Live-world law (unchanged): every site checked against heightAt + actual
  bbox before place; two-way walk-test any lane a work abuts.

## 3. Village core — minimal, inspected, then placed

The earlier phrase “forge + court, bakery, tower-house” accidentally counted
the bakery twice. `village_court3.glb` is already the bakery + workshop court;
`village_forge3.glb` is its small exterior forge annex. The honest minimal
core is therefore TWO principal building masses, not three:

1. Bakery + workshop court (`village_court3.glb`) with forge annex,
   bakery cistern, and the two trade signs as separately reviewed satellites.
2. Tower-house (`village_tower3.glb`) with shutters at the identical pose.

No inn or third building is implied. Add another principal mass only after
Arthur's live core walk identifies a missing function. Subtraction remains law.

### 3.1 Coordinate sheet (proposed; review-gated)

Angles use the existing convention: 0° = +X/east, CCW positive. Building
local +Z faces the hearth. All numbers below are design coordinates; the
placer still resolves live `heightAt` immediately before spawn.

| Ensemble | Polar slot | Proposed world pose | Yaw | Notes |
| --- | --- | --- | ---: | --- |
| hearth | center | `(0, y, 0)` | existing | `PLACED_VERIFIED` nvp-3 at exact reviewed tuple; no re-place was needed. |
| welcome | existing | `(-3, y, -4.3)` | `0.6092` | `PLACED_VERIFIED` nvp-5 at revised COMMONS-inscription hash. |
| carousel | `r≈25.456, 135°` | `(-18, 0.00014950061063032772, 18)` | `2.35619` | `PLACED_VERIFIED` nvp-7 at optimized 43-node hash; smoke origin contract-corrected to local `[0,6.3,0]` (nvp-8). |
| tower-house | `r=22, 50°` | `(14.1, y, 16.9)` | `-2.44347` | North-east vertical anchor, inside the flat-radius ground. Shutters share exact pose/yaw. |
| bakery/workshop court | `r=24, 322°` | `(18.9, y, -14.8)` | `-0.90756` | South-east working anchor; both open shed faces turn toward the hearth. |
| forge annex | court-local | `(22.13, y, -7.93)` | court yaw | Local anchor `(7.373, 0, 1.677)` from the align-9 flush placement. |
| bakery cistern | court-local | `(15.54, y, -15.88)` | court yaw | Local anchor `(-2.949, 0, 1.980)` derived from the era-3 court plan. |
| bakery sign | court-local | `(17.94, y, -18.29)` | review | Local anchor `(-3.364, 0, -1.394)`; orientation must be visually re-aimed after court placement. |
| smithy sign | court-local | `(20.06, y, -20.41)` | review | Local anchor `(-3.729, 0, -4.372)`; orientation must be visually re-aimed after court placement. |

This makes a deliberate three-anchor composition around the hearth: carousel
NW, tower NE, working court SE, with the SW arrival meadow left open. Pairwise
principal-anchor distances are 31.99–49.41m; each mass has breathing room and
the hearth remains visible. Four approach lamps begin at the cardinal r=10
points `(10,0)`, `(0,10)`, `(-10,0)`, `(0,-10)` only after the lamp asset is
rebuilt and reviewed; the inherited eight-lamp `village_streetlamps3.glb`
does not match this four-way plan and must not be placed as-is.

The reviewed nvp-9 lamp ensemble uses one reusable two-draw model at those four
exact seats, yawed inward, plus four separate warm point-light entities. The
first one-sided draft failed its outward approach view; the accepted hash uses
twin transverse lanterns so every approach gets a visible beacon face.

### 3.2 Inspect-before-place gate

Every model has two distinct states and two distinct ticks:

1. `REVIEWED_READY`: deterministic rebuild; GLB structure/bounds/materials/
   node budget/anchors decoded; source and component targets reconciled;
   four-angle daylight frames plus a gameplay-distance frame inspected;
   night frame and interval pair added when light or motion matters; highest-
   value defect fixed; exact SHA-256 and proposed pose recorded.
2. `PLACED_VERIFIED`: Arthur marked that exact hash and pose reviewed-ready in
   `NEXT-PLACEMENT-APPROVALS.md` (legacy filename); a later tick re-proved the hash, spawned via
   a placer file, restored the full component bag, verified live hash/pose/
   components, and took a fresh target-world visual frame.

Review and placement never happen in the same wakeup. A model that is merely
technically valid is not ready. A visual contradiction is a hard stop.

## 4. Districts (the ring, organized)

The 60 works group into 12 themes; themes group into 4 readable districts at
the ring's compass points, each with one landmark work and shared dressing:

- NW — CULTIVATION: orchard, garden, lavender (hedgerows, bee skeps)
- NE — CRAFT: hamlet, cloister, statuary (work yards, stone benches)
- SE — WILD: forest, wayside, cairnfield (path spurs, border stones)
- SW — CONTEMPLATIVE: labyrinth, terrace, seed, mosaic (gravel paths, lamps)

Approach lanes: one per district, from the nearest spoke, lamp-lit, each work
readable from its lane at ~18m.

## 5. Mai's district

- MAI gets the E rim beyond the ring (r ∈ [112, …] is rim; inside that her
  own ground: an E extension drawn on this plan's coordinate sheet when she
  picks her theme). Disjoint ids: prefix `mx-` for her entities.
- Her lane laws: same seven families, same node budget, same comp protocol,
  English reports, register-first for defects. Her plan file: hers to keep;
  Arthur's audits cover her district like any other.

## 6. Keeper migration

- Phase 0 (default): keeper stays in commons. Commons-next builds silent.
- Phase 1: a SECOND keeper instance, new name (not "keeper"), waypoints
  drawn from the new plan, refine-257/258 defenses on from the first commit.
- Phase 2 (Bill's call only): swap which world the public link means, or keep
  both worlds alive side by side. The old world is never deleted.

## 7. Night + sky

- Per-district lamp budget set at plan time (commons ran out at 8 slots —
  welcome board went dark; commons-next budgets lights per district up front).
- Emissive anchors named per KEEP law (lamp/flame/fire/glow) so lighting
  survives mergeByMaterial.
- Sky palette: keep commons' (works with the families); revisit after the
  first night vision pass.

## 8. Build order + verification

1. Entire plaza trio PLACED_VERIFIED through `nvp-8`; carousel compact reseat,
   193→43 node optimization, and entity-local smoke correction live.
2. Four-way approach-lamp asset reviewed-ready at exact two-draw twin-lantern
   hash (`nvp-9`); next tick places the four models + four lights atomically.
3. Review the court ensemble one model at a time: court, forge, cistern,
   bakery sign, smithy sign. Place the ensemble only after every member is
   individually Arthur-reviewed-ready; then two-way walk-test both open shed lanes.
4. Review tower and shutters separately; place at the shared pose only after
   both pass; two-way walk-test the 1.4m door lane and inspect the study at night.
5. Draw roads and paths around the accepted seats, never the reverse.
6. Run Arthur's live core walk and end-to-end visual audit. Open the 60-work
   district queue when that gate passes; Bill review is optional, never blocking.
7. Ring lift-in remains one reviewed work per placement tick, capture/reapply comps
   by placer FILES, with district sweep after each accepted cluster.
8. Mai's `mx-` district remains untouched. Keeper phase 1 and public-link swap
   remain Bill-only decisions. Finish with the end-to-end audit protocol.

Standing gate stays: verify-repairs.ts must exit 0 before any commit; new
world gets its own HEAD-gate consideration when its first lane opens.

## 9. Open decisions for Bill

- Arthur owns per-model review, acceptance, and placement; Bill does not review each item.
- After the autonomous two-building core walk: add a third mass only if a function is missing.
- Keeper phase-1 timing, public-link swap, and Mai's district remain Bill-only decisions.
