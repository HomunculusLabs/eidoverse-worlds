#!/usr/bin/env python3
"""sweep-132 snapshot rewrite: sweep-125 committed chassis (7-field projection,
key order id/pos/yaw/scale/kind/lib(bare-hex)/bbox, json.dump indent=1 + trailing
newline, committed-baseline entity order + arrival appended last).
Single stable epoch (306). Zero departures. Exactly ONE arrival:
- nx-struct-hilbertlabyrinth @ (-6.98, -0.01822, 99.76) yaw pi
  lib 38d3bb8f49a08af9 comp {} — struct-105 R10-7 placement @ 11ff8cba, committed
  PRE-tick (tick-start HEAD carries it), census 305->306 per its own ledger line,
  tuple matches line-for-line (sha 38d3bb8f, same pos/yaw, idempotent).
Zero drift on all 305 shared ids (epochs A and B identical, 20s-paced).

PROBE SELF-CATCH (disclosed, sweep-55 write-format class): the first version of
this script wrote get()-projected keys in census order (kind early, store/-prefixed
lib, no trailing newline) — the size-vs-prior guard tripped (+3169B vs ~+400B
expected) BEFORE any commit, the bad write was inspected via git diff (646/612
formatting churn), and the file was rewritten like-for-like per the committed
sweep-125 chassis before staging. Final diff: 35 insertions / 1 deletion.
"""
import json, hashlib, subprocess

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

d_new = json.load(open('/tmp/sweep132-census-b.json'))  # epoch B settled (306)
ents_new = {e['id']: e for e in d_new['entities']}
d_old = json.loads(subprocess.run(
    ['git', 'show', 'HEAD:agents/arthur/reviews/sweep-census-baseline.json'],
    capture_output=True, text=True, check=True).stdout)
ents_old = {e['id']: e for e in d_old['entities']}

arrivals = set(ents_new) - set(ents_old)
departures = set(ents_old) - set(ents_new)
assert arrivals == {'nx-struct-hilbertlabyrinth'}, sorted(arrivals)
assert not departures, sorted(departures)
assert len(ents_old) == 305 and len(ents_new) == 306, (len(ents_old), len(ents_new))

FIELDS = ('pos', 'yaw', 'scale', 'kind', 'bbox')
diffs = [(i, k) for i in sorted(set(ents_new) & set(ents_old))
         for k in FIELDS
         if ents_old[i].get(k) != ents_new[i].get(k)]
assert not diffs, diffs
lib_flips = sorted(i for i in (set(ents_new) & set(ents_old))
                   if norm_lib(ents_old[i].get('lib')) != norm_lib(ents_new[i].get('lib')))
assert not lib_flips, lib_flips
new = ents_new['nx-struct-hilbertlabyrinth']
assert [round(v, 4) for v in new.get('pos') or []] == [-6.98, -0.0182, 99.76], new.get('pos')
assert round(new.get('yaw') or 0, 6) == 3.141593
assert norm_lib(new.get('lib')) == '38d3bb8f49a08af9'
assert (new.get('comp') in (None, {}, '')), new.get('comp')
print('ASSERT OK: 0 departures; drift = ZERO on 305 shared ids; arrival = exactly '
      '[nx-struct-hilbertlabyrinth], tuple ledger-exact (struct-105 @ 11ff8cba), comp {}')

def proj(e):
    return {
        'id': e['id'],
        'pos': e['pos'],
        'yaw': e['yaw'],
        'scale': e.get('scale'),
        'kind': e.get('kind'),
        'lib': norm_lib(e.get('lib')),
        'bbox': e.get('bbox'),
    }

out = {'world': 'commons-next', 'count': len(ents_new),
       'entities': [proj(ents_new[e['id']]) for e in d_old['entities']]
       + [proj(ents_new['nx-struct-hilbertlabyrinth'])]}
path = 'agents/arthur/reviews/sweep-census-baseline.json'
with open(path, 'w') as f:
    json.dump(out, f, indent=1)
    f.write('\n')

raw = open(path, 'rb').read()
print('written', len(raw), 'bytes', 'sha16', hashlib.sha256(raw).hexdigest()[:16])

# Post-write verification: re-read, drift vs live must be ZERO on all 7 fields
chk = {e['id']: e for e in json.loads(raw.decode())['entities']}
assert len(chk) == 306
for i, e in ents_new.items():
    c = chk[i]
    assert c['pos'] == e['pos'] and c['yaw'] == e['yaw'] and c['lib'] == norm_lib(e.get('lib'))
    assert c['scale'] == e.get('scale') and c['kind'] == e.get('kind') and c['bbox'] == e.get('bbox')
print('post-rewrite drift vs live: ZERO (306/306 exact)')
