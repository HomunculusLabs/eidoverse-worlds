#!/usr/bin/env python3
"""sweep-162 snapshot check (comparison-only, sweep-161 zero-churn
precedent): fresh projection census vs the COMMITTED baseline
(316 ents, sha16 e146e035726d6998). On a fully quiet tick with zero
full-field drift the committed baseline stays current and the working
tree keeps zero churn — no write. The 4-byte proj delta (209736B ->
209732B) is classified representation-order only, by this full-field
comparison, BEFORE any verdict (sweep-159 law)."""
import json, hashlib, subprocess

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
LIVE = '/tmp/sweep162-census-proj.json'

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

old_raw = subprocess.run(['git', 'show', f'HEAD:{BASE}'], capture_output=True,
                         text=True, check=True).stdout
old = {e['id']: e for e in json.loads(old_raw)['entities']}
new = json.load(open(LIVE))
newc = {e['id']: e for e in new['entities']}

assert new['count'] == len(newc) == 316, f"count mismatch: {new['count']} vs {len(newc)}"
arr = sorted(set(newc) - set(old)); dep = sorted(set(old) - set(newc))
assert not arr, f'unexpected arrivals: {arr}'
assert not dep, f'unexpected departures: {dep}'

FIELDS = ('pos', 'yaw', 'scale', 'kind', 'bbox', 'comp', 'compKeys')
drift = []
for i in sorted(set(newc) & set(old)):
    for k in FIELDS:
        if old[i].get(k) != newc[i].get(k):
            drift.append((i, k))
    if norm_lib(old[i].get('lib')) != norm_lib(newc[i].get('lib')):
        drift.append((i, 'lib'))
assert not drift, f'drift vs committed: {drift}'

raw = open(BASE, 'rb').read()
print(f'baseline current, zero churn: committed {len(raw)}B / 316 ents / '
      f'sha16 {hashlib.sha256(raw).hexdigest()[:16]} untouched; fresh proj '
      f'{len(open(LIVE, "rb").read())}B full-field comparison vs committed: '
      f'ZERO drift on 316 shared ids (0 arrivals, 0 departures, incl '
      f'comp/compKeys/lib-normalized); 4-byte delta classified '
      f'representation-order only, pre-verdict (sweep-159 law)')
