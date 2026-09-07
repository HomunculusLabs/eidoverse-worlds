#!/usr/bin/env python3
"""sweep-96 snapshot rewrite: 7-field projection like-for-like, epoch A final (292).
Arrivals exactly [nx-struct-conoidfan] (struct-87 authored build-only @ 36be05c1,
placed live by struct-88 @ f34f8168 — the pre-recorded sweep-95 known epoch; tuple
(25.82,-0.0154,48.56) yaw -1.0821 lib c75f8dfbbe2cf9f6 matches the struct-88 ledger
line-for-line); zero departures, zero drift on 291 shared ids (canonical 7-field diff)."""
import json, hashlib, subprocess


def load(path):
    d = json.load(open(path))
    ents = {e['id']: e for e in d['entities']}
    return d, ents


d_new, ents_new = load('/tmp/sweep96-census-B.json')  # epoch B settled (292)

committed = subprocess.run(
    ['git', 'show', 'HEAD:agents/arthur/reviews/sweep-census-baseline.json'],
    capture_output=True, text=True, check=True).stdout
open('/tmp/sweep96-committed-baseline.json', 'w').write(committed)
d_old, ents_old = load('/tmp/sweep96-committed-baseline.json')

arrivals = set(ents_new) - set(ents_old)
departures = set(ents_old) - set(ents_new)
assert arrivals == {'nx-struct-conoidfan'}, sorted(arrivals)
assert not departures, sorted(departures)
assert len(ents_old) == 291 and len(ents_new) == 292, (len(ents_old), len(ents_new))
diffs = [(i, k) for i in sorted(set(ents_new).intersection(set(ents_old)))
         for k in ('pos', 'yaw', 'scale', 'lib', 'kind', 'bbox')
         if ents_old[i].get(k) != ents_new[i].get(k)]
assert not diffs, diffs
print('ASSERT OK: arrivals exactly [conoidfan (struct-88 placement, sweep-95 known epoch)]; '
      '0 departures; 0 drift on 291 shared ids')


def proj(e):
    o = {}
    for k in ('id', 'kind', 'pos', 'yaw', 'scale', 'lib', 'bbox'):
        o[k] = e.get(k)
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
      if ents_chk[i].get(k) != ents_new[i].get(k)]
assert not dr, dr
assert set(ents_chk) == set(ents_new), 'post-rewrite id set mismatch'
print('post-rewrite drift vs live ZERO')
