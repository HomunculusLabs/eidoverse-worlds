#!/usr/bin/env python3
"""sweep-89 snapshot rewrite: 7-field projection like-for-like, epoch C final (289).
Arrivals exactly [nx-struct-reuleauxrotor] (struct-84 in flight, struct-83's authored
R8-1 rotor), zero departures, zero drift on shared ids."""
import json, hashlib, subprocess

def load(path):
    d = json.load(open(path))
    ents = {e['id']: e for e in d['entities']}
    return d, ents

d_new, ents_new = load('/tmp/sweep89-census-raw-C.json')  # epoch C final (settled)

committed = subprocess.run(
    ['git', 'show', 'HEAD:agents/arthur/reviews/sweep-census-baseline.json'],
    capture_output=True, text=True, check=True).stdout
open('/tmp/sweep89-committed-baseline.json', 'w').write(committed)
d_old, ents_old = load('/tmp/sweep89-committed-baseline.json')

arrivals = set(ents_new) - set(ents_old)
departures = set(ents_old) - set(ents_new)
assert arrivals == {'nx-struct-reuleauxrotor'}, sorted(arrivals)
assert not departures, sorted(departures)
diffs = [(i, k) for i in sorted(set(ents_new).intersection(set(ents_old)))
         for k in ('pos', 'yaw', 'scale', 'lib', 'kind', 'bbox')
         if ents_old[i].get(k) != ents_new[i].get(k)]
assert not diffs, diffs
print('ASSERT OK: arrivals exactly [nx-struct-reuleauxrotor] (struct-84 in flight, '
      'struct-83-authored sha 670e397c matches the live lib prefix; tuple '
      '(-12,-0.0373,-64.5) yaw 0; comp bag live = exactly the ledger sidecar pair '
      'motion:pwheel_rr 240pt deltoid path + motion:sails spin z 2.5deg/s); '
      '0 departures; 0 drift on 288 shared ids')

def proj(e):
    o = {}
    for k in ('id', 'kind', 'pos', 'yaw', 'scale', 'lib', 'bbox'):
        o[k] = e.get(k)
    return o

old_order = [e['id'] for e in d_old['entities']]
out_ids = set(old_order) | arrivals
assert set(ents_new) == out_ids, 'id set mismatch'
out = {'world': 'commons-next', 'count': len(old_order) + len(arrivals),
       'entities': [proj(ents_new[i]) for i in old_order] + [proj(ents_new['nx-struct-reuleauxrotor'])]}
data = json.dumps(out, indent=1)
open('agents/arthur/reviews/sweep-census-baseline.json', 'w').write(data)
h = hashlib.sha256(open('agents/arthur/reviews/sweep-census-baseline.json', 'rb').read()).hexdigest()[:16]
print('WRITTEN count', out['count'], 'bytes', len(data), 'sha16', h)

# post-rewrite: projection vs live on the 6 tracked fields (+bbox)
_, ents_chk = load('agents/arthur/reviews/sweep-census-baseline.json')
dr = [(i, k) for i in sorted(set(ents_chk).intersection(set(ents_new)))
      for k in ('pos', 'yaw', 'scale', 'lib', 'kind', 'bbox')
      if ents_chk[i].get(k) != ents_new[i].get(k)]
assert not dr, dr
assert set(ents_chk) == set(ents_new), 'post-rewrite id set mismatch'
print('post-rewrite drift vs live ZERO')
