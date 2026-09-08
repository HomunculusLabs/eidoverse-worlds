#!/usr/bin/env python3
"""sweep-103 plan edit: narrative register block only (matches sweep-101/102 pattern —
the history table's last row is sweep-100; 101/102 are narrative-complete without rows)."""

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

block = """
sweep-103: CLEAN SWEEP, epoch-settled tick. Census 294→295 at epochs A and B
(20s-paced) vs the committed baseline (sha16 43cd103177bfd34d): +1 domain-valid
arrival nx-struct-fifthbench @ (−23.5,−0.04,−51) yaw −0.4328 lib 62f33173ccdae107
= struct-92 @ c28d8b26 (Fifth Bench, R9-3 stone ribbon), tuple matches its
ledger line-for-line; exactly ONE drift field-set = nx-dress-ne-timberyard-001
lib 10b449fa→dfafb8c8 at identical tuple (76.7,−0.006,69.4) yaw −2.356194, bbox
top 1.241→1.63 = the v9 deep cants, = dress-142 @ 5e461c1e (survey-57 cure
re-place), ledger-exact; 0 departures, 0 unexplained drift on 294 shared ids.
Both commits predate this tick's start (HEAD 5e461c1e at gate) — no mid-tick
epoch correction was needed; epochs A and B identical (settled). Snapshot
rewritten with pre-write assertions (arrivals exactly [fifthbench]; drift
exactly [timberyard lib+bbox]), post-rewrite drift vs live ZERO. Overlap: SAT
fresh-live fetch 257 bbox non-light / 233 classified / 0 coverage holes, exit 3
on ONLY the known R-121 lamp-n | nx-town-mapboard −0.407 (Sev 2 routed to
artwalk @ sweep-43, fifty-ninth sweep since routing, no escalation due — the
law keys on severity-1); zero new contacts at the fifthbench or timberyard
seats. Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0: core
64/64 @ 0.38 (banner-stripped parse), NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @
0.37; both changed entities sit r56.1 / r103.2 from every tier-1 leg point —
walks unaffected by construction, the SAT re-run covers the collision surface
(sweep-53/57 precedent). Tier-2 81st cycle per committed pointer: forge 6/6 @
0.375 (interior-walk-forge.ts) + potter 6/6 @ 0.366 (interior-walk-potter.ts),
both real exit 0. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real
exit 0 (57th consecutive clean) + sweep89-battery 28/28 ALL PASS on epoch-B
bytes; comp-bearing count 18 census-matched (sweep-89 record stands);
fifthbench comp {} and timberyard comp {} both census-matched against their
ledgers. Interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT
2370732→2370732 at append (D+0, E+0). Standing gate ALL PASS real exit 0 at
tick-start 5e461c1e. Zero world mutations, zero defect notes, zero uploads,
zero verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2
pair (sweep-104): hall + row-cottage (82nd cycle — LRU chain: @103
forge/potter, @102 bunkhouse/longhouse, @101 row-cottage/inn, @100 stable/
observatory, @99 garden-cottage/tower-house, @98 hall/row-cottage — hall last
walked sweep-98 and row-cottage sweep-101, now the stalest standing pair; both
walk tools verified present: interior-walk-hall.ts, interior-walk-row-cottage.ts).
"""

anchor = "interior-walk-forge.ts, interior-walk-potter.ts).\n"
assert s.count(anchor) == 1, ('anchor count', s.count(anchor))
assert s.rstrip('\n').endswith(anchor.strip()), 'anchor is not at file tail'
s = s.rstrip('\n') + '\n' + block
open(P, 'w').write(s)

v = open(P).read()
assert v.count('sweep-103: CLEAN SWEEP') == 1, 'block not unique'
assert '## Findings register' in v, 'header consumed (adjacent-token-bleed check)'
assert v.count('## Frozen route list') == 1 and v.count('## Census snapshot discipline') == 1
import os
print('PLAN EDIT OK: narrative block 1x at tail, headers intact, bytes', len(v))
