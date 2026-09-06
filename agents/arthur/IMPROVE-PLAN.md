# IMPROVE-PLAN — improve-N lane durable state (refinement era)

Lane: object improvement for commons-next. One object per wakeup, full
analyze→evaluate→plan→execute cycle. Loop file: `IMPROVE-LOOP.md`.
Interlane: `INTERLANE-PROTOCOL.md`.

## Era framing

Additive era closed 2026-09-06: sweep-19 CLEAN at 259 entities, all builder
queues drained, four district dressing queues COMPLETE, waysign/mile queues
closed with eye-gates delivered. The refinement era opens here — the same
arc the old commons ran as its refine/texture eras, the highest-yield lanes
in village history.

## Object pool (authored objects, from the sweep-20 census snapshot)

| family | count | notes |
|---|---|---|
| nx-town core buildings | 36 | round-1 analysis focus |
| nx-sign trade signs | 8 | incl. heritage smithy |
| nx-dress district dressing | 27 | 11 fleet-built + 16 legacy core |
| nx-struct structures | 30 | rounds 2+ |
| nx-approach legs | 17 | lamp-gap D-notes pending Bill's budget call |
| nx-mile milestones | 15 | rounds 2+ |
| nx-artwalk riders | 54 | host-anchor reconciliation stays artwalk's own |

## Round structure

A round = one analysis phase (2–3 ticks, family-by-family render+judge
sweeps that commit a ranked worst-first queue) + N execution ticks (one
object each) + one eye-gate circuit at close. Next round re-derives from
the then-current census — never reuse a stale queue.

## Round 1 (OPEN)

**Analysis ticks:**
- improve-1: render+judge the 36 core nx-town buildings at gameplay
  distance (2 views each, existing review chassis), defect list, ranked.
- improve-2: signs (8) + fleet dress pieces (11) — same treatment. DONE —
  findings below (merged into the execution queue at improve-3).
- improve-3: struct + approach + mile families; commit the merged ranked
  round-1 execution queue (worst first, each entry = id + defect + fix).

**improve-2 findings (signs + fleet dress, judged at 18m gameplay vantage,
ZAI fallback vision — native down 14th consecutive tick, disclosed; isolation
renders, so host-mount/absent-host-wall reads were filtered as non-defects
per host-rider law):**

Signs (8): `nx-sign-stable-001` CLEAN (dark horseshoe on cream holds).
The other 7 share one root failure class — emblem collapses at 18m
(motif <~1/3 of board face, low contrast, shape ambiguity):
- `nx-sign-smithy` — horseshoe a dark smudge, no U-shape; stray detached
  fragment left of board; bracket hairline-thin. Sev 2 (heritage sign).
- `nx-sign-dyer-001` — flax-blue bolt reads near-black at 18m, fuses with
  dark frame (known waysign flag CONFIRMED). Sev 2.
- `nx-sign-kiln-001` — flame collapses to orange blob; chains hairline.
  Sev 2.
- `nx-sign-woodyard-001` — saw-buck reads chevron; black header slab a
  content-free void; no mount silhouette. Sev 2.
- `nx-sign-mill-001` — sails read as generic X, indistinguishable from
  crossed-tools; header an unresolvable clump. Sev 2.
- `nx-sign-potter-001` — wheel reads, pot a smudge; emblem ~1/3 of panel.
  Sev 3 (closest to passing).
- `nx-sign-bakery` — emblem gold-on-cream blob ~6px. Sev 3.
(Note: waysign lane owns `nx-sign-*` re-places; execution entries route as
a cross-lane packet to waysign or wait for idle-guard to lapse — improve-3
resolves routing before any sign execution.)

Fleet dress (11): `nx-dress-se-stones-001` CLEAN (rock clusters read),
`nx-dress-nw-logpile-001` effectively CLEAN at 18m (minor close-range
notes only: shadow blob, dark end caps, sparse right end).
- `nx-dress-ne-yard-001` — reads rubble-pile not farmyard; floating rail
  ends; uniform near-black value. Sev 2.
- `nx-dress-sw-gravel-001` — collapses to a 1–2px dark line at 18m;
  reads as render artifact. Sev 2.
- `nx-dress-ne-bench-001` — reads as scattered tables not a bench; hard
  misaligned blob shadows. Sev 3.
- `nx-dress-se-cairn-001` — spindly totem not squat cairn; top stones
  dissolve; no per-stone value variation. Sev 3.
- `nx-dress-sw-prayer-001` — reads as rock pile; ZERO fabric/pole read —
  the namesake element is absent. Sev 2 (identity failure).
- `nx-dress-nw-skeps-001` — borderline pass; stray plank reads noise;
  rock swallows 2nd skep. Sev 4.
- `nx-dress-nw-stile-001` — reads as fence not crossing; step stones
  illegible. Sev 3. (dress-11 placed <24h — idle-guarded.)
