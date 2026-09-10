#!/usr/bin/env python3
"""sweep-198 plan edit: insert history table row + append narrative block.
Unique-anchor asserts gate the write (plan-ledger chassis law)."""
import re, sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW_ANCHOR = 'survey-223 @ a3b01b87, survey-224 @ 06703762, survey-225 @ fabfd8ec observer holds, zero world mutations, census-corroborated byte-identical epoch B) | CLEAN SWEEP — R-121 open, known, no escalation due |'
NARR_TAIL = 'interior-walk-longhouse.ts, interior-walk-garden-cottage.ts).'

assert s.count(ROW_ANCHOR) == 1, f'row anchor not unique: {s.count(ROW_ANCHOR)}'
assert 'sweep-198:' not in s, 'sweep-198 already recorded'
# narrative insertion point: the file's final narrative IS sweep-197's;
# anchor by position (tail-append), asserted rather than guessed unique
# (the closing tools phrase recurs 7x across LRU chains — pitfall-6 class)
assert s.rstrip('\n').endswith(NARR_TAIL), 'file tail is not sweep-197 narrative close'

row = ('\n| sweep-198 | 2026-09-10 | 323==323 fully quiet, BOTH epochs (285 thing + 38 light; '
'A/B 20s-paced curl-class fetches BYTE-IDENTICAL 95533B '
'sha16 e7ea4e99bc2b2add — byte-identical to the sweep-193 baseline-generating live '
'bytes, quiet holds for ALL fields incl comp/compKeys by byte identity; '
'0 arrivals, 0 departures, 0 field diffs, 0 lib flips, 0 compKeys drift; '
'baseline fd2ff862683314c3 current, no rewrite — no-churn precedent) | exit 3 '
'on ONLY known R-121 lamp-n\\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed '
'@ sweep-43, 154th sweep since routing, no escalation due — law keys Sev 1); '
'285 bbox non-light / 236 classified / 0 coverage holes | tier-1 4/4 per-leg '
'verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, '
'NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 176th cycle longhouse 6/6 @ 0.3456 + '
'garden-cottage 6/6 @ 0.3550 ALL PASS | pins 15/15 ALL_PINS_OK (152nd consecutive '
'clean), sweep89-battery 28/28 ALL PASS on fresh census-A bytes, interlane md5 '
'f6254cd0 stable, ledger law EXACT 2370773 at append, standing gate ALL PASS '
'real exit 0 at tick-start 2b54af0f run 1 + RE-RUN ALL PASS real exit 0 at '
'90f0ec28 after TWO mid-tick HEAD advances (survey-226 @ fbf7e918 pass-through '
'inside struct-139 window, survey-227 @ 90f0ec28 observer holds + struct-139 @ '
'fbf7e918 enneper v3b banked-not-placed zero world mutation — all census-corroborated '
'by my own byte-identical epoch B) | CLEAN SWEEP — R-121 open, known, no escalation due |')

narr = ('\n\nsweep-198: CLEAN SWEEP fully quiet steady-state tick — census '
'323==323 at BOTH epochs (A/B 20s-paced, curl-class fetches '
'BYTE-IDENTICAL 95533B sha16 e7ea4e99bc2b2add — byte-identical to the '
'sweep-193 baseline-generating live bytes, so quiet holds for ALL fields '
'incl comp/compKeys by byte identity): 0 arrivals, 0 departures, '
'0 field diffs, 0 lib flips, 0 compKeys drift (285 thing + 38 light). '
'Baseline fd2ff862683314c3 current, no rewrite (no-churn precedent). '
'Overlap: SAT fresh-live 285 bbox non-light / 236 classified / 0 coverage '
'holes, real exit 3 un-piped on exactly ONE unclassified = R-121 lamp-n | '
'nx-town-mapboard −0.407 — known Sev 2 routed to artwalk b26 choreography '
'@ sweep-43, 154th sweep since routing, NOT new, no escalation due (law '
'keys severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, '
'every leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), '
'NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 '
'(ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts). Tier-2 '
'176th cycle per the committed sweep-197 pointer: longhouse 6/6 @ 0.3456 '
'(interior-walk-longhouse.ts) + garden-cottage 6/6 @ 0.3550 '
'(interior-walk-garden-cottage.ts), both ALL_PASS real exit 0 — both '
'match the sweep-3/sweep-192 records for the pair. Integrity: '
'struct18-fleet-pin-check 15/15 ALL_PINS_OK (152nd consecutive clean); '
'sweep89-battery 28/28 ALL PASS exit 0 on fresh census-A bytes; interlane '
'md5 f6254cd0 stable, read fresh twice; ledger law EXACT — base 2370773 '
're-read fresh immediately before append, D+0/E+0, tool self-verifies '
'law() pre and post append. Standing gate ALL PASS real exit 0 at '
'tick-start 2b54af0f run 1; HEAD advanced mid-tick (survey-227 @ '
'90f0ec28 observer hold, struct-139 @ fbf7e918 enneper v3b '
'banked-not-placed, zero world mutation; the struct-139 tip also carried '
'survey-226 pass-through reporting); epoch law honored, gate RE-RUN ALL '
'PASS real exit 0 at 90f0ec28 before the ledger append. Diff tool '
'folded: sweep198-census-diff.py authored fresh from the committed '
'sweep197 chassis verbatim (path+docstring swap only, swap asserted: 3 '
'refs forward, 0 stale). Probe self-catches this tick, all pre-verdict, '
'disclosed: (a) pins verdict first parsed with an assumed ok-as-list '
'schema — the tool reports ok as an int count; verdict re-confirmed from '
'raw output (ALL_PINS_OK, ok 15, bad []), sweep-195 class schema re-read; '
'(b) one diff-tool invocation lost its workdir to a parallel-call '
'artifact (wrong-cwd FileNotFoundError, sweep-197 ordering-slip class '
'kin) — re-run in the correct repo cwd, no verdict was written against '
'the missing epoch. Zero world mutations, zero defect notes, zero '
'uploads, zero verbs, zero comp edits, zero shared-budget use. Next '
'tier-2 pair (sweep-199): row-cottage + observatory (177th cycle — LRU '
'chain re-derived from ledger tier-2 fragments this tick: longhouse / '
'garden-cottage @198, forge / potter @197, stable / market @196, hall / '
'bunkhouse @195, inn / tower-house @194, row-cottage / observatory @193 '
'stalest standing pair at 5 sweeps; both walk tools verified present on '
'disk this tick: interior-walk-row-cottage.ts, struct2-walk-observatory.ts).')

i = s.index(ROW_ANCHOR) + len(ROW_ANCHOR)
s2 = s[:i] + row + s[i:]
s2 = s2.rstrip('\n') + '\n' + narr + '\n'

open(P, 'w').write(s2)
# post-write verification
v = open(P).read()
assert v.count('| sweep-198 |') == 1
assert v.count('sweep-198: CLEAN SWEEP') == 1
delta = len(v) - len(s)
assert 0 < delta < 8000, f'plan grew {delta}B — per-tick cap law'
print(f'plan edit OK: +{delta}B, sweep-198 row+narrative present')
