#!/usr/bin/env python3
"""survey-182 census set-diff (read-only). Proven chassis: survey178-181 class.
Fields: id/pos/yaw/scale/lib/kind/color/intensity/range/comp."""
import json
BASE = 'agents/arthur/reviews/sweep-census-baseline.json'  # sweep-183 fold, 322
LIVE = '/tmp/survey182-census.json'
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
for probe in ('enneper', 'gyroid'):
    hits = {i: str(B[i].get('lib', ''))[:16] for i in bids if probe in i}
    print(f'{probe} {hits}')
