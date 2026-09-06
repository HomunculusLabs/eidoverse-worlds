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
| 3 | `nx-town-dyehouse` | dyer | dyed cloth bolt (flax-blue) | pending |
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

## Carried laws

- Host-rider continuity (artwalk-39): re-derive anchors from CURRENT host
  tuple; never blind-reuse a pin.
- Rider-only SAT + exemption ladder; host-pair concentric exemption
  explicit.
- Unlit by default; no lamp budget spent; polish-273 emissive only if
  provably past every light.
- Standing gate real exit 0 before any live mutation; ledger law EXACT;
  one append per wakeup; stage only lane-owned paths.
