#!/usr/bin/env python3
"""survey-211 census set-diff (read-only). Chassis: survey210-census-diff.py
verbatim (s183 full-field law, 8 fields pos/yaw/scale/lib/kind/bbox/comp/
compKeys, projection-canonical compKeys)."""
import json
BASE = 'agents/arthur/reviews/sweep-census-baseline.json'  # sweep-183 fold, 322
LIVE = '/tmp/survey211-census-a.json'
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
for i in arr:
    print('ARR', i, B[i].get('lib'), B[i].get('pos'))
for i in dep:
    print('DEP', i)
# Full 8-field diff on shared ids
diffs = 0
for i in sorted(aids & bids):
    fa, fb = A[i], B[i]
    fields = [f for f in FIELDS if fa.get(f) != fb.get(f)]
    if fields:
        diffs += 1
        print('DIFF', i, fields)
print(f'field-diffs {diffs} on {len(aids & bids)} shared ids')
lib_flips = [i for i in sorted(aids & bids) if A[i]['lib'] != B[i]['lib']]
print(f'lib-flips {len(lib_flips)}')
for i in lib_flips:
    print('FLIP', i, A[i]['lib'], '->', B[i]['lib'])
