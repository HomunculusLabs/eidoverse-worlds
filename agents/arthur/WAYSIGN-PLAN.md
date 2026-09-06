# WAYSIGN-PLAN — waysign-N lane durable state

Lane: core trade signage for commons-next. One sign per wakeup. Loop file:
`WAYSIGN-LOOP.md`. Interlane: `INTERLANE-PROTOCOL.md`.

## Idiom bank (heritage)

- Hanging pictogram signs, old commons since era-2: bakery scored loaf,
  smithy hammer, weaver spool with flanges, livery drawn horseshoe.
- refine-276 put all four on the forge-family iron (bracket plates, arms,
  hanger chains byte-identical to the standing forge) — commons-next signs
  inherit that iron.
- Pictogram plates: flat bone/pale substrate + incised trade glyph, plate
  ~0.5–0.7m, hung to swing visually (rigid geometry, chain links implied
  by 3–4 iron tori).

## Queue (seed from core-town buildout roster; FIRST WAKEUP reconciles
against the LIVE census — hosts without a live entity drop out, hosts the
census adds for a trade fold in at queue end)

Rotation: working edge outward from the E road, then craft edge.

| # | Host (expected id) | Trade | Pictogram | Status |
|---|--------------------|-------|-----------|--------|
| 1 | `nx-town-inn` | inn | tankard + key | folded out — inn carries a BUILT-IN porch hanging sign (sign_board + brass wheel emblem + flanking lamps, mkv3-landmarks.ts:522-540); a second sign would duplicate the idiom. Defect note for Bill: the built-in emblem reads "wheel", not "tankard" — host redesign belongs to the owner lane, not waysign. |
| 2 | `nx-town-stable` | livery | drawn horseshoe | DONE waysign-1 |
| 3 | `nx-town-dyehouse` | dyer | dyed cloth bolt (flax-blue) | DONE waysign-2 |
| 4 | `nx-town-kiln` | kiln | flame over chamber | DONE waysign-3 |
| 5 | `nx-town-potter` | potter | wheel in profile | DONE waysign-4 |
| 6 | woodyard host (id from census) | woodyard | saw-buck | DONE waysign-5 (`nx-town-woodyard`) |
| 7 | `nx-town-windmill` (or nx-windmill) | mill | four-sail cross | DONE waysign-6 |
| 8 | `nx-town-forge` / `nx-forge` | smithy | hammer (heritage) | pending |

Every host's road-facing face is confirmed in the host build-source decode
before the anchor is chosen — the roster above is expectation, not truth;
the census + decode are truth.

## Host anchor log (filled per sign; re-derive after host re-places)

- waysign-5 `nx-town-woodyard` (lib 1f2c6f592095b204 — INTENTIONAL
  old-gen tex-85 freeze, interior-19 finding; local mkv3-woodyard27
  rebuild hashes 5ad78870 ≠ live, so anchors derive from the LIVE bbox
  law, never a local rebuild): open-front 3-sided shed, road-facing
  face = the OPEN FRONT (host-local +z, world dir (−0.457,−0.889)
  toward plaza). TRUE HANGING idiom (dyer precedent): bracket flush
  under the front eave at host-local [0, 2.05, 1.25] (live bbox roof
  front edge ≈ z1.29 y2.14 top / ~2.10 underside). Sibling artwalk b11
  rider on the BACK wall (host-local z −0.80) — no contact.

- waysign-1 `nx-town-stable` (lib 5beff62ed41ca6cf, local source hash-matches
  live): road-facing face = the back wall (host local z=+2.1) — the E road
  terminates at the stable, so visitors meet this wall head-on; open stalls
  face away. Anchor host-local [0, 0, 2.1], sign yaw = host yaw −0 (i.e.
  −π/2), plate flush on the wall face, glyph +z pointing down the road.
- waysign-2 `nx-town-dyehouse` (lib 888be3597d2f772f, local source
  hash-matches live): OPEN SHED — no front wall. Road-facing face = the
  open front (host local +z, drying-line side), normal world dir (0.808,
  0.589) toward the plaza approach. Anchor host-local [0, 2.05, 1.13] =
  under the high front eave's rafter tail (roof tilted −0.12 rad, edge
  z≈1.146 y≈2.08); TRUE hanging idiom, board in open air 0.15m proud.
  Sibling artwalk rider nx-artwalk-b9-…-crossing-loom sits on the BACK
  wall (host-local z −0.77) — no contact, verified in census.

