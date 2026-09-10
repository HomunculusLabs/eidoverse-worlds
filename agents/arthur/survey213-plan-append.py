#!/usr/bin/env python3
"""survey-213 plan append (read-only lane bookkeeping). Assert-gated per
waysign-19 / s199 self-catch law: unique anchor verified BEFORE write,
block-count + size verified AFTER."""
import io
P = 'agents/arthur/SURVEY-PLAN.md'
s = io.open(P, encoding='utf-8').read()
assert s.count('## Tick 212 (') == 1, 'anchor not unique: Tick 212'
assert s.count('## Tick 213 (') == 0, 'Tick 213 already present'
before = len(s)
block = '''

## Tick 213 (2026-09-09 23:34 EDT) — ARRIVAL-GATED SLICE: nx-struct-boy first independent read

- Gate: interleaved recovery this tick (survey-8 class, disclosed). First
  run at b567c674 FAILED ledger law EXACT 2370774==2370773 — sibling
  struct-137's ledger append staged pre-commit (working tree ahead of
  HEAD). Paced waits x4 (~25/45/90/120s) watching HEAD + IMPROVEMENTS.md;
  sibling executed full placement arc mid-wait (census 322->323), then
  struct-137v reconciliation commit landed at 76546ac3. Re-gate at
  76546ac3: ALL PASS REAL EXIT 0 (redirect-captured, 0 FAIL lines; first
  re-gate grep showed ALL PASS but ran through tail — exit re-captured
  clean per polish-270 addendum-b law). One structured interruption gap
  (~7 min): the sibling's full mutation window ran inside it, classified
  below.
- Census fresh (curl UA, canonical /geom?world=commons-next): A/B epochs
  20s-paced, both 95533B raw sha16 e7ea4e99bc2b2add BYTE-IDENTICAL,
  first-try HTTP 200. Set-diff vs committed sweep-183 fold baseline (322)
  via tracked survey213-census-diff.py (s212 chassis verbatim): 1 arrival
  / 0 departures / 0 field-diffs / 0 lib-flips on all 322 shared ids.
  ARRIVAL nx-struct-boy [-100, 0.018685, 0] yaw pi lib
  store/8c25b66573954418.glb tris 16376 — ledger-matched to struct-137v
  (76546ac3) PLACED_VERIFIED tuple EXACT (pos/yaw/lib/tris all equal).
  Struct-family 72->73. ARRIVAL LIFTS the no-slice gate (s138 law):
  first independent read owed.
- Slice = nx-struct-boy ONLY (the arrival; all other pools drained —
  never-judged 0 by prior set algebra + this diff, IMPROVE-PLAN md5
  c0f569d0 unchanged, STATE-OPEN 0, shard check 102nd consecutive:
  survey owns no prefix/rows, no survey-executable shard work).
  Evidence: live store bytes fetched curl UA HTTP 200 78588B served-sha16
  0e2f5d278b752436 (uploaded lib 8c25b665 = served DRACO re-encode,
  struct-104 law, normal transform); rendered via struct104-render-yaw.ts
  chassis (yaw 0, 3-fold symmetric per struct-137 record), 3 frames
  front/gameplay18m/night -> /tmp/survey213-boy/ (lean-evidence law; host
  disk constrained per survey-20 note).
- Judge: NATIVE 1210 x2 (paced retry burned) -> ZAI FALLBACK disclosed,
  gameplay + front both ZAI (native down hard this tick). VERDICT:
  nx-struct-boy CLEAN-WITH-MARGIN.
  (1) Identity PASS-as-sculpture at 18m: two-lobe-over-bulb composition
  with notch x440-505 y185-260 + elliptical cavity x525-600 y288-332
  reads deliberate landmark, not blob; ground truth: mathematical
  Boy's-specific identity (self-intersection curve, triple point) does
  NOT resolve at 18m — generic organic sculpture read. NOT routed as
  defect: struct-137's own ledger already carries this exact class to the
  refine slot ("native re-judge debt on v4 frames carries to refine slot
  with enneper/gyroid identity-at-18m class"); corroborates owner's
  self-assessment, zero duplication.
  (2) Silhouette MARGINAL: continuous, deliberate lobe rhythm; stipple
  noise bleeds the rim ~2-3px fuzzy (left lobe outer edge x305-330
  y190-310, right x615-645 y200-320) — shimmer-risk at 18m in motion;
  texture-uniform per front view (no patch defect; design note).
  (3) Floating/void: FRONT VIEW RESOLVES the gameplay pin-flag — thin
  stem x477-480 y84-113 + orange ball x471-487 y68-84 anchors into the
  inter-lobe saddle with NO daylight gap; DECODE CONFIRMS authored
  geometry: mkv3-boy.ts iron needle on the pinwheel axis with glow bead
  glow_bs_1 (emissive 0x9a7030 @ 0.85, dusk lineage, glow-census law
  exactly 1 KEEP). Pin is intentional finial, not float/gizmo (decode
  outranks render claim, pitfall 11).
  (4) Grounding PASS: contact band x390-560 y485-505, directional cast
  shadow x170-330, sun-consistent.
  (5) Emblem: orange bead 16-20px <2% of height — color accent legible,
  detail not; below pitfall-13 2% legibility floor, distance-limited not
  geometry-limited; already in owner's refine-slot scope.
- Routing: ZERO notes routed (struct domain, standing self-assessment
  already in owner's ledger + refine slot; SURVEY-PLAN judged-index only
  — the loop's CLEAN-index surface). ZERO candidate rows (object is a
  struct-lane commission, not a round-queue object; survey-17 precedent).
  ZERO ledger append (loop law 4: append only when routing). Grep
  discipline: 'nx-struct-boy' in STRUCTURES-PLAN = owner's own
  struct-137/-137v records; no survey note exists = no duplicate.
- Self-catches this tick: (a) gate exit-code laundering via tail pipe
  (GATE_EXIT:0 on a FAILING run) — re-captured clean via redirect file +
  grep -c '^FAIL'; (b) survey213-census-diff.py derived verbatim from
  s212 chassis before use; (c) no vision native calls succeeded — both
  burned, fallback disclosed in-plan (not silent).
- Zero world mutations, zero uploads, zero verbs, zero comp edits, zero
  shared-budget use (D+0, E+0). Tag survey-213 from plan sequence (ledger
  max re-checked: bracketed [survey-81] is max in IMPROVEMENTS.md, no
  survey-213 string anywhere in ledger).
'''
io.open(P, 'w', encoding='utf-8').write(s + block)
t = io.open(P, encoding='utf-8').read()
assert t.count('## Tick 213 (') == 1, 'append failed'
assert t[:before] == s, 'prefix mutated'
print(f'APPENDED +{len(t) - before}B; Tick 213 blocks={t.count("## Tick 213 (")}; '
      f'plan size {len(t)}B')
