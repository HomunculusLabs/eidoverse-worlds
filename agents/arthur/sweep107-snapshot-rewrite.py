#!/usr/bin/env python3
"""sweep-107 snapshot rewrite: 7-field projection like-for-like, epoch B settled (299).
Zero departures. Exactly ONE arrival:
- nx-struct-slidingladder @ (3.5, 0.0056, 58) yaw 0 lib ed652efc09e44123 = struct-96
  @ 86998ed4 (R9-4 The Sliding Ladder, PLACED_VERIFIED + idempotent per its ledger,
  committed MID-TICK after epoch A). Zero drift on all 298 shared ids.
"""
import json, hashlib, subprocess


def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')


d_new = json.load(open('/tmp/sweep107-census-b.json'))  # epoch B settled (299)
ents_new = {e['id']: e for e in d_new['entities']}

committed = subprocess.run(
    ['git', 'show', 'HEAD:agents/arthur/reviews/sweep-census-baseline.json'],
    capture_output=True, text=True, check=True).stdout
d_old = json.loads(committed)
ents_old = {e['id']: e for e in d_old['entities']}

arrivals = set(ents_new) - set(ents_old)
departures = set(ents_old) - set(ents_new)
assert arrivals == {'nx-struct-slidingladder'}, sorted(arrivals)
assert not departures, sorted(departures)
assert len(ents_old) == 298 and len(ents_new) == 299, (len(ents_old), len(ents_new))

FIELDS = ('pos', 'yaw', 'scale', 'kind')
diffs = [(i, k) for i in sorted(set(ents_new) & set(ents_old))
         for k in FIELDS
         if ents_old[i].get(k) != ents_new[i].get(k)]
assert not diffs, diffs
lib_flips = sorted(i for i in (set(ents_new) & set(ents_old))
                   if norm_lib(ents_old[i].get('lib')) != norm_lib(ents_new[i].get('lib')))
assert not lib_flips, lib_flips
bbox_drift = [i for i in (set(ents_new) & set(ents_old))
              if ents_old[i].get('bbox') != ents_new[i].get('bbox')]
assert not bbox_drift, bbox_drift
new = ents_new['nx-struct-slidingladder']
assert [round(v, 4) for v in new.get('pos') or []] == [3.5, 0.0056, 58.0], new.get('pos')
assert round(new.get('yaw') or 0, 4) == 0.0
assert norm_lib(new.get('lib')) == 'ed652efc09e44123'
print('ASSERT OK: 0 departures; drift = ZERO on 298 shared ids; arrival = exactly [nx-struct-slidingladder], tuple ledger-exact')


def proj(e):
    o = {}
    for k in ('id', 'kind', 'pos', 'yaw', 'scale', 'lib', 'bbox'):
        o[k] = e.get(k)
    return o


order_old = [e['id'] for e in d_old['entities']]
out = {'world': 'commons-next', 'count': len(ents_new),
       'entities': [proj(ents_new[i]) for i in order_old] + [proj(new)]}
assert len(out['entities']) == 299
data = json.dumps(out, indent=1)
open('agents/arthur/reviews/sweep-census-baseline.json', 'w').write(data)
h = hashlib.sha256(open('agents/arthur/reviews/sweep-census-baseline.json', 'rb').read()).hexdigest()[:16]
print('WRITTEN count', out['count'], 'bytes', len(data), 'sha16', h)

# post-rewrite drift vs live: ZERO
chk = json.load(open('agents/arthur/reviews/sweep-census-baseline.json'))
C = {e['id']: e for e in chk['entities']}
assert len(C) == 299
resid = [(i, k) for i in ents_new for k in ('pos', 'yaw', 'scale', 'kind', 'lib', 'bbox')
         if norm_lib(str(C[i].get('lib'))) != norm_lib(ents_new[i].get('lib'))
         or C[i].get(k) != ents_new[i].get(k)]
assert not resid, resid[:5]
print('POST-REWRITE drift vs live: ZERO')
