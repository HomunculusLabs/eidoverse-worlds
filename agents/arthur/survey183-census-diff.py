#!/usr/bin/env python3
"""survey-183 census set-diff (read-only). Chassis: survey178-182 class,
WIDENED this tick to the FULL field set (self-catch: the s182 9-field law
omitted bbox + compKeys). Fields: pos/yaw/scale/lib/kind/bbox/comp/compKeys."""
import json
BASE = 'agents/arthur/reviews/sweep-census-baseline.json'  # sweep-183 fold, 322
LIVE = '/tmp/survey183-census.json'
FIELDS = ('pos', 'yaw', 'scale', 'lib', 'kind', 'bbox',
          'comp', 'compKeys')


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
assert not arr and not dep and fd == 0, 'drift detected — fail closed'
print('FULLY QUIET (full-field law)')
sf = [i for i in bids if 'nx-struct-' in i]
print(f'struct-family live {len(sf)}')
for probe in ('enneper', 'gyroid'):
    hits = {i: str(B[i].get('lib', ''))[:16] for i in bids if probe in i}
    print(f'{probe} {hits}')
