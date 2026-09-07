# CITY-PLAN — commons-next master composition (Bill ruling: B + A)

Ruled by Bill 2026-09-07: "B + A" — Negative Space between town and
districts, plus four coherent cardinal spokes. This plan is now the
COMPOSITION LAW above all lane siting decisions; every placement, reseat,
and retirement must cite it. Bill alone may amend or dissolve this plan.

## Bands (canonical geometry)

- **r0–20 — PLAZA CORE**: gates, lamps, paths, carousel. Intact, done.
- **r20–33 — VILLAGE RING**: the town's buildings (hall, longhouse,
  bunkhouse, tower-house, row-cottage, garden-cottage, dyehouse, woodyard,
  forge, court, cistern, kiln, potter, halt, shrine, windmill, stable, inn)
  + their attached dressing/signs/artwalk riders. THE VILLAGE. Complete;
  no new builds, no removals. Host-attached riders move only with hosts.
- **r33–55 — PROCESSIONAL BAND**: mostly EMPTY (the B cut). Each cardinal
  spoke carries exactly ONE coherent procession from gate to district:
  - **N (cultivation spoke)**: waystone-n → meridiandial → waterstair →
    orrery(+ring) → shelltower → ellipsecourt → meridianstair → NW district
  - **E (craft spoke)**: waystone-e → anvilpad → well → hens/coop/hutch →
    inn/stable cluster edge → wavepergola → NE district
  - **S (wild spoke)**: waystone-s → halt → mobius → (Bridge of Nines
    continues on-axis at r69) → SE district
  - **W (contemplative spoke)**: waystone-w → shrine → hypar → mill sign →
    windmill → stillwind → SW district
  Nothing else lives in this band. Off-spoke works currently here
  RELOCATE (see relocation register) — they are authored works, not
  deletions; they go to their thematic district ring.
- **r70–100 — DISTRICT RINGS**: NW cultivation, NE craft, SE wild, SW
  contemplative. Intact and growing (round-3 dress lands here).

## Relocation register (r33–55 off-spoke → districts)

| Work | From | To | District |
|---|---|---|---|
| nx-struct-soundmirror | r33.9 off-spoke | SE wild edge | SE | EXECUTED struct-71: moved (28.7,-18)→(35.46,-55.66) az-57.5 r66 yaw 0, same lib f313e59a (no upload), 2 verbs, PLACED_VERIFIED + idempotent; exact-disc r2.30 SAT, gap 1.51 vs forest-0044 (law 1.4); terrain 5.2mm |
| nx-struct-pendulum | r36 | NW edge near meridian spoke | NW | EXECUTED city-3: moved (25.01,-0.041,25.9) yaw 0 -> (13.16,-0.0479,-60.59) az282.25 r62 yaw -12.25deg, same lib c32a35a8 content-addressed (zero uploads), remove+spawn 2 verbs PLACED_VERIFIED + idempotent 0-verb rerun; exact rect-OBB SAT worst-neighbor gap 2.37 vs meridianstair (1.4 law) on fresh 278 census; row-ends 2.63m off az276 spoke ray + 9.1m off gate walking axis x=0, spoke-line walk 5/5 both directions (0.36m max arrival); terrain 7pt spread 12.4mm; DISCLOSED: register window r66-80 az279-318 holds ZERO lawful seats for the 8.3x2.7m rectangle (soundmirror's unique disc seat + forest-0010/0018 + district interior consume it) — threshold pocket beside meridianstair taken as the register-faithful "edge near meridian spoke" seat (row-1 dialect class: anchors resolved physically, district names run the +z=north dialect) |
| nx-struct-millrace | r40 | NW (pairs windmill theme) | NW |
| nx-struct-reedpool | r42 | SE wild | SE |
| nx-struct-skymirror | r42.9 | SW contemplative | SW |
| nx-struct-amphi | r44 | NE craft edge | NE |
| nx-struct-beacon | r44 | SE wild | SE |
| nx-struct-observatory | r44 | SW contemplative | SW |
| nx-struct-angler | r45 | SE wild (water theme) | SE |
| nx-struct-needlerest | r47.5 | NE craft | NE |
| nx-struct-skene | r53.4 | NE craft | NE |
| nx-gallery-mosaic-0036/0052/0059 | r45 off-spoke | gallery row (Bill's nvp-105 line) | NE |
| nx-mile-sw-005/006, ne-003/004 | r47–49 | re-anchor at district thresholds | per-quad |
| nx-dress-harvestcart/milkstand/churn/charcoal | r38–48 | village ring edge (working farm props) | ring edge |
| nx-town-potter | r48.1 | village ring (compress inward) | ring |
| nx-town-kiln | r49.8 | village ring (compress inward) | ring |
| signs (dyer/potter/kiln) | follow hosts | follow hosts | — |

Relocations preserve yaw-relative-to-center where the read depends on it;
SAT preflights at destination; sweep re-baselines after each wave.

## Standing laws

1. **No new entity in r33–55 except on-spoke procession pieces named in
   this plan.** Lane plans must cite this law when siting.
2. **Relocation ≠ deletion.** Authored works move whole (same lib), never
   rebuilt. Hosts carry their riders.
3. **Village ring is closed.** No new builds in r20–33 without a Bill
   commission widening.
4. **District rings take all new work** (round-3 dress, struct R6+,
   improve reseats).
5. Artwalk counting-series riders await Bill's eye-gate circuit before
   any move — attachments stay with hosts meanwhile.
6. Sweep audits composition: any off-spoke arrival in the processional
   band is a Sev-2 finding routed to the placing lane.

## Execution order

Wave 1: struct relocations (SE/SW/NE pieces) — one per struct tick.
Wave 2: mosaic row + mile re-anchors (needs Bill's nvp-105 row blessing).
Wave 3: dress farm-props to ring edge + potter/kiln compression.
Sweep re-baselines after each wave; census delta classified against this
plan's register. Eye-gate packet to Bill after each wave.
