#!/usr/bin/env python3
"""sweep-147 walk parse: per-tool schema (sweep-136/139/140 chassis) — `legs` is a
COUNT, per-leg rows in `results[]`; skip the leading `[physics]` banner by
brace-scanning (sweep-135 self-catch law)."""
import json, sys

TOOLS = [
    ('core', '/tmp/sweep147-walk-next-walk-core-paths.txt', 64),
    ('NW',   '/tmp/sweep147-walk-nw-approach1-walk.txt', 5),
    ('NE',   '/tmp/sweep147-walk-ne-approach2-walk.txt', 7),
    ('SW',   '/tmp/sweep147-walk-sw-approach3-walk.txt', 5),
]

for name, path, expected in TOOLS:
    raw = open(path, encoding='utf-8', errors='replace').read()
    i = raw.find('{')
    if i < 0:
        print(f'{name}: NO JSON FOUND — FAIL'); sys.exit(1)
    d = json.loads(raw[i:])
    legs = d.get('legs')
    results = d.get('results', [])
    ok = all(r.get('ok', False) for r in results)
    def dval(r):
        v = r.get('dist', r.get('distance', None))
        return v if isinstance(v, (int, float)) else -1
    dists = [round(dval(r), 4) for r in results]
    maxd = max(dists) if dists else None
    status = d.get('status', d.get('verdict', ''))
    print(f'{name}: legs={legs} (expect {expected}) rows={len(results)} '
          f'all_ok={ok} maxDist={maxd} status={status!r}')
    if legs != expected or len(results) != expected or not ok:
        print(f'{name}: MISMATCH — FAIL'); sys.exit(1)
print('TIER1 ALL PASS (81/81 implied)')
