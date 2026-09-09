#!/usr/bin/env python3
"""sweep-167 walk-parse: per-leg verdicts from a walk tool's JSON output.
Usage: python3 sweep167-walk-parse.py <file> <label>. Anchors on status +
per-leg ok fields (sweep-48/165 class: never key on a single field name)."""
import json, sys

path, label = sys.argv[1], sys.argv[2]
raw = open(path).read()
# physics preamble convention: parse from first '{'
start = raw.index('{')
d = json.loads(raw[start:])
status = d.get('status', d.get('result', ''))
legs = d.get('results', d.get('legs', []))
if isinstance(legs, int):
    legs = d.get('results', [])
    print(f'(note: schema has legs={d.get("legs")} as int; using results list)')
ok = [l for l in legs if l.get('ok') is True]
max_arr = max((l.get('dist', l.get('distance', l.get('maxArrival', 0))) or 0) for l in legs)
print(f'{label}: status={status} legs={len(legs)} ok={len(ok)} '
      f'max_dist={max_arr:.4f} verdict={"ALL_PASS" if status == "ALL_PASS" and len(ok) == len(legs) else "FAIL"}')
for l in legs:
    if l.get('ok') is not True:
        print(f'  FAILING LEG: {json.dumps(l)[:200]}')
