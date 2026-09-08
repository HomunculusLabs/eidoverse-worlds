#!/usr/bin/env python3
"""sweep-138 plan edit: history row after the sweep-137 row + prose block at EOF.
Asserted unique anchors; verifies block structure after write.
Arrival tick: 307→308 (sunflowerdial, struct-108), snapshot rewritten
121587B / sha16 491682d9a5c07a09.
"""
P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P, encoding='utf-8').read()

ROW = ("| sweep-138 | 2026-09-08 | 307→308 (270 thing + 38 light) across epochs A→C: epoch A fully quiet "
"307==307 raw sha16 084c22ed2a6b427d identical to sweep-137's close; epochs B/C 20s-paced settled at 308 with "
"exactly ONE domain-valid arrival nx-struct-sunflowerdial @ (2.48, 0.0189, 70.96) yaw π lib 3f271a10fff20cc1 "
"comp {} = struct-108 @ 1147cbda committed mid-tick, tuple matches its ledger line line-for-line; 0 departures, "
"0 drift on 307 shared ids; snapshot rewritten 121587B / 308 ents / sha16 491682d9a5c07a09, post-rewrite drift "
"ZERO | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 94th sweep "
"since routing, no escalation due — law keys Sev 1); SAT re-run at epoch B over arrival-inclusive set: 270 bbox "
"non-light / 236 classified / 0 coverage holes, zero new contacts, sunflowerdial SAT-clean (corroborates "
"struct-108's own +1.78 needlerest) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ "
"0.38 maxDist, NW 5/5 @ 0.38, NE 7/7 @ 0.38 — first run printed complete ALL_PASS JSON 7/7 but exited 124 = "
"post-verdict open-handle timeout kill, one paced re-run returned real exit 0, SW 5/5 @ 0.37; arrival r71 S "
"51m+ off every walked leg, walks stand by construction, sweep-53/136 precedent) + tier-2 116th per committed "
"pointer stable 5/5 @ 0.396 + observatory 5/5 @ 0.389 ALL PASS | pins 15/15 ALL_PINS_OK 92nd consecutive; "
"battery 28/28 on fresh census-A bytes; interlane f6254cd0 stable read fresh; ledger law EXACT 2370754 base "
"re-read fresh pre-append (struct-108 D+1 absorbed); gate ALL PASS real exit 0 at tick-start 49bd330c + re-run "
"at 1147cbda post-evidence from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |\n")

PROSE = """
sweep-138: CLEAN SWEEP, arrival + epoch-correction tick. Census epoch A fully
quiet (307==307 vs the committed sweep-137 baseline sha16 0fd137c936560a28,
raw sha16 084c22ed2a6b427d identical, no sibling had mutated when the tick
opened). Epoch B (20s-paced re-read) caught exactly ONE arrival —
nx-struct-sunflowerdial @ (2.48, 0.0189333, 70.96) yaw pi, lib
3f271a10fff20cc1, scale 1, comp {}, bbox 7.52x8.185x3.304 — struct-108 @
1147cbda committed mid-tick: its ledger line matches the observed tuple
line-for-line (pos/yaw/lib/comps, census 307->308 per its own entry),
domain-valid, not drift. Epoch C (further 20s-paced re-read) settled at 308,
0 departures, 0 drift on all 307 shared ids across id/pos/yaw/lib/scale/
kind/bbox. Per the polish-270 epoch law all affected evidence was re-taken
fresh before verdicts: SAT re-run at epoch B over the arrival-inclusive live
set — 270 bbox non-light, 236 classified, 0 coverage holes, exit 3 on exactly
ONE unclassified = R-121 lamp-n | nx-town-mapboard -0.407, known Sev 2 routed
to artwalk b26 choreography @ sweep-43, ninety-fourth sweep since routing,
NOT new, no escalation due (law keys severity-1); the sunflowerdial itself is
SAT-clean (zero new contacts, corroborating struct-108's own +1.78 needlerest
fresh-307 gate), and the standing gate re-run ALL PASS real exit 0 at 1147cbda
post-evidence. Walk classification: the arrival sits r71 S (az178); every
tier-1 leg is r<20 and no S approach leg exists in the standing route list —
51m+ from the nearest walked waypoint, epoch-A walks stand by construction
(sweep-53/136 precedent), and struct-108's own two-way walk 6/6 @ 0.335
re-proves the site. Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg
real exit 0: core 64/64 @ 0.38 maxDist (next-walk-core-paths.ts), NW 5/5 @
0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @
0.37 (sw-approach3-walk.ts). Probe disclosure (one paced retry class): the
NE walk's first run printed its COMPLETE ALL_PASS JSON (7/7 ok:true, valid
status object) but the process exited 124 — the timeout killed an open
handle AFTER the verdict, not a failed leg; per the one-paced-retry law the
tool was re-run once and returned real exit 0, 7/7 @ 0.38, identical
verdict. Tier-2 116th cycle per the committed pointer: stable 5/5 @ 0.396
(interior-walk-stable.ts) + observatory circuit 5/5 @ 0.389
(struct2-walk-observatory.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (92nd consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census-A bytes;
interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT — base re-read
fresh immediately before append, 2370754 (struct-108's D+1 absorbed
mid-tick), D+0/E+0. Snapshot rewritten per the sweep-136 chassis: 308
entities, 121587 bytes, sha16 491682d9a5c07a09, pre-write assertions (exactly
one arrival, zero departures, zero drift on shared ids, arrival tuple as
observed), post-rewrite drift vs live ZERO (308/308 exact). Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp edits,
zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-139):
row-cottage + market (117th cycle — LRU chain: @138 stable/observatory,
@137 longhouse/garden-cottage, @136 hall/bunkhouse, @135 inn/tower-house,
@134 forge/potter, @133 row-cottage/market — row-cottage and market both
last walked sweep-133, now the stalest standing pair; both walk tools
verified present on disk this tick: interior-walk-row-cottage.ts,
interior-walk-market.ts).
"""

# --- asserted unique anchors ---
anchor = next(line for line in s.splitlines() if line.startswith('| sweep-137 |'))
assert s.count(anchor) == 1, 'sweep-137 row anchor not unique'
assert s.count('(sweep-138):') == 1, 'next-pair pointer not unique'
i = s.index(anchor) + len(anchor)

s2 = s[:i] + '\n' + ROW + s[i:]
assert s2.count('| sweep-138 |') == 1

s3 = s2.rstrip('\n') + '\n' + PROSE
assert s3.count('sweep-138: CLEAN SWEEP') == 1
assert s3.count('(sweep-139):') == 1

open(P, 'w', encoding='utf-8').write(s3)
print('WROTE row+prose; new size', len(s3))
print('rows now:', sum(1 for l in s3.splitlines() if l.startswith('| sweep-1')))
