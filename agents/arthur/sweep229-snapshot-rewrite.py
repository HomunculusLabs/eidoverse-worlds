#!/usr/bin/env python3
"""sweep-229 snapshot rewrite: re-seat-fold variant on the sweep-223/225
verbatim-anchor convention. The committed baseline (sweep-225 arrival-fold,
215224B sha16 f78fdcb6b2407ef0) is census-tool format written VERBATIM from
live bytes; this tick's single classified change is ONE domain-valid re-seat
nx-struct-boy = struct-161 @ 55c95333 (banked struct-160 v2 smoke build
a20c9275136841f3 placed live between epoch A and epoch B) — v1 retired from
W r100 ([-100, 0.018685, 0] yaw pi, lib 8c25b66573954418, bbox 6.98x7.02x6.98
'deformed ball' vertical-pinwheel defect), v2 seated E R110 az90
[110, -0.019174, 0] yaw -0.6981317007977318, bbox 10.1x6.523x7.1, tuple
matches the committed struct-161 ledger line-for-line (REPLACED_VERIFIED,
comp {}, census 325).
Zero arrivals, zero departures, zero drift on the 324 other shared ids;
epochs B/C byte-identical (settled).
Pre-write asserts: 0 arrivals, 0 departures, drift set exactly the boy quad
(pos, yaw, lib, bbox), count 325, boy lib == a20c9275136841f3.
Post-write: re-read, count 325, BYTE-IDENTICAL to the live epoch-C file."""
import json, hashlib, subprocess

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
LIVE = '/tmp/sweep229-census-c.json'

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

old_raw = subprocess.run(['git', 'show', f'HEAD:{BASE}'], capture_output=True,
                         text=True, check=True).stdout
old = {e['id']: e for e in json.loads(old_raw)['entities']}

live_raw = open(LIVE, 'r').read()
newc = {e['id']: e for e in json.loads(live_raw)['entities']}
assert len(newc) == len(json.loads(live_raw)['entities']), 'dup ids'

EXPECT_ID = 'nx-struct-boy'
EXPECT_LIB = 'a20c9275136841f3'
arr = sorted(set(newc) - set(old)); dep = sorted(set(old) - set(newc))
assert not arr, f'unexpected arrivals: {arr}'
assert not dep, f'unexpected departures: {dep}'
assert len(newc) == 325, f'count mismatch: {len(newc)}'
assert norm_lib(newc[EXPECT_ID].get('lib')) == EXPECT_LIB, \
    f"boy lib mismatch: {newc[EXPECT_ID].get('lib')}"
assert newc[EXPECT_ID].get('pos') == [110, -0.019174, 0], \
    f"boy pos mismatch: {newc[EXPECT_ID].get('pos')}"

lib_flips = sorted(i for i in (set(newc) & set(old))
                   if norm_lib(old[i].get('lib')) != norm_lib(newc[i].get('lib')))
assert lib_flips == [EXPECT_ID], f'unexpected lib flips: {lib_flips}'

FIELDS = ('pos', 'yaw', 'scale', 'kind', 'bbox', 'compKeys', 'comp')
drift = []
for i in sorted(set(newc) & set(old)):
    for k in FIELDS:
        if old[i].get(k) != newc[i].get(k):
            drift.append((i, k))
assert drift == [(EXPECT_ID, 'pos'), (EXPECT_ID, 'yaw'), (EXPECT_ID, 'bbox')], \
    f'unexpected drift vs committed: {drift}'

# verbatim fold: write the live epoch-C bytes exactly (sweep-223 convention)
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
assert post == [(EXPECT_ID, 'pos'), (EXPECT_ID, 'yaw'), (EXPECT_ID, 'bbox'),
                (EXPECT_ID, 'lib')], f'post-write drift: {post}'
print(f'OK: baseline 325 ents, {len(chk_raw)} bytes, sha16 {hashlib.sha256(chk_raw).hexdigest()[:16]}, '
      f're-seat folded [{EXPECT_ID} -> lib {EXPECT_LIB} @ E R110 az90], verbatim live-bytes anchor, '
      f'drift ZERO on the 324 other shared ids')
