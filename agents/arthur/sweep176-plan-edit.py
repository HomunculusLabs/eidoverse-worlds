#!/usr/bin/env python3
"""sweep-176 plan edits: history row after the sweep-175 row, prose block at
EOF. Anchored + asserted unique. Row anchor verified by grep pre-write.
Adapted verbatim from the committed sweep175-plan-edit.py."""
import sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW_ANCHOR = '| sweep-175 | 2026-09-09 |'
assert s.count(ROW_ANCHOR) == 1, f'row anchor not unique: {s.count(ROW_ANCHOR)}'
assert s.count('sweep-176: CLEAN SWEEP') == 0, 'prose anchor already present'

i = s.index(ROW_ANCHOR)
j = s.index('\n', i)

ROW = ("| sweep-176 | 2026-09-09 | 319==319 BOTH epochs (A/B 20s-paced) BYTE-IDENTICAL vs committed baseline 319 "
       "ents / sha16 b52c0538d95606df (sweep-175 arrival-fold): zero arrivals, zero departures, zero field diffs, "
       "zero lib flips on all 319 shared ids (281 thing + 38 light); raw A/B sha16 9d6a3e8325b69027 211652B "
       "(compKeys parent+tris fetch shape, s148/s163 flap class — content compared on the 8 shared fields); no "
       "snapshot rewrite needed, baseline current (sweep-106/108/174 no-churn precedent) | SAT fresh-live 281 "
       "bbox non-light / 236 classified / 0 coverage holes / exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard "
       "−0.407 (Sev 2 artwalk-routed @ sweep-43, 132nd sweep since routing, not new, no escalation due — law keys "
       "Sev 1) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 "
       "next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ "
       "0.37 sw-approach3-walk.ts, run individually, per-leg ok parsed — sweep-48/165 keying law; NW/NE/SW tools "
       "key distance not dist, sweep-54 keying class; JSON parsed from first brace behind the [physics] banner — "
       "in-tick self-catch on the core parse, corrected, disclosed; interior support-seam abstentions on "
       "dress/temple entities = known normalized diagnostic set, unchanged) | tier-2 154th cycle per committed "
       "sweep-175 pointer row-cottage 6/6 @ 0.3838 (interior-walk-row-cottage.ts) + observatory 5/5 @ 0.389 "
       "(struct2-walk-observatory.ts), both ALL_PASS real exit 0 | pins 15/15 ALL_PINS_OK (130th consecutive "
       "clean, struct18-fleet-pin-check.ts real exit 0), sweep89-battery 28/28 on fresh census-A bytes, interlane "
       "md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool self-verifies law() both sides, base "
       "2370768 re-read fresh pre-append, D+0/E+0), standing gate ALL PASS real exit 0 at tick-start 35847cab + "
       "RE-RUN ALL PASS real exit 0 at 5ece8e11 (TWO mid-tick sibling observer holds absorbed: survey-164 "
       "native-debt-retired + survey-165 hold, SURVEY-PLAN.md only, zero SWEEP paths, both census-confirm the "
       "quiet 319 epoch) | CLEAN SWEEP — R-121 open, known, no escalation due |\n")

s = s[:j] + '\n' + ROW.rstrip('\n') + s[j:]

PROSE = """
sweep-176: CLEAN SWEEP, fully quiet steady-state tick. Census 319==319 at
BOTH epochs (A/B 20s-paced, byte-identical raw sha16 9d6a3e8325b69027,
211652B) vs the committed baseline (319 ents, sha16 b52c0538d95606df —
the sweep-175 arrival-fold): zero arrivals, zero departures, zero field
diffs, zero lib flips on all 319 shared ids (281 thing + 38 light). The
compKeys parent+tris fetch shape persists (s148/s163 flap class) —
content compared on the 8 shared fields, all quiet. No snapshot rewrite
needed — baseline current, sweep-106/108/174 no-churn precedent.
Overlap: SAT fresh-live 281 bbox non-light / 236 classified / 0 coverage
holes, exit 3 on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard −0.407 — known Sev 2 routed to artwalk b26 choreography
@ sweep-43, 132nd sweep since routing, NOT new, no escalation due (law
keys severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS,
every leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW
5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts),
SW 5/5 @ 0.37 (sw-approach3-walk.ts); all four run individually, per-leg
ok parsed from the results list (sweep-48/165 keying law; NW/NE/SW tools
key `distance`, core keys `dist`). One in-tick probe self-catch,
disclosed: the first core-parse read from the file head and hit the
`[physics]` banner (sweep-175 self-catch (b) class, repeated) — re-parsed
from the first brace, 64/64 real. Interior support-seam abstentions on
dress/temple entities remain the known normalized diagnostic set,
unchanged. Tier-2 154th cycle per the committed sweep-175 pointer:
row-cottage 6/6 @ 0.3838 (interior-walk-row-cottage.ts) + observatory
5/5 @ 0.389 (struct2-walk-observatory.ts), both ALL_PASS real exit 0 —
the observatory leg is struct-family per the sweep-171 cycle's own
naming. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real
exit 0 (130th consecutive clean); sweep89-battery 28/28 ALL PASS exit 0
on fresh census-A bytes; interlane md5 f6254cd0 stable, read fresh.
Ledger law EXACT — canonical tool self-verifies law() before and after
append, base 2370768 re-read fresh immediately before append, D+0/E+0.
Standing gate ALL PASS real exit 0 at tick-start 35847cab; HEAD advanced
TWICE mid-tick (survey-164 @ bff67160 native-debt-retired, survey-165 @
5ece8e11 hold — sibling observer ticks touching SURVEY-PLAN.md only,
zero SWEEP paths, both census-confirm the quiet 319 epoch); epoch law
honored, gate RE-RUN ALL PASS real exit 0 at 5ece8e11 before the ledger
append. Zero world mutations, zero defect notes, zero uploads, zero
verbs, zero comp edits, zero shared-budget use. Next tier-2 pair
(sweep-177): hall + bunkhouse (155th cycle — LRU chain: @176
row-cottage/observatory, @175 inn/tower-house, @174 stable/market, @173
longhouse/garden-cottage, @172 hall/bunkhouse stalest standing pair at 4
sweeps; both walk tools verified present on disk this tick:
interior-walk-hall.ts, interior-walk-bunkhouse.ts).
"""

s = s.rstrip('\n') + '\n' + PROSE

open(P, 'w').write(s)
n_blocks = s.count('sweep-176: CLEAN SWEEP')
print(f'OK: row inserted after sweep-175 row; prose block appended; '
      f'sweep-176 prose blocks: {n_blocks}; bytes: {len(s)}')
assert n_blocks == 1
