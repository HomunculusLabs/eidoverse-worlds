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
| 1 | `nx-town-inn` | inn | tankard + key | pending |
| 2 | `nx-town-stable` | livery | drawn horseshoe | pending |
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

- (empty — first entries land at waysign-1)

## Siting + build log (filled per sign)

- (empty — first entries land at waysign-1)

## Carried laws

- Host-rider continuity (artwalk-39): re-derive anchors from CURRENT host
  tuple; never blind-reuse a pin.
- Rider-only SAT + exemption ladder; host-pair concentric exemption
  explicit.
- Unlit by default; no lamp budget spent; polish-273 emissive only if
  provably past every light.
- Standing gate real exit 0 before any live mutation; ledger law EXACT;
  one append per wakeup; stage only lane-owned paths.
