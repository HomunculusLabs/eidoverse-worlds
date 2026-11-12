// Independent integration regressions. No live network, builders or implementation edits.
// Child isolation prevents filesystem mocks from contaminating the existing suites.
import {test,expect} from 'bun:test';
import {resolve} from 'node:path';

const repo=resolve(import.meta.dir,'../../..');
const runtime=resolve(import.meta.dir,'../cabin-overhaul/runtime');
function child(code:string){
 const r=Bun.spawnSync(['bun','-e',code],{cwd:repo,env:{...process.env,CABIN_PLAYER_RUNTIME_DIR:runtime}});
 const stdout=new TextDecoder().decode(r.stdout),stderr=new TextDecoder().decode(r.stderr);
 expect(r.exitCode,stderr+'\n'+stdout).toBe(0);
 return JSON.parse(stdout.trim().split('\n').at(-1)!);
}

for(const id of ['nx-town-hall','nx-town-inn'])test(`parent inspector consumes real approved ${id} routes and frozen neighbors`,()=>{
 const result=child(`
 import {mock} from 'bun:test';
 import * as fs from 'node:fs';
 import {resolve,join} from 'node:path';
 import {tmpdir} from 'node:os';
 const read=fs.readFileSync,write=fs.writeFileSync,mkdir=fs.mkdirSync,realpath=fs.realpathSync,exists=fs.existsSync,rm=fs.rmSync;
 const root=resolve('agents/arthur/village-overhaul'),prefix=join(root,'verification')+'/',temp=fs.mkdtempSync(join(tmpdir(),'village-parent-audit-'));
 const redirect=(p)=>typeof p==='string'&&p.startsWith(prefix)?join(temp,p.slice(prefix.length)):p;
 mock.module('node:fs',()=>({...fs,readFileSync:(p,...a)=>read(redirect(p),...a),writeFileSync:(p,...a)=>write(redirect(p),...a),mkdirSync:(p,...a)=>mkdir(redirect(p),...a),realpathSync:(p,...a)=>realpath(redirect(p),...a)}));
 globalThis.fetch=async(url)=>{
  const u=new URL(url);if(u.origin!=='https://eidoverse.billding.dev'||!['/lib/colliders.js','/lib/supportclass.js'].includes(u.pathname))throw Error('OFFLINE TEST refuses network');
  return new Response(read(resolve(process.env.CABIN_PLAYER_RUNTIME_DIR,u.pathname.split('/').at(-1))));
 };
 try{
  const {loadFrozen,selectNeighbors,sourceGate,sha}=await import('./agents/arthur/village-overhaul/rollout.ts');
  const {inspect}=await import('./agents/arthur/village-overhaul/preflight.ts');
  const c=loadFrozen(root),a=JSON.parse(read(join(root,'approved.json'),'utf8')),slot=a.slots.find(s=>s.id===${JSON.stringify(id)});
  if(!slot)throw Error('real approval required');
  const source=sourceGate(root,slot,resolve(root,'../../..'));
  const by=Object.fromEntries(c.census.entities.map(e=>[e.id,e]));
  const entities={...c.foldedHosts,...Object.fromEntries(c.protectedSet.map(p=>[p.geom.id,p.folded]))};
  const neighbors=selectNeighbors(by,slot).map(e=>{
   if(!e.lib)return {...e,folded:entities[e.id],bytes:null,sha256:null};
   const path=['before','neighbors'].map(d=>join(root,d,e.id+'.glb')).find(exists);
   if(!path)throw Error('missing real neighbor fixture '+e.id);
   const bytes=read(path);return {...e,folded:entities[e.id],bytes,sha256:sha(bytes)};
  });
  const input={schema:'village-preflight-input-v1',world:'commons-next',slot,before:c.baseline.find(e=>e.id===slot.id),capturedHost:c.foldedHosts[slot.id],stage:'local',sourceBytes:source,modelBytes:source,modelSha256:sha(source),neighbors,census:by,state:{entities,mounts:{}},contextSha256:sha('OFFLINE real frozen-census parent integration audit')};
  try{const r=await inspect(input);console.log(JSON.stringify({ok:true,verdict:r.verdict,neighbors:r.neighbors.map(n=>n.id)}));}
  catch(e){console.log(JSON.stringify({ok:false,error:e.message,neighbors:neighbors.map(n=>n.id)}));}
 }finally{rm(temp,{recursive:true,force:true});}
 `);
 expect(result.ok,JSON.stringify(result)).toBe(true);
 expect(result.verdict).toBe('passed');
},60000);