- waysign-6 `nx-town-windmill` (lib 0993836012d1b17d, local source
  hash-matches live — anchor from source + live tuple): tower mill with
  a full mill-room base; door face host-local +z (world +x toward the
  plaza/W road at host yaw +π/2). Flat ceiling slab `rceil` overhangs
  the front wall (front edge z 2.6, underside y 2.8). Sibling artwalk
  b10 `four-wind-crown` owns the wall CENTER (live bbox local x ±1.125,
  y 2.22..2.87); door lane |x|<0.7; struct-lane millrace south. Sign
  sited host-local [−1.6, 2.78, 2.5] — north of the crown, bracket flush
  under the rceil front edge, board proud of the wall face z 2.4.

## Siting + build log (filled per sign)

- waysign-1 `nx-sign-stable-001` livery: mkv3-sign-stable.ts, deterministic
  ×2, sha afee37dd9a5b5d67…, 3 nodes, iron + sign_bone materials, no comps
  no lights. v1 REJECTED on vision review (arms decorative stubs, no visible
  chain drop, stacked-slab read); v2 arms reach to board corners ±0.22 with
  2-link chain drop each side — ACCEPT on zai-vision (native vision provider
  returned 400 on image content both attempts this tick — recorded, not a
  PASS claim from native). Placer waysign-place-stable-1.ts: rider-only SAT,
  host-pair exemption explicit, minGap 0.576 vs nx-town-inn (no other solid
  near), PLACED_VERIFIED 1 verb, idempotent rerun zero verbs, live tuple
  [40.9, 0, ~0] yaw −π/2. Bill eye-check: walk the E road from the inn —
  the livery horseshoe should read on the stable's gable-end wall before
  you reach the stalls.

- waysign-2 `nx-sign-dyer-001` dyer: mkv3-sign-dyer.ts, deterministic ×2,
  sha 38416baede850b77…, 7 nodes (iron + sign_bone buckets + flat glyph
  colors), no comps no lights. v1 REJECTED on zai-vision review (filled
  neck slab read — chain links too small, glyph line-bar heavier than the
  cloth, drip bead read as orphan stub); v2: three big alternating links
  per side (r 0.032, ~2cm air gaps), corner hook rings, two dipped strips
  (flax-blue + madder-red) on a thin bar — ACCEPT (isolated) + 18m stress
  PASS on the 8m gate. Native vision provider down again this tick
  (error 1210) — zai-vision fallback, recorded not claimed as native PASS.
  Placer waysign-place-dyer-1.ts: rider-only SAT, host exemption explicit,
  ground-layer exemption for the three approach-lane paver meshes
  (sw-lane-003 compound bbox 29×38m blocked first run — dress-1 fat-bbox
  precedent; lamps stay in the collision set), minGap +1.649 vs
  nx-town-row-cottage, PLACED_VERIFIED 1 verb, idempotent rerun zero
  verbs, live tuple [−22.087, 2.05, −22.334] yaw 0.941 (host-relative
  anchor [0, 2.05, 1.13] exact). Distance note: flax-blue darkens toward
  black past ~15m — heritage family color kept; flagged for Bill's
  eye-check.

- waysign-3 `nx-sign-kiln-001` kiln: mkv3-sign-kiln.ts, deterministic ×2,
  sha be3d85045b335101…, 7 nodes, no comps no lights. Host is a DRUM — front
  face occupied (sibling b12 film + burn ledger), so PROJECTED-ARM idiom:
  straps sized to decoded taper circle the upper drum, arms project over
  the board, board hangs beyond+above the film (3D clear; no occlusion).
  TWO decode catches pre-placement: v1 arms/board inside the drum (never
  uploaded); v3 glyph zai-REJECTED (posts/chimneys read) → v4 stepped
  tapers, opposing leans, flicked hot tips — ACCEPT + 8m PASS. Native
  vision provider down 3rd consecutive tick (error 1210) — zai-vision
  fallback, recorded not claimed as native PASS. Placer
  waysign-place-kiln-1.ts: rider-only SAT, host exemption explicit, b12
  GAP-BOUNDED exemption (2D measured −0.380 = decoded −0.380; first pin
  −0.813 was stale hand-math — the gate refused until re-derived from the
  raised bbox), minGap +2.268 vs nx-town-potter, PLACED_VERIFIED 1 verb,
  idempotent rerun zero verbs, live tuple [30.471, 2.45, 38.322] yaw
  −2.4785 (host-relative anchor [0, 2.45, 0.86] exact). Bill eye-check:
  from the E ring track, the flame-over-chamber board should read on the
  kiln's mouth face above the heat-contours band, straps hugging the drum.

