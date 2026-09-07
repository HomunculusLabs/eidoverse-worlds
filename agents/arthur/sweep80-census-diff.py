#!/usr/bin/env python3
"""sweep-80 census diff vs committed sweep-79 epoch-C baseline (282 ents, sha16 e7aef5dc9b7564d5)."""
import json, subprocess

new = {e['id']: e for e in json.load(open('/tmp/sweep80-census-A.json'))['entities']}
committed = subprocess.run(
    ['git', 'show', 'HEAD:agents/arthur/reviews/sweep-census-baseline.json'],
    capture_output=True, text=True, check=True).stdout
d_old = json.loads(committed)
old = {e['id']: e for e in d_old['entities']}
print('old count', len(old), 'new count', len(new))
arr = sorted(set(new) - set(old))
dep = sorted(set(old) - set(new))
print('ARRIVALS:', arr)
print('DEPARTURES:', dep)
diffs = []
inter = sorted(set(new).intersection(set(old)))
for i in inter:
    for k in ('pos', 'yaw', 'scale', 'lib', 'kind', 'bbox', 'comp'):
        if old[i].get(k) != new[i].get(k):
            diffs.append((i, k))
print('DRIFT FIELDS:')
for d in diffs:
    i, k = d
    print(' ', i, k, '->', json.dumps(new[i].get(k))[:160])
    if k in ('pos', 'yaw', 'lib'):
        print('     old:', json.dumps(old[i].get(k))[:160])
print('total drift fields:', len(diffs))
# prefix-domain check on arrivals
for a in arr:
    print('arrival domain:', a, '->', a.split('-')[1] if a.startswith('nx-') else 'OTHER')
# scale/pose sanity on arrivals
for a in arr:
    e = new[a]
    print('arrival sanity:', a, 'kind', e.get('kind'), 'pos', e.get('pos'), 'yaw', e.get('yaw'),
          'scale', e.get('scale'), 'lib', e.get('lib'),
          'bbox', json.dumps(e.get('bbox'))[:120] if e.get('bbox') else None)
