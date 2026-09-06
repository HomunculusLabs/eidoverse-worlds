#!/usr/bin/env python3
# struct38-ledger-inspect.py — print the struct-37 ledger entry format (tail
# reference for struct-38's append) + current running total.
import re
PATH = "agents/arthur/IMPROVEMENTS.md"
s = open(PATH).read()
# find last struct-37 line
lines = s.splitlines()
idx = [i for i, l in enumerate(lines) if l.startswith("- [struct-37")]
print("struct-37 entry lines found at:", idx)
if idx:
    for l in lines[idx[-1]: idx[-1] + 3]:
        print(repr(l[:300]))
run = int(re.findall(r"\*\*Running total: (\d+)", s)[-1])
print("running total:", run)
# count existing struct-38
print("struct-38 count:", s.count("[struct-38"))
