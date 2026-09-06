# NIGHT & SKY DECISION PACKET — for Bill

Assembled once by the night-N observer lane, 2026-09-06 (night-5, overnight
fleet wave). All districts judged (NW/NE/SE/SW/core, night-1..5), sky study
facets 1–5 complete. This lane mutates nothing — every item below is render
evidence and a recommendation. Sky palette, lamp budgets, keeper timing, and
anything public-link are yours alone.

## Evidence class (read this first)

All renders are hash-bound local rigs, not in-world camera frames: every
subject GLB's sha256[:16] verified against the live census lib token before
render (single scope note: nx-town-woodyard rendered from the live at-rest
store copy — its optimized bytes differ from the lib token by design).
Poses = exact live tuples; lights = the live client contract
(0xffd9a0, intensity 16, range 10) at all live light positions (36 at the
core pass census of 246 entities). Judge channel: ZAI vision (GLM-4.6V)
fallback — native vision provider down 6 consecutive ticks (error 1210),
disclosed per pass. Rig sources: `agents/arthur/review-night-*.ts`;
renders under `agents/arthur/reviews/night-*/`.

## What the five passes found (one line each)

| district | wayfinding | material | emissive |
|---|---|---|---|
| NW Cultivation | FAIL (2 lamps / 47m leg) | PARTIAL | PASS |
| NE Craft | FAIL (33.5m gate gap, worst legs) | PARTIAL | PASS |
| SE Wild | FAIL (az315 corridor zero lamps) | PARTIAL | PASS |
| SW Contemplative | FAIL (temple grounds entirely unlit — gravest) | PARTIAL | PASS |
| CORE | PARTIAL-FAIL (gate→plaza middle third unlit on all 4 spokes) | PARTIAL | PASS |

The pattern is consistent fleet-wide: emissive discipline is clean; the
village reads as a set of warm pools connected by dark paths. Two systemic
questions, both yours:

## Decision 1 — SKY PALETTE (recommendation: FACET 5)

Evolution: (1) cool `#0a0d18` beats warm for night mood → (2) horizon
gradient earns its keep, stars underpowered → (3) moonlight ambient lift
(hemi 0.9, moon 1.1, sky `#0e1626`) partially rescues mid-ground MATERIAL
without a flat wash → (4) + unfogged pushed star dome = compound, better
than baseline → (5) + zenith concentration (~20% pulled zenith-ward) +
cleared low band along the four approach corridors = **wins head-to-head
on the same rig**; the facet-4 judge independently recommended exactly
these two fixes.

Facet-5 parameters (all render-only, never applied): sky `#0e1626`,
hemisphere 0.9 (0x25304a / 0x0c0e09), moon directional 0x8ea2c8 @ 1.1
from (-80,120,60), 420-star dome at r500 with top ~15% pushed white +
2.4x size, ~20% zenith-concentrated, low-altitude band cleared within
~12.5° of az 45/135/225/315, star materials fog:false.

Wins: clean horizon band kills false "distant waypoint" dots on approach
sightlines (judged the strongest single win of the study); vault cue
overhead; mid-ground material identity returns (path slabs read as stone,
timber lattice separates) while warm pools stay localized — night mood
survives.
Residual costs: single-still dome read is gradient-not-vault (would
confirm in motion); far-left secondary masses partially dissolve; if you
want a stronger dome, steepen the top-10% gradient or add a faint
galactic band at zenith.

**Eye-check pair (the decision image):**
- Baseline: `reviews/night-core/road-e-long.png`
- Facet 5:    `reviews/night-core-skyvar-facet5/road-e-long.png`
Also strong: `reviews/night-se-skyvar-moon/corridor-inbound.png` (the
material-rescue win) and `reviews/night-sw-skyvar-facet4/corridor-inbound.png`.

## Decision 2 — LAMP BUDGETS / NIGHT WAYFINDING (no single recommendation; options)

Every wayfinding FAIL is budget-bound: existing budgets are spent, and the
defects are routed to the approach lane (APPROACH-PLAN `### night-N defect
note`, Bill-correction class). What only you can decide:

- **D1/D2/D3/D4 (legs + districts)**: NW 2/2, NE 2/2, SE 8/8 (all interior),
  SW 2-of-3 spent. The dead stretches are 15–33m each; SW's temple grounds
  have zero lights of any kind. Options: (a) widen per-district budgets,
  (b) accept dark districts as intentional night wilds, (c) policy change
  (e.g. allow 1 lamp per ~15m of visitor path).
- **D5 (core)**: gate→plaza middle third unlit on all four spokes; the
  mapboard is an unlit slab. The core is the village's front door — this
  one I'd rank highest of the five.
- **N5 detached orbs**: leg lamps are bare kind=light entities with no
  fixture geometry; every judge read them as floating points. mile-5's
  hanging-lantern is the in-world precedent for a lit fixture. Worth a
  client-side check of what kind=light actually renders before deciding.
- **N7 hierarchy**: edge lamps match plaza brightness at pixel level; the
  house ring has no light tier. If you touch anything here, the ring tier
  (r18–28) is the missing middle.
- **Material truth (all districts)**: the moonlift in facet 5 is the only
  tested measure that recovers depth material. Adopting it answers this
  systemic finding without touching entity budgets.

## Defect disposition (all routed, all OPEN pending your calls)

D1–D5 → approach lane (budget-bound). N1/N2/N4/N5 orb class → approach
lane + client-contract check. N3 budget-table mismatch → dress lane
(DRESSING-PLAN note). N6/N7 → approach lane notes, final-packet questions.
Zero world mutations were made by this lane at any point.

## Suggested eye-check circuit (10 minutes)

1. Stand on the E road at the village edge after dark, walk home — feel the
   gate→plaza dead middle third (D5).
2. Walk the SW leg past the gravel gate into the temple grounds — the
   darkest district (D4).
3. Compare the decision image pair above (sky facet 5 vs baseline).
4. Look at one bare leg lamp up close — does the live client show a post?
   (N5.)
