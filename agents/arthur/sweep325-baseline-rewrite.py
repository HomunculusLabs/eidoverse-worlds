#!/usr/bin/env python3
# sweep325-baseline-rewrite.py — lawful baseline rewrite with pre-write assertion.
# Diff committed baseline (sweep-324, 371 ents, sha16 8557bb74839cca25) vs
# epoch-B census must be exactly [arrival nx-struct-rt (struct-236 @ 0d38ee6e
# PRE-tick), arrival nx-dress-frog-001 (fauna-29 @ 9f658778 mid-tick)],
# zero other drift; then copy census B as the new committed baseline and
# re-verify zero drift post-rewrite (sweep-321/324 copyfile convention).
import json, hashlib, shutil

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
NEW = '/tmp/sweep325-censusB.json'

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
assert arrivals == ['nx-dress-frog-001', 'nx-struct-rt'], arrivals
assert dep == [], dep
assert drift == [], drift
assert old['count'] == 371 and new['count'] == 373

# classify both arrivals explicitly against the lane ledgers
rt = nE['nx-struct-rt']
assert rt['pos'] == [87.496668, -0.024244, -0.763572] and rt['yaw'] == 4.197517, rt
assert rt['lib'] == 'store/40059339816dc320.glb', rt['lib']
assert rt['kind'] == 'thing'
assert sorted(rt.get('compKeys') or []) == []
fr = nE['nx-dress-frog-001']
assert fr['pos'] == [7.873, 0.08093, -89.132] and abs(fr['yaw'] - 2.356194490192345) < 1e-12, fr
assert fr['lib'] == 'store/c372159974ef9415.glb', fr['lib']
assert fr['kind'] == 'thing'
assert sorted(fr.get('compKeys') or []) == ['motion:frog', 'motion:frog_head', 'motion:frog_throat']
print('PRE-WRITE ASSERTION PASS: exactly [arrival rt (struct-236), arrival frog '
      '(fauna-29)]; 0 departures, 0 other drift; 371->373')

shutil.copyfile(NEW, BASE)

chk = {e['id']: e for e in json.load(open(BASE))['entities']}
dr2 = [(i, f) for i in sorted(set(chk) & set(nE))
       for f in ('pos', 'yaw', 'scale', 'kind', 'bbox', 'lib', 'comp', 'compKeys')
       if chk[i].get(f) != nE[i].get(f)]
assert not dr2, dr2
assert set(chk) == set(nE)
h = hashlib.sha256(open(BASE, 'rb').read()).hexdigest()[:16]
print('post-rewrite drift vs live ZERO (full 8-field projection); id set equal')
print('WRITTEN 373 entities, sha16', h)
