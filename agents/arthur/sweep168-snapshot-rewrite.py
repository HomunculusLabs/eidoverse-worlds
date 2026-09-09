#!/usr/bin/env python3
"""sweep-168 snapshot rewrite: sweep-164 committed chassis (9-field
like-for-like projection: id/kind/pos/yaw/scale/lib(store-form verbatim)/
bbox/compKeys/comp, compKeys derived from comp when raw carries null per
sweep-160 epoch #7; json.dump indent=2 + trailing newline; committed entity
order + arrival appended last; world key preserved).
ARRIVAL tick: exactly ONE arrival (nx-struct-clothoid, struct-125 @ 76250b52
committed mid-tick, domain-valid, tuple matches its ledger line-for-line:
PLACED_VERIFIED pos [-13.7414,-0.0010,219.3541] yaw 3.1416 lib 4843ef8ae7093365
census 317->318; also matches struct-124's committed deferred siting contract
az184 r220 S-axis past galton r210 yaw-pi face-on family). Epoch A fully
quiet 317==317 (raw sha16 5d86c019, same as sweep-164..167). Zero departures.
Pre-write asserts: arrivals == exactly [nx-struct-clothoid], 0 departures,
zero full-field drift on the 317 shared ids (pos/yaw/scale/kind/bbox/
lib-normalized/comp/compKeys). Post-write: re-read, verify count 318 +
entity diff vs pre-write baseline == exactly the one arrival + zero drift
on shared. (First rewrite attempt used the stale sweep-138 7-field
projection — self-caught by the on-disk key-set check pre-commit, reverted
via git checkout, zero damage.)"""
import json, hashlib, subprocess

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
LIVE = '/tmp/sweep168-census-C.json'

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

def project(e):
    """9-field like-for-like projection onto the committed convention;
    compKeys derived from comp when raw carries null (sweep-160 epoch #7)."""
    return {
        'id': e.get('id'),
        'kind': e.get('kind'),
        'pos': e.get('pos'),
        'yaw': e.get('yaw'),
        'scale': e.get('scale'),
        'lib': e.get('lib'),
        'bbox': e.get('bbox'),
        'compKeys': e.get('compKeys') if e.get('compKeys') is not None else sorted((e.get('comp') or {}).keys()),
        'comp': e.get('comp') if e.get('comp') is not None else {},
    }

old_raw = subprocess.run(['git', 'show', f'HEAD:{BASE}'], capture_output=True,
                         text=True, check=True).stdout
old_d = json.loads(old_raw)
old = {e['id']: e for e in old_d['entities']}

new_raw = json.load(open(LIVE))
assert len(new_raw['entities']) == len({e['id'] for e in new_raw['entities']}), 'dup ids'
newc = {e['id']: project(e) for e in new_raw['entities']}

EXPECT_ARRIVAL = 'nx-struct-clothoid'
arr = sorted(set(newc) - set(old)); dep = sorted(set(old) - set(newc))
assert arr == [EXPECT_ARRIVAL], f'unexpected arrivals: {arr}'
assert not dep, f'unexpected departures: {dep}'
assert len(newc) == 318, f'count mismatch: {len(newc)}'

FIELDS = ('pos', 'yaw', 'scale', 'kind', 'bbox', 'compKeys', 'comp')
drift = []
for i in sorted(set(newc) & set(old)):
    for k in FIELDS:
        if old[i].get(k) != newc[i].get(k):
            drift.append((i, k))
    if norm_lib(old[i].get('lib')) != norm_lib(newc[i].get('lib')):
        drift.append((i, 'lib'))
assert not drift, f'drift vs committed: {drift}'

# new baseline = committed entity order + the one arrival appended in raw
# census order (its natural position at the tail of the entity list);
# top-level world key preserved from the committed baseline (shape check)
order = [e['id'] for e in old_d['entities']] + [EXPECT_ARRIVAL]
out = {
    'world': old_d.get('world'),
    'count': 318,
    'entities': [dict(newc[i]) for i in order],
}
open(BASE, 'w').write(json.dumps(out, indent=2, sort_keys=False) + '\n')

chk = json.load(open(BASE))
chkd = {e['id']: e for e in chk['entities']}
assert chk['count'] == len(chkd) == 318, 'post-write count mismatch'
assert sorted(set(chkd) - set(old)) == [EXPECT_ARRIVAL], 'post-write entity diff not exactly the arrival'
post = []
for i in sorted(set(chkd) & set(old)):
    for k in FIELDS:
        if old[i].get(k) != chkd[i].get(k):
            post.append((i, k))
    if norm_lib(old[i].get('lib')) != norm_lib(chkd[i].get('lib')):
        post.append((i, 'lib'))
assert not post, f'post-write drift: {post}'
raw = open(BASE, 'rb').read()
print(f'OK: baseline -> 318 ents, {len(raw)} bytes, sha16 {hashlib.sha256(raw).hexdigest()[:16]}, '
      f'arrival [{EXPECT_ARRIVAL}] appended last, world key {chk.get("world")!r}, drift ZERO on 317 shared ids')
