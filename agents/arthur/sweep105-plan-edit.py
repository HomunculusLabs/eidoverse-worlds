#!/usr/bin/env python3
"""sweep-105 plan edit: narrative register block appended at file tail
(matches the sweep-103/104 pattern)."""

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

block = """
sweep-105: CLEAN SWEEP, epoch-settled drift-pair tick. Census 298==298 at
epochs A/B/C vs the committed sweep-104 baseline (sha16 a1de8a78dbab76bc):
0 arrivals, 0 departures, exactly TWO classified lib flips at identical
tuples, both struct-domain, both ledger-matched: (1) nx-struct-halt
bb227fd6->cdaf7c1f = struct-93 @ a4f51752, committed PRE-tick — sweep-104's
census reads predated its re-place verbs (the sweep-52 known-epoch class);
(2) nx-struct-needlerest bb227fd6->cdaf7c1f = struct-94 @ f5e6883d, committed
MID-TICK — the deferred shared-bytes half of the halt value-crush lineage,
zero-upload byte-swap at register-pinned tuple (10.273, 0.0029, 68.737) yaw
2.99324, independently corroborated by city-103 and dress-150 holds. Epoch C
settled 0/0/0 across a 25s-paced re-read; both swaps bbox-parity EXACT
(material-only cures per both ledgers). Overlap: SAT fresh-live at epoch A
and re-run at epoch C — 260 bbox non-light / 232 classified / 0 coverage
holes, exit 3 on ONLY the known R-121 lamp-n | nx-town-mapboard -0.407
(Sev 2 routed to artwalk @ sweep-43, sixty-first sweep since routing, no
escalation due — the law keys on severity-1); ZERO new contacts at either
cured seat. Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit
0: core 64/64 @ 0.38 (banner-stripped parse), NW 5/5 @ 0.38, NE 7/7 @ 0.38,
SW 5/5 @ 0.37; needlerest sits r69 NE, 47m+ off every tier-1 waypoint —
epoch-A walks stand by construction, SAT re-run covers the collision surface
(sweep-53/57 precedent). Tier-2 83rd cycle per committed pointer: stable 5/5
@ 0.396 (interior-walk-stable.ts, walked over the overhaul-wave bytes) +
observatory circuit 5/5 @ 0.389 (struct2-walk-observatory.ts), both real
exit 0. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0
(59th consecutive clean); sweep89-battery 25/28 with exactly three FAILs,
ALL stale-probe-pins predating the sweep-104 wave — windmill pin 369c5724 vs
live a557d918 = the WINDMILL-OVERHAUL accepted baseline ("windmill looks
amazing!", LIVE_VERIFIED); woodyard pin 01b78fdd vs live 333e85a4 =
village-overhaul DELIVERY.json LIVE_VERIFIED exact; comp-bearing pin 18 vs
live 21 = the sweep-104 record (gains moonmoth + house-35_-22 arrivals +
windmill millstone) — world correct throughout, all three re-derived from
the live census, not memory (battery probe pins refreshed from live values
this tick); comp-bearing 21 census-matched; interlane md5 f6254cd0 stable,
read fresh. Ledger law EXACT — base re-read immediately before append
(struct-94 D+1 absorbed mid-tick), entry landed D+0/E+0 at 2370739.
Standing gate ALL PASS real exit 0 at tick-start 13fc65d4, re-run ALL PASS
real exit 0 at 543f0fb4 post-interleave. Snapshot rewritten with pre-write
assertions (0 arrivals, 0 departures, drift exactly [halt lib, needlerest
lib], bbox parity), post-rewrite drift vs live ZERO: 298 entities, 120100B,
sha16 2f6ccda3e57cc491. Probe self-caught pre-verdict: my walk-verification
script shadowed the core results variable with SW's 5-leg list and tripped
its own redundant assert — re-inspected the printed per-leg counts from the
actual captures (sweep-48 class, no verdict impact); the SAT re-run echo
printed exit 0 from the pipe tail (content-anchored on the unclassified line
instead, polish-270 class). Zero world mutations, zero defect notes, zero
uploads, zero verbs, zero comp edits, zero shared-budget use (D+0, E+0).
Next tier-2 pair (sweep-106): bunkhouse + longhouse (84th cycle — LRU
chain: @105 stable/observatory, @104 hall/row-cottage, @103 forge/potter,
@102 bunkhouse/longhouse, @101 row-cottage/inn, @100 stable/observatory —
bunkhouse last walked sweep-102 and longhouse sweep-102, now the stalest
standing pair; both walk tools verified present: interior-walk-bunkhouse.ts,
interior-walk-longhouse.ts).
"""

anchor = "interior-walk-stable.ts, struct2-walk-observatory.ts).\n"
c = s.count(anchor)
assert c >= 1, ('anchor count', c)
assert s.rstrip('\n').endswith(anchor.strip()), 'anchor is not at file tail'
s = s.rstrip('\n') + '\n' + block
open(P, 'w').write(s)
print('PLAN APPENDED; tail now ends with sweep-106 pointer')
