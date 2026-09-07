#!/usr/bin/env python3
"""sweep-87: repair the corrupted prose tail of the just-landed ledger entry
(sweep-55 corrupted-insert class: my paste mangled the battery enumeration).
Anchor-asserted: the corrupted substring must appear EXACTLY once."""
import sys

PATH = "agents/arthur/IMPROVEMENTS.md"
BAD = "woodyard 01-window placeholder; zero world mutations"
GOOD = ("woodyard 01b78fdd00f090a7, welcome 7d1bd0c9545c44fb + welcome-l, "
        "cistern 156b4fc8c7287a9d, beacon 03d278be72677877 + beacon-l, "
        "angler 6ee5b4b06bc07d5e, hamlet embers 5-of-5, court smoke, "
        "38 lights, 17 comp-bearing); interlane f6254cd0 stable; ledger law "
        "canonical EXACT 2370709 (ad-hoc probe shape discarded, canonical "
        "law() verbatim re-derived); gate ALL PASS real exit 0 at tick-start "
        "ac728ee9 + re-run at ec468568 post-interleave; zero world mutations, "
        "zero defect notes")

s = open(PATH).read()
n = s.count(BAD)
assert n == 1, f"anchor count {n} != 1 — refusing"
s = s.replace(BAD, GOOD)
open(PATH, "w").write(s)
print("REPAIRED sweep-87 prose tail; BAD present now:", s.count(BAD))
