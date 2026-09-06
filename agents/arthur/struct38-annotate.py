#!/usr/bin/env python3
# struct38-annotate.py — annotate IMPROVE-PLAN row 13 + STRUCTURES-PLAN tick
# record. Anchor-gated: each assert must find EXACTLY ONE anchor before any
# write; the asserts gate the whole edit chain.
import sys

# --- 1. IMPROVE-PLAN row 13 annotation ---
P1 = "agents/arthur/IMPROVE-PLAN.md"
s = open(P1).read()
anchor = "reviews/survey2-sev2-slice/millrace/gameplay.png; intake note\n    STRUCTURES-PLAN SURVEY INTAKE]"
assert s.count(anchor) == 1, f"row13 anchor count {s.count(anchor)}"
ann = ("\n    [EXECUTED struct-38: native re-judge CONFIRMED 4/5 (floating pin\n"
       "    speck, no-sheen basin, hairline reeds, fountain-not-millrace\n"
       "    identity), DROPPED open-slit finding (bands already read as\n"
       "    shadowed risers at 18m); root cause = plain mat() water/reeds\n"
       "    exported NO glTF material -> COLOR_0 x loader-default metal-1\n"
       "    material rendered near-black sheenless; fix: real water material\n"
       "    via emissive lane (canon 0.25/0.5 + polish-281 0x2e4a58@0.45),\n"
       "    timber launder flume on trestle posts + drop tongue + stone\n"
       "    chute + visible pour, stemmed textured-gold bead 0.09, clumped\n"
       "    reeds r0.035-0.045 x3; sha d2f46768->6e82dd2e x2 deterministic,\n"
       "    6 nodes; day gameplay PASS (weir-pools not slits, reeds read,\n"
       "    bead attached), top view PASS (launder feeds head on-axis),\n"
       "    night PASS 3/3 (moonlit water, warm bead, quiet); remove+spawn\n"
       "    exact tuple, comp {} both sides, PLACED_VERIFIED + idempotent\n"
       "    0-verb rerun, 5-leg bank walk ALL_PASS 0.38m]")
s = s.replace(anchor, anchor + ann)
open(P1, "w").write(s)
print("IMPROVE-PLAN row 13 annotated")

# --- 2. STRUCTURES-PLAN tick record ---
P2 = "agents/arthur/STRUCTURES-PLAN.md"
t = open(P2).read()
anchor2 = "| struct-37 | SHARD ROW 12: skymirror open-cup rebirth | exact standing tuple (24, −0.05395918, −35.5) | 0 | 0 | LIVE, lib 8331ba88→782eb864, circuit re-verifiable (folly, non-enterable) |"
assert t.count(anchor2) == 1, f"siting-log anchor count {t.count(anchor2)}"
row = "\n| struct-38 | SHARD ROW 13: millrace material+identity fix | exact standing tuple (−37.59, −0.04526, −13.68) yaw −π/2 | — | — | LIVE, lib d2f46768→6e82dd2e, bank walk 5/5 |"
t = t.replace(anchor2, anchor2 + row)
assert t.count("| struct-38 |") == 1
open(P2, "w").write(t)
print("STRUCTURES-PLAN siting log row added")
