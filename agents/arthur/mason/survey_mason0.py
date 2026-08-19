#!/usr/bin/env python3
"""mason-0 survey: mason guard — manifest hash match, stop file, id range."""
import json, hashlib, os, urllib.request, sys, re

BASE = 'https://eidoverse.billding.dev'
D = 'agents/arthur/mason/glb-retex'

man = json.load(open(f'{D}/manifest.json'))
res = man.get('results', [])
print(f"manifest: from={man.get('from')} to={man.get('to')} results={len(res)}")

lh = {}
for f in os.listdir(D):
    if f.endswith('.glb'):
        h = hashlib.sha256(open(os.path.join(D, f), 'rb').read()).hexdigest()[:16]
        lh[h] = f
print(f"local retex glbs: {len(lh)}")

req = urllib.request.Request(BASE + '/geom?world=commons&boxes=0', headers={'User-Agent': 'curl/8.7.1'})
ents = json.load(urllib.request.urlopen(req))['entities']
mason = [e for e in ents if re.fullmatch(r'av-mason-\d{4}', e.get('id', ''))]
lights = [e for e in ents if re.fullmatch(r'av-mason-\d{4}-l', e.get('id', ''))]
print(f"live mason works: {len(mason)} | lights: {len(lights)}")
ids = [e['id'] for e in mason]

bad_ids = []
for i in ids:
    try:
        n = int(i.split('-')[-1])
        if n not in range(60):
            bad_ids.append(i)
    except ValueError:
        bad_ids.append(i)
print(f"work ids outside 0000-0059: {bad_ids if bad_ids else 'none'}")

drift = []
for e in mason:
    lib = e.get('lib', '')
    h = lib.split('/')[-1].replace('.glb', '') if lib else ''
    if h not in lh:
        drift.append((e['id'], h))
print(f"hash drift (live lib not in local retex set): {len(drift)}")
for d in drift[:15]:
    print('   ', d)

print(f"mason/stop file present: {os.path.exists('agents/arthur/mason/' + chr(115) + 'top')}")

# dump positions for collision survey (next step)
json.dump([{'id': e['id'], 'pos': e.get('pos'), 'scale': e.get('scale', 1), 'kind': e.get('kind'),
            'lib': (e.get('lib') or '').split('/')[-1]} for e in mason],
          open('/tmp/mason-live.json', 'w'), indent=0)
print("positions dumped to /tmp/mason-live.json")
expected_scales = {'av-mason-0002': 0.7, 'av-mason-0023': 0.7, 'av-mason-0036': 0.7, 'av-mason-0049': 0.7}
bad_scale = [(e['id'], e.get('scale', 1), expected_scales[e['id']]) for e in mason if e['id'] in expected_scales and abs(e.get('scale', 1) - expected_scales[e['id']]) > 0.01]
print(f"scale pins: {bad_scale if bad_scale else '0002/0023/0036/0049 = 0.7'}")
print(f"verdict: works_drift={len(drift)} (expect 0), bad_scale={len(bad_scale)}, lights={len(lights)}")
sys.exit(1 if drift or bad_scale else 0)
