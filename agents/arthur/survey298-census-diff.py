#!/usr/bin/env python3
"""survey-298 census set-diff (read-only). Chassis: survey235-census-diff.py
verbatim post-fix (s183 full-field law, 8 fields pos/yaw/scale/lib/kind/bbox/
comp/compKeys, projection-canonical compKeys)."""
import json
BASE = '/tmp/survey297-census-a.json'  # survey-297 certified baseline, 323
LIVE = '/tmp/survey298-census-a.json'
FIELDS = ('pos', 'yaw', 'scale', 'lib', 'kind', 'bbox', 'comp',
          'compKeys')


def ents(d):
    e = d.get('entities', d if isinstance(d, list) else [])
    # Canonical projection: compKeys is a chassis-DERIVED field (sweep fold
    # derives it; raw /geom curl omits it and carries extra server fields
    # parent/tris the fold drops). Derive it from comp on BOTH sides so the
    # full-field law compares the same projection (s184 self-catch).
    out = {}
    for x in e:
        y = {k: x.get(k) for k in FIELDS}
        c = x.get('comp')
        y['compKeys'] = sorted(c.keys()) if isinstance(c, dict) else []
        out[x['id']] = y
    return out


A, B = ents(json.load(open(BASE))), ents(json.load(open(LIVE)))
aids, bids = set(A), set(B)
arr, dep = sorted(bids - aids), sorted(aids - bids)
print(f'baseline {len(aids)} live {len(bids)}')
print(f'arrivals {len(arr)} departures {len(dep)}')
for x in arr:
    print(f'  ARR {x} lib={B[x]["lib"]} pos={B[x]["pos"]}')
for x in dep:
    print(f'  DEP {x}')
changed = [i for i in sorted(set(A) & set(B)) if A[i] != B[i]]
print(f'field diffs {len(changed)}')
for i in changed:
    keys = [k for k in FIELDS if A[i].get(k) != B[i].get(k)]
    print(f'  DIFF {i} fields={keys}')
    for k in keys:
        print(f'    {k}: {A[i].get(k)!r} -> {B[i].get(k)!r}')
