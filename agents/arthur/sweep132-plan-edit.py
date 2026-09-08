#!/usr/bin/env python3
"""sweep-132 plan edit: history row after the sweep-131 row + prose block at EOF.
Asserted unique anchors; verifies block structure after write.
"""
P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P, encoding='utf-8').read()

ROW = ("| sweep-132 | 2026-09-08 | 305→306 (+1 domain-valid arrival nx-struct-hilbertlabyrinth @ "
"(-6.98,-0.01822,99.76) yaw pi lib 38d3bb8f49a08af9 comp {} = struct-105 R10-7 @ 11ff8cba "
"committed PRE-tick, tick-start HEAD carries it, census 305->306 per its own ledger line, tuple "
"matches line-for-line, bbox 8.42x2.925x8.42 scale-sane, r~100 N — beyond every walked leg; 0 "
"departures, 0 drift on 305 shared ids; epochs A/B 20s-paced identical raw sha16 4ac1f73a02f71ec4 "
"both — single stable epoch; snapshot rewritten 306/120713B/sha16 c1514c2339552894 via sweep-125 "
"chassis, post-rewrite drift ZERO, diff 35 ins/1 del) | exit 3 on ONLY known R-121 lamp-n\\|"
"nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 88th sweep since routing, no escalation "
"due — law keys Sev 1); 268 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the "
"live set incl. the arrival (corroborates struct-105's own +7.03m), zero new contacts | tier-1 4/4 "
"per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE "
"7/7 @ 0.38, SW 5/5 @ 0.37 — labyrinth >80m off every leg, no re-walk band, struct-105 re-proved "
"its own 35-leg walk) + tier-2 110th cycle per committed pointer stable 5/5 @ 0.40 + observatory "
"5/5 @ 0.39 ALL PASS | pins 15/15 ALL_PINS_OK 86th consecutive, battery 28/28 exit 0 (comp-bearing "
"21, 38 lights), interlane f6254cd0 stable read fresh, ledger law EXACT 2370752 base re-read fresh "
"pre-append (struct-105 D+1/E+2 absorbed), gate ALL PASS real exit 0 at tick-start 11ff8cba from "
"repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |\n")

PROSE = """
sweep-132: CLEAN SWEEP, arrival tick. Census 305->306 (268 thing + 38
light) vs the committed sweep-131 baseline (sha16 124f64699e4dcd6e):
exactly ONE arrival nx-struct-hilbertlabyrinth @ (-6.98, -0.01822, 99.76)
yaw pi, lib 38d3bb8f49a08af9, scale 1, comp {} -- struct-105 (R10-7 THE
HILBERT LABYRINTH) @ 11ff8cba, committed PRE-tick: the tick-start HEAD
already carries it and its ledger line documents census 305->306 with this
exact tuple (sha 38d3bb8f x2 deterministic, PLACED_VERIFIED, idempotent),
so the arrival is ledger-matched line-for-line, domain-valid
(nx-struct-* struct lane), not drift. bbox 8.42 x 2.925 x 8.42
scale-sane; sits r~100 N, beyond every walked leg. 0 departures, 0 drift
on all 305 shared ids across id/pos/yaw/lib/scale/kind/bbox -- epochs A
and B (20s-paced re-read) identical (raw sha16 4ac1f73a02f71ec4 both),
single stable epoch; no sibling mutated the live world during this
window. Overlap: SAT fresh over the live set -- 268 bbox non-light, 236
classified, 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard -0.407 -- known Sev 2 routed to artwalk b26
choreography @ sweep-43, eighty-eighth sweep since routing, NOT new, no
escalation due (law keys severity-1); zero new contacts, the labyrinth is
SAT-clean (corroborates struct-105's own +7.03m clearance). Tier-1 4/4
per-leg verified 81/81 ALL_PASS, every leg real exit 0: core 64/64 @ 0.38
maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37 -- the labyrinth
sits >80m off every walked leg, outside the re-verify band; struct-105
re-proved its own full-path 35-leg two-way MCPL walk 0.4m at placement.
Tier-2 110th cycle per the committed pointer: stable 5/5 @ 0.40
(interior-walk-stable.ts) + observatory circuit 5/5 @ 0.39
(struct2-walk-observatory.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (86th consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census bytes
(comp-bearing 21, 38 lights); interlane md5 f6254cd0 stable, read fresh.
Ledger law EXACT -- base re-read fresh immediately before append, 2370752
(struct-105 D+1/E+2 absorbed mid-tick window), D+0/E+0. Standing gate ALL
PASS real exit 0 at tick-start 11ff8cba run from repo ROOT (98 PASS / 0
FAIL). Probe self-caught pre-verdict, disclosed (sweep-55 write-format
class): the first snapshot-rewrite draft used census-order keys
(kind-early, store/-prefixed lib, no trailing newline) -- the size guard
tripped (+3169B vs ~+400B expected) before any commit, the bad write was
inspected via git diff (646/612 formatting churn), and the file was
rewritten like-for-like per the committed sweep-125 chassis; final diff
35 insertions / 1 deletion, on-disk script updated to the corrected
chassis so the committed record matches the bytes that produced the
baseline. Zero world mutations, zero defect notes, zero uploads, zero
verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2
pair (sweep-133): row-cottage + market (111th cycle -- LRU chain: @132
stable/observatory, @131 longhouse/garden-cottage, @130 hall/bunkhouse,
@129 row-cottage/market, @128 tower-house/inn, @127 forge/potter --
row-cottage and market both last walked sweep-129, now the stalest
standing pair; both walk tools verified present on disk this tick:
interior-walk-row-cottage.ts, interior-walk-market.ts).
"""

# --- asserted unique anchors ---
a1 = s.count('| sweep-131 | 2026-09-08 | 305==305 steady state (267 thing + 38 light; epoch A ')
assert a1 == 1, f'row anchor not unique: {a1}'
anchor = next(line for line in s.splitlines() if line.startswith('| sweep-131 |'))
assert s.count(anchor) == 1
i = s.index(anchor) + len(anchor)

s2 = s[:i] + '\n' + ROW + s[i:]
assert s2.count('| sweep-132 |') == 1

s3 = s2.rstrip('\n') + '\n' + PROSE
assert s3.count('sweep-132: CLEAN SWEEP') == 1
assert s3.count('pair (sweep-133): row-cottage + market') == 1

open(P, 'w', encoding='utf-8').write(s3)
print('WROTE row+prose; new size', len(s3))
print('rows now:', sum(1 for l in s3.splitlines() if l.startswith('| sweep-1')))
