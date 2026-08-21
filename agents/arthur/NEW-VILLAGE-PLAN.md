# NEW-VILLAGE PLAN — commons-next (Arthur, started 2026-08-20)

Status: WORLD FORKED (2026-08-21 10:43, seed 8128, by Arthur) — DRAFT v1 plan
awaits Bill's eye-check pass before anything is built.
World: `commons-next` — LIVE and empty: https://eidoverse.billding.dev/geom?world=commons-next
Old world stays live and untouched: ?world=commons

## 0. Design thesis

Commons was assembled by hundreds of iterative loops; it carries era-2 geometry
debt, a saturated mason ring (90% packing — R-118), and 3 standing collisions.
Commons-next is a PLANNED village: the same craft, drawn once on purpose.
The old world remains the keeper's home until the new one earns the swap —
maybe forever. Zero risk, full optionality.

What carries over (proven assets): the 12 mason themes, the 7 material
families, housekit idiom, slow-and-calm motion law, placer-FILE comps
protocol, the keeper (resident.ts behaviors + refine-257/258 defenses).

What gets fixed by design: R-118 band math (sized to fleet, not to an era-2
layout), plot layout from one plan instead of hundreds of loop nudges,
era-2 geometry zeroed (every building at current housekit quality), Mai's
district drawn from day one, night lighting budgeted per district.

## 1. Terrain (seeded at fork)

- size 224 (±112m), amplitude 0.16 (gentler than 0.2), flatRadius 24, segments 240.
- Seed: NEW random (Mai picks; not 4666/7). Terrain relief is décor only — all
  buildings sit at heightAt.
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

## 3. Village core — drawn, not inherited

Core moves as HOUSEKIT SOURCES, not as placed GLBs. Each commons building is
rebuilt from its mkv3 script at current quality and re-seated on a drawn plan:

- Plaza: hearth, welcome board (night-lamp from day one), mapboard, carousel
  (staged roof-lift + widened paint finally live), keeper's shelf. Radii
  compact — everything readable at 18m spectator distance (polish-3 lesson).
- Ring road: full circle at r≈30, 3.5m cart width, spokes at 60° with lamp
  posts budgeted per spoke (welcome-board lesson: no dark rims).
- Buildings (~15): inn, bakery, dyer/weaver, forge + court, tower house,
  stables + paddock, coop + run, granary, kiln, cistern, watchpost at the
  W gate, row cottage, garden cottage + fence, fieldpond. Each on a named
  plot with setback, door lane facing a spoke or the ring, and a comp plan
  (smoke/embers/lights) written BEFORE the first place.
- Interiors: rooms ≥16 m², doors 1.4m clear (R-113 law), furniture placed
  with the build, not after.

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

1. Terrain verified (fork done) — /geom census empty, no 404.
2. Core skeleton: plaza + ring road + 3 buildings, walk-tested two-way.
3. Remaining core, one district at a time, Bill eye-check per district.
4. Ring lift-in: 60 works re-seated by district (capture/reapply comps by
   placer FILES; re-seat same lib first, elevate geometry per-work after —
   masonr loop hand-off).
5. Mai's district (her lane).
6. Keeper phase 1, night pass, full end-to-end audit (audit-254 protocol).

Standing gate stays: verify-repairs.ts must exit 0 before any commit; new
world gets its own HEAD-gate consideration when its first lane opens.

## 9. Open decisions for Bill

- Terrain seed/relief: gentler (0.16) or keep commons' character (0.2)?
- Core building list: the 15 above — cut/add any?
- Keeper: phase-1 second instance timing — with core build or after ring?
- Public link: swap when? (default: never auto-swap; your explicit call)
- Mai's district theme: hers to pick, or you assign?
