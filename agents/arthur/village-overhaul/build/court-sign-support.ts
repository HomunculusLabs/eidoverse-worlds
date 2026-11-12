// Exact decoded mount proof for court-owned hanging signs (including smithy near forge).
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {loadPlayerMesh,loadPlayerAssembly,THREE} from '../../cabin-overhaul/verify-player.ts';
const base=resolve(import.meta.dir,'..'),k=JSON.parse(readFileSync(`${base}/neighbors/nx-court.json`,'utf8'));
const out:any={purpose:'Resolve forge-solo floating-sign false positive with the real court host',signs:[],unfixableWithoutCompanionAmendment:[]};
const signs=await loadPlayerAssembly(k.host,k.neighbors.filter((x:any)=>/^nx-sign-/.test(x.id)));
for(const phase of ['before','after']){
 const court=await loadPlayerMesh(phase==='before'?`${base}/before/nx-court.glb`:`${base}/build/court.glb`);
 for(const sign of signs){const smith=sign.id==='nx-sign-smithy',points=[];const direction=new THREE.Vector3(smith?-1:1,0,0),x=smith?6.10001:-6.10001,z=smith?-1.4:1.4;const cast=new THREE.Raycaster();
  for(const y of [2.2,2.3,2.4])for(const dz of [-.09,0,.09]){cast.set(new THREE.Vector3(x,y,z+dz),direction);const a=cast.intersectObject(court.root,true);points.push({pos:[x,y,z+dz],hit:a[0]?{distance:a[0].distance,node:a[0].object.name}:null,pass:!!a[0]&&a[0].distance<.001});}
  out.signs.push({phase,id:sign.id,courtSha256:court.sha256,signSha256:sign.sha256,signBounds:new THREE.Box3().setFromObject(sign.root),points,pass:points.every(x=>x.pass)});
 }
}
for(const n of k.neighbors.filter((x:any)=>/b28|b29/.test(x.id))){out.unfixableWithoutCompanionAmendment.push({id:n.id,sha256:n.sha256,actualHostLocalBounds:n.hostLocalBounds,hostRearMinimum:-2.940000057220459,rearSeparation:-2.940000057220459-n.hostLocalBounds.max[2],explanation:'Entire rider is behind the existing host rear bound. Remains byte/tuple unchanged, exposed; backing cannot be added inside frozen host footprint.'});}
writeFileSync(`${base}/build/court-sign-support.json`,JSON.stringify(out,null,2));
console.log(JSON.stringify({signs:out.signs.map((x:any)=>({phase:x.phase,id:x.id,pass:x.pass,distances:x.points.map((p:any)=>p.hit?.distance)})),preExistingDisplaced:out.unfixableWithoutCompanionAmendment}));
if(out.signs.some((x:any)=>!x.pass))throw Error('sign mount proof failed');
