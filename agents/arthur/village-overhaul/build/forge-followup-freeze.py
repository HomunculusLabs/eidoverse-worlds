"""Forge-only rebuild identity and frozen-input guard. No world or source mutation."""
from pathlib import Path
import hashlib,json,os,subprocess
ROOT=Path(__file__).resolve().parents[4]
BASE=Path(__file__).resolve().parent.parent
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
paths=list((BASE/'before').rglob('*'))+list((BASE/'neighbors').rglob('*'))
paths += [BASE/p for p in ['build-court.ts','build-forge.ts','kit.ts','build/court.glb','build/court.json','build/forge-assembly-before.glb','build/forge-assembly-after.glb']]
paths += [ROOT/p for p in ['agents/arthur/assets/glbwrite.ts','agents/arthur/assets/mergekit.ts','agents/arthur/cabin-overhaul/render.ts','agents/arthur/cabin-overhaul/verify-player.ts','agents/arthur/village-overhaul/verify-approach.ts']]
paths=[p for p in paths if p.is_file()]
protected={str(p.relative_to(ROOT)):sha(p) for p in paths}
model=BASE/'build/forge.glb';old=sha(model);runs=[]
for i in range(2):
    prev=model.stat().st_mtime_ns
    proc=subprocess.run(['bun',str(BASE/'build-forge.ts')],cwd=ROOT,capture_output=True,text=True)
    (BASE/f'reviews/forge-followup-build-{i+1}.log').write_text(proc.stdout+proc.stderr)
    assert proc.returncode==0,proc.stderr
    runs.append({'sha256':sha(model),'bytes':model.stat().st_size,'mtimeNs':model.stat().st_mtime_ns,'previousMtimeNs':prev})
    assert runs[-1]['mtimeNs']>prev,'no new write'
    assert runs[-1]['sha256']==old,'unexpected forge byte change'
changed=[p for p,s in protected.items() if sha(ROOT/p)!=s]
assert not changed,changed
out={'status':'PASS_IDENTICAL_REBUILD_NOT_A_REPAIR','baselineCandidateSha256':old,'runs':runs,'forgeSourceSha256':sha(BASE/'build-forge.ts'),'unchangedProtectedInputs':protected,'changedProtectedInputs':changed}
(BASE/'build/forge-followup-determinism.json').write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps({k:v for k,v in out.items() if k!='unchangedProtectedInputs'},indent=2));print('protected files unchanged:',len(protected))
env=dict(os.environ,CABIN_PLAYER_RUNTIME_DIR=str(ROOT/'agents/arthur/cabin-overhaul/runtime'))
proc=subprocess.run(['bun',str(BASE/'build/forge-followup-gates.ts')],cwd=ROOT,env=env,capture_output=True,text=True)
(BASE/'reviews/forge-followup-gates.log').write_text(proc.stdout+proc.stderr)
print('FORGE_GATES_EXIT',proc.returncode);print(proc.stdout)
assert proc.returncode==0,proc.stderr
route=json.loads((BASE/'build/forge-player-report.json').read_text())
assert route['physicalSupport']['pass']
print('supported trace samples',len(route['physicalSupport']['samples']))
