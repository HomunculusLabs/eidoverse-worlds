#!/usr/bin/env python3
"""mason-0 survey: mason guard — manifest hash match, stop file, id range."""
import json, hashlib, os, urllib.request, sys

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
mason = [e for e in ents if e.get('id', '').startswith('av-mason-')]
ids = [e['id'] for e in mason]
print(f"live mason entities: {len(mason)}")

bad_ids = []
for i in ids:
    try:
        n = int(i.split('-')[-1])
        if n not in range(60):
            bad_ids.append(i)
    except ValueError:
        bad_ids.append(i)
print(f"ids outside 0000-0059: {bad_ids if bad_ids else 'none'}")

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
json.dump([{'id': e['id'], 'pos': e.get('pos'), 'kind': e.get('kind'),
            'lib': (e.get('lib') or '').split('/')[-1]} for e in mason],
          open('/tmp/mason-live.json', 'w'), indent=0)
print("positions dumped to /tmp/mason-live.json")
works_drift = [d for d in drift if d[0].split('-')[-1] != 'l']
lights = [i for i in ids if i.endswith('-l')]
print(f"verdict: works_drift={len(works_drift)} (expect 0), lights={len(lights)} (daemon family)")
sys.exit(1 if works_drift else 0)
