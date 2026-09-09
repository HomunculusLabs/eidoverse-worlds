#!/usr/bin/env python3
"""sweep-164 plan edits: history row after the sweep-163 row, prose block at
EOF. Anchored + asserted unique. Row anchor verified by grep pre-write."""
import sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW_ANCHOR = '| sweep-163 | 2026-09-09 |'
assert s.count(ROW_ANCHOR) == 1, f'row anchor not unique: {s.count(ROW_ANCHOR)}'
assert s.count('sweep-164: CLEAN SWEEP') == 0, 'prose anchor already present'

i = s.index(ROW_ANCHOR)
j = s.index('\n', i)

ROW = ("| sweep-164 | 2026-09-09 | 316→317 (+1 domain-valid arrival nx-struct-galtonboard @ (−14.649,0.002,209.873) yaw π lib "
       "3d9f7c9cdf81d64c comp {} = struct-122 @ 40c39c37, tuple matches its staged placer line-for-line incl full sha "
       "3d9f7c9cdf81d64ce497b2c1aa6684b98f1330b3c1c0af56fa9512d9fd1d807b + ledger D+1; corroborated independently by "
       "survey-138 NATIVE CLEAN slice; 0 departures, 0 drift, 0 lib flips on 316 shared ids at all three epochs A/B/C "
       "(A/B 20s-paced, C post-verify), raw sha16 5d86c019 byte-stable A/B/C; snapshot REWRITTEN arrival-fold precedent "
       "sweep-124: 317 ents / 211135B / sha16 a07d6e627c9e034e, pre-write asserts (arrival exactly [nx-struct-galtonboard], "
       "0 departures, zero full-field drift on 316 shared incl comp byte-equal), post-rewrite drift ZERO, one shape "
       "self-catch: first write dropped the top-level world key, caught by committed-vs-new shape check pre-commit, "
       "re-run with world preserved) | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ "
       "sweep-43, 120th sweep since routing, no escalation due — law keys Sev 1); 279 bbox non-light (galtonboard in the "
       "live SAT set) / 236 classified / 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each "
       "(core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 "
       "ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts; arrival r210 S outside every walked leg — walks stand "
       "by construction, SAT covers the collision surface, sweep-53 precedent); tier-2 142nd cycle per committed pointer "
       "stable 5/5 @ 0.3958 (interior-walk-stable.ts) + market 6/6 @ 0.3894 (interior-walk-market.ts), both ALL_PASS real "
       "exit 0, per-leg ok counts verified | pins 15/15 ALL_PINS_OK (118th consecutive clean), sweep89-battery 28/28 on "
       "fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool, base re-read "
       "fresh pre-append, D+0/E+0), standing gate ALL PASS real exit 0 at tick-start 490fa900 + re-run ALL PASS 99 exit 0 "
       "at 84d8c722 (struct-122 placement + survey-138 slice, both absorbed mid-tick; index partition clean at commit "
       "time — foreign staged files landed their own commits first) | CLEAN SWEEP — R-121 open, known, no escalation due |\n")

s = s[:j] + '\n' + ROW.rstrip('\n') + s[j:]

PROSE = """
sweep-164: CLEAN SWEEP, arrival tick. Census 316→317 across all three
epochs (A/B 20s-paced, C post-verification): exactly ONE arrival,
nx-struct-galtonboard @ (−14.649, 0.002, 209.873) yaw π, lib
3d9f7c9cdf81d64c, scale 1, comp {} — classified domain-valid line-for-line
against struct-122's staged placer (full sha
3d9f7c9cdf81d64ce497b2c1aa6684b98f1330b3c1c0af56fa9512d9fd1d807b, exact
pos tuple) and its ledger entry (line 5417, D+1, running total 2370764).
The placement landed mid-tick (HEAD 001e06d4 → 40c39c37) with its staged
index partition — observed live, never blocked on: my commit deferred
until the sibling's files landed their own commit, then the partition was
clean. survey-138 (84d8c722) independently judged the arrival NATIVE CLEAN
(gameplay/night/front, 7-glow-bead contract named-node-verified) —
corroborates my classification; its census predates the live verb by
pipeline interleaving, reconciled timeline in its own register. 0
departures, 0 drift, 0 lib flips on the 316 shared ids at every epoch;
raw /geom sha16 5d86c019 byte-stable A/B/C. Snapshot REWRITTEN per the
arrival-fold precedent (sweep-124 class): pre-write asserts passed
(arrival exactly [nx-struct-galtonboard], 0 departures, zero full-field
drift on 316 shared incl comp byte-equal and lib-normalized), new baseline
317 ents / 211135B / sha16 a07d6e627c9e034e, post-rewrite drift ZERO.
Probe self-catch before commit (disclosed, zero damage): the first rewrite
dropped the committed baseline's top-level 'world' key — caught by a
committed-vs-new top-level shape comparison before any commit, chassis
re-run with world: 'commons-next' preserved; final shape keys
[world, count, entities] exact. HEAD advanced three times mid-tick:
490fa900 (survey-137 hold) → 40c39c37 (struct-122 placement) → 84d8c722
(survey-138 arrival slice); per the polish-270 epoch law the standing gate
was re-run at 84d8c722: ALL PASS 99 PASS lines real exit 0. Overlap: SAT
fresh-live 279 bbox non-light (galtonboard included) / 236 classified / 0
coverage holes, exit 3 on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard −0.407 — known Sev 2 routed to artwalk b26 choreography
@ sweep-43, 120th sweep since routing, NOT new, no escalation due (law
keys severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS,
every leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW
5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts),
SW 5/5 @ 0.37 (sw-approach3-walk.ts); the arrival sits r210 S, outside
every walked leg — walks stand by construction, SAT covers the collision
surface (sweep-53 precedent). Tier-2 142nd cycle per the committed
sweep-163 pointer: stable 5/5 @ 0.3958 (interior-walk-stable.ts) + market
6/6 @ 0.3894 (interior-walk-market.ts), both ALL_PASS real exit 0,
per-leg ok counts verified. Integrity: pins 15/15 ALL_PINS_OK (118th
consecutive clean, struct18-fleet-pin-check.ts real exit 0),
sweep89-battery 28/28 on fresh census-A bytes, interlane md5 f6254cd0
stable read fresh. Ledger law EXACT via canonical tool (base re-read
fresh immediately pre-append, D+0/E+0). Zero world mutations, zero
defect notes written, zero uploads, zero verbs, zero comp edits, zero
shared-budget use. Next tier-2 pair (sweep-165): inn + tower-house
(143rd cycle — LRU after 142nd walked stable/market; inn/tower-house last
walked @161, now the stalest standing pair at 3 sweeps; both walk tools
present on disk this tick: interior-walk-inn.ts,
interior-walk-tower-house.ts).
"""

s = s.rstrip('\n') + '\n' + PROSE

open(P, 'w').write(s)
print('plan edits applied: row inserted after sweep-163 row, prose appended at EOF')
