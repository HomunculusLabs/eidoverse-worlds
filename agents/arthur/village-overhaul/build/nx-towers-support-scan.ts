// Read-only diagnostic. Explicit flat terrain 0 is the frozen route datum, not live terrain evidence.
import {THREE as T,loadPlayerMesh,loadPlayerAssembly,runtimeEvidence} from '../../cabin-overhaul/verify-player.ts';
import {json,BASE,save} from '../build-belltower.ts';
const C=await import(`${runtimeEvidence.root}/colliders.js`);
for(const id of ['nx-tower','nx-town-belltower']){
 const k=json(`${BASE}/build/${id}.route.json`),m=await loadPlayerMesh(`${BASE}/build/${id}.glb`),ns=await loadPlayerAssembly(k,k.assembly),roots=[m.root,...ns.map(n=>n.root)];
 C.clearColliders(); C.fitCollider(id,m.root,{scale:k.scale,collide:k.collide,localFrame:true});
 for(const n of ns)C.fitCollider(n.id,n.root,{scale:n.root.scale.x,collide:n.collide,localFrame:true});
 roots.forEach(r=>{r.updateMatrixWorld(true);r.traverse(o=>{if(o.isMesh)o.material.side=T.DoubleSide;});});
 const sample=(x,z)=>{const ray=new T.Raycaster(new T.Vector3(x,.40,z),new T.Vector3(0,-1,0));const hs=roots.flatMap((r,i)=>ray.intersectObject(r,true).map(h=>({y:h.point.y,id:i?ns[i-1].id:id,node:h.object.name}))).sort((a,b)=>b.y-a.y);const physical=Math.max(k.terrainY,...hs.map(h=>h.y)),p=new T.Vector3(x,physical,z),browser=C.resolveColliders(p,()=>k.terrainY);return {pos:[x,physical,z],physical,browser,error:browser-physical,push:Math.hypot(x-p.x,z-p.z),surface:hs[0]??'terrain'};};
 const cells=[];if(id==='nx-tower'){for(let z=3.65;z<=4.2;z+=.05)cells.push(sample(.4,z));}
 else {for(let z=-2.5;z<=2.5;z+=.1)for(let x=-2.5;x<=2.5;x+=.1)if(Math.max(Math.abs(x),Math.abs(z))>=1.75)cells.push(sample(x,z));}
 const report={id,modelSha256:m.sha256,runtime:runtimeEvidence,neighbors:ns.map(n=>({id:n.id,sha256:n.sha256})),cells};save(`${BASE}/build/${id}.support-scan.json`,report);
 console.log(JSON.stringify({id,total:cells.length,good:cells.filter(s=>Math.abs(s.error)<=.035&&s.push<=.001),bad:cells.filter(s=>Math.abs(s.error)>.035).length}));C.clearColliders();
}
