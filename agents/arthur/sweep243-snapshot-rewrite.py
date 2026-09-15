#!/usr/bin/env python3
"""sweep-243 snapshot rewrite: arrival-fold variant on the sweep-223
verbatim-anchor convention (sweep-225 chassis). The committed baseline
(sweep-241 re-baseline, 216436B sha16 9ea3f61b2522fa66) is census-tool
format written VERBATIM from live bytes; this tick's single classified
change is ONE domain-valid arrival nx-struct-catalan = struct-174 @
f8575dac (banked struct-173 CATALAN build 4f0c2a4a7b506f56 placed live as
committed carry BEFORE this tick's census A; tick-start HEAD f8575dac
already carried the placement) — pos [-22.574263, -0.038027, 128.025008]
yaw 0.6981317 (40 deg oblique, struct-104 law), scale 1, comp {} (glow
emissive-in-GLB by contract), tuple matches the committed struct-174
ledger line-for-line (PLACED_VERIFIED census 328, r130.0 az100.0 Math
Avenue SE-side deep band, NN 13.61 tesseract, SAT 5.00 rule30wall,
idempotent rerun zero verbs). Independently corroborated by city-124
observer HOLD (sole arrival classified, register 19/19).
Zero departures, zero lib flips, zero field drift on the 327 shared ids;
epochs A/B byte-identical (settled, 16th consecutive quiet-or-classified
epoch pair).
Pre-write asserts: exactly [nx-struct-catalan] arrivals, 0 departures,
arrival lib == 4f0c2a4a7b506f56, count 328, zero drift on shared ids
across pos/yaw/scale/kind/bbox/lib/compKeys/comp.
Post-write: re-read, count 328, BYTE-IDENTICAL to the live epoch-B file."""
import json, hashlib, subprocess

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
LIVE = '/tmp/sweep243-census-b.json'

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

old_raw = subprocess.run(['git', 'show', f'HEAD:{BASE}'], capture_output=True,
                         text=True, check=True).stdout
old = {e['id']: e for e in json.loads(old_raw)['entities']}

live_raw = open(LIVE, 'r').read()
newc = {e['id']: e for e in json.loads(live_raw)['entities']}
assert len(newc) == len(json.loads(live_raw)['entities']), 'dup ids'

EXPECT_ARRIVAL = 'nx-struct-catalan'
EXPECT_LIB = '4f0c2a4a7b506f56'
arr = sorted(set(newc) - set(old)); dep = sorted(set(old) - set(newc))
assert arr == [EXPECT_ARRIVAL], f'unexpected arrivals: {arr}'
assert not dep, f'unexpected departures: {dep}'
assert len(newc) == 328, f'count mismatch: {len(newc)}'
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

# verbatim fold: write the live epoch-B bytes exactly (sweep-223 convention)
open(BASE, 'w').write(live_raw)

chk_raw = open(BASE, 'rb').read()
chk = json.loads(chk_raw)
chkd = {e['id']: e for e in chk['entities']}
assert chk['count'] == len(chkd) == 328, 'post-write count mismatch'
assert sorted(chkd) == sorted(set(old) | {EXPECT_ARRIVAL}), 'post-write entity set changed'
assert chk_raw == open(LIVE, 'rb').read(), 'post-write bytes not identical to live epoch B'
post = []
for i in sorted(set(chkd) & set(old)):
    for k in FIELDS:
        if old[i].get(k) != chkd[i].get(k):
            post.append((i, k))
    if norm_lib(old[i].get('lib')) != norm_lib(chkd[i].get('lib')):
        post.append((i, 'lib'))
assert not post, f'post-write drift: {post}'
print(f'OK: baseline 328 ents, {len(chk_raw)} bytes, sha16 {hashlib.sha256(chk_raw).hexdigest()[:16]}, '
      f'arrival folded [{EXPECT_ARRIVAL} lib {EXPECT_LIB} empty-comp], verbatim live-bytes anchor, '
      f'drift ZERO on the 327 shared ids')
