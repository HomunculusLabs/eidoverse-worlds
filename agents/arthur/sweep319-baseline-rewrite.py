#!/usr/bin/env python3
# sweep319-baseline-rewrite.py — lawful baseline rewrite with pre-write assertion.
# Diff committed baseline vs census A must be exactly [arrival nx-dress-peacock-001]
# + [nx-carousel lib flip], zero other drift; then copy census A as the new
# committed baseline and re-verify zero drift post-rewrite.
import json, hashlib, shutil

old = json.load(open('agents/arthur/reviews/sweep-census-baseline.json'))
new = json.load(open('/tmp/s319-censusA.json'))
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
assert arrivals == ['nx-dress-peacock-001'], arrivals
assert dep == [], dep
assert drift == ['nx-carousel.lib'], drift
assert old['count'] == 366 and new['count'] == 367
print('PRE-WRITE ASSERTION PASS: exactly [arrival peacock, carousel.lib]')
shutil.copyfile('/tmp/s319-censusA.json', 'agents/arthur/reviews/sweep-census-baseline.json')
b = open('agents/arthur/reviews/sweep-census-baseline.json', 'rb').read()
print('baseline rewritten:', len(b), 'bytes, sha16', hashlib.sha256(b).hexdigest()[:16])
chk = json.load(open('agents/arthur/reviews/sweep-census-baseline.json'))
cE = {e['id']: e for e in chk['entities']}
d2 = []
for i in set(cE) & set(nE):
    for f in ('pos', 'yaw', 'scale', 'kind', 'bbox', 'lib', 'comp', 'compKeys'):
        if cE[i].get(f) != nE[i].get(f):
            d2.append(f'{i}.{f}')
assert d2 == [] and set(cE) == set(nE)
print('POST-REWRITE DRIFT ZERO (cmp vs census A)')
