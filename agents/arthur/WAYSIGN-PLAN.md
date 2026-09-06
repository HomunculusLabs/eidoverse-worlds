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
| 4 | `nx-town-kiln` | kiln | flame over chamber | pending |
| 5 | `nx-town-potter` | potter | wheel in profile | pending |
| 6 | woodyard host (id from census) | woodyard | saw-buck | pending |
| 7 | `nx-town-windmill` (or nx-windmill) | mill | four-sail cross | pending |
| 8 | `nx-town-forge` / `nx-forge` | smithy | hammer (heritage) | pending |

Every host's road-facing face is confirmed in the host build-source decode
before the anchor is chosen — the roster above is expectation, not truth;
the census + decode are truth.

## Host anchor log (filled per sign; re-derive after host re-places)

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

## Carried laws

- Host-rider continuity (artwalk-39): re-derive anchors from CURRENT host
  tuple; never blind-reuse a pin.
- Rider-only SAT + exemption ladder; host-pair concentric exemption
  explicit.
- Unlit by default; no lamp budget spent; polish-273 emissive only if
  provably past every light.
- Standing gate real exit 0 before any live mutation; ledger law EXACT;
  one append per wakeup; stage only lane-owned paths.
