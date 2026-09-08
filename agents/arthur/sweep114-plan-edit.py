#!/usr/bin/env python3
"""sweep-114 plan edit: append prose block after the sweep-113 block, with unique-anchor assert.
Steady-state tick: 302==302 0/0/0 both epochs, no snapshot rewrite."""
P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

anchor = 'tier-2 pair (sweep-114):\nstable + observatory circuit (92nd cycle'
assert s.count(anchor) == 1, ('anchor count', s.count(anchor))

block = '''\n\nsweep-114: CLEAN SWEEP, steady-state tick. Census 302==302 (264 thing +\n38 light) vs the committed sweep-113 baseline (sha16 c68fcbc9e3195567):\n0 arrivals, 0 departures, 0 drift on all 302 shared ids across\nid/pos/yaw/scale/lib/kind/bbox -- epoch A fully quiet, epoch B\n(25s-paced re-read) settled identical; no sibling landed this window\n(HEAD f5228415 = sweep-113 close, stable all window). Snapshot\nbyte-identical, NO rewrite (sweep-106/108/111/112 precedent). Overlap:\nSAT fresh over the live set -- 264 bbox non-light, 235 classified, 0\ncoverage holes, exit 3 on exactly ONE unclassified = R-121 lamp-n |\nnx-town-mapboard -0.407 -- known Sev 2 routed to artwalk b26\nchoreography @ sweep-43, seventieth sweep since routing, NOT new, no\nescalation due (law keys severity-1); zero new contacts. Tier-1 4/4\nper-leg verified 81/81 ALL_PASS, every leg real exit 0: core 64/64 @\n0.38 (banner-stripped parse), NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @\n0.37. Tier-2 92nd cycle per committed pointer: stable 5/5 @ 0.396\n(interior-walk-stable.ts) + observatory circuit 5/5 @ 0.389\n(struct2-walk-observatory.ts), both real exit 0. Integrity:\nstruct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (68th\nconsecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh\ncensus bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law\nEXACT -- base re-read fresh immediately before append, 2370744 D+0/E+0.\nStanding gate ALL PASS real exit 0 at tick-start f5228415 (no\ninterleave, no re-run needed -- HEAD stable all window). Zero world\nmutations, zero defect notes, zero uploads, zero verbs, zero comp\nedits, zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-115):\nforge + potter (93rd cycle -- LRU chain: @114 stable/observatory, @113\nlonghouse/garden-cottage, @112 hall/bunkhouse, @111 row-cottage/market,\n@110 stable/observatory, @109 forge/potter -- forge and potter both\nlast walked sweep-109, now the stalest standing pair; both walk tools\nverified present this tick: interior-walk-forge.ts,\ninterior-walk-potter.ts).\n'''
assert s.count('sweep-114: CLEAN SWEEP') == 0, 'block already present'
new = s.rstrip('\n') + '\n' + block
assert len(new) - len(s) < 3000 and len(new) - len(s) > 1200, ('size delta', len(new) - len(s))
open(P, 'w').write(new)
t = open(P).read()
assert t.count('sweep-114: CLEAN SWEEP') == 1
assert t.count('pair (sweep-115):') == 1  # pointer inserted once (line-wrapped after colon)
print('PLAN_EDIT_OK delta=%d' % (len(new) - len(s)))
