#!/usr/bin/env python3
"""sweep-150 plan edit: one history table row after the sweep-149 row
(line-anchored on its unique prefix) + one prose block appended at the
file tail. Asserts unique anchors before writing (plan-edit chassis law)."""

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW = ("| sweep-150 | 2026-09-08 | 312==312 fully quiet BOTH epochs (274 thing + 38 light; 0 arrivals, "
"0 departures, 0 drift on all 312 shared ids on id/pos/yaw/lib/scale/kind/bbox vs the committed "
"sweep-146-era baseline sha16 cd7dd2a21cd8327d; REPRESENTATION EPOCH #4: schema flipped back to the "
"sweep-148-era compKeys representation — raw sha16 6e90180315a0676d equals sweep-148's recorded raw, "
"compKeys on all 312 entities, zero tris on things, canonical fields identical proven by the "
"zero-diff — same server-lane flap class as #2/#3, no world change, no snapshot rewrite, baseline "
"current; epochs A/B 20s-paced BYTE-IDENTICAL single stable epoch; mid-tick HEAD advance survey-106 "
"0add15b4 read-only D+0/E+0 hold corroborates quiet) | exit 3 on ONLY known R-121 lamp-n\\|"
"nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 106th sweep since routing, no escalation due "
"— law keys Sev 1); 274 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the live set, "
"zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW "
"5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 128th cycle per committed pointer forge 6/6 @ 0.375 "
"+ potter 6/6 @ 0.366 ALL PASS | pins 15/15 ALL_PINS_OK 104th consecutive, battery 28/28 exit 0 on "
"fresh census-A bytes, interlane f6254cd0 stable read fresh, ledger law EXACT (tool self-verifies "
"pre/post append) D+0/E+0, gate ALL PASS real exit 0 at tick-start eb525201 + re-run ALL PASS exit 0 at "
"0add15b4 post-interleave (survey-106 read-only hold), both from repo ROOT | CLEAN SWEEP — R-121 open, "
"known, no escalation due |\n")

anchor = '| sweep-149 | 2026-09-08 | 312==312 fully quiet BOTH epochs'
assert s.count(anchor) == 1, f'table anchor count {s.count(anchor)}'
i = s.index(anchor)
j = s.index('\n', i) + 1
s = s[:j] + ROW + s[j:]

PROSE = """
sweep-150: CLEAN SWEEP, fully quiet steady-state tick. Census 312==312 at
both epochs (274 thing + 38 light) vs the committed baseline (sha16
cd7dd2a21cd8327d): 0 arrivals, 0 departures, 0 drift on all 312 shared
ids across id/pos/yaw/lib/scale/kind/bbox; epochs A and B (20s-paced)
byte-identical, raw sha16 6e90180315a0676d. REPRESENTATION EPOCH #4
(noted, classified, no world change): the /geom schema flipped back to
the sweep-148-era compKeys representation — compKeys on all 312
entities, no tris on things — so the raw sha equals sweep-148's recorded
raw while sweep-149's was 1c1337a9025c3117 (tris-era). Canonical fields
proven identical by the zero-diff against the committed baseline; same
server-lane flap class as representation epochs #2/#3, compared
like-for-like per the sweep-80 law, no snapshot rewrite (baseline
current, sweep-106..149 precedent). Mid-tick HEAD advance survey-106
(0add15b4, read-only D+0/E+0 hold) corroborates the quiet epoch. Overlap:
SAT fresh over the live set — 274 bbox non-light, 236 classified, 0
coverage holes, exit 3 on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard −0.407, known Sev 2 routed to artwalk b26 choreography @
sweep-43, one-hundred-and-sixth sweep since routing, NOT new, no
escalation due (law keys severity-1). Walks: tier-1 4/4 per-leg verified
81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7
@ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts).
Tier-2 128th cycle per the committed pointer: forge 6/6 @ 0.375
(interior-walk-forge.ts) + potter 6/6 @ 0.366 (interior-walk-potter.ts),
both real exit 0. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK
real exit 0 (104th consecutive clean); sweep89-battery 28/28 ALL PASS
exit 0 on fresh census-A bytes; interlane md5 f6254cd0 stable, read
fresh. Ledger law EXACT — tool self-verifies law() before and after
append, D+0/E+0. Standing gate ALL PASS real exit 0 at tick-start
eb525201, re-run ALL PASS exit 0 at 0add15b4 post-interleave (survey-106
read-only D+0/E+0 hold), both runs from repo ROOT. Zero world mutations,
zero defect notes, zero uploads, zero verbs, zero comp edits, zero
shared-budget use (D+0, E+0). Next tier-2 pair (sweep-151): hall +
bunkhouse (129th cycle — LRU chain: @150 forge/potter, @149
inn/tower-house, @148 stable/market, @147 longhouse/garden-cottage,
@146 hall/bunkhouse; hall and bunkhouse both last walked sweep-146, now
the stalest standing pair by committed-table derivation; both walk tools
verified present on disk this tick: interior-walk-hall.ts,
interior-walk-bunkhouse.ts).
"""

assert s.count('sweep-150: CLEAN SWEEP') == 0, 'prose already present'
assert s.rstrip().endswith('interior-walk-potter.ts).'), f'unexpected tail: {s[-120:]!r}'
s = s.rstrip() + '\n' + PROSE
open(P, 'w').write(s)
print('written; bytes:', len(s))
