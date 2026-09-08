#!/usr/bin/env python3
"""sweep-135 plan edit: history row after the sweep-134 row + prose block at EOF.
Asserted unique anchors; verifies block structure after write.
Steady-state CLEAN tick: 306==306, 0/0/0 across epochs A/B/C, no snapshot rewrite.
"""
P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P, encoding='utf-8').read()

ROW = ("| sweep-135 | 2026-09-08 | 306==306 steady state (268 thing + 38 light; 0 arrivals, 0 "
"departures, 0 drift on all 306 shared ids across id/pos/yaw/lib/scale/kind/bbox vs the committed "
"sweep-132 baseline sha16 c1514c2339552894 — epochs A/B/C identical raw sha16 "
"4ac1f73a02f71ec4, single stable epoch; one sibling commit interleaved mid-tick: survey-77 "
"rotating district pass @ a90c2905, read-only observer per its own ledger line (plan files only), "
"zero world mutations, epoch C post-interleave census corroborates 306 unchanged; snapshot "
"byte-identical NO rewrite, sweep-106..134 precedent, 7-field projection law) | exit 3 on ONLY "
"known R-121 lamp-n\\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 91st sweep since "
"routing, no escalation due — law keys Sev 1); 268 bbox non-light / 236 classified / 0 coverage "
"holes, SAT fresh over the live set, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS "
"real exit 0 each (core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + "
"tier-2 113th cycle per committed pointer inn 6/6 @ 0.364 + tower-house 6/6 @ 0.3765 ALL PASS | "
"pins 15/15 ALL_PINS_OK 89th consecutive, battery 28/28 exit 0 (comp-bearing 21, 38 lights), "
"interlane f6254cd0 stable read fresh, ledger law EXACT 2370752 base re-read fresh pre-append "
"(ledger landed BEFORE the survey-77 interleave; base was quiet at append), gate ALL PASS real "
"exit 0 at tick-start bfbbe48f + re-run 98/0 at a90c2905 post-interleave, both from repo ROOT | "
"CLEAN SWEEP — R-121 open, known, no escalation due |\n")

PROSE = """
sweep-135: CLEAN SWEEP, steady-state tick. Census 306==306 (268 thing +
38 light) vs the committed sweep-132 baseline (sha16 c1514c2339552894):
0 arrivals, 0 departures, 0 drift on all 306 shared ids across
id/pos/yaw/lib/scale/kind/bbox -- epoch A fully quiet, epoch B (20s-paced
re-read) identical, epoch C (post-interleave) identical, raw sha16
4ac1f73a02f71ec4 all three; single stable epoch, no sibling mutated the
live world this window. HEAD advanced once mid-tick: survey-77 rotating
district pass @ a90c2905, read-only observer per its own ledger line
(IMPROVE-PLAN/SURVEY-PLAN/IMPROVEMENTS file writes only), zero world
mutations, epoch C corroborates; gate re-run ALL PASS real exit 0 (98/0)
at the new HEAD from repo ROOT. Ledger sequencing note: the sweep-135
append landed immediately BEFORE the survey-77 interleave (base re-read
fresh at append was quiet at 2370752); survey-77's own entry then
advanced the file under this tick's commit, absorbed normally per the
artwalk-34 interleave law -- verified the pair by grep after commit.
Snapshot byte-identical, NO rewrite (sweep-106..134 precedent; 7-field
projection law). Overlap: SAT fresh over the live set -- 268 bbox
non-light, 236 classified, 0 coverage holes, exit 3 on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard -0.407 -- known Sev 2
routed to artwalk b26 choreography @ sweep-43, ninety-first sweep since
routing, NOT new, no escalation due (law keys severity-1); zero new
contacts. Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real
exit 0: core 64/64 @ 0.38 maxArrival (next-walk-core-paths.ts), NW 5/5 @
0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW
5/5 @ 0.37 (sw-approach3-walk.ts). Tier-2 113th cycle per the committed
pointer: inn 6/6 @ 0.364 (interior-walk-inn.ts) + tower-house 6/6 @
0.3765 (interior-walk-tower-house.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (89th consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census bytes
(comp-bearing 21, 38 lights); interlane md5 f6254cd0 stable, read fresh.
Ledger law EXACT -- base re-read fresh immediately before append,
2370752, D+0/E+0. Standing gate ALL PASS real exit 0 at tick-start
bfbbe48f run from repo ROOT. Probe self-caught pre-verdict, disclosed
(sweep-126/133 per-tool schema class): the core-walk first parse
json.load'ed the whole file and died on the leading `[physics]` banner
line -- re-anchored on the first `{` brace-scan; the NW count-extract
grep keyed fields these tools do not emit -- re-derived from the JSON
itself (both walk tools had already exited 0 with ALL_PASS printed in
their own output; only the probes were wrong, no walk re-run needed).
Zero world mutations, zero defect notes, zero uploads, zero verbs, zero
comp edits, zero shared-budget use (D+0, E+0). Next tier-2 pair
(sweep-136): hall + bunkhouse (114th cycle -- LRU chain: @135
inn/tower-house, @134 forge/potter, @133 row-cottage/market, @132
stable/observatory, @131 longhouse/garden-cottage, @130 hall/bunkhouse
-- hall and bunkhouse both last walked sweep-130, now the stalest
standing pair; both walk tools verified present on disk this tick:
interior-walk-hall.ts, interior-walk-bunkhouse.ts).
"""

# --- asserted unique anchors ---
a1 = s.count('| sweep-134 | 2026-09-08 | 306==306 steady state (268 thing + 38 light; 0 arrivals, 0 ')
assert a1 == 1, f'row anchor not unique: {a1}'
anchor = next(line for line in s.splitlines() if line.startswith('| sweep-134 |'))
assert s.count(anchor) == 1
i = s.index(anchor) + len(anchor)

s2 = s[:i] + '\n' + ROW + s[i:]
assert s2.count('| sweep-135 |') == 1

s3 = s2.rstrip('\n') + '\n' + PROSE
assert s3.count('sweep-135: CLEAN SWEEP') == 1
assert s3.count('(sweep-136): hall + bunkhouse') == 1

open(P, 'w', encoding='utf-8').write(s3)
print('WROTE row+prose; new size', len(s3))
print('rows now:', sum(1 for l in s3.splitlines() if l.startswith('| sweep-1')))
