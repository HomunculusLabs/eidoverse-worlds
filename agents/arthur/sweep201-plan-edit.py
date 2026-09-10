#!/usr/bin/env python3
"""sweep-201 plan edit: append narrative block after the sweep-200 block (EOF,
narrative-only convention since sweep-199). Unique-anchor asserts gate the
write (plan-ledger chassis law); post-write verification gates the commit."""
import sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

# sweep-200's narrative block terminates the file (verified this tick by
# read_file: lines 7712-7724). Append-to-EOF chassis: no mid-file insert, so
# the anchor law here = unique sweep-200 block + EOF-shape proof.
BLOCK = 'sweep-200: CLEAN SWEEP'
EOF_LINE = 'interior-walk-forge.ts, interior-walk-potter.ts).'
assert s.count(BLOCK) == 1, f'sweep-200 block not unique: {s.count(BLOCK)}'
assert s.rstrip('\n').endswith(EOF_LINE), 'file does not end on sweep-200 pointer — re-derive'
assert 'sweep-201:' not in s, 'sweep-201 already recorded'

narr = '''

sweep-201: CLEAN SWEEP fully quiet steady-state tick, no snapshot rewrite.
Census 323==323, quiet verified across BOTH representations this tick:
projection epochs A/B (20s-paced, next-live-census.ts chassis) BYTE-IDENTICAL
214035B sha16 ed5856e6ef4abd37 — byte-identical to the survey-231/232/233
certified post-enneper baseline; AND raw curl-class fetch (UA arthur-sweep201)
95543B BYTE-IDENTICAL to sweep-200's surviving epoch-B capture by direct cmp
(the +10B vs the sweep-193..198 95533B representation is sweep-199's own
classified enneper flip, sweep-159 class, resolved by byte-compare BEFORE any
verdict): 0 arrivals, 0 departures, 0 field diffs, 0 lib flips, 0 compKeys
drift (285 thing + 38 light). Baseline 29f0c652df402f01 current, no rewrite
(no-churn precedent — field-equal to live on every compared field).
Overlap: SAT fresh-live 285 bbox non-light / 236 classified / 0 coverage
holes, real exit 3 un-piped on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard -0.407 — known Sev 2 routed to artwalk b26 choreography
@ sweep-43, 157th sweep since routing, NOT new, no escalation due (law keys
severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg
real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5 @ 0.38
(nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37
(sw-approach3-walk.ts). Tier-2 179th cycle per the committed sweep-200
pointer: forge 6/6 @ 0.3750 (interior-walk-forge.ts) + potter 6/6 @ 0.3660
(interior-walk-potter.ts), both ALL_PASS real exit 0 — both match the
sweep-197 records for the pair. Integrity: struct18-fleet-pin-check 15/15
ALL_PINS_OK (155th consecutive clean); sweep89-battery 28/28 ALL PASS exit 0
on fresh census-A bytes; interlane md5 f6254cd0 stable, read fresh; ledger
law EXACT base 2370773 re-read fresh immediately before append, D+0/E+0,
tool self-verifies law() pre and post append. Standing gate ALL PASS real
exit 0 at tick-start ffa47eb0 run 1 (own survey-233 tip); HEAD advanced
twice mid-tick (survey-234 @ 54fb6103, survey-235 @ e79ace9d — observer
holds, zero world mutations per their own entries, both census-corroborated
by my own byte-identical epochs); epoch law honored, gate RE-RUN ALL PASS
real exit 0 at e79ace9d before the ledger append. Probe self-catches this
tick, all pre-verdict, disclosed: (a) first tier-1 walk batch timed out at
the 420s wrapper with all four logs complete on disk — wrapper timeout
classified, verdicts taken from per-file real exit + JSON status fields,
each tool re-verified by log-size + ALL_PASS string, forge/potter re-run
individually; (b) first walk-parse keyed per-leg 'status' — wrong field
(legs carry ok:true; suites carry status), schema re-read from actual
output before any verdict (sweep-195 class); (c) grep -c 'sweep-201' on the
ledger returned 1 pre-append — matched sweep-200's PROSE naming the next
pair, not a tag entry; re-checked with '^- [sweep-201]' anchored count = 0
(tag-race check passed on the anchored form). Diff tool folded:
sweep201-census-diff.py authored fresh from the committed sweep200 chassis
verbatim (sed swap only, asserted: 3 refs forward, 0 stale). Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp edits,
zero shared-budget use. Next tier-2 pair (sweep-202): hall + bunkhouse
(180th cycle — LRU chain re-derived from ledger tier-2 fragments this
tick: inn / tower-house @200, row-cottage / observatory @199, longhouse /
garden-cottage @198, forge / potter @201, stable / market @196, hall /
bunkhouse @195 stalest standing pair at 5 sweeps; both walk tools verified
present on disk this tick: interior-walk-hall.ts, interior-walk-bunkhouse.ts).'''

open(P, 'a').write(narr)

v = open(P).read()
assert v.count('sweep-201: CLEAN SWEEP') == 1
assert v.rstrip('\n').endswith('interior-walk-bunkhouse.ts).')
delta = len(v) - len(s)
assert 0 < delta < 8000, f'plan grew {delta}B — per-tick cap law'
assert v.count(BLOCK) == 1, 'sweep-200 block duplicated by append'
print(f'plan edit OK: +{delta}B, sweep-201 narrative present at EOF')
