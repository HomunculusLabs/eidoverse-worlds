# APPROACH-PLAN — durable plan for the approach-N lane

Opened approach-1 (2026-09-03). Mandate: NEW-VILLAGE-PLAN §4 — "one approach
lane per district, from the nearest spoke, lamp-lit, each work readable from
its lane at ~18m." The core paths (`nx-core-paths`, nvp-21) end at the plaza
lamp ring; the four legs from the gate ring to each district edge were never
built. This lane raises them, one leg (or segment) per wakeup.

## District geometry (from the live census, 218 entities at approach-1)

| Leg | District     | Works family       | Inner edge | Rotation order |
|-----|--------------|--------------------|-----------|----------------|
| NW  | Cultivation  | `nx-cultivation-*` | r≈72      | 1st            |
| NE  | Craft        | `nx-craft-*`       | r≈74      | 2nd            |
| SE  | Wild         | `nx-wild-*`        | r≈76      | 3rd            |
| SW  | Contemplative| `nx-temple-*`      | r≈71      | 4th            |

Gate ring: `nx-town-gate-{n,e,s,w}` at r=19.5 on the cardinal axes; the four
gate lamps (`nx-approach-lamp-{n,e,s,w}`, lib `store/18b69a6bb2f5862f.glb`)
sit at r=10 — reference idiom, never touched. Rotation matches the dress-lane
rotation (NW first) so a district's dressing and approach land in the window.

## Lamp budget law

Per-district light counts at lane open (r>25 entities with light semantics):
NW 2, NE 4, SE 12, SW 3. Approach legs add lamp posts sparingly — one lamp
entity per leg segment harmonic (target ≤2 per leg), plus separate budgeted
light entities (color 0xffb066, intensity 1.35, range 4.5 — the nvp-10 idiom).
Running lamp count per district is recorded per leg below.

## Leg 1 — NW Cultivation winding lane (approach-1)

- **Concept contract**: one composed walk from the gate ring to the district
  edge — a 1.8m paved ribbon with hemmed verge, sharing the core-path paver
  rhythm (0.92m spacing, 4-soil material family, ±0.14 yaw jitter) and the
  gate-lamp idiom (twin-lantern iron posts). Paver spacing and lamp placement
  share one harmonic: lamps at ~1/3 and ~2/3 of the walk. A lane that reads as
  scattered objects failed.
- **Siting study** (why the lane bends): the pure az-315 bisector is blocked —
  carousel (r25.5 az315), garden cottage (r32 az306, spans az 296–316), the
  struct lane's amphitheater (r44 az328, spans az 313–343) and gallery mosaic
  0052 (r45 az300) leave NO straight ray from r24 to r71 with ≥1.5m OBB
  clearance. The clear corridor (full-annulus sweep, 1.5m threshold, thin
  layers exempt) is the sector **r 40–50, az 300–311**; the leg threads it:
  - run: radial az 306° from r37 (clear of the cottage yard) to r58
  - bend: onto az 315°
  - home: radial az 315° from r58 to r71 (lavender-field corner)
  - outer-edge line chosen from the lavender-0027/orchard-0033 OBB gap scan:
    the az-315 offset line x−z=−40 maximizes worst-case clearance (2.36m);
    the leg ends at r71, inside the district ring (inner edge r≈72).
- **Build**: `agents/arthur/assets/mkv3-nw-approach1.ts` — 40 pavers + 12
  verge stones + 2 lamps in ONE thin-film entity (7 buckets + 2 keep-group
  lamp trees). Deterministic rebuild ×2: `d46a60fb3ad301e39b0935c50dd56b867e`
  both passes. Decode audit: paver film y −0.05..0.17 (ground-layer class,
  h<0.5); lamps top out at 2.56; flame anchors KEEP-named.
- **Review**: `agents/arthur/reviews/nw-approach1/` — aerial, gameplay, night,
  top all judged. Verdict: continuous composed lane, bend joins cleanly with
  no gap, two upright lamps with warm globes reading at night. Contract met.
- **Placement tuple**: entity `nx-approach-nw-lane-001` at pos (0,0,0),
  yaw 0, scale 1 (polyline is baked in world coordinates).
- **Lights**: `nx-approach-nw-lamp-001-l` at (−38.6, 1.96, 30.9),
  `nx-approach-nw-lamp-002-l` at (−48.0, 1.96, 47.9) — exact flame-anchor
  world positions from the decode. Color 0xffb066, intensity 1.35, range 4.5.
  NW district light count after leg: 2 + 2 = 4.
- **Walk-test log (approach-1)**: two-way MCPL out-and-back, 5 legs
  (start r37 → bend r58 → end r71 → bend → start), ALL PASS, max arrival
  0.38m — the placed thin film is genuinely walkable end to end in both
  directions.
- **18m readability sweep (approach-1)**: READABILITY_PASS — eye points on
  the lane at 18m before `nx-cultivation-lavender-0027` and
  `nx-cultivation-orchard-0033`; both walked (arrivals 0.35/0.28), both
  sightlines clean, no solid blocker.
- **Verdict**: leg 1 of 4 stands. Next leg (rotation 2): NE Craft.

## Leg map (all four)

- NW: **winding lane** (this leg) — az306 r37→58, bend, az315 r58→71.
- NE: TBD (rotation 2) — bisector az45; known blockers: pendulum (25,25.9),
  spiral folly (46.1,33.5), dress-charcoal (34.5,34), gallery mosaic 0036
  (r45 az300 in-NE-half? no — az300 is NW; NE mosaic is at az 60).
- SE: TBD (rotation 3) — bisector az135; wild district inner edge r76.
- SW: TBD (rotation 4) — bisector az225; temple district inner edge r71.
Each future leg re-runs the full-corridor OBB sweep against a FRESH census
before committing its polyline — this plan's NW study took five blocked
straight-line attempts before the sector sweep found the winding lane.
