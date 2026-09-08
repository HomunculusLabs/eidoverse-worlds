#!/usr/bin/env python3
"""sweep-144 plan edit: one history table row after the sweep-143 row
(line-anchored on its unique prefix) + one prose block appended at the
file tail. Asserts unique anchors before writing (plan-edit chassis law)."""

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW = ("| sweep-144 | 2026-09-08 | 310→311 arrival tick single stable epoch (273 thing + 38 light; "
"exactly ONE domain-valid arrival nx-struct-lorenz @ (−9.77,−0.0279,139.66) yaw 0 lib 77b59dbbcb8bfb59 "
"comp {} = struct-111 @ 178aa7ad PRE-tick at tick-start HEAD, tuple matches its committed ledger "
"line-for-line, bbox 5.332×7.039×7.076 scale-sane r140.6 S-axis; 0 departures, 0 drift on all 310 "
"shared ids on id/pos/yaw/lib/scale/kind/bbox; epochs A/B 20s-paced byte-identical raw sha16 "
"56d2eb580a0844be; snapshot rewritten like-for-like 311 ents / 122844B / sha16 460774e12507efb2, "
"pre-write assertions, post-rewrite drift ZERO) | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard "
"−0.407 (Sev 2 artwalk-routed @ sweep-43, 100th sweep since routing, no escalation due — law keys "
"Sev 1); 273 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the live set, lorenz "
"SAT-clean, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core "
"64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; arrival 100m+ off every leg, walks also "
"run fresh per law) + tier-2 122nd cycle per committed pointer stable 5/5 @ 0.396 + observatory 5/5 "
"@ 0.389 ALL PASS | pins 15/15 ALL_PINS_OK 98th consecutive, battery 28/28 exit 0 on fresh census-A "
"bytes, interlane f6254cd0 stable read fresh, ledger law EXACT 2370757 base re-read fresh pre-append "
"D+0/E+0, gate ALL PASS real exit 0 at tick-start 178aa7ad from repo ROOT | CLEAN SWEEP — R-121 "
"open, known, no escalation due |\n")

anchor = '| sweep-143 | 2026-09-08 | 310==310 steady state both epochs'
assert s.count(anchor) == 1, f'table anchor count {s.count(anchor)}'
i = s.index(anchor)
j = s.index('\n', i) + 1
s = s[:j] + ROW + s[j:]

PROSE = """
sweep-144: CLEAN SWEEP, arrival tick. Census 310→311 (273 thing + 38
light) vs the committed sweep-143 baseline (sha16 26747e696973d352,
normalized under the known store/-prefix + null-for-lights representation
epoch): exactly ONE domain-valid arrival nx-struct-lorenz @
(−9.77, −0.0279, 139.66) yaw 0, lib 77b59dbbcb8bfb59, scale 1, comp {}
— struct-111 @ 178aa7ad (the tick's starting HEAD, committed PRE-tick),
tuple matching its committed ledger line-for-line (sha exact, S-axis az184
r140 10m cadence behind tesseract, its census 310→311 PLACED_VERIFIED
corroborated sweep-side). 0 departures, 0 drift on all 310 shared ids
across id/pos/yaw/lib/scale/kind/bbox; epochs A and B (20s-paced)
byte-identical, raw sha16 56d2eb580a0844be — single stable epoch.
Snapshot rewritten like-for-like (7-field projection, indent=1): 311
entities / 122844B / sha16 460774e12507efb2, pre-write assertions
(exactly one arrival, zero departures, zero drift), post-rewrite drift vs
live ZERO (311/311 exact). Overlap: SAT fresh over the live set — 273
bbox non-light, 236 classified, 0 coverage holes, exit 3 on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard −0.407, known Sev 2 routed
to artwalk b26 choreography @ sweep-43, one-hundredth sweep since routing,
NOT new, no escalation due (law keys severity-1). The lorenz arrival is
SAT-clean with zero new contacts — struct-111's +1.91 clearance claim
corroborated sweep-side. Walks: tier-1 4/4 per-leg verified 81/81
ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @
0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts); the
arrival sits r140.6 S, 100m+ off every walked leg, and the walks were run
fresh this wakeup regardless (law: never claim a route that was not
walked this wakeup). Tier-2 122nd cycle per the committed pointer: stable
5/5 @ 0.396 (interior-walk-stable.ts) + observatory 5/5 @ 0.389
(struct2-walk-observatory.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (98th consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census-A bytes;
interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT — base re-read
fresh immediately before append (running total 2370757, struct-111's D+1
already absorbed; tool verifies law() before and after append), D+0/E+0.
Standing gate ALL PASS real exit 0 at tick-start 178aa7ad, run from repo
ROOT. Zero world mutations, zero defect notes, zero uploads, zero verbs,
zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2 pair
(sweep-145): inn + tower-house (123rd cycle — LRU chain: @144
stable/observatory, @143 forge/potter, @142 inn/tower-house — inn and
tower-house both last walked sweep-142, now the stalest standing pair;
both walk tools verified present on disk this tick:
interior-walk-inn.ts, interior-walk-tower-house.ts).
"""

assert s.count('sweep-144: CLEAN SWEEP') == 0, 'prose already present'
s = s.rstrip('\n') + '\n' + PROSE
open(P, 'w').write(s)

# post-write verify
s2 = open(P).read()
assert s2.count('| sweep-144 | 2026-09-08 |') == 1
assert s2.count('sweep-144: CLEAN SWEEP') == 1
print('PLAN EDIT OK: 1 table row + 1 prose block; anchors unique; verified post-write')
