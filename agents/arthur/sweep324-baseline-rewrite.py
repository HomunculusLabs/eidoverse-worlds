#!/usr/bin/env python3
# sweep324-baseline-rewrite.py — lawful baseline rewrite with pre-write assertion.
# Diff committed baseline (sweep-323, 370 ents, sha16 68e9d77f471599ed) vs
# epoch-C census must be exactly [arrival nx-dress-peahen-001 (fauna-28 @
# 0daee003), carousel.lib 8cd33f44->2d61deab (polish-295 @ d95f0154)],
# zero other drift; then copy census C as the new committed baseline and
# re-verify zero drift post-rewrite (sweep-321 copyfile convention).
import json, hashlib, shutil

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
NEW = '/tmp/s324/censusC.json'

old = json.load(open(BASE))
new = json.load(open(NEW))
oE = {e['id']: e for e in old['entities']}
nE = {e['id']: e for e in new['entities']}
arrivals = sorted(set(nE) - set(oE))
dep = sorted(set(oE) - set(nE))
drift = []
for i in set(oE) & set(nE):
    a, b = oE[i], nE[i]
    for f in ('pos', 'yaw', 'scale', 'kind', 'bbox', 'lib', 'comp', 'compKeys'):
        if a.get(f) != b.get(f):
            drift.append(f'{i}.{f}')
assert arrivals == ['nx-dress-peahen-001'], arrivals
assert dep == [], dep
assert drift == ['nx-carousel.lib'], drift
assert old['count'] == 370 and new['count'] == 371

# classify both changes explicitly against the lane ledgers
ph = nE['nx-dress-peahen-001']
assert ph['pos'] == [-45.1, 0.03286, 67.5] and ph['yaw'] == 0.196, ph
assert ph['lib'] == 'store/a1f5190fd50a9775.glb', ph['lib']
assert ph['kind'] == 'thing'
assert sorted(ph.get('compKeys') or []) == ['motion:peahen', 'motion:peahen_crest',
                                            'motion:peahen_head', 'motion:peahen_tail']
assert nE['nx-carousel']['lib'] == 'store/2d61deabf0c2560d.glb'
print('PRE-WRITE ASSERTION PASS: exactly [arrival peahen (fauna-28), carousel.lib '
      '8cd33f44->2d61deab (polish-295)]; 0 departures, 0 other drift; 370->371')

shutil.copyfile(NEW, BASE)

chk = {e['id']: e for e in json.load(open(BASE))['entities']}
dr2 = [(i, f) for i in sorted(set(chk) & set(nE))
       for f in ('pos', 'yaw', 'scale', 'kind', 'bbox', 'lib', 'comp', 'compKeys')
       if chk[i].get(f) != nE[i].get(f)]
assert not dr2, dr2
assert set(chk) == set(nE)
h = hashlib.sha256(open(BASE, 'rb').read()).hexdigest()[:16]
print('post-rewrite drift vs live ZERO (full 8-field projection); id set equal')
print('WRITTEN 371 entities, sha16', h)
