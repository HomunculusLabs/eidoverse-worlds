#!/usr/bin/env python3
"""sweep-177 plan edits: history row after the sweep-176 row, prose block at
EOF. Anchored + asserted unique. Row anchor verified by grep pre-write.
Adapted verbatim from the committed sweep176-plan-edit.py."""
import sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW_ANCHOR = '| sweep-176 | 2026-09-09 |'
assert s.count(ROW_ANCHOR) == 1, f'row anchor not unique: {s.count(ROW_ANCHOR)}'
assert s.count('sweep-177: CLEAN SWEEP') == 0, 'prose anchor already present'

i = s.index(ROW_ANCHOR)
j = s.index('\n', i)

ROW = ("| sweep-177 | 2026-09-09 | 319->320 (epoch-A fully quiet 319==319 sha16 9d6a3e8325b69027 byte-identical to "
       "sweep-176; epoch-B 20s-paced caught exactly ONE arrival): nx-struct-harmonickiss pos "
       "[-16.043989,-0.014399,229.439732] yaw pi-exact lib 8008167c97c9922f scale 1 bbox 3x6.4x3 empty comp = "
       "struct-130 @ 1be6774f PLACED_VERIFIED (r230 az184 yaw-pi lawful seat past clothoid r220 on the S math walk), "
       "domain-valid committed, live tuple ledger-exact; 0 departures / 0 field diffs / 0 lib flips on all 319 shared "
       "ids; snapshot REWRITTEN arrival-fold 320 ents 213012B sha16 5014e49ad693c10f order+set preserved post-write "
       "drift ZERO | SAT fresh-live 282 bbox non-light (harmonickiss in the collision set) / 236 classified / 0 "
       "coverage holes / exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ "
       "sweep-43, 133rd sweep since routing, not new, no escalation due — law keys Sev 1); harmonickiss adds ZERO "
       "overlapping pairs, corroborating struct-130 worst clothoid +8.12 | tier-1 4/4 per-leg verified 81/81 "
       "ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, "
       "NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts, run individually, per-leg ok "
       "parsed from first brace, sweep-48/165 keying law, no banner self-catch this tick; interior support-seam "
       "abstentions on dress/temple entities = known normalized diagnostic set, unchanged) | tier-2 155th cycle "
       "per committed sweep-176 pointer hall 8/8 @ 0.3600 (interior-walk-hall.ts) + bunkhouse 6/6 @ 0.3803 "
       "(interior-walk-bunkhouse.ts), both ALL_PASS real exit 0 | pins 15/15 ALL_PINS_OK (131st consecutive "
       "clean, struct18-fleet-pin-check.ts real exit 0), sweep89-battery 28/28 on fresh census-A bytes, interlane "
       "md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool self-verifies law() both sides, base "
       "2370769 re-read fresh pre-append, D+0/E+0 — struct-130's D+1 was the absorbed mid-tick sibling append), "
       "standing gate ALL PASS real exit 0 at tick-start 5ff98d45 + RE-RUN ALL PASS real exit 0 at 1be6774f "
       "(FOUR mid-tick sibling advances absorbed: survey-165/166/167 observer holds SURVEY-PLAN.md only + "
       "struct-130 the arrival) | CLEAN SWEEP — R-121 open, known, no escalation due |\n")

s = s[:j] + '\n' + ROW.rstrip('\n') + s[j:]

PROSE = """
sweep-177: CLEAN SWEEP, single-classified-arrival tick. Census 319->320:
epoch-A fully quiet (319==319 vs committed baseline, raw sha16
9d6a3e8325b69027 byte-identical to sweep-176, zero deltas on all shared
fields); epoch-B (20s-paced) caught exactly ONE arrival —
nx-struct-harmonickiss at [-16.043989, -0.014399, 229.439732] yaw
pi-exact, lib 8008167c97c9922f, scale 1, bbox 3x6.4x3, empty comp — the
struct-130 spawn @ 1be6774f (PLACED_VERIFIED, its own entry records
census 319->320, r230 az184 yaw-pi lawful seat past clothoid r220 on
the S math walk). Domain-valid committed work (nx-struct-*), live
tuple ledger-exact against its entry. Zero departures, zero field
diffs, zero lib flips on all 319 shared ids. Snapshot REWRITTEN
(arrival-fold variant, sweep-55/170/175 chassis, pre-write asserts
exact, post-write drift ZERO): 320 entities, 213012B, sha16
5014e49ad693c10f, prior-319 order+set preserved, world key preserved.
Overlap: SAT fresh-live 282 bbox non-light (harmonickiss in the
collision set) / 236 classified / 0 coverage holes, exit 3 on exactly
ONE unclassified = R-121 lamp-n | nx-town-mapboard −0.407 — known Sev 2
routed to artwalk b26 choreography @ sweep-43, 133rd sweep since
routing, NOT new, no escalation due (law keys severity-1). The SAT's
282 count (noticed before epoch-B explained it — the sweep-176 count
was 281) is itself evidence the fetch included the mid-tick arrival:
harmonickiss adds ZERO overlapping pairs, corroborating struct-130's
reported worst clothoid gap +8.12. Walks: tier-1 4/4 per-leg verified
81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE
7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37
(sw-approach3-walk.ts); all four run individually, per-leg ok parsed
from the results list from the first brace (sweep-48/165 keying law; no
banner self-catch this tick). Interior support-seam abstentions on
dress/temple entities remain the known normalized diagnostic set,
unchanged. Tier-2 155th cycle per the committed sweep-176 pointer:
hall 8/8 @ 0.3600 (interior-walk-hall.ts) + bunkhouse 6/6 @ 0.3803
(interior-walk-bunkhouse.ts), both ALL_PASS real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (131st
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT — canonical tool self-verifies law() before and after append,
base 2370769 re-read fresh immediately before append, D+0/E+0
(struct-130's D+1 was the absorbed mid-tick sibling append). Standing
gate ALL PASS real exit 0 at tick-start 5ff98d45; HEAD advanced FOUR
times mid-tick (survey-165 @ 5ece8e11, survey-166 @ e9e2b185,
survey-167 @ 20e7ea20 observer holds touching SURVEY-PLAN.md only,
zero SWEEP paths + struct-130 @ 1be6774f the arrival); epoch law
honored, gate RE-RUN ALL PASS real exit 0 at 1be6774f before the
snapshot rewrite and ledger append. Zero world mutations, zero defect
notes, zero uploads, zero verbs, zero comp edits, zero shared-budget
use. Next tier-2 pair (sweep-178): stable + market (156th cycle — LRU
chain: @177 hall/bunkhouse, @176 row-cottage/observatory, @175
inn/tower-house, @174 stable/market stalest standing pair at 3 sweeps;
both walk tools verified present on disk this tick:
interior-walk-stable.ts, interior-walk-market.ts).
"""

s = s.rstrip('\n') + '\n' + PROSE

open(P, 'w').write(s)
n_blocks = s.count('sweep-177: CLEAN SWEEP')
print(f'OK: row inserted after sweep-176 row; prose block appended; '
      f'sweep-177 prose blocks: {n_blocks}; bytes: {len(s)}')
assert n_blocks == 1
