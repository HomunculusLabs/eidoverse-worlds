#!/usr/bin/env python3
"""sweep-175 plan edits: history row after the sweep-174 row, prose block at
EOF. Anchored + asserted unique. Row anchor verified by grep pre-write.
Adapted verbatim from the committed sweep174-plan-edit.py."""
import sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW_ANCHOR = '| sweep-174 | 2026-09-09 |'
assert s.count(ROW_ANCHOR) == 1, f'row anchor not unique: {s.count(ROW_ANCHOR)}'
assert s.count('sweep-175: CLEAN SWEEP') == 0, 'prose anchor already present'

i = s.index(ROW_ANCHOR)
j = s.index('\n', i)

ROW = ("| sweep-175 | 2026-09-09 | 318->319 BOTH epochs (A/B 20s-paced) vs committed baseline 318 ents / sha16 "
       "a1fc3ef2938810a0: exactly ONE arrival nx-struct-peaucellier pos [-10.4888,-0.0480,168.3133] yaw pi-exact "
       "lib f66494fa3ffb9ff8 scale 1 bbox 7.00x4.20x1.05 empty comp = struct-129 @ d6e3baf0 PLACED_VERIFIED spawn "
       "(mid-tick sibling ledger append 2370767->2370768 absorbed, IMPROVEMENTS clean at its HEAD, gate RE-RUN "
       "ALL PASS real exit 0 at d6e3baf0 per polish-270 epoch law), domain-valid committed work, tuple "
       "ledger-exact vs its entry; 0 departures, 0 field diffs, 0 lib flips on all 318 shared ids; epoch-A raw "
       "md5 8e89b3da sha16 6a54bb6d 94432B; epoch-B first fetch gateway-1033 17B body — ONE paced 20s retry "
       "clean (polish-270e class), A/B byte-identical; snapshot REWRITTEN arrival-fold variant per sweep-55/170 "
       "chassis: 319 ents 212416B sha16 b52c0538d95606df, pre-write asserts exact, post-write drift ZERO | SAT "
       "fresh-live 281 bbox non-light (peaucellier in the live set) / 236 classified / 0 coverage holes / exit 3 "
       "on ONLY known R-121 lamp-n\\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 131st sweep since "
       "routing, not new, no escalation due — law keys Sev 1), peaucellier adds ZERO overlapping pairs "
       "corroborating struct-129's own live worst zeno +2.07 | tier-1 4/4 per-leg verified 81/81 ALL_PASS real "
       "exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ "
       "0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts, run individually, per-leg ok parsed — "
       "sweep-48/165 keying law; NW/NE/SW tools key distance not dist, sweep-54 keying class, corrected "
       "in-tick, JSON parsed from first brace behind the [physics] banner; interior support-seam abstentions on "
       "dress/temple entities = known normalized diagnostic set, unchanged); tier-2 153rd cycle per committed "
       "sweep-174 pointer inn 6/6 @ 0.3640 (interior-walk-inn.ts) + tower-house 6/6 @ 0.3765 "
       "(interior-walk-tower-house.ts), both ALL_PASS real exit 0 | pins 15/15 ALL_PINS_OK (129th consecutive "
       "clean, struct18-fleet-pin-check.ts real exit 0), sweep89-battery 28/28 on fresh census-A bytes, "
       "interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool self-verifies law() both "
       "sides, base 2370768 re-read fresh pre-append, D+0/E+0 — struct-129's +1 absorbed as the mid-tick "
       "sibling append), standing gate ALL PASS real exit 0 at tick-start 7bb8b898 + RE-GATED d6e3baf0 "
       "(struct-129 absorbed mid-tick; its spawn is exactly this tick's single arrival) | CLEAN SWEEP — R-121 "
       "open, known, no escalation due |\n")

s = s[:j] + '\n' + ROW.rstrip('\n') + s[j:]

