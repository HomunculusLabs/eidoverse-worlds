#!/usr/bin/env python3
"""sweep-175 snapshot rewrite: sweep-170 committed chassis (9-field
like-for-like projection), ARRIVAL variant per sweep-55 precedent.
This tick's single classified change: exactly ONE arrival —
nx-struct-peaucellier at (-10.48884406283718, -0.047974347699418496,
168.3133244939103) yaw 3.141592653589793 lib f66494fa3ffb9ff8
(struct-128 accepted bytes; the struct-129 spawn per its ledger entry —
r168 re-seat candidate, spawn-only family, empty comp bag). Zero
departures, zero lib flips, zero field drift on the 318 shared ids.
The baseline's entity set, order, and world key are preserved; ONLY
the new entity's 9-field projection is APPENDED at the end.
Pre-write asserts: arrivals == exactly [nx-struct-peaucellier], 0
departures, 0 lib flips, 0 full-field drift on the 318 shared ids.
Post-write: re-read, verify count 319 + entity diff vs pre-write
baseline == exactly the one appended entity, everything else
identical."""
import json, hashlib, subprocess

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
LIVE = '/tmp/sweep175-census-b.json'

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

EXPECT_ARRIVAL = 'nx-struct-peaucellier'
EXPECT_LIB = 'f66494fa3ffb9ff8'
arr = sorted(set(newc) - set(old)); dep = sorted(set(old) - set(newc))
assert arr == [EXPECT_ARRIVAL], f'unexpected arrivals: {arr}'
assert not dep, f'unexpected departures: {dep}'
assert len(newc) == 319, f'count mismatch: {len(newc)}'
assert norm_lib(newc[EXPECT_ARRIVAL].get('lib')) == EXPECT_LIB, \
    f"arrival lib mismatch: {newc[EXPECT_ARRIVAL].get('lib')}"

lib_flips = sorted(i for i in (set(newc) & set(old))
                   if norm_lib(old[i].get('lib')) != norm_lib(newc[i].get('lib')))
assert not lib_flips, f'unexpected lib flips: {lib_flips}'

FIELDS = ('pos', 'yaw', 'scale', 'kind', 'bbox', 'compKeys', 'comp')
drift = []
for i in sorted(set(newc) & set(old)):
    for k in FIELDS:
        if old[i].get(k) != newc[i].get(k):
            drift.append((i, k))
assert not drift, f'drift vs committed: {drift}'

# new baseline = committed entity order and set preserved; the one arrival's
# 9-field projection appended at the end; world key preserved from the
# committed baseline (shape check)
entities = [dict(newc[e['id']]) for e in old_d['entities']]
entities.append(newc[EXPECT_ARRIVAL])
out = {
    'world': old_d.get('world'),
    'count': 319,
    'entities': entities,
}
open(BASE, 'w').write(json.dumps(out, indent=2, sort_keys=False) + '\n')

chk = json.load(open(BASE))
chkd = {e['id']: e for e in chk['entities']}
assert chk['count'] == len(chkd) == 319, 'post-write count mismatch'
assert sorted(chkd) == sorted(set(old) | {EXPECT_ARRIVAL}), 'post-write entity set changed'
assert chkd[EXPECT_ARRIVAL] == newc[EXPECT_ARRIVAL], 'post-write arrival not applied'
post = []
for i in sorted(set(chkd) & set(old)):
    for k in FIELDS:
        if old[i].get(k) != chkd[i].get(k):
            post.append((i, k))
    if norm_lib(old[i].get('lib')) != norm_lib(chkd[i].get('lib')):
        post.append((i, 'lib'))
assert not post, f'post-write drift: {post}'
raw = open(BASE, 'rb').read()
print(f'OK: baseline 319 ents, {len(raw)} bytes, sha16 {hashlib.sha256(raw).hexdigest()[:16]}, '
      f'arrival folded [{EXPECT_ARRIVAL} lib {EXPECT_LIB} empty-comp], order+set of prior 318 preserved, '
      f'world key {chk.get("world")!r}, drift ZERO on the 318 shared ids')
