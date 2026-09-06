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
- **Verdict**: leg 1 of 4 stands.

## Leg 2 — NE Craft gallery lane (approach-2)

- **Siting study** (fresh 221-entity census): the pure az-45 bisector is
  blocked (pendulum az~44 r36, spiral folly az37 r56, charcoal az45.6 r48.5,
  kiln az38.5 r49.8, statuary-0039 az42 r74). The inner annulus r26–44 has
  exactly ONE clear window: **az 52.4–56** (0.25°-step sweep). Leg shape:
  - run: radial az 54 from r24 to r48 (threads the waist)
  - jink: pivot at (54, az48) to clear the charcoal/kiln pair
  - home: long straight to (72, az15) — lands between the statuary-0052
    (7.5m) and hamlet-0054 (7.7m) arrival faces
  - full-corridor clearance: worst 2.49m (tower); all other neighbors ≥2.68m.
- **Build**: `agents/arthur/assets/mkv3-ne-approach2.ts` — 78 pavers + verge
  hem + 2 lamps, 71.8m walk, lamps at the 1/3 and 2/3 harmonic of the FULL
  walk (one on the run, one on the home straight). Deterministic ×2:
  `a27bc9a252272b12`. Decode: film below 0.5, lamp trees to 2.56, flame
  anchors KEEP-named at (39.71, 1.96, 27.0) and (32.89, 1.96, 50.15).
- **Review**: `agents/arthur/reviews/ne-approach2/` — gameplay, night, front,
  left judged: continuous lane, both bends joined, warm globes at night.
  (Aerial/top framed the long axis too tightly to judge — gameplay view used
  as the primary composed-lane evidence instead.)
- **Placement**: `nx-approach-ne-lane-002` at (0,0,0) yaw 0, lights
  `nx-approach-ne-lamp-001-l`/`-002-l` in the nvp-10 idiom; NE district
  lights 4 → 6. Idempotent rerun: zero verbs.
- **Walk-test (approach-2)**: two-way MCPL out-and-back, 7 legs, ALL PASS,
  max arrival 0.38m.
- **18m readability (approach-2)**: READABILITY_PASS for statuary-0052 and
  hamlet-0054 (arrivals 0.33/0.25, clean sightlines).
- **Verdict**: leg 2 of 4 stands.

## Leg 3 — SE: INFEASIBLE from the gate ring (proof); rotation swap to SW (approach-3)

- **SE infeasibility proof** (fresh 224-entity census, 0.2°-step sweep):
  NO azimuth in 90–180° gives a clear r24–40 channel at the 1.5m law. The
  inner SE ring is wall-to-wall: court (az128 r24), forge/bakery/smithy signs
  (az109–143 r23–26), inn (az90 r36), hall (az161 r27.5), the artwalk shelter
  line h2–h7 (az123–144 r31–55), and the struct termini (beacon, soundmirror,
  observatory, northneedle, orrery, skymirror). The nearest per-band windows
  never chain: r24–40 has none; r40–56 has only az169.6–176; r56–74 windows
  (130.4–131.2 on the bisector, 147–149, 164–165) do not connect inward.
  **Options for Bill** (siting call): (a) a lane segment r40→76 only, fed by
  the S road (starts off-ring — breaks the gate-ring connection law);
  (b) a road-side spur from gate-s along the S road verge (needs ring-law
  exception); (c) leave SE approaches to the forest paths as-is.
- **Rotation swap**: leg 3 executed as SW Contemplative instead.
- **SW siting**: straight radial **az217.25** from r24 (between bunkhouse
  az199/r27 and dyehouse az227/r32) to r71 (temple seed ring). Worst centerline
  clearance 2.50m (struct-angler); 0.7m paver envelope CLEAR; one verge stone
  seat (paver 22) within 1.3m of the angler — omitted per the per-stone
  neighbor check, other 16 stand.
- **Build**: `agents/arthur/assets/mkv3-sw-approach3.ts` — 52 pavers + 2 lamps,
  47.0m walk, lamps at the 1/3 and 2/3 harmonic. Deterministic ×2:
  `56b35877ecda923d`. Review: gameplay + night judged — continuous lane,
  warm globes at night.
