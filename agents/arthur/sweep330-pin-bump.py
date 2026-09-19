#!/usr/bin/env python3
"""sweep-330: lawful pin bump comp-bearing 42->43 (fauna-34 swallows arrival).
Asserted unique anchor, single replacement, byte-level verification."""
import sys

P = "agents/arthur/sweep89-battery.py"
needle = b'check("comp-bearing-23", len(compb) == 42)  # sweep-329 correction of record:'
replacement = b'check("comp-bearing-23", len(compb) == 43)  # sweep-330 pin bump 42->43 (lawful RED->GREEN, sweep-316/326/327/329 precedent chain): fauna-34 barn swallows nx-dress-swallows-001 @ 9e3f6b05f1f41ab8, 9x motion:swallow_* (3 orbit rings + 6 wing pendulums), arrival ledger-matched this tick vs its in-tree fauna-34 entry, census 376->377; PRIOR sweep-329 correction of record:'

raw = open(P, "rb").read()
assert raw.count(needle) == 1, f"anchor not unique: {raw.count(needle)}"
open(P, "wb").write(raw.replace(needle, replacement, 1))
chk = open(P, "rb").read()
assert chk.count(b"len(compb) == 43") == 1, "pin not bumped exactly once"
assert chk.count(b"len(compb) == 42") == 0, "old pin value still present"
print("PATCHED: comp-bearing-23 pin 42 -> 43, history comment preserved")
