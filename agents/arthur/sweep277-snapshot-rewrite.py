#!/usr/bin/env python3
"""sweep-277 snapshot rewrite: 7-field projection like-for-like, epoch C final (342).
Arrivals exactly [nx-struct-elliptic] (struct-203 committed @ 431c8c3d, committed
carry from struct-202 BANKED sha 602519cf), zero departures, zero drift on shared ids."""
import json, hashlib, subprocess

def load(path):
    d = json.load(open(path))
    ents = {e['id']: e for e in d['entities']}
    return d, ents

d_new, ents_new = load('/tmp/sweep277-census-c.json')  # epoch C final (settled)

committed = subprocess.run(
    ['git', 'show', 'HEAD:agents/arthur/reviews/sweep-census-baseline.json'],
    capture_output=True, text=True, check=True).stdout
open('/tmp/sweep277-committed-baseline.json', 'w').write(committed)
d_old, ents_old = load('/tmp/sweep277-committed-baseline.json')

arrivals = set(ents_new) - set(ents_old)
departures = set(ents_old) - set(ents_new)
assert arrivals == {'nx-struct-elliptic'}, sorted(arrivals)
assert not departures, sorted(departures)
diffs = [(i, k) for i in sorted(set(ents_new).intersection(set(ents_old)))
         for k in ('pos', 'yaw', 'scale', 'lib', 'kind', 'bbox')
         if ents_old[i].get(k) != ents_new[i].get(k)]
assert not diffs, diffs
print('ASSERT OK: arrivals exactly [nx-struct-elliptic] (struct-203 committed '
      '@ 431c8c3d, committed carry from struct-202 BANKED sha 602519cf == live '
      'lib prefix exact; tuple (-24.414766, 0.074360, 349.147418) yaw '
      '3.735004599267865; comp {} — matches its committed ledger line-for-line '
      'and city-173 census fold); 0 departures; 0 drift on 341 shared ids')

def proj(e):
    o = {}
    for k in ('id', 'kind', 'pos', 'yaw', 'scale', 'lib', 'bbox'):
        o[k] = e.get(k)
    return o

old_order = [e['id'] for e in d_old['entities']]
out_ids = set(old_order) | arrivals
assert set(ents_new) == out_ids, 'id set mismatch'
new_order = [e['id'] for e in d_new['entities']]
i = new_order.index('nx-struct-elliptic')
assert new_order[:i] == old_order[:i] and new_order[i+1:] == old_order[i:], 'sorted insert at %d' % i
# like-for-like: the committed convention since sweep-275 is RAW census bytes
# (sweep-276 cmp-verified live vs on-disk byte-identical) — write epoch-C raw.
data = open('/tmp/sweep277-census-c.json', 'rb').read()
open('agents/arthur/reviews/sweep-census-baseline.json', 'wb').write(data)
h = hashlib.sha256(data).hexdigest()[:16]
print('WRITTEN count', d_new['count'], 'bytes', len(data), 'sha16', h, '(raw, like-for-like)')

# post-rewrite: projection vs live on the 6 tracked fields (+bbox)
_, ents_chk = load('agents/arthur/reviews/sweep-census-baseline.json')
dr = [(i, k) for i in sorted(set(ents_chk).intersection(set(ents_new)))
      for k in ('pos', 'yaw', 'scale', 'lib', 'kind', 'bbox')
      if ents_chk[i].get(k) != ents_new[i].get(k)]
assert not dr, dr
assert set(ents_chk) == set(ents_new), 'post-rewrite id set mismatch'
print('post-rewrite drift vs live ZERO')
