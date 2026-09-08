#!/usr/bin/env python3
"""sweep-136 plan edit: history row after the sweep-135 row + prose block at EOF.
Asserted unique anchors; verifies block structure after write.
Arrival tick: 306==307 via struct-107 dodecahedron placement (ledger-backed,
mid-tick, domain-valid); snapshot rewritten 307/121148B/sha16 0fd137c936560a28.
"""
P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P, encoding='utf-8').read()

ROW = ("| sweep-136 | 2026-09-08 | 306→307 (269 thing + 38 light) across epochs A→C: epoch A "
"fully quiet 306==306 vs baseline c1514c2339552894 raw sha16 4ac1f73a02f71ec4; epochs B/C "
"20s-paced identical at 307 — exactly ONE arrival nx-struct-dodecahedron @ (−7.67,−0.0289,109.73) "
"yaw π lib 671b99124ba55182 comp {} = struct-107 @ 11920ec7 committed mid-tick, tuple matches its "
"ledger line line-for-line (pos/yaw/lib/comps, census 306→307 per its own entry; live lib 671b… is "
"the v2c night-bead-cure rebuild its entry names, not the build-only e30b… sha), 0 departures, 0 "
"drift on 306 shared ids across id/pos/yaw/lib/scale/kind/bbox; survey-78 @ d2e5335b read-only "
"observer interleave absorbed; snapshot rewritten 307/121148B/sha16 0fd137c936560a28 sweep-132 "
"chassis, post-rewrite drift ZERO | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard −0.407 "
"(Sev 2 artwalk-routed @ sweep-43, 92nd sweep since routing, no escalation due — law keys Sev 1); "
"269 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the arrival-inclusive live "
"set, dodecahedron SAT-clean, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real "
"exit 0 each (core 64/64 @ 0.38 maxDist, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; composite "
"walk batch hit the 420s tool timeout AFTER all four tools completed — logs parsed per-tool schema, "
"no re-run needed, sweep-135 disclosed class) + tier-2 114th cycle per committed pointer hall 8/8 "
"@ 0.36 + bunkhouse 6/6 @ 0.3803 ALL PASS | pins 15/15 ALL_PINS_OK 90th consecutive, battery 28/28 "
"exit 0 on fresh census-C bytes (comp-bearing 21, 38 lights), interlane f6254cd0 stable read fresh, "
"ledger law EXACT 2370753 base re-read fresh pre-append (struct-107 D+1 + survey-78 D+0 absorbed "
"mid-tick), gate ALL PASS real exit 0 at tick-start 3fb49918 + re-run at d2e5335b post-interleave, "
"both from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |\n")

PROSE = """
sweep-136: CLEAN SWEEP, arrival tick. Census 306==307 (269 thing + 38
light) vs the committed sweep-132 baseline (sha16 c1514c2339552894):
epoch A fully quiet (306==306, raw sha16 4ac1f73a02f71ec4 identical),
epochs B and C (20s-paced re-reads) identical at 307 with exactly ONE
arrival -- nx-struct-dodecahedron @ (-7.67, -0.028895, 109.73) yaw pi,
lib 671b99124ba55182, scale 1, comp {}, bbox 5.99x5.739x6.298 -- and
ZERO drift on all 306 shared ids across id/pos/yaw/lib/scale/kind/bbox.
The arrival is struct-107 @ 11920ec7, committed mid-tick: its ledger
line matches the observed tuple line-for-line (same pos/yaw/lib/comps,
census 306->307 per its own entry). The live lib (671b...) differs from
struct-106's build-only sha (e30b...) exactly as its pinned
placement-tick contract allowed: v2c night-bead-cure rebuild, named in
its own entry -- not drift. survey-78 @ d2e5335b read-only observer
interleave absorbed (its own census corroborates 306 pre-arrival).
Snapshot rewritten per the sweep-132 chassis: 307 entities, 121148
bytes, sha16 0fd137c936560a28, post-rewrite drift vs live ZERO
(307/307 exact). Overlap: SAT fresh over the arrival-inclusive live
set -- 269 bbox non-light, 236 classified, 0 coverage holes, exit 3 on
exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard -0.407 --
known Sev 2 routed to artwalk b26 choreography @ sweep-43, ninety-second
sweep since routing, NOT new, no escalation due (law keys severity-1);
the dodecahedron itself is SAT-clean (corroborating struct-107's own
+2.61 film-guarded adjacency law), zero new contacts. Tier-1 4/4
per-leg verified 81/81 ALL_PASS, every leg real exit 0: core 64/64 @
0.38 maxDist (next-walk-core-paths.ts), NW 5/5 @ 0.38
(nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @
0.37 (sw-approach3-walk.ts). Tier-2 114th cycle per the committed
pointer: hall 8/8 @ 0.36 (interior-walk-hall.ts) + bunkhouse 6/6 @
0.3803 (interior-walk-bunkhouse.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (90th
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-C bytes (comp-bearing 21, 38 lights); interlane md5 f6254cd0
stable, read fresh. Ledger law EXACT -- base re-read fresh immediately
before append, 2370753 (struct-107's D+1 and survey-78's D+0 absorbed
mid-tick), D+0/E+0. Standing gate ALL PASS real exit 0 at tick-start
3fb49918, re-run ALL PASS exit 0 at d2e5335b post-interleave, both from
repo ROOT. Probe self-caught pre-verdict, disclosed (sweep-133/135
per-tool schema class): the walk-parse probe first keyed `distance`
where the core tool emits `dist` -- maxDist printed -1 until
re-anchored on the actual row schema and re-parsed; all four walk tools
had already exited 0 with ALL_PASS printed in their own output, no
re-run needed. Composite walk batch hit the 420s tool-layer timeout
AFTER all four tools completed (logs present, parsed) -- the 3-call
split shape remains the standing law for future ticks. Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp
edits, zero shared-budget use (D+0, E+0). Next tier-2 pair
(sweep-137): longhouse + garden-cottage (115th cycle -- LRU chain:
@136 hall/bunkhouse, @135 inn/tower-house, @134 forge/potter, @133
row-cottage/market, @132 stable/observatory, @131
longhouse/garden-cottage -- longhouse and garden-cottage both last
walked sweep-131, now the stalest standing pair; both walk tools
verified present on disk this tick: interior-walk-longhouse.ts,
interior-walk-garden-cottage.ts).
"""

# --- asserted unique anchors ---
a1 = s.count('| sweep-135 | 2026-09-08 | 306==306 steady state (268 thing + 38 light; 0 arrivals, 0 ')
assert a1 == 1, f'row anchor not unique: {a1}'
anchor = next(line for line in s.splitlines() if line.startswith('| sweep-135 |'))
assert s.count(anchor) == 1
i = s.index(anchor) + len(anchor)

s2 = s[:i] + '\n' + ROW + s[i:]
assert s2.count('| sweep-136 |') == 1

s3 = s2.rstrip('\n') + '\n' + PROSE
assert s3.count('sweep-136: CLEAN SWEEP') == 1
assert s3.count('(sweep-137): longhouse + garden-cottage') == 1

open(P, 'w', encoding='utf-8').write(s3)
print('WROTE row+prose; new size', len(s3))
print('rows now:', sum(1 for l in s3.splitlines() if l.startswith('| sweep-1')))
