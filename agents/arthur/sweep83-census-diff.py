#!/usr/bin/env python3
"""sweep-83 census diff vs committed sweep-82 baseline (284 ents, sha16 c8d3817982a7a9bb).
Canonical 6-field diff (id+pos+yaw+scale+lib+kind+bbox) — comp is NOT tracked
(sweep-80 projection-artifact law: committed snapshots omit comp)."""
import json, subprocess, sys

new = {e['id']: e for e in json.load(open('/tmp/sweep83-census-A.json'))['entities']}
committed = subprocess.run(
    ['git', 'show', 'HEAD:agents/arthur/reviews/sweep-census-baseline.json'],
    capture_output=True, text=True, check=True).stdout
d_old = json.loads(committed)
old = {e['id']: e for e in d_old['entities']}
assert len(old) == 284, f'baseline count assert FAILED: {len(old)} != 284'
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
    print(' ', i, k, '->', json.dumps(new[i].get(k))[:160])
    if k in ('pos', 'yaw', 'lib'):
        print('     old:', json.dumps(old[i].get(k))[:160])
print('total drift fields:', len(diffs))
for a in arr:
    e = new[a]
    print('arrival sanity:', a, 'kind', e.get('kind'), 'pos', e.get('pos'), 'yaw', e.get('yaw'),
          'scale', e.get('scale'), 'lib', e.get('lib'),
          'bbox', json.dumps(e.get('bbox'))[:120] if e.get('bbox') else None)
