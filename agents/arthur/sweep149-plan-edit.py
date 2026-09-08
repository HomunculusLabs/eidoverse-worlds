#!/usr/bin/env python3
"""sweep-149 plan edit: one history table row after the sweep-148 row
(line-anchored on its unique prefix) + one prose block appended at the
file tail. Asserts unique anchors before writing (plan-edit chassis law)."""

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW = ("| sweep-149 | 2026-09-08 | 312==312 fully quiet BOTH epochs (274 thing + 38 light; 0 arrivals, "
"0 departures, 0 drift on all 312 shared ids on id/pos/yaw/lib/scale/kind/bbox vs the committed "
"sweep-146-era baseline sha16 cd7dd2a21cd8327d; REPRESENTATION EPOCH #3: live /geom flipped BACK to the "
"sweep-147-era schema — tris/parent fields restored, compKeys dropped, mounts null→{} — epochs A/B "
"20s-paced byte-identical raw sha16 1c1337a9025c3117 which equals sweep-147's recorded raw sha (epoch-A "
"capture BYTE-IDENTICAL to sweep-147-raw 92218B by cmp; vs sweep-148's 6e90180315a0676d capture diffs "
"are exactly compKeys↔tris + mounts + entity order, comp VALUES and all canonical fields identical — "
"server-side schema flip-back, sibling server lane in flight, classified like-for-like per sweep-80 law, "
"no world change, no snapshot rewrite, baseline current) | exit 3 on ONLY known R-121 lamp-n\\|"
"nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 105th sweep since routing, no escalation due "
"— law keys Sev 1); 274 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the live set, "
"zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW "
"5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 127th cycle per committed pointer inn 6/6 @ 0.3640 "
"+ tower-house 6/6 @ 0.3765 ALL PASS | pins 15/15 ALL_PINS_OK 103rd consecutive, battery 28/28 exit 0 on "
"fresh census-B bytes, interlane f6254cd0 stable read fresh, ledger law EXACT (tool self-verifies "
"pre/post append) D+0/E+0, gate ALL PASS real exit 0 at tick-start c2f569e8 + re-run ALL PASS exit 0 at "
"0bb00948 post-interleave (survey-103 read-only hold), both from repo ROOT | CLEAN SWEEP — R-121 open, "
"known, no escalation due |\n")

anchor = '| sweep-148 | 2026-09-08 | 312==312 fully quiet BOTH epochs'
assert s.count(anchor) == 1, f'table anchor count {s.count(anchor)}'
i = s.index(anchor)
j = s.index('\n', i) + 1
s = s[:j] + ROW + s[j:]

PROSE = """
sweep-149: CLEAN SWEEP, fully quiet steady-state tick. Census 312==312 at
both epochs (274 thing + 38 light) vs the committed baseline (sha16
cd7dd2a21cd8327d): 0 arrivals, 0 departures, 0 drift on all 312 shared
ids across id/pos/yaw/lib/scale/kind/bbox. REPRESENTATION EPOCH #3
(noted, classified, no world change): live /geom flipped BACK to the
sweep-147-era schema — tris/parent fields restored on all 274 things
(93592 tris on the carousel), compKeys dropped, mounts null→{} — so the
epoch raw sha16 is again 1c1337a9025c3117 (equals sweep-147's recorded
raw sha; the epoch-A capture is BYTE-IDENTICAL to sweep-147-raw by cmp,
92218B). Against sweep-148's 6e90180315a0676d capture the full-field
diffs are exactly compKeys↔tris + mounts representation + entity order;
comp VALUES and all canonical fields are identical on every shared id.
Classified as a server-side schema flip-back (sibling server lane in
flight — server.ts/world.ts sit dirty in the worktree), compared
like-for-like on canonical fields per the sweep-80 law, no snapshot
rewrite (baseline current, sweep-106..148 precedent). Overlap: SAT fresh
over the live set — 274 bbox non-light, 236 classified, 0 coverage
holes, exit 3 on exactly ONE unclassified = R-121 lamp-n | nx-town-
mapboard −0.407, known Sev 2 routed to artwalk b26 choreography @
sweep-43, one-hundred-and-fifth sweep since routing, NOT new, no
escalation due (law keys severity-1). Walks: tier-1 4/4 per-leg verified
81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7
@ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts).
Tier-2 127th cycle per the committed pointer: inn 6/6 @ 0.3640
(interior-walk-inn.ts) + tower-house 6/6 @ 0.3765
(interior-walk-tower-house.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (103rd
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-B bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT — base re-read fresh immediately before append, D+0/E+0. Standing
gate ALL PASS real exit 0 at tick-start c2f569e8, re-run ALL PASS exit 0
at 0bb00948 post-interleave (survey-103 read-only D+0/E+0 hold), both
runs from repo ROOT. Zero world mutations, zero defect notes, zero
uploads, zero verbs, zero comp edits, zero shared-budget use (D+0, E+0).
Next tier-2 pair (sweep-150): forge + potter (128th cycle — LRU chain:
@149 inn/tower-house, @148 stable/market, @147 longhouse/garden-cottage,
@146 hall/bunkhouse; forge and potter both last walked sweep-143, now
the stalest standing pair by committed-table derivation; both walk tools
verified present on disk this tick: interior-walk-forge.ts,
interior-walk-potter.ts).
"""

assert s.count('sweep-149: CLEAN SWEEP') == 0, 'prose already present'
assert s.rstrip().endswith('interior-walk-tower-house.ts).'), f'unexpected tail: {s[-120:]!r}'
s = s.rstrip() + '\n' + PROSE

open(P, 'w').write(s)
print('plan edit applied')
print('new size:', len(s))
assert 'sweep-149: CLEAN SWEEP' in open(P).read()
print('verified: sweep-149 prose present')
