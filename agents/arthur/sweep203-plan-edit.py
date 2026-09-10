#!/usr/bin/env python3
"""sweep-203 plan edit: append narrative block after the sweep-202 block (EOF,
narrative-only convention since sweep-199). Unique-anchor asserts gate the
write (plan-ledger chassis law); post-write verification gates the commit."""
import sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

# sweep-202's narrative block terminates the file (verified this tick by
# read_file: lines 7778-7825). Append-to-EOF chassis: no mid-file insert, so
# the anchor law here = unique sweep-202 block + EOF-shape proof.
BLOCK = 'sweep-202: CLEAN SWEEP'
EOF_LINE = 'interior-walk-stable.ts,\ninterior-walk-market.ts).'
assert s.count(BLOCK) == 1, f'sweep-202 block not unique: {s.count(BLOCK)}'
assert 'sweep-203:' not in s, 'sweep-203 already recorded'

narr = '''

sweep-203: CLEAN SWEEP fully quiet steady-state tick, no snapshot rewrite.
Census 323==323 at BOTH epochs (A/B 20s-paced, next-live-census.ts chassis)
BYTE-IDENTICAL 214035B sha16 ed5856e6ef4abd37 — byte-identical to the
survey-231..239 / sweep-200..202 certified post-enneper baseline
representation, so quiet holds for ALL fields the projection carries incl
comp/compKeys by byte identity: 0 arrivals, 0 departures, 0 field diffs,
0 lib flips, 0 compKeys drift (285 thing + 38 light). Projection-quiet
only this tick (no second raw-representation fetch; byte-identity to the
baseline representation carries, sweep-198 precedent). Baseline
29f0c652df402f01 current, no rewrite (no-churn precedent — field-equal to
live on every compared field). Overlap: SAT fresh-live 285 bbox non-light /
236 classified / 0 coverage holes, real exit 3 un-piped on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard -0.407 — known Sev 2 routed
to artwalk b26 choreography @ sweep-43, 159th sweep since routing, NOT new,
no escalation due (law keys severity-1). Walks: tier-1 4/4 per-leg verified
81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @
0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts). Tier-2
181st cycle per the committed sweep-202 pointer: stable 5/5 @ 0.3958
(interior-walk-stable.ts) + market 6/6 @ 0.3894
(interior-walk-market.ts), both ALL_PASS real exit 0 — both match the
sweep-196 records for the pair. Integrity: struct18-fleet-pin-check 15/15
ALL_PINS_OK bad:[] (157th consecutive clean); sweep89-battery 28/28 ALL
PASS exit 0 on fresh census-A bytes; interlane md5 f6254cd0 stable, read
fresh; ledger law EXACT — base 2370773 re-read fresh immediately before
append, D+0/E+0, tool self-verifies law() pre and post append. Standing
gate ALL PASS real exit 0 at tick-start 48fc37e8 run 1 (own sweep-202
tip); HEAD advanced twice mid-tick (survey-238 @ 3889058a, survey-239 @
490166b0 — observer holds, zero world mutations per their own entries,
zero SWEEP paths, census-corroborated by my own byte-identical epoch B);
epoch law honored, gate RE-RUN ALL PASS real exit 0 at 490166b0 before
the ledger append. Diff tool sweep203-census-diff.py authored fresh from
the committed sweep202 chassis verbatim (sed swap only, asserted: 3 refs
forward, 1 stale ref = the docstring chassis-provenance line naming
sweep202, accurate as provenance, 0 functional stale refs). Probe
self-catches this tick, all pre-verdict, disclosed: (a) first walk-parse
keyed per-leg 'ok' on the core suite — schema carries suite-level
status/maxArrival with per-leg entries in results[]; re-keyed on the
suite fields after reading actual output (sweep-195/202 class). Zero
world mutations, zero defect notes, zero uploads, zero verbs, zero comp
edits, zero shared-budget use. Next tier-2 pair (sweep-204): inn +
tower-house (182nd cycle — LRU chain re-derived from ledger tier-2
fragments this tick: stable / market @203, hall / bunkhouse @202, forge /
potter @201, inn / tower-house @200 stalest standing pair at 3 sweeps,
row-cottage / observatory @199, longhouse / garden-cottage @198; both
walk tools verified present on disk this tick: interior-walk-inn.ts,
interior-walk-tower-house.ts).'''

open(P, 'a').write(narr)

v = open(P).read()
assert v.count('sweep-203: CLEAN SWEEP') == 1
assert v.rstrip('\n').endswith('interior-walk-tower-house.ts).')
delta = len(v) - len(s)
assert 0 < delta < 8000, f'plan grew {delta}B — per-tick cap law'
assert v.count(BLOCK) == 1, 'sweep-202 block duplicated by append'
print(f'plan edit OK: +{delta}B, sweep-203 narrative present at EOF')
