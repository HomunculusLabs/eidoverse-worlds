#!/usr/bin/env python3
# ledger-append.py — THE CANONICAL LEDGER TOOL (new-era loop 39).
# Usage: python3 ledger-append.py <tag> <D+N> <E+n> "<entry prose>"
# Always exactifies (no tilde path exists in this tool), always verifies
# the law closes before writing, refuses on break.
import re, sys

PATH = "agents/arthur/IMPROVEMENTS.md"

def law(s: str):
    post = s[s.index("[audit-balance]"):]
    run = int(re.findall(r"\*\*Running total: (\d+)", s)[-1])
    deltas = sum(int(m.group(1)) + int(m.group(2)) for m in re.finditer(r"\(D\+(\d+), E\+(\d+)\)", post))
    return 2336002 + deltas == run, run

def main():
    if len(sys.argv) != 5:
        print("usage: ledger-append.py <tag> <D+n> <E+n> <prose>"); sys.exit(2)
    tag, d, e, prose = sys.argv[1], int(sys.argv[2].replace("D+", "").replace("E+", "")), int(sys.argv[3].replace("D+", "").replace("E+", "")), sys.argv[4]
    if "(D+~" in prose or "~" in f"D+{d}":
        print("REFUSED: tilde in input — this tool exactifies by construction"); sys.exit(1)
    s = open(PATH).read()
    ok, run = law(s)
    if not ok:
        print(f"REFUSED: law already broken ({run}) — fix before appending"); sys.exit(1)
    cleaned = re.sub(r"\*\*Running total: \d+[^\n]*\n?$", "", s)
    entry = f"- [{tag}] {prose} (D+{d}, E+{e})\n"
    nxt = run + d + e
    open(PATH, "w").write(cleaned + entry + f"\n**Running total: {nxt} / 2000000**\n")
    ok2, run2 = law(open(PATH).read())
    print(f"appended {tag}: {run} -> {run2}, law {'exact' if ok2 else 'BROKEN'}")
    sys.exit(0 if ok2 else 1)

if __name__ == "__main__":
    main()
