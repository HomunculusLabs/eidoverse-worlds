import json, hashlib, subprocess, datetime, math
from pathlib import Path
BASE=Path(__file__).resolve().parents[2]
OUT=Path(__file__).resolve().parent
sha=lambda b:hashlib.sha256(b).hexdigest()
traffic=[]
def get(url, dest):
    if dest.exists():
        b=dest.read_bytes(); status=200
    else:
        r=subprocess.run(['curl','-fSs','--max-time','45',url,'-o',str(dest),'-w','%{http_code}'],capture_output=True,text=True,check=True)
        b=dest.read_bytes(); status=int(r.stdout)
    traffic.append({'method':'GET','url':url,'status':status,'bytes':len(b),'sha256':sha(b),'at':datetime.datetime.now(datetime.timezone.utc).isoformat()})
    return b
originals={}
for d in (BASE/'reviews').glob('live-*'):
    if not d.is_dir() or d.name.startswith('live-recapture-'):continue
    for p in d.rglob('*'):
        if p.is_file():originals[str(p.relative_to(BASE))]=sha(p.read_bytes())
originals['live-views.json']=sha((BASE/'live-views.json').read_bytes())
if not (OUT/'original-evidence-hashes.json').exists():
    (OUT/'original-evidence-hashes.json').write_text(json.dumps(originals,indent=2)+'\n')
census=json.loads(get('https://eidoverse.billding.dev/geom?world=commons-next',OUT/'geom-initial.json'))
expected=json.loads((BASE/'reviews/live-hall-inn-expected.json').read_text())
fields=['id','kind','pos','yaw','scale','lib','parent','comp','name']
def tup(e):return {k:e[k] for k in fields if k in e}
report={'observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'censusKeys':list(census),'hosts':[],'traffic':traffic,'authoredVerbs':0,'uploads':0}
for want in expected:
    host=next(e for e in census['entities'] if e['id']==want['id'])
    assert tup(host)==tup(want),(host,want)
    b=get('https://eidoverse.billding.dev/library/'+host['lib'],OUT/(host['id']+'-served.glb'))
    lights=[]
    for e in census['entities']:
        if e.get('kind')!='light':continue
        dx,dy,dz=[e['pos'][i]-host['pos'][i] for i in range(3)]
        if math.hypot(dx,dz)<15:
            c,s=math.cos(host['yaw']),math.sin(host['yaw'])
            lights.append({'entity':e,'hostLocal':[dx*c-dz*s,dy,dx*s+dz*c],'distanceXZ':math.hypot(dx,dz)})
    report['hosts'].append({'tuple':tup(host),'servedFile':host['id']+'-served.glb','servedSha256':sha(b),'nearLights':lights})
(OUT/'discovery.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
