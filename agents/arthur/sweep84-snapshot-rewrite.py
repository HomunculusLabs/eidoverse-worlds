#!/usr/bin/env python3
"""sweep-84 snapshot rewrite: projection like-for-like, epoch B final (286).
Pre-write assertion: arrivals exactly [screwwell, streamstones]; drift exactly
the struct-80 ogeegate yaw repair."""
import json, hashlib, subprocess

def load(path):
    d = json.load(open(path))
    ents = {e['id']: e for e in d['entities']}
    return d, ents

d_new, ents_new = load('/tmp/sweep84-census-B.json')  # epoch B final (settled)

committed = subprocess.run(
    ['git', 'show', 'HEAD:agents/arthur/reviews/sweep-census-baseline.json'],
    capture_output=True, text=True, check=True).stdout
open('/tmp/sweep84-committed-baseline.json', 'w').write(committed)
d_old, ents_old = load('/tmp/sweep84-committed-baseline.json')

arrivals = set(ents_new) - set(ents_old)
departures = set(ents_old) - set(ents_new)
assert arrivals == {'nx-struct-screwwell', 'nx-dress-se-streamstones-001'}, sorted(arrivals)
assert not departures, sorted(departures)
diffs = [(i, k) for i in sorted(set(ents_new).intersection(set(ents_old)))
         for k in ('pos', 'yaw', 'scale', 'lib', 'kind', 'bbox')
         if ents_old[i].get(k) != ents_new[i].get(k)]
expect = {('nx-struct-ogeegate', 'yaw')}
assert set(diffs) == expect, sorted(set(diffs) ^ expect)
print('ASSERT OK: arrivals exactly [screwwell, streamstones]; diff exactly the '
      'struct-80 ogeegate yaw repair (-32.68 deg-unit bug -> -0.5703736 rad)')

def proj(e):
    o = {}
    for k in ('id', 'kind', 'pos', 'yaw', 'scale', 'lib', 'bbox'):
        o[k] = e.get(k)
    return o

old_order = [e['id'] for e in d_old['entities']]
new_ents = []
for eid in old_order:
    new_ents.append(proj(ents_new[eid]))
for a in sorted(arrivals):
    new_ents.append(proj(ents_new[a]))
d_out = {'entities': new_ents}
blob = json.dumps(d_out, indent=1, sort_keys=False) + '\n'
open('agents/arthur/reviews/sweep-census-baseline.json', 'w').write(blob)
print('written', len(blob), 'bytes,', len(new_ents), 'entities, sha16',
      hashlib.sha256(blob.encode()).hexdigest()[:16])

# post-rewrite drift vs live: ZERO
_, ents_check = load('agents/arthur/reviews/sweep-census-baseline.json')
drift = [(i, k) for i in ents_check for k in ('pos', 'yaw', 'scale', 'lib', 'kind', 'bbox')
         if ents_check[i].get(k) != ents_new[i].get(k)]
assert not drift, drift
print('post-rewrite drift vs live epoch B: ZERO')