- **Placement**: `nx-approach-sw-lane-003` at (0,0,0); lights
  `nx-approach-sw-lamp-001-l` (−25.20, 1.96, −30.67) and
  `nx-approach-sw-lamp-002-l` (−34.69, 1.96, −43.14); SW district lights
  3 → 5. Idempotent rerun: zero verbs.
- **Walk-test (approach-3)**: two-way MCPL, 5 legs, ALL PASS, max 0.37m.
- **18m readability (approach-3)**: PASS — seed-0021 and terrace-0049,
  arrivals 0.30/0.25, clean sightlines.
- **Verdict**: leg 3 (SW) stands; SE deferred on proof. One leg remains
  (SE, pending Bill's option call above).

### approach-4 (2026-09-06): shard row 16 — SW verge re-dress

Interrupted-window recovery (artwalk-32 class: build+reviews on disk, live
untouched, ledger ignorant) folded into the shard fix. Candidate 2 (the
interrupted tick's) REJECTED by native judgment — companion offsets read
lateral, stones detached (band 2.23m). Candidate 3 landed: cool gray-bone
stone family, band 1.22–1.45m, companions offset ALONG the walk, generalized
1.3m angler keep-out (3.32m clear). Sha `43817a4fcdd06a15` ×2 deterministic,
7 nodes, pavers/lamps byte-stable. Judged PASS via ZAI fallback (native 1210
×2, disclosed). Remove+spawn reseat at the exact standing tuple, comp `{}`,
PLACED_VERIFIED + idempotent zero-verb rerun. Two-way MCPL walk ALL_PASS
(5 legs, max 0.37m). Bill eye-check: from the SW gate, at 8–18m the path
verge should read as deliberate gray-bone stone dressing flanking the walk,
not scattered cubes.

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

### night-1 defect note (from night-N observer lane, 2026-09-05 — treat like a Bill correction, re-opens ahead of rotation)

- **night-1/D1 (severity 2)** — NW leg night wayfinding FAIL, hash-bound render
  + census evidence: only 2 lamps serve the whole 47m leg (r49.4, r66.9);
  unlit dead stretches gate(r18)→lamp-001 ≈31m and lamp-001→lamp-002 17.5m
  (plaza lights reach 10m). Judged from approach vantage: path readable only
  to the near lamp, then dissolves into the fields; the two-beat lamp rhythm
  reads as a terminus, not a cadence. Renders:
  `agents/arthur/reviews/night-nw/` (approach-outbound, arrival-interior,
  center-homebound). NOTE: the homebound "no core glow on horizon" part is
  rig-confounded (core lights not in the night rig) — probable but unproven.
- **night-1/N1 (informational)** — lamp-head emissive consistency: judge
  flagged one orb reading half-lit and a shade disc bright on its upper face;
  "could be intentional shade occlusion". Worth an eye-check at your next
  lamp model build; no action forced.
- Budget state: NW district live-light budget (census 2026-09-05) = 2, and
  both are these leg lamps. Any fix that adds lamps exceeds the counted
  budget → needs Bill or a budget-policy call. Unlit fixes (verge-stone
  reflectors, path material) stay inside budget.

### night-2 defect note (from night-N observer lane, 2026-09-05 — treat like a Bill correction; re-opens ahead of rotation)

- **D2 (severity 2, census-verified)**: NE leg dead stretches worse than NW.
  Gate-edge (r~20, where the E road's plaza lamp coverage ends) → lamp-001 =
  33.5m unlit; lamp-001 → lamp-002 = 24.1m; lamp-002 → first lit hamlet
  interior = 28.1m. Judged from 6 hash-bound night renders
  (`reviews/night-ne/`): foreground dead stretch at the gate; lamp string
  reads flat/unconverging from the district side; eye jumps to brightest
  cluster instead of walking the lane. Budget state unchanged from night-1's
  note: NE live-light budget = 2, both spent by these same lamps — closing
  needs Bill or a budget-policy call; unlit fixes (verge stones, path
  material) stay inside budget.
- **N2 (severity 3, informational→design)**: lamps cast weak/no ground pools
  at range-10 — in three judged views the lights read as points pasted on
  darkness rather than fixtures in space (no spill on posts/ground beneath).
  The light contract is the live client's (0xffd9a0/16/10) — if this is a
  defect it is an ambient/sky-budget question for the final night decision
  packet, not a per-lamp fix. Noted; no re-open.

### night-3 defect note (from night-N observer lane, 2026-09-06 — treat like a Bill correction; re-opens ahead of rotation)

- **D3 (severity 3, judged from 6 hash-bound night renders, `reviews/night-se/`)**:
  SE wild corridor (az 315 visitor corridor) has NO corridor lamps at all —
  judged reads show the path readable only via stepping-stone silhouettes,
  fading to black within ~one-third of frame from the district edge; between
  the last readable path stone and the wild margin, the link is implied but
  unlit. The district's 8 budget lights are all spent on interior anchors
  (artwalk h-lights ×5, struct beacon/needle/observatory ×3) — SE budget = 8,
  used 8. Any corridor lamp is therefore OVER budget: closing needs Bill or a
  budget-policy call. Unlit corridor fixes (stone rhythm, verge contrast) stay
  inside budget.
- **N4 (severity 4, informational)**: recurring class — SE pavilion lamps
  read as detached points, not fixtures (no ground pool/spill at range-10);
  one globe reads as a bare emissive ball with no visible mount. Same live
  client contract as N1/N2 — final decision packet question. No re-open.


### night-4 defect note (observer lane, 2026-09-06 — treat as Bill-correction class; re-opens ahead of rotation)

- **D4 (severity 2): SW corridor + grounds unlit.** Leg dead stretches as the
  NW/NE class (gate-edge ~r20 → lamp-001 r39.7 ≈ 20m; lamp-001→002 15.8m;
  lamp-002 r55.4 → gravel gate r74.7 ≈ 19m), then the entire temple grounds
  (terraces/seeds/labyrinths, r71–98) carry zero lights — judged from 6
  hash-bound night renders (`reviews/night-sw/`): arrival reads as an unlit
  scene, not a night scene. Budget-bound: SW table budget 3, live in-quadrant
  count 2 (the table's third "inn" anchor sits core-side, outside the r≥35
  rule). Any grounds lighting needs Bill or budget policy.
- **N5 (severity 3, informational→design): detached-orb lamp class, now
  census-corroborated.** SW + NW leg lamps are kind=light entities with NO
  fixture model entity in the world; judges in all four districts read them
  as floating orbs/points pasted on darkness. Whether the live client renders
  a post for kind=light is unverified (rig bead stands in for the head).
  mile-5's hanging-lantern idiom (nx-mile-nw-007/-008) is the in-world
  precedent for a lit fixture with visible geometry. Final packet question.


### night-5 defect note (observer lane, 2026-09-06 — treat as Bill-correction class; re-opens ahead of rotation)

- **D5 (severity 2): CORE gate→plaza middle third carries ZERO active lights
  on all four spokes.** Gate lamp pairs sit at r10, plaza sources at r~0–9,
  nothing between — the spoke path reads by paver albedo contrast alone, and
  judges flagged the identical dead stretch in road-e-long, gate-inbound-n,
  AND plaza-eye (arrival from the sides is unguided; the N-spoke mapboard, a
  literal wayfinding object, is an unlit black slab at night). Budget-bound:
  the core approach budget is spent on the four gate lamp pairs; closing D5
  needs Bill or budget policy.
- **N6 (severity 3, informational→design): plaza street level leans on ONE
  central source.** nx-plaza-l (0,1.2,0) is the only plaza light; hearth fire
  emissive + benches/stones within its r10, but plaza-edge paving reads gray
  and the plaza reads "destination without lit street level". Mapboard unlit
  (see D5). Final packet question (also touches plaza/dress surface).
- **N7 (severity 3, informational→design): aerial hierarchy inversion.**
  Edge/leg lamps match plaza-core peak brightness (halo parity at pixel
  level); the house ring (r18–28) carries no light tier of its own; the E
  road's lamp fan scatters into orphaned dots at range; SW quadrant darkest
  in the core. Final packet question.