- waysign-4 `nx-sign-potter-001` potter: mkv3-sign-potter.ts,
  deterministic ×2, sha bc05a4f316d96558…, 6 nodes, no comps no lights.
  Host is an OPEN WORK STAND (no wall/eave) → PLANTED-POST open-yard
  idiom: iron post, bracket arm plaza-ward, three-link chains, bone
  board. Glyph took FIVE versions: v1 merged blob; v2 inverted
  hierarchy; v3 "!" mark; v4 magnifying-glass; v5 ACCEPTED —
  HORIZONTAL layout, lathe-profile terracotta pot (single silhouette,
  heritage bakery-loaf law) beside a wheel RING (torus + proud hub;
  reads as wheel by its hole); v6 = +15% scale + terracotta 0xb96a45.
  zai-vision ACCEPT + 8m front-view gate PASS (native vision provider
  down error 1210 FOURTH consecutive tick — fallback, recorded not
  claimed native). SAT refusal caught the first siting INSIDE sibling
  artwalk b3's ruled-porch pavilion (2D −2.005, post top into canopy)
  — resited to host-local [1.5, 0, 3.1], between the pavilion's two +z
  posts, outside its envelope; minGap +0.545 vs b3, PLACED_VERIFIED
  1 verb, idempotent rerun zero verbs, live tuple [23.086, 0, 38.665]
  yaw −2.5835 (host-relative anchor exact). Bill eye-check: walk the
  plaza-to-craft edge — the pot + wheel board should read between the
  porch posts at the stand's approach, terracotta pot distinct from
  the dark wheel at 8m.

- waysign-5 `nx-sign-woodyard-001` woodyard: mkv3-sign-woodyard.ts,
  deterministic ×2, sha 58f5cbe3272aa7a8…, 6 nodes, no comps no lights.
  v1 zai-REJECTED (log end-grain invisible at size, log edge-to-edge
  with frame) → v2: brighter/bigger cut-face end discs, warmer log
  0xc0a04e, log shortened 0.34→0.30 for frame margin — ACCEPT
  (isolated) + 8m front gate PASS; far-LOD degrades gracefully to
  "a sign" (consistent with waysign-1..4). Native vision provider down
  5th consecutive tick (error 1210) — zai-vision fallback, recorded
  not claimed as native PASS. Placer waysign-place-woodyard-1.ts:
  rider-only SAT, host exemption explicit, ground-layer exemptions
  (paths/roads/approach lanes), minGap +1.156 vs nx-town-longhouse,
  PLACED_VERIFIED 1 verb, idempotent rerun zero verbs, live tuple
  [15.432, 2.05, 29.887] yaw −2.6698 (host-relative [0, 2.05, 1.25]
  exact). Bill eye-check: from the plaza working-edge path, the
  saw-buck board should read under the woodyard's open front eave as
  you approach the cordwood, X trestles + log one clean glyph.

- waysign-6 `nx-sign-mill-001` mill: mkv3-sign-mill.ts, deterministic
  ×2, sha 5b6a55bdea1c2316…, 6 nodes, no comps no lights. Glyph took
  FIVE versions: v1 hub-invisible/links-as-dots/arms-column;
  v2 tips-still-faint; v3 REJECT tonal inversion (pale cloth dissolved
  into pale bone field); v4 ACCEPT — DARK four-blade silhouette
  (family law: every accepted glyph is dark-on-pale), tapering blades,
  two pale lattice slits each, bright brass hub; v5 hub +30% (judge
  margin note). zai-vision ACCEPT + 8m gate PASS (far-LOD degrades to
  "a sign" — consistent with waysign-1..4). Native vision provider down
  6th consecutive tick (error 1210) — fallback, recorded not claimed
  native. Placer waysign-place-mill-1.ts: rider-only SAT, host exemption
  explicit, EXACT (unpadded) rider extents so the b10 adjacency gates
  truthfully (padding false-fails at −0.025), minGap +0.339 vs
  nx-artwalk-b10-windmill-four-wind-crown (expected +0.203 by 1D
  extents; axis-separated), PLACED_VERIFIED 1 verb, idempotent rerun
  zero verbs, live tuple [−37.5, 2.78, 1.6] yaw +π/2 (host-relative
  [−1.6, 2.78, 2.5] exact). Bill eye-check: walk the W road from the
  ring toward the windmill — the four-blade mill board should read on
  the mill-room's door face left of the artwalk crown, brass hub clear
  at 8m, clear of the door lane and the millrace side.

## Carried laws

- Host-rider continuity (artwalk-39): re-derive anchors from CURRENT host
  tuple; never blind-reuse a pin.
- Rider-only SAT + exemption ladder; host-pair concentric exemption
  explicit.
- Unlit by default; no lamp budget spent; polish-273 emissive only if
  provably past every light.
- Standing gate real exit 0 before any live mutation; ledger law EXACT;
  one append per wakeup; stage only lane-owned paths.
