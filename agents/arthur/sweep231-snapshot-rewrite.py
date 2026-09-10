#!/usr/bin/env python3
"""sweep-231 snapshot rewrite: lib-fold variant on the sweep-229 verbatim-anchor
convention. The committed baseline (sweep-229 re-seat-fold, 215228B sha16
70f823b4d1aec102) pre-dates the struct-163 unduloid v3 placement; this tick's
single classified change is ONE domain-valid lib flip nx-struct-unduloid
3a9b92b8aeb3722d -> 014ed586a083a4df at identical tuple
[95.262794, -0.031702, 55] yaw -2.0943951023931953 — the known epoch recorded
by sweep-230's register note for THIS tick to fold (sweep-52 precedent).
Zero arrivals, zero departures, zero drift on the 324 other shared ids;
epochs A/B/C byte-identical (settled).
Pre-write asserts: 0 arrivals, 0 departures, lib flips exactly the unduloid,
NO field drift at all (lib-only fold), count 325, lib == 014ed586a083a4df.
Post-write: re-read, count 325, BYTE-IDENTICAL to the live epoch-C file."""
import json, hashlib, subprocess

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
LIVE = '/tmp/sweep231-census-c.json'

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

old_raw = subprocess.run(['git', 'show', f'HEAD:{BASE}'], capture_output=True,
                         text=True, check=True).stdout
old = {e['id']: e for e in json.loads(old_raw)['entities']}

live_raw = open(LIVE, 'r').read()
newc = {e['id']: e for e in json.loads(live_raw)['entities']}
assert len(newc) == len(json.loads(live_raw)['entities']), 'dup ids'

EXPECT_ID = 'nx-struct-unduloid'
EXPECT_LIB = '014ed586a083a4df'
arr = sorted(set(newc) - set(old)); dep = sorted(set(old) - set(newc))
assert not arr, f'unexpected arrivals: {arr}'
assert not dep, f'unexpected departures: {dep}'
assert len(newc) == 325, f'count mismatch: {len(newc)}'
assert norm_lib(newc[EXPECT_ID].get('lib')) == EXPECT_LIB, \
    f"unduloid lib mismatch: {newc[EXPECT_ID].get('lib')}"

lib_flips = sorted(i for i in (set(newc) & set(old))
                   if norm_lib(old[i].get('lib')) != norm_lib(newc[i].get('lib')))
assert lib_flips == [EXPECT_ID], f'unexpected lib flips: {lib_flips}'

FIELDS = ('pos', 'yaw', 'scale', 'kind', 'bbox', 'compKeys', 'comp')
drift = []
for i in sorted(set(newc) & set(old)):
    for k in FIELDS:
        if old[i].get(k) != newc[i].get(k):
            drift.append((i, k))
assert drift == [], f'unexpected field drift vs committed: {drift}'

# verbatim fold: write the live epoch-C bytes exactly (sweep-223/229 convention)
open(BASE, 'w').write(live_raw)

chk_raw = open(BASE, 'rb').read()
chk = json.loads(chk_raw)
chkd = {e['id']: e for e in chk['entities']}
assert chk['count'] == len(chkd) == 325, 'post-write count mismatch'
assert sorted(chkd) == sorted(old), 'post-write entity set changed'
assert chk_raw == open(LIVE, 'rb').read(), 'post-write bytes not identical to live epoch C'
post = []
for i in sorted(set(chkd) & set(old)):
    for k in FIELDS:
        if old[i].get(k) != chkd[i].get(k):
            post.append((i, k))
    if norm_lib(old[i].get('lib')) != norm_lib(chkd[i].get('lib')):
        post.append((i, 'lib'))
assert post == [(EXPECT_ID, 'lib')], f'post-write drift: {post}'
print(f'OK: baseline 325 ents, {len(chk_raw)} bytes, sha16 {hashlib.sha256(chk_raw).hexdigest()[:16]}, '
      f'lib-fold [{EXPECT_ID} -> {EXPECT_LIB} @ identical tuple], verbatim live-bytes anchor, '
      f'drift ZERO on the 324 other shared ids')
