#!/usr/bin/env python3
"""sweep-106 plan edit: narrative register block appended at file tail
(matches the sweep-103/104/105 pattern)."""

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

block = """
sweep-106: CLEAN SWEEP, steady-state tick. Census 298==298 at epochs A/B
(25s-paced) vs the committed sweep-105 baseline (sha16 2f6ccda3e57cc491):
0 arrivals, 0 departures, 0 drift field-sets on all 298 shared ids; epochs
A and B byte-identical across id/pos/yaw/scale/lib/kind/bbox — single stable
epoch, no sibling landed this window; snapshot byte-identical, NO rewrite
(sweep-18/19 precedent). Overlap: SAT fresh-live 260 bbox non-light / 232
classified / 0 coverage holes, exit 3 on ONLY the known R-121 lamp-n |
nx-town-mapboard -0.407 (Sev 2 routed to artwalk @ sweep-43, sixty-second
sweep since routing, no escalation due — the law keys on severity-1); zero
new contacts. Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real
exit 0: core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37 —
standing profile exact. Tier-2 84th cycle per committed pointer: bunkhouse
6/6 @ 0.380 (interior-walk-bunkhouse.ts) + longhouse 6/6 @ 0.346
(interior-walk-longhouse.ts), both real exit 0, both walked over the
overhaul-wave bytes — profile matches sweep-102 exactly. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (60th consecutive
clean); interlane md5 f6254cd0 stable, read fresh. BATTERY PROBE MAINTENANCE
+ DISCLOSURE: sweep89-battery first ran 24/28 — the FOURTH FAIL was
carousel-lib ce363399 vs live 1c0128b6 = the polish-283 Bill-approved
carved-horses swap from the sweep-104 wave, the same stale-probe-pin class
as the known three (windmill/woodyard/comp-bearing). That means sweep-105's
reported "25/28, 3 FAILs" was a MISCOUNT: on that world state the committed
battery (still pinning carousel at ce363399) must have shown 24/28 — the
carousel FAIL was real then too and went uncounted; correcting the record
here. All four FAILs were stale PROBE pins, never world drift: carousel
comp bag exact 7 PRESERVED through the swap (census-verified this tick),
windmill a557d918 = WINDMILL-OVERHAUL accepted baseline, woodyard 333e85a4
= village-overhaul DELIVERY.json LIVE_VERIFIED, comp-bearing 21 = sweep-104
record. The four battery pins were refreshed to their committed-ledger
accepted baselines IN THIS TICK's probe edit (sweep89-battery.py, committed
with this entry) — RED (4 FAILs) observed on live bytes before the pin
refresh, GREEN (28/28) after, all pins derived from committed ledgers, not
memory; battery now exits 0 with zero FAILs. Comp-bearing 21 census-matched;
38 lights. Ledger law EXACT — base re-read fresh immediately before append,
entry landed D+0/E+0 at 2370739. Standing gate ALL PASS real exit 0 at
tick-start 4fe363e9 (struct-95 sibling at HEAD, zero-mutation committed
tick); no interleave between gate and evidence this window — gate not
re-run, epoch B census settled 0/0/0 after all evidence. Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp edits,
zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-107):
garden-cottage + tower-house (85th cycle — LRU chain: @106 bunkhouse/
longhouse, @105 stable/observatory, @104 hall/row-cottage, @103 forge/
potter, @102 bunkhouse/longhouse, @101 row-cottage/inn, @100 stable/
observatory, @99 garden-cottage/tower-house — garden-cottage last walked
sweep-99 and tower-house sweep-99, now the stalest standing pair; both walk
tools verified present this tick: interior-walk-garden-cottage.ts,
interior-walk-tower-house.ts).
"""

assert s.count('Next tier-2 pair (sweep-106):') == 1
s2 = s + block
open(P, 'w').write(s2)
# verify
v = open(P).read()
assert v.count('sweep-106: CLEAN SWEEP') == 1
assert v.count('Next tier-2 pair (sweep-107):') == 1
print('PLAN_OK bytes', len(block))
