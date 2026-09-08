#!/usr/bin/env python3
"""sweep-125 snapshot rewrite: 7-field projection like-for-like, epoch B (305).
Zero arrivals, zero departures. Exactly ONE classified drift field:
- nx-struct-slidingladder yaw 0 -> 0.6981317007977318 (2*pi/9 = 40 deg)
  = struct-104 @ 9cdd3b23 committed mid-tick (survey-70 identity cure,
  yaw-only re-seat, same pos/same bytes/no upload, ledger-matched).
All other 304 shared ids zero drift on id/pos/yaw/lib/scale/kind/bbox.
"""
import json, hashlib, subprocess

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

d_new = json.load(open('/tmp/sweep125-census-b.json'))
ents_new = {e['id']: e for e in d_new['entities']}

committed = subprocess.run(
    ['git', 'show', 'HEAD:agents/arthur/reviews/sweep-census-baseline.json'],
    capture_output=True, text=True, check=True).stdout
d_old = json.loads(committed)
ents_old = {e['id']: e for e in d_old['entities']}

assert len(ents_old) == 305 and len(ents_new) == 305, (len(ents_old), len(ents_new))
assert set(ents_old) == set(ents_new), (
    sorted(set(ents_new) - set(ents_old)), sorted(set(ents_old) - set(ents_new)))

# Field-level pre-write assertions
sl_o, sl_n = ents_old['nx-struct-slidingladder'], ents_new['nx-struct-slidingladder']
assert sl_o['yaw'] == 0 and abs(sl_n['yaw'] - 2*3.141592653589793/9) < 1e-9, (sl_o['yaw'], sl_n['yaw'])
for k in ('pos', 'lib', 'scale', 'kind', 'bbox'):
    assert sl_o.get(k) == sl_n.get(k), (k, sl_o.get(k), sl_n.get(k))

FIELDS = ('pos', 'yaw', 'scale', 'kind', 'bbox')
diffs = [(i, k) for i in sorted(set(ents_new) & set(ents_old))
         for k in FIELDS
         if i != 'nx-struct-slidingladder' and ents_old[i].get(k) != ents_new[i].get(k)]
assert diffs == [], diffs
lib_flips = sorted(i for i in (set(ents_new) & set(ents_old))
                   if norm_lib(ents_old[i].get('lib')) != norm_lib(ents_new[i].get('lib')))
assert lib_flips == [], lib_flips

# Rewrite in committed baseline order, 7-field projection, indent=1
def proj(e):
    return {
        'id': e['id'],
        'pos': e['pos'],
        'yaw': e['yaw'],
        'scale': e.get('scale'),
        'kind': e.get('kind'),
        'lib': norm_lib(e.get('lib')),
        'bbox': e.get('bbox'),
    }

out = {'world': 'commons-next', 'count': len(d_old['entities']),
       'entities': [proj(ents_new[e['id']]) for e in d_old['entities']]}
path = 'agents/arthur/reviews/sweep-census-baseline.json'
with open(path, 'w') as f:
    json.dump(out, f, indent=1)
    f.write('\n')

raw = open(path, 'rb').read()
print('written', len(raw), 'bytes', 'sha16', hashlib.sha256(raw).hexdigest()[:16])

# Post-write verification: re-read, drift vs live must be ZERO on all 7 fields
chk = {e['id']: e for e in json.loads(raw.decode())['entities']}
for i, e in ents_new.items():
    c = chk[i]
    assert c['pos'] == e['pos'] and c['yaw'] == e['yaw'] and c['lib'] == norm_lib(e.get('lib'))
    assert c['scale'] == e.get('scale') and c['kind'] == e.get('kind') and c['bbox'] == e.get('bbox')
print('post-rewrite drift vs live: ZERO (305/305 exact)')
