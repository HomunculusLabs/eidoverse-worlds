#!/usr/bin/env python3
"""sweep-141 snapshot rewrite: sweep-140 committed chassis (7-field projection,
key order id/pos/yaw/scale/kind/lib(bare-hex)/bbox, json.dump indent=1 + trailing
newline, committed-baseline entity order + arrival appended last).
Epoch A fully quiet (309==309, raw sha16 61dcec449edc3149). Epoch B caught
exactly ONE arrival (struct-110 in flight, uncommitted placer
next-place-struct110.ts):
- nx-struct-tesseract @ (-9.07, 0.1478621615839162, 129.68) yaw 0
  lib 4c14467776d58748 scale 1 comp {} — struct-lane domain prefix, tuple
  matches the uncommitted placer's POS/YAW constants line-for-line;
  SAT-clean in the live set (zero new contacts at epoch B).
Zero departures. Zero drift on all 309 shared ids at both epochs.
"""
import json, hashlib, subprocess

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

d_new = json.load(open('/tmp/sweep141-census-b.json'))  # epoch B (310)
ents_new = {e['id']: e for e in d_new['entities']}
d_old = json.loads(subprocess.run(
    ['git', 'show', 'HEAD:agents/arthur/reviews/sweep-census-baseline.json'],
    capture_output=True, text=True, check=True).stdout)
ents_old = {e['id']: e for e in d_old['entities']}

arrivals = set(ents_new) - set(ents_old)
departures = set(ents_old) - set(ents_new)
assert arrivals == {'nx-struct-tesseract'}, sorted(arrivals)
assert not departures, sorted(departures)
assert len(ents_old) == 309 and len(ents_new) == 310, (len(ents_old), len(ents_new))

FIELDS = ('pos', 'yaw', 'scale', 'kind', 'bbox')
diffs = [(i, k) for i in sorted(set(ents_new) & set(ents_old))
         for k in FIELDS
         if ents_old[i].get(k) != ents_new[i].get(k)]
assert not diffs, diffs
lib_flips = sorted(i for i in (set(ents_new) & set(ents_old))
                   if norm_lib(ents_old[i].get('lib')) != norm_lib(ents_new[i].get('lib')))
assert not lib_flips, lib_flips
new = ents_new['nx-struct-tesseract']
assert [round(v, 4) for v in new.get('pos') or []] == [-9.07, 0.1479, 129.68], new.get('pos')
assert round(new.get('yaw') or 0, 6) == 0.0
assert norm_lib(new.get('lib')) == '4c14467776d58748'
assert (new.get('comp') in (None, {}, '')), new.get('comp')
print('ASSERT OK: 0 departures; drift = ZERO on 309 shared ids; arrival = exactly '
      '[nx-struct-tesseract] live tuple as observed, comp {}, tuple matches the '
      'uncommitted placer next-place-struct110.ts line-for-line')

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
       + [proj(ents_new['nx-struct-tesseract'])]}
path = 'agents/arthur/reviews/sweep-census-baseline.json'
with open(path, 'w') as f:
    json.dump(out, f, indent=1)
    f.write('\n')

raw = open(path, 'rb').read()
print('written', len(raw), 'bytes', 'sha16', hashlib.sha256(raw).hexdigest()[:16])

# Post-write verification: re-read, drift vs live must be ZERO on all 7 fields
chk = {e['id']: e for e in json.loads(raw.decode())['entities']}
assert len(chk) == 310
for i, e in ents_new.items():
    c = chk[i]
    assert c['pos'] == e['pos'] and c['yaw'] == e['yaw'] and c['lib'] == norm_lib(e.get('lib'))
    assert c['scale'] == e.get('scale') and c['kind'] == e.get('kind') and c['bbox'] == e.get('bbox')
print('post-rewrite drift vs live: ZERO (310/310 exact)')
