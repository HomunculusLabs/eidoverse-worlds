#!/usr/bin/env python3
"""sweep-152 snapshot rewrite: 7-field projection like-for-like, epoch C final (313).
Arrival exactly [nx-struct-voronoi] (struct-113 authored + struct-114 placed @ ecd059c6,
tuple (-11.16,-0.04643,159.61) yaw 0 lib 00b94c926392cece matches the struct-113/114
ledger lines line-for-line; sha 00b94c926392cece == struct-113's pinned build hash
x3-deterministic); zero departures, zero drift on 312 shared ids (canonical 7-field diff)."""
import json, hashlib, subprocess


def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')


def load(path):
    d = json.load(open(path))
    ents = {e['id']: e for e in d['entities']}
    return d, ents


d_new, ents_new = load('/tmp/sweep152-census-c.json')  # epoch C settled (313)

committed = subprocess.run(
    ['git', 'show', '1cc91b05:agents/arthur/reviews/sweep-census-baseline.json'],
    capture_output=True, text=True, check=True).stdout
open('/tmp/sweep152-committed-baseline.json', 'w').write(committed)
d_old, ents_old = load('/tmp/sweep152-committed-baseline.json')

arrivals = set(ents_new) - set(ents_old)
departures = set(ents_old) - set(ents_new)
assert arrivals == {'nx-struct-voronoi'}, sorted(arrivals)
assert not departures, sorted(departures)
assert len(ents_old) == 312 and len(ents_new) == 313, (len(ents_old), len(ents_new))
diffs = [(i, k) for i in sorted(set(ents_new).intersection(set(ents_old)))
         for k in ('pos', 'yaw', 'scale', 'lib', 'kind', 'bbox')
         if (ents_old[i].get(k) if k != 'lib' else norm_lib(ents_old[i].get('lib')))
         != (ents_new[i].get(k) if k != 'lib' else norm_lib(ents_new[i].get('lib')))]
assert not diffs, diffs
print('ASSERT OK: arrivals exactly [voronoi (struct-113/114 placement)]; '
      '0 departures; 0 drift on 312 shared ids')


def proj(e):
    o = {}
    for k in ('id', 'pos', 'yaw', 'scale', 'kind', 'lib', 'bbox'):
        o[k] = e.get(k)
    o['lib'] = norm_lib(e.get('lib'))
    return o


old_order = [e['id'] for e in d_old['entities']]
out_ids = set(old_order) | arrivals
assert set(ents_new) == out_ids, 'id set mismatch'
out = {'world': 'commons-next', 'count': len(old_order) + len(arrivals),
       'entities': [proj(ents_new[i]) for i in old_order]
       + [proj(ents_new[i]) for i in sorted(arrivals)]}
data = json.dumps(out, indent=1)
open('agents/arthur/reviews/sweep-census-baseline.json', 'w').write(data)
h = hashlib.sha256(open('agents/arthur/reviews/sweep-census-baseline.json', 'rb').read()).hexdigest()[:16]
print('WRITTEN count', out['count'], 'bytes', len(data), 'sha16', h)

# post-rewrite: projection vs live on the 6 tracked fields (+bbox)
_, ents_chk = load('agents/arthur/reviews/sweep-census-baseline.json')
dr = [(i, k) for i in sorted(set(ents_chk).intersection(set(ents_new)))
      for k in ('pos', 'yaw', 'scale', 'lib', 'kind', 'bbox')
      if (ents_chk[i].get(k) if k != 'lib' else norm_lib(ents_chk[i].get('lib')))
      != (ents_new[i].get(k) if k != 'lib' else norm_lib(ents_new[i].get('lib')))]
assert not dr, dr
print('POST-REWRITE DRIFT ZERO vs epoch-C live (lib normalized like-for-like)')
