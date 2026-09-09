#!/usr/bin/env python3
"""sweep-174 plan edits: history row after the sweep-173 row, prose block at
EOF. Anchored + asserted unique. Row anchor verified by grep pre-write.
Adapted verbatim from the committed sweep173-plan-edit.py."""
import sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW_ANCHOR = '| sweep-173 | 2026-09-09 |'
assert s.count(ROW_ANCHOR) == 1, f'row anchor not unique: {s.count(ROW_ANCHOR)}'
assert s.count('sweep-174: CLEAN SWEEP') == 0, 'prose anchor already present'

i = s.index(ROW_ANCHOR)
j = s.index('\n', i)

ROW = ("| sweep-174 | 2026-09-09 | 318==318 fully quiet both epochs (A/B 20s-paced) vs committed baseline "
       "318 ents / sha16 a1fc3ef2938810a0: 0 arrivals, 0 departures, 0 field diffs, 0 lib flips on all 318 "
       "shared ids (280 thing + 38 light; epoch-A raw capture BYTE-IDENTICAL to the survey-159 capture "
       "(md5 c6109787), 94118B parent+tris schema shape, s152/s154 precedent, raw sha16 6a789d2e4d07e766 "
       "A/B byte-stable; world byte-quiet across ten consecutive survey ticks s151-s159 + this sweep; no "
       "snapshot rewrite needed, baseline current, sweep-106/108 no-churn precedent) | SAT fresh-live 280 "
       "bbox non-light / 236 classified / 0 coverage holes / exit 3 on ONLY known R-121 lamp-n\\|"
       "nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 130th sweep since routing, not new, no "
       "escalation due — law keys Sev 1) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each "
       "(core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 "
       "ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts, run individually, per-leg ok parsed "
       "from the results list — sweep-48/165 keying law; interior support-seam abstentions on "
       "dress/temple entities = known normalized diagnostic set, unchanged); tier-2 152nd cycle per "
       "committed sweep-173 pointer stable 5/5 @ 0.3958 (interior-walk-stable.ts) + market 6/6 @ 0.3894 "
       "(interior-walk-market.ts), both ALL_PASS real exit 0 | pins 15/15 ALL_PINS_OK (128th consecutive "
       "clean, struct18-fleet-pin-check.ts real exit 0), sweep89-battery 28/28 on fresh census-A bytes, "
       "interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool self-verifies law() "
       "both sides, base 2370765 re-read fresh pre-append → 2370767 post-append absorbing ONE mid-tick "
       "sibling struct-128 append, D+0/E+0), standing gate ALL PASS real exit 0 at tick-start ba1e530c "
       "(survey-159 absorbed, 99 PASS lines; struct-128 sibling appended mid-tick, prefix-disjoint, "
       "siting blocked fail-closed per its entry, unspawned — consistent with this tick's 0 arrivals) | "
       "CLEAN SWEEP — R-121 open, known, no escalation due |\n")

s = s[:j] + '\n' + ROW.rstrip('\n') + s[j:]

PROSE = """
sweep-174: CLEAN SWEEP, fully quiet steady-state tick. Census 318==318 at
BOTH epochs (A/B 20s-paced) vs the committed baseline (318 ents, sha16
a1fc3ef2938810a0): zero arrivals, zero departures, zero field diffs
(pos/yaw/scale/kind/bbox), zero lib flips. Epoch-A raw capture is
BYTE-IDENTICAL to the survey-159 capture (md5 c6109787) — parent+tris
schema shape (s152/s154 precedent), A/B byte-identical; the world has been
byte-quiet across ten consecutive survey ticks s151-s159 plus this sweep.
No snapshot rewrite needed — baseline current, sweep-106/108 no-churn
precedent. Overlap: SAT fresh-live 280 bbox non-light / 236 classified /
0 coverage holes, exit 3 on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard −0.407 — known Sev 2 routed to artwalk b26 choreography
@ sweep-43, 130th sweep since routing, NOT new, no escalation due (law
keys severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every
leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5 @
0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5
@ 0.37 (sw-approach3-walk.ts); all four run individually, per-leg ok
parsed from the results list (sweep-48/165 keying law). Tier-2 152nd cycle
per the committed sweep-173 pointer: stable 5/5 @ 0.3958
(interior-walk-stable.ts) + market 6/6 @ 0.3894
(interior-walk-market.ts), both ALL_PASS real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (128th consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census-A bytes;
interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT — canonical
tool self-verifies law() before and after append, base 2370765 re-read
fresh immediately before append → 2370767 after (ONE mid-tick sibling
struct-128 append absorbed, prefix-disjoint; its entry records
built+accepted with siting blocked fail-closed, unspawned — consistent
with this tick's zero arrivals). Standing gate ALL PASS real exit 0 at
tick-start ba1e530c (survey-159 absorbed, 99 PASS lines); HEAD static
through this tick's verification phase; pre-commit re-gate below. Zero
world mutations, zero defect notes, zero uploads, zero verbs, zero comp
edits, zero shared-budget use. Next tier-2 pair (sweep-175): inn +
tower-house (153rd cycle — LRU chain: @174 stable/market, @173
longhouse/garden-cottage, @172 hall/bunkhouse, @171
row-cottage/observatory, @170 inn/tower-house stalest standing pair at 5
sweeps; both walk tools verified present on disk this tick:
interior-walk-inn.ts, interior-walk-tower-house.ts).
"""

s = s.rstrip('\n') + '\n' + PROSE

open(P, 'w').write(s)
n_blocks = s.count('sweep-174: CLEAN SWEEP')
print(f'OK: row inserted after sweep-173 row; prose block appended; '
      f'sweep-174 prose blocks: {n_blocks}; bytes: {len(s)}')
assert n_blocks == 1
