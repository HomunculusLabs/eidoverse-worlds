#!/usr/bin/env python3
"""sweep-161 snapshot rewrite: committed baseline -> fresh projection census.
Quiet tick: same 316-id set, 0 arrivals/departures, zero law-field drift
(pos/yaw/scale/kind/bbox/lib-normalized/comp/compKeys) vs the COMMITTED
baseline (verified full-field pre-write). The proj byte delta
(209736B e146e035 -> 209732B a500c281) is representation-order only —
classified by full-field comparison BEFORE rewrite, sweep-159 law.
Post-write: re-read, verify zero drift + count 316 + sha16."""
import json, hashlib, subprocess

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
LIVE = '/tmp/sweep161-census-proj.json'

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

open(BASE, 'w').write(json.dumps(new, indent=2, sort_keys=False) + '\n')

chk = json.load(open(BASE))
chkd = {e['id']: e for e in chk['entities']}
assert len(chkd) == 316
post = []
for i in sorted(set(chkd) & set(old)):
    for k in FIELDS:
        if old[i].get(k) != chkd[i].get(k):
            post.append((i, k))
    if norm_lib(old[i].get('lib')) != norm_lib(chkd[i].get('lib')):
        post.append((i, 'lib'))
assert not post, f'post-rewrite drift: {post}'
raw = open(BASE, 'rb').read()
print(f'snapshot rewritten: {len(raw)}B / {chk["count"]} ents / '
      f'sha16 {hashlib.sha256(raw).hexdigest()[:16]} — pre-write asserts pass '
      f'(0 arrivals, 0 departures, zero full-field drift on 316 shared), '
      f'post-rewrite drift ZERO')
