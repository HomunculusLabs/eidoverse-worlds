#!/usr/bin/env python3
"""sweep-286 baseline rewrite: committed 345-ent baseline (sha16 44d6808a39d4f7ff)
-> censusA/B (346 ents, raw 234132B sha16 b12d1bcbfcf26ba1). Asserted pre-write:
the ONLY entity-level diff is ONE arrival nx-struct-morley (struct-209 @ 7bb32ce
PRE-tick, ledger-matched tuple (-26.50746,-0.002271,379.074339) yaw 3.735004599267865
= 214deg, lib a95b12958e032f69 = struct-208 banked sha, comp bag empty), 0
departures, 0 drift on 345 shared ids. Like-for-like RAW census-tool output (no
projection), sweep-283 chassis."""
import json, hashlib, subprocess

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
NEW = '/tmp/s286/censusA.json'

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

old = json.loads(subprocess.run(['git', 'show', f'HEAD:{BASE}'], capture_output=True,
                                text=True, check=True).stdout)
new = json.load(open(NEW))
oldE = {e['id']: e for e in old['entities']}
newE = {e['id']: e for e in new['entities']}

assert old['count'] == len(oldE) == 345, 'committed baseline count != 345'
assert new['count'] == len(newE) == 346, 'censusA count != 346'
arrivals = set(newE) - set(oldE)
departures = set(oldE) - set(newE)
assert arrivals == {'nx-struct-morley'}, ('unexpected arrivals', sorted(arrivals))
assert not departures, ('unexpected departures', sorted(departures))

diffs = {}
for i in oldE:
    for k in ('pos', 'yaw', 'scale', 'kind', 'bbox', 'lib', 'comp', 'compKeys'):
        if k == 'lib':
            if norm_lib(oldE[i].get(k)) != norm_lib(newE[i].get(k)):
                diffs.setdefault(i, []).append(k)
        elif oldE[i].get(k) != newE[i].get(k):
            diffs.setdefault(i, []).append(k)
assert not diffs, ('unexpected shared-id diffs', diffs)

d = newE['nx-struct-morley']
assert norm_lib(d['lib']) == 'a95b12958e032f69', 'morley lib'
assert d['pos'] == [-26.50746, -0.002271, 379.074339], 'morley tuple'
assert abs(d['yaw'] - 3.735004599267865) < 1e-9 and d.get('scale') == 1, 'morley yaw/scale'
assert not d.get('comp'), 'morley comp bag empty'

raw = open(NEW, 'rb').read()
sha16 = hashlib.sha256(raw).hexdigest()[:16]
with open(BASE, 'wb') as f:
    f.write(raw)
print(f'BASELINE_REWRITTEN 346 ents / {len(raw)}B / sha16 {sha16}')
print('pre-write assertions: exactly [arrival nx-struct-morley] — PASS')