// This is an in-memory adversarial route, not a changed accepted contract or evidence.
// It demonstrates that declared waypoint heights can launder a phantom bbox floor.
test('market approach cannot be made passing merely by declaring the phantom road-box top as floor',()=>{
 const r=child(`
 import {readFileSync} from 'node:fs';
 import {THREE,loadPlayerMesh,loadPlayerAssembly} from './agents/arthur/cabin-overhaul/verify-player.ts';
 import {probeApproach} from './agents/arthur/village-overhaul/verify-approach.ts';
 const base='agents/arthur/village-overhaul/';
 const k=JSON.parse(readFileSync(base+'build/nx-town-market-approach-contract.json','utf8'));
 const model=await loadPlayerMesh(base+'build/nx-town-market.glb');
 if(model.sha256!==k.sha256)throw Error('real model/route fixture drift');
 const neighbors=await loadPlayerAssembly(k,k.assembly);
 const run=c=>probeApproach(model.root.clone(true),c,neighbors.map(n=>({...n,root:n.root.clone(true)})));
 const original=run(k),changed=structuredClone(k),phantom=0.058276183903217316;
 for(const w of changed.waypoints)w.pos[1]=phantom;
 const lifted=run(changed),roots=[model.root,...neighbors.map(n=>n.root)];
 roots.forEach(root=>root.traverse(m=>{if(m.isMesh)m.material.side=THREE.DoubleSide;}));
 const physical=changed.waypoints.map(w=>{
  const ray=new THREE.Raycaster(new THREE.Vector3(w.pos[0],phantom+.04,w.pos[2]),new THREE.Vector3(0,-1,0));
  const ys=roots.flatMap(root=>ray.intersectObject(root,true).map(h=>h.point.y));
  return {name:w.name,declared:w.pos[1],physicalTop:Math.max(k.terrainY,...ys)};
 });
 console.log(JSON.stringify({original:original.status,lifted:lifted.status,physical,failedOriginalLegs:original.walks.filter(w=>!w.pass).length}));
 `);
 expect(r.original).toBe('FAIL');
 expect(r.physical.every((p:any)=>p.declared-p.physicalTop>.035),JSON.stringify(r)).toBe(true);
 expect(r.lifted,JSON.stringify(r)).toBe('FAIL');
},60000);

for(const file of ['nx-tower.route.json','nx-town-belltower.route.json','nx-town-belltower.ladder-approach.json'])
test(`submitted ${file} must not certify a physically unsupported approach height`,()=>{
 const r=child(`
 import {readFileSync} from 'node:fs';
 import {THREE,loadPlayerMesh,loadPlayerAssembly,verifyPlayerMesh} from './agents/arthur/cabin-overhaul/verify-player.ts';
 const base='agents/arthur/village-overhaul/',k=JSON.parse(readFileSync(base+'build/'+${JSON.stringify(file)},'utf8'));
 const m=await loadPlayerMesh(base+'build/'+k.id+'.glb');if(m.sha256!==k.sha256)throw Error('real model/route fixture drift');
 const ns=await loadPlayerAssembly(k,k.assembly),roots=[m.root,...ns.map(n=>n.root)],w=k.waypoints[0];
 roots.forEach(root=>root.traverse(m=>{if(m.isMesh)m.material.side=THREE.DoubleSide;}));
 const ray=new THREE.Raycaster(new THREE.Vector3(w.pos[0],w.pos[1]+.04,w.pos[2]),new THREE.Vector3(0,-1,0));
 const ys=roots.flatMap(root=>ray.intersectObject(root,true).map(h=>h.point.y));
 const physicalTop=Math.max(k.terrainY,...ys);
 const report=verifyPlayerMesh(m.root,k,ns);
 console.log(JSON.stringify({status:report.status,firstPoint:w,physicalTop,supportError:w.pos[1]-physicalTop,failures:report.failures}));
 `);
 // Accept an honest route rejection or physical support within the verifier's own tolerance.
 expect(r.status==='FAIL'||r.supportError<=.035,JSON.stringify(r)).toBe(true);
},60000);

test('scholar upper route is consumable directly by the parent, without an unencoded builder-only proof frame',()=>{
 const r=child(`
 import {readFileSync} from 'node:fs';
 import {THREE,loadPlayerMesh,loadPlayerAssembly,verifyPlayerMesh} from './agents/arthur/cabin-overhaul/verify-player.ts';
 import {applyProofFrame} from './agents/arthur/village-overhaul/preflight.ts';
 import {normalizeRootYaw} from './agents/arthur/village-overhaul/verify-approach.ts';
 const base='agents/arthur/village-overhaul/',saved=JSON.parse(readFileSync(base+'build/nx-tower.upper-route.json','utf8'));
 const results={};
 for(const frame of ['parent-direct','builder-rotated','unframed-control']){
  const k=structuredClone(saved),m=await loadPlayerMesh(base+'build/nx-tower.glb');if(m.sha256!==k.sha256)throw Error('real model/route fixture drift');
  let ns=await loadPlayerAssembly(k,k.assembly),modelRoot=m.root,contract=k;
  if(frame==='parent-direct'){const f=applyProofFrame(m.root,ns,k);modelRoot=f.root;ns=f.neighbors;contract=f.contract;}
  if(frame==='builder-rotated'){
   const A=new THREE.Matrix4().makeRotationY(-Math.PI/2);m.root.applyMatrix4(A);ns.forEach(n=>n.root.applyMatrix4(A));
   k.waypoints=k.waypoints.map(w=>({...w,pos:new THREE.Vector3(...w.pos).applyMatrix4(A).toArray()}));
   k.protectedVolumes=k.protectedVolumes.map(p=>{const box=new THREE.Box3(new THREE.Vector3(...p.min),new THREE.Vector3(...p.max)).applyMatrix4(A);return {...p,min:box.min.toArray(),max:box.max.toArray()};});
  }
  normalizeRootYaw(modelRoot);ns.forEach(n=>normalizeRootYaw(n.root));
  const report=verifyPlayerMesh(modelRoot,contract,ns);results[frame]={status:report.status,doorHits:report.doors.map(d=>d.hits),failures:report.failures};
 }
 console.log(JSON.stringify(results));
 `);
 expect(r['builder-rotated'].status,JSON.stringify(r)).toBe('PASS');
 expect(r['parent-direct'].status,JSON.stringify(r)).toBe('PASS');
 expect(r['unframed-control'].status,JSON.stringify(r)).toBe('FAIL');
},60000);
