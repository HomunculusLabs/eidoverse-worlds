#!/usr/bin/env python3
"""sweep-136 snapshot rewrite: sweep-132 committed chassis (7-field projection,
key order id/pos/yaw/scale/kind/lib(bare-hex)/bbox, json.dump indent=1 + trailing
newline, committed-baseline entity order + arrival appended last).
Epochs B/C settled (307). Zero departures. Exactly ONE arrival:
- nx-struct-dodecahedron @ (-7.67, -0.028895, 109.73) yaw pi
  lib 671b99124ba55182 comp {} — struct-lane domain prefix, placed mid-tick
  (struct-106 build-only committed @ fc7db189 with placement deferred; the
  placement landed this window with no ledger entry/commit yet = sibling
  work-in-flight, sweep-30/55/57 precedent; live lib differs from the
  build-only sha e30bbfa9 = the lane's pinned placement-tick contract allowed
  a night-bead-fix rebuild; their entry owns that record when it lands).
Zero drift on all 306 shared ids (epochs A quiet, B/C identical arrival).
"""
import json, hashlib, subprocess

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

d_new = json.load(open('/tmp/sweep136-census-c.json'))  # epoch C settled (307)
ents_new = {e['id']: e for e in d_new['entities']}
d_old = json.loads(subprocess.run(
    ['git', 'show', 'HEAD:agents/arthur/reviews/sweep-census-baseline.json'],
    capture_output=True, text=True, check=True).stdout)
ents_old = {e['id']: e for e in d_old['entities']}

arrivals = set(ents_new) - set(ents_old)
departures = set(ents_old) - set(ents_new)
assert arrivals == {'nx-struct-dodecahedron'}, sorted(arrivals)
assert not departures, sorted(departures)
assert len(ents_old) == 306 and len(ents_new) == 307, (len(ents_old), len(ents_new))

FIELDS = ('pos', 'yaw', 'scale', 'kind', 'bbox')
diffs = [(i, k) for i in sorted(set(ents_new) & set(ents_old))
         for k in FIELDS
         if ents_old[i].get(k) != ents_new[i].get(k)]
assert not diffs, diffs
lib_flips = sorted(i for i in (set(ents_new) & set(ents_old))
                   if norm_lib(ents_old[i].get('lib')) != norm_lib(ents_new[i].get('lib')))
assert not lib_flips, lib_flips
new = ents_new['nx-struct-dodecahedron']
assert [round(v, 4) for v in new.get('pos') or []] == [-7.67, -0.0289, 109.73], new.get('pos')
assert round(new.get('yaw') or 0, 6) == 3.141593
assert norm_lib(new.get('lib')) == '671b99124ba55182'
assert (new.get('comp') in (None, {}, '')), new.get('comp')
print('ASSERT OK: 0 departures; drift = ZERO on 306 shared ids; arrival = exactly '
      '[nx-struct-dodecahedron] live tuple as observed, comp {}')

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

out = {'world': 'commons-next', 'count': len(ents_new),
       'entities': [proj(ents_new[e['id']]) for e in d_old['entities']]
       + [proj(ents_new['nx-struct-dodecahedron'])]}
path = 'agents/arthur/reviews/sweep-census-baseline.json'
with open(path, 'w') as f:
    json.dump(out, f, indent=1)
    f.write('\n')

raw = open(path, 'rb').read()
print('written', len(raw), 'bytes', 'sha16', hashlib.sha256(raw).hexdigest()[:16])

# Post-write verification: re-read, drift vs live must be ZERO on all 7 fields
chk = {e['id']: e for e in json.loads(raw.decode())['entities']}
assert len(chk) == 307
for i, e in ents_new.items():
    c = chk[i]
    assert c['pos'] == e['pos'] and c['yaw'] == e['yaw'] and c['lib'] == norm_lib(e.get('lib'))
    assert c['scale'] == e.get('scale') and c['kind'] == e.get('kind') and c['bbox'] == e.get('bbox')
print('post-rewrite drift vs live: ZERO (307/307 exact)')