- `nx-dress-ne-woodstack-001` — right post near-black/burnt read; gaps
  see-through mid rows; left post detached. Sev 3. (idle-guarded.)
- `nx-dress-nw-hedge-001` — passes as hedge; cleanup tier only (lone
  stub riser, stray cube, mid-gap hole). Sev 4.

**Seeded defects (enter the ranked queue regardless of sweep):**
- `nx-town-inn` porch emblem reads "wheel, not tankard" (waysign-7 flag) —
  host defect, waysign folded the inn sign over it.
- tex-85 woodyard live-freeze: live bytes ≠ source rebuild by design —
  any improvement derives from the LIVE store copy, never a source rebuild
  (disputed-bytes law).

**Round-1 execution queue:** (committed at improve-1, worst-first; every entry
decodes at source before editing — vision findings are probes ranked by
8m-walker severity, not verdicts. Seeded entries: inn emblem, woodyard
live-freeze. Idle-guard: any object another lane touched within 24h defers.)

1. `nx-town-hall` — see-through hole: sky visible through porch opening (no
   door/backstop); eave sliver top-right; ridge dashes. Sev 1: reads as
   unfinished mesh.
2. `nx-town-inn` — two floating diagonal planes at roof corners; dead
   unattached ridge box; porch emblem reads wheel-not-tankard (seeded,
   waysign-7); off-center entrance recess. Sev 1: floating geometry.
3. `nx-town-windmill` — gallery ring floats with zero attachment; stray pole
   clips lit window; sail cross lopsided (one arm bare). Sev 1: floating
   geometry + weak identity.
4. `nx-town-tower-house` — front stilts emerge from pure-black underside
   (floating read); balcony door ~4m with no stair/ladder; railing broken
   (posts only right half + one stray). Sev 1–2.
5. `nx-town-stable` — no entrance/identity on any face (reads as chest/
   monument); squat proportions; corner wedge voids at roof overhang. Sev 2.
6. `nx-town-kiln` — floating quad on cone flank; orphan rod; no flue/vent
   (silhouette reads hut, not kiln); firebox dead void. Sev 2.
7. `nx-town-shrine` — offering props unreadable clumps; torch flames 1–2px
   specks; asymmetric base plate; dead side faces. Sev 2.
8. `nx-town-row-cottage` — left door jamb bare (trim missing one side); lamp
   dot with no fixture; ridge tabs; dormer seam. Sev 2.
9. `nx-town-bunkhouse` — facade value crush (door reads as smudge); stray
   diagonal face right wall; ridge tabs. Sev 2.
10. `nx-town-garden-cottage` — front face zero info (no windows, door a
    faint seam); extension fuses with main volume. Sev 2.
11. `nx-town-belltower` — ladder rungs float (no stringers, top+bottom
    detached); rope unanchored mid-air; muddy belfry-corner junction. Sev 3.
12. `nx-town-mapboard` — map face reads as dirt smudges (no contrast); side
    edge fragments. Sev 3.
13. `nx-town-monument` — pinhole at ring intersection ~2 o'clock; pedestal
    face crushed. Sev 3.

**CLEAN (recorded, skipped):** dyehouse, gate (e/n/s/w, one GLB), longhouse,
market, potter, woodyard (live-freeze noted: any future edit derives from
LIVE store copy, never a source rebuild).

## Round 1 log

- improve-1: analysis tick. Fetched all 19 unique live store-min GLBs from
  /library/store/ (HTTP 200 ×19; server serves DRACO store-min shadows —
  added lane chassis review-model-draco.ts, the old chassis has no
  DRACOLoader). Rendered 8 views each via review chassis; judged gameplay
  vantage at 18m (ZAI fallback vision — native vision down, 13th
  consecutive tick, disclosed). 6 models CLEAN / 12 unique models defective;
  ranked queue committed above. Zero world mutations. Review evidence:
  agents/arthur/reviews/improve1-core/.
- improve-2: analysis tick. Signs (8) + fleet dress (11) from fresh live
  census (259 entities), live store bytes fetched (19/19 HTTP 200), 8 views
  each rendered, judged at 18m (ZAI fallback — native down 14th tick,
  disclosed). Signs: 1 CLEAN / 7 defective, one shared root class (emblem
  scale/contrast collapse at 18m); dyer flax-blue flag confirmed. Dress:
  2 CLEAN / 9 defective (worst: ne-yard rubble read, sw-gravel artifact
  line, sw-prayer identity failure — namesake fabric absent). Idle-guard
  noted on woodstack/logpile/stile (dress-9/10/11 <24h). Findings committed
  above; merged ranked queue deferred to improve-3 per round structure.
  Zero world mutations. Review evidence:
  agents/arthur/reviews/improve2-signs-dress/.

## Carried laws

- Full house discipline: gate exit 0 before mutation, ledger law EXACT,
  one append per tick, stage only lane-owned paths, never push.
- Comp capture/reapply on every re-place; idempotent rerun proof.
- CLEAN verdicts are recorded results; no manufactured work.