PROSE = """
sweep-175: CLEAN SWEEP, single-classified-arrival tick. Census 318->319 at
BOTH epochs (A/B 20s-paced) vs the committed baseline (318 ents, sha16
a1fc3ef2938810a0): exactly ONE arrival — nx-struct-peaucellier at
[-10.4888,-0.0480,168.3133] yaw pi-exact, lib f66494fa3ffb9ff8, scale 1,
bbox 7.00x4.20x1.05, empty comp — the struct-129 spawn @ d6e3baf0
(PLACED_VERIFIED). Its ledger append (2370767->2370768) landed mid-tick
AFTER my epoch-A census; IMPROVEMENTS.md was clean at its HEAD and the
standing gate was RE-RUN ALL PASS real exit 0 at d6e3baf0 per the
polish-270 epoch law. Domain-valid committed work (nx-struct-*), live
tuple ledger-exact against its entry, and the struct-129 siting narrative
(r169 lawful seat inside the S-walk 20m HOLE, voronoi r160 -> peaucellier
r169 -> zeno r180) is consistent with this tick's SAT: peaucellier adds
ZERO overlapping pairs in the live set, corroborating its own reported
worst solid gap zeno +2.07. Zero departures, zero field diffs, zero lib
flips on all 318 shared ids. Epoch-A raw capture md5 8e89b3da, sha16
6a54bb6d, 94432B; epoch-B's first fetch returned a gateway-1033 17-byte
error body — ONE paced 20s retry came back clean and A/B byte-identical
(polish-270e single-retry-recovery class, disclosed). Snapshot REWRITTEN
(arrival-fold variant, sweep-55/170 chassis, pre-write asserts exact,
post-write drift ZERO): 319 entities, 212416B, sha16 b52c0538d95606df,
prior-318 order+set preserved, world key preserved. Overlap: SAT
fresh-live 281 bbox non-light (peaucellier in the collision set) / 236
classified / 0 coverage holes, exit 3 on exactly ONE unclassified =
R-121 lamp-n | nx-town-mapboard −0.407 — known Sev 2 routed to artwalk
b26 choreography @ sweep-43, 131st sweep since routing, NOT new, no
escalation due (law keys severity-1). Walks: tier-1 4/4 per-leg verified
81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7
@ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts); all
four run individually, per-leg ok parsed from the results list
(sweep-48/165 keying law). Two in-tick probe self-catches, disclosed:
(a) the NW/NE/SW walk tools key their arrival field `distance` where the
core/interior tools use `dist` — sweep-54's exact keying class; first
parse read 0.0000 maxArrival, re-parsed on the correct per-tool key.
(b) stdout carries a `[physics]` banner line ahead of the JSON — parse
from the first brace, not the file head. Interior support-seam
abstentions on dress/temple entities remain the known normalized
diagnostic set, unchanged. Tier-2 153rd cycle per the committed
sweep-174 pointer: inn 6/6 @ 0.3640 (interior-walk-inn.ts) +
tower-house 6/6 @ 0.3765 (interior-walk-tower-house.ts), both ALL_PASS
real exit 0. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real
exit 0 (129th consecutive clean); sweep89-battery 28/28 ALL PASS exit 0
on fresh census-A bytes; interlane md5 f6254cd0 stable, read fresh.
Ledger law EXACT — canonical tool self-verifies law() before and after
append, base 2370768 re-read fresh immediately before append, D+0/E+0
(struct-129's D+1 was the absorbed mid-tick sibling append). Standing
gate ALL PASS real exit 0 at tick-start 7bb8b898 and re-gated at
d6e3baf0 after the struct-129 advance. Zero world mutations, zero defect
notes, zero uploads, zero verbs, zero comp edits, zero shared-budget use.
Next tier-2 pair (sweep-176): row-cottage + observatory (154th cycle —
LRU chain: @175 inn/tower-house, @174 stable/market, @173
longhouse/garden-cottage, @172 hall/bunkhouse, @171
row-cottage/observatory stalest standing pair at 5 sweeps; both walk
tools verified present on disk this tick: interior-walk-row-cottage.ts,
struct2-walk-observatory.ts — the observatory leg is struct-family per
the sweep-171 cycle's own naming).
"""

s = s.rstrip('\n') + '\n' + PROSE

open(P, 'w').write(s)
n_blocks = s.count('sweep-175: CLEAN SWEEP')
print(f'OK: row inserted after sweep-174 row; prose block appended; '
      f'sweep-175 prose blocks: {n_blocks}; bytes: {len(s)}')
assert n_blocks == 1
