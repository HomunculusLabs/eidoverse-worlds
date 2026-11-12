// External-access proof for non-room craft stations. Never labels a bbox host walk-in.
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {THREE,runtimeEvidence,clipTriangle} from '../cabin-overhaul/verify-player.ts';
const C:any=await import(pathToFileURL(resolve(runtimeEvidence.root,'colliders.js')).href);
export function normalizeRootYaw(root:any){
 root.updateMatrix();const before=root.matrix.clone(),x=root.scale.x,z=root.scale.z;
 if(!(x>0&&z>0))throw Error('unsupported non-positive root scale');
 const heading=Math.atan2(before.elements[8]/z,before.elements[0]/x);root.rotation.set(0,heading,0);root.updateMatrixWorld(true);
 if(before.elements.some((v:number,i:number)=>Math.abs(v-root.matrix.elements[i])>1e-8))throw Error('unsupported non-yaw root transform');
 return root;
}
function triangles(root:any){
 const out:any[]=[];root.updateMatrixWorld(true);root.traverse((m:any)=>{if(!m.isMesh)return;const p=m.geometry.attributes.position,idx=m.geometry.index,n=idx?.count??p.count;
 for(let i=0;i<n;i+=3){const vs=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,idx?idx.getX(i+k):i+k).applyMatrix4(m.matrixWorld).toArray());out.push({vs,name:m.name,min:[0,1,2].map(a=>Math.min(...vs.map(v=>v[a]))),max:[0,1,2].map(a=>Math.max(...vs.map(v=>v[a])))});}});return out;
}
function hits(soup:any[],min:number[],max:number[]){
 const lo=min.map(v=>v+.001),hi=max.map(v=>v-.001),found=[];
 for(const t of soup){if([0,1,2].some(a=>t.max[a]<lo[a]||t.min[a]>hi[a]))continue;const p=clipTriangle(t.vs,lo,hi);if(p.length<3)continue;
 const v=new THREE.Vector3(...p[0]);let area=0;for(let i=1;i<p.length-1;i++)area+=new THREE.Vector3(...p[i]).sub(v).cross(new THREE.Vector3(...p[i+1]).sub(v)).length()/2;
 if(area>1e-12)found.push(t.name);}
 return found;
}
export function physicalSupport(root:any,k:any,neighbors:any[]=[]){
 const s=k.scale??1,terrain=(k.terrainY??0)*s;
 const roots=[root,...neighbors.map(n=>n.root)].map(r=>{const copy=r.clone(true);copy.position.multiplyScalar(s);copy.scale.multiplyScalar(s);copy.updateMatrixWorld(true);copy.traverse((m:any)=>{if(m.isMesh)m.material=new THREE.MeshBasicMaterial({side:THREE.DoubleSide});});return copy;});
 const down=new THREE.Vector3(0,-1,0),ray=new THREE.Raycaster(new THREE.Vector3(),down),samples:any[]=[];
 for(const w of k.waypoints){const p=w.pos.map((v:number)=>v*s);ray.set(new THREE.Vector3(p[0],p[1]+.04,p[2]),down);const found:any[]=roots.flatMap(r=>ray.intersectObject(r,true));const ground=Math.max(terrain,...found.filter(h=>h.point.y<=p[1]+.035).map(h=>h.point.y));const gap=p[1]-ground;samples.push({name:w.name,pos:p,ground,gap,pass:Math.abs(gap)<=.035});}
 for(const r of roots)r.traverse((m:any)=>{if(m.isMesh)m.material.dispose();});
 return {method:'independent-default-scene-triangle-ray-and-declared-terrain',pass:samples.length>0&&samples.every(x=>x.pass),samples};
}
export function probeApproach(root:any,k:any,neighbors:any[]=[]){
 const vec=(p:any)=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite);
 if(!k||typeof k.id!=='string'||!k.id||!(k.scale>0)||!Number.isFinite(k.scale)||!Number.isFinite(k.terrainY)||!Array.isArray(k.waypoints)||k.waypoints.length<2||k.waypoints.some((p:any)=>!p||typeof p.name!=='string'||!vec(p.pos)))throw Error('invalid external route contract');
 if(!k.waypoints.some((p:any,i:number)=>i>0&&Math.hypot(p.pos[0]-k.waypoints[i-1].pos[0],p.pos[2]-k.waypoints[i-1].pos[2])>.1))throw Error('external route has no traversal');
 if(k.collide!==undefined&&k.collide!=='exact'&&k.collide!=='box')throw Error('invalid collision preference');
 const seen=new Set([k.id]);for(const n of neighbors){if(!n||!n.root||typeof n.id!=='string'||seen.has(n.id))throw Error('invalid duplicate neighbor');seen.add(n.id);}
 const g=root.clone(true);g.scale.setScalar(k.scale);normalizeRootYaw(g);
 C.clearColliders();
 try{
  C.fitCollider(k.id,g,{scale:k.scale,collide:k.collide,localFrame:true});const e=C.colliders.get(k.id);if(!e)throw Error('missing host collider');
  const soup=triangles(g),nb=[];for(const n of neighbors){const o=n.root.clone(true);o.position.multiplyScalar(k.scale);o.scale.multiplyScalar(k.scale);normalizeRootYaw(o);C.fitCollider(n.id,o,{scale:o.scale.x,collide:n.collide,localFrame:true});nb.push(n.id);soup.push(...triangles(o).map(t=>({...t,name:`${n.id}/${t.name}`})));}
  const walks=[],supportPoints:any[]=[];
  for(const direction of ['in','out']){
   const points=direction==='in'?k.waypoints:[...k.waypoints].reverse();const pos=new THREE.Vector3(...points[0].pos.map((v:number)=>v*k.scale));
   supportPoints.push({name:`${direction}:start`,pos:pos.toArray().map(v=>v/k.scale)});
   for(let i=1;i<points.length;i++){
    const start=points[i-1],end=points[i],target=new THREE.Vector3(...end.pos.map((v:number)=>v*k.scale));
    const dx=target.x-pos.x,dz=target.z-pos.z,steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.04));let maxPush=0,maxRise=0,minY=pos.y,maxY=pos.y,geometryHits=0;const examples:any[]=[];
    for(let j=1;j<=steps;j++){
     pos.x+=dx/steps;pos.z+=dz/steps;const old=pos.clone();const y=C.resolveColliders(pos,()=>k.terrainY*k.scale);
     maxPush=Math.max(maxPush,Math.hypot(pos.x-old.x,pos.z-old.z));maxRise=Math.max(maxRise,y-old.y);pos.y=y;minY=Math.min(minY,y);maxY=Math.max(maxY,y);
     supportPoints.push({name:`${direction}:${start.name}:${end.name}:${j}`,pos:pos.toArray().map(v=>v/k.scale)});
     const gh=hits(soup,[Math.min(old.x-dx/steps,pos.x)-.32,Math.max(Math.min(old.y,y),Math.max(start.pos[1],end.pos[1])*k.scale),Math.min(old.z-dz/steps,pos.z)-.32],[Math.max(old.x-dx/steps,pos.x)+.32,Math.max(old.y,y)+1.9,Math.max(old.z-dz/steps,pos.z)+.32]);
     geometryHits+=gh.length;if(gh.length&&examples.length<5)examples.push({sample:j,pos:pos.toArray(),nodes:[...new Set(gh)]});
    }
    const low=Math.min(start.pos[1],end.pos[1])*k.scale-.035,high=Math.max(start.pos[1],end.pos[1])*k.scale+.035;
    const arrivalXZ=Math.hypot(pos.x-target.x,pos.z-target.z),floorError=Math.abs(pos.y-target.y);
    walks.push({direction,from:start.name,to:end.name,steps,maxPush,maxRise,minY,maxY,arrivalXZ,floorError,geometryHits,examples,pass:maxPush<=.001&&maxRise<=.551&&arrivalXZ<=.01&&floorError<=.035&&minY>=low&&maxY<=high&&geometryHits===0});
   }
  }
  const support=physicalSupport(root,{...k,waypoints:supportPoints},neighbors);
  return {status:walks.every(w=>w.pass)&&support.pass?'PASS':'FAIL',id:k.id,kind:'workstation',runtime:runtimeEvidence,collider:{exact:!!e.exact,pillar:!!e.pillar},neighbors:nb,walks,physicalSupport:support,evidenceKind:'actual-browser-collider-external-access-not-live-walk',limitations:['Not an enterable-room certification.','Only supplied neighbors and declared flat terrain checked.']};
 }finally{C.clearColliders();}
}
