#!/usr/bin/env python3
"""sweep-287 baseline rewrite: committed 346-ent baseline (sha16 b12d1bcbfcf26ba1)
-> censusA/B (346 ents, raw 235652B sha16 c308cd2d133598cc). Asserted pre-write:
the ONLY entity-level diff is ONE classified drift field-set nx-dress-hutch
(fauna-4 @ a3ac1590 PRE-tick same-tuple replace: lib f5f47791dadb5abe ->
c0a64ac43a695f67 at identical tuple (38.5,0,-9.5) yaw -1.9 scale 1, bbox change,
comp bag ZERO -> 5x motion:rabbit_{sit,alert,sit_head,alert_head,alert_ears}),
0 arrivals, 0 departures, 0 drift on the other 345 shared ids. Like-for-like
RAW census-tool output (no projection), sweep-283/286 chassis."""
import json, hashlib, subprocess

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
NEW = '/tmp/s287/censusB.json'

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

old = json.loads(subprocess.run(['git', 'show', f'HEAD:{BASE}'], capture_output=True,
                                text=True, check=True).stdout)
new = json.load(open(NEW))
oldE = {e['id']: e for e in old['entities']}
newE = {e['id']: e for e in new['entities']}

assert old['count'] == len(oldE) == 346, 'committed baseline count != 346'
assert new['count'] == len(newE) == 346, 'censusB count != 346'
arrivals = set(newE) - set(oldE)
departures = set(oldE) - set(newE)
assert not arrivals, ('unexpected arrivals', sorted(arrivals))
assert not departures, ('unexpected departures', sorted(departures))

diffs = {}
for i in oldE:
    for k in ('pos', 'yaw', 'scale', 'kind', 'bbox', 'lib', 'comp', 'compKeys'):
        if k == 'lib':
            if norm_lib(oldE[i].get(k)) != norm_lib(newE[i].get(k)):
                diffs.setdefault(i, []).append(k)
        elif oldE[i].get(k) != newE[i].get(k):
            diffs.setdefault(i, []).append(k)
assert set(diffs) == {'nx-dress-hutch'}, ('unexpected drift ids', sorted(diffs))
assert set(diffs['nx-dress-hutch']) <= {'bbox', 'lib', 'comp', 'compKeys'}, diffs

d_old, d_new = oldE['nx-dress-hutch'], newE['nx-dress-hutch']
assert d_new['pos'] == d_old['pos'] == [38.5, 0, -9.5], 'hutch tuple drift'
assert d_new['yaw'] == d_old['yaw'] == -1.9 and d_new.get('scale') == 1, 'hutch yaw/scale'
assert norm_lib(d_old['lib']) == 'f5f47791dadb5abe', 'hutch old lib'
assert norm_lib(d_new['lib']) == 'c0a64ac43a695f67', 'hutch new lib'
assert not d_old.get('comp'), 'hutch old comp bag expected empty'
got = sorted(d_new.get('comp', {}).keys())
want = sorted(['motion:rabbit_sit', 'motion:rabbit_alert',
               'motion:rabbit_sit_head', 'motion:rabbit_alert_head',
               'motion:rabbit_alert_ears'])
assert got == want, ('hutch comp keys', got)

raw = open(NEW, 'rb').read()
sha16 = hashlib.sha256(raw).hexdigest()[:16]
with open(BASE, 'wb') as f:
    f.write(raw)
print(f'BASELINE_REWRITTEN 346 ents / {len(raw)}B / sha16 {sha16}')
print('pre-write assertions: exactly [nx-dress-hutch lib+bbox+comps] — PASS')
