#!/usr/bin/env python3
"""sweep-283 baseline rewrite: committed 344-ent baseline (sha16 80d7954bf2b21f70)
-> censusB (344 ents, sha16 e70239d97e1db774). Asserted pre-write: the ONLY
entity-level diffs are the two classified fauna field-sets (nx-dress-goats,
nx-dress-hens: lib/pos/bbox/comp/compKeys), 0 arrivals, 0 departures, count
344==344. Like-for-like RAW census-tool output (no projection)."""
import json, hashlib, subprocess, sys

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
NEW = '/tmp/s283/censusB.json'

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

old = json.loads(subprocess.run(['git', 'show', f'HEAD:{BASE}'], capture_output=True,
                                text=True, check=True).stdout)
new = json.load(open(NEW))
oldE = {e['id']: e for e in old['entities']}
newE = {e['id']: e for e in new['entities']}

assert old['count'] == len(oldE) == 344, 'committed baseline count != 344'
assert new['count'] == len(newE) == 344, 'censusB count != 344'
assert set(oldE) == set(newE), ('id set changed',
                                sorted(set(oldE) - set(newE)), sorted(set(newE) - set(oldE)))

diffs = {}
for i in oldE:
    for k in ('pos', 'yaw', 'scale', 'kind', 'bbox', 'lib', 'comp', 'compKeys'):
        if k == 'lib':
            if norm_lib(oldE[i].get(k)) != norm_lib(newE[i].get(k)):
                diffs.setdefault(i, []).append(k)
        elif oldE[i].get(k) != newE[i].get(k):
            diffs.setdefault(i, []).append(k)

assert set(diffs) == {'nx-dress-goats', 'nx-dress-hens'}, ('unexpected diff set', diffs)
assert sorted(diffs['nx-dress-goats']) == ['bbox', 'comp', 'compKeys', 'lib'], diffs['nx-dress-goats']
assert sorted(diffs['nx-dress-hens']) == ['bbox', 'comp', 'compKeys', 'lib', 'pos'], diffs['nx-dress-hens']
# classified provenance pins
assert norm_lib(newE['nx-dress-goats']['lib']) == '7e9af5a59d4b77ad', 'goats lib'
assert newE['nx-dress-goats']['pos'] == [34, 0, 13], 'goats tuple'
assert norm_lib(newE['nx-dress-hens']['lib']) == '1ab461bd7b95aab2', 'hens lib'
assert newE['nx-dress-hens']['pos'] == [34, -0.0335, -8], 'hens tuple'
assert len(newE['nx-dress-goats']['comp']) == 6 and len(newE['nx-dress-hens']['comp']) == 6, 'comp bags'

raw = open(NEW, 'rb').read()
sha16 = hashlib.sha256(raw).hexdigest()[:16]
with open(BASE, 'wb') as f:
    f.write(raw)
print(f'BASELINE_REWRITTEN 344 ents / {len(raw)}B / sha16 {sha16}')
print('pre-write assertions: exactly [goats lib/pos/bbox/comp, hens lib/pos/bbox/comp] — PASS')
