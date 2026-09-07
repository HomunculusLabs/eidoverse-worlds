#!/usr/bin/env python3
"""sweep-77 census diff vs committed epoch-C baseline (282 ents, sha16 72efee34c8c8d908)."""
import json

new = {e['id']: e for e in json.load(open('/tmp/sweep77-census-A.json'))['entities']}
d_old = json.load(open('agents/arthur/reviews/sweep-census-baseline.json'))
old = {e['id']: e for e in d_old['entities']}
print('old count', len(old), 'new count', len(new))
arr = sorted(set(new) - set(old))
dep = sorted(set(old) - set(new))
print('ARRIVALS:', arr)
print('DEPARTURES:', dep)
diffs = []
inter = sorted(set(new).intersection(set(old)))
for i in inter:
    for k in ('pos', 'yaw', 'scale', 'lib', 'kind', 'bbox'):
        if old[i].get(k) != new[i].get(k):
            diffs.append((i, k))
print('DRIFT FIELDS:')
for d in diffs:
    i, k = d
    print(' ', i, k, '->', json.dumps(new[i].get(k))[:140])
    if k in ('pos', 'yaw'):
        print('     old:', json.dumps(old[i].get(k))[:140])
print('total drift fields:', len(diffs))
