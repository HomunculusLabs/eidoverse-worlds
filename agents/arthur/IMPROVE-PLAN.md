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
- improve-2: signs (8) + fleet dress pieces (11) — same treatment.
- improve-3: struct + approach + mile families; commit the merged ranked
  round-1 execution queue (worst first, each entry = id + defect + fix).

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

## Carried laws

- Full house discipline: gate exit 0 before mutation, ledger law EXACT,
  one append per tick, stage only lane-owned paths, never push.
- Comp capture/reapply on every re-place; idempotent rerun proof.
- CLEAN verdicts are recorded results; no manufactured work.
