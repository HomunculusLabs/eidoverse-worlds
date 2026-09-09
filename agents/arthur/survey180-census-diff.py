#!/usr/bin/env python3
"""survey-180 census set-diff (read-only). Proven chassis: survey178/179 class.
Fields: id/pos/yaw/scale/lib/kind/color/intensity/range/comp."""
import json, sys

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'  # committed sweep-181 fold, 321
LIVE = '/tmp/survey180-census.json'
FIELDS = ('pos', 'yaw', 'scale', 'lib', 'kind', 'color',
          'intensity', 'range', 'comp')


def ents(d):
    e = d.get('entities', d if isinstance(d, list) else [])
    return {x['id']: x for x in e}


A, B = ents(json.load(open(BASE))), ents(json.load(open(LIVE)))
aids, bids = set(A), set(B)
arr, dep = sorted(bids - aids), sorted(aids - bids)
print(f'baseline {len(aids)} live {len(bids)}')
print(f'arrivals {len(arr)} {arr[:10]}')
print(f'departures {len(dep)} {dep[:10]}')
fd = lf = 0
for i in sorted(aids & bids):
    for k in FIELDS:
        if A[i].get(k) != B[i].get(k):
            fd += 1
            if k == 'lib':
                lf += 1
            print(f' DIFF {i} {k} {A[i].get(k)!r} -> {B[i].get(k)!r}')
print(f'field diffs {fd} lib flips {lf}')
sf = [i for i in bids if 'nx-struct-' in i]
print(f'struct-family live {len(sf)}')
gy = [B[i].get('lib', '')[:12] for i in bids if 'gyroid' in i]
print(f'gyroid libs {gy}')
