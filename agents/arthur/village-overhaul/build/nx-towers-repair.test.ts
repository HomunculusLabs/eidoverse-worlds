// Tower-owned STRICT TDD regressions; real frozen GLBs and pinned public CPU collider only.
import {test,expect} from 'bun:test';
import {THREE as T,clipTriangle,loadPlayerMesh,loadPlayerAssembly,verifyPlayerMesh,runtimeEvidence} from '../../cabin-overhaul/verify-player.ts';
import {BASE,json,save,sha,applyProofFrame} from '../build-belltower.ts';
import {readFileSync} from 'node:fs';
const C=await import(`${runtimeEvidence.root}/colliders.js`);
test('belltower retains the repaired low crown without changing its XZ envelope',async()=>{
 const m=await loadPlayerMesh(`${BASE}/build/nx-town-belltower.glb`),b=new T.Box3().setFromObject(m.root),h=json(`${BASE}/before/contracts.json`).find((h:any)=>h.id==='nx-town-belltower');
 // Conservative retained design envelope, not a campaign height cap (parent withdrew it).
 // Actual decoded maximum, not a declaration, rounded value, or relaxed tolerance.
 expect(b.max.y).toBeLessThanOrEqual(h.bbox.max[1]+.9);
 expect(b.max.y).toBeLessThanOrEqual(h.bbox.max[1]+1);
 for(const a of [0,2]){expect(b.min.getComponent(a)).toBeGreaterThanOrEqual(h.bbox.min[a]-.001);expect(b.max.getComponent(a)).toBeLessThanOrEqual(h.bbox.max[a]+.001);}
},60000);
test('belltower exterior approaches honestly reject phantom support rather than declare bbox ground',async()=>{
 for(const suffix of ['route','ladder-approach']){
  const {k,m,ns,result}=await probe(`nx-town-belltower.${suffix}`);
  expect(verifyPlayerMesh(m.root,k,ns).status,'known unsupported exterior must stay FAIL').toBe('FAIL');
  expect(k.waypoints[0].pos[1]).toBe(0);expect(k.terrainY).toBe(0);expect(result.unsupported.length).toBeGreaterThan(0);
  expect(k.assembly).toEqual(json(`${BASE}/neighbors/nx-town-belltower.json`).neighbors);
 }
},60000);
test('belltower frozen exterior collar proves the host-only grounded-access HOLD',async()=>{
 const id='nx-town-belltower',k=json(`${BASE}/build/${id}.route.json`),m=await loadPlayerMesh(`${BASE}/build/${id}.glb`),ns=await loadPlayerAssembly(k,k.assembly);
 const road=ns.find(n=>n.id==='nx-core-paths')!;C.clearColliders();C.fitCollider(road.id,road.root,{scale:road.root.scale.x,collide:road.collide,localFrame:true});const entry=C.colliders.get(road.id),top=entry.obj.position.y+entry.box.max.y*entry.obj.scale.x;
 // This closed collar lies OUTSIDE even the allowed 1mm host-envelope tolerance.
 // Four corners inside a convex road OBB prove the entire collar is in that box.
 const inner=1.71,outer=1.75,lowestCompatible=top-.035;
 const corners=[[-outer,-outer],[-outer,outer],[outer,-outer],[outer,outer]].map(([x,z])=>{const p=road.root.worldToLocal(new T.Vector3(x,0,z));return {host:[x,0,z],roadLocal:p.toArray(),inside:p.x>entry.box.min.x&&p.x<entry.box.max.x&&p.z>entry.box.min.z&&p.z<entry.box.max.z};});
 expect(entry.exact).toBeFalsy();expect(entry.pillar).toBe(false);expect(corners.every(c=>c.inside)).toBe(true);expect(top-k.terrainY).toBeGreaterThan(.035);
 const strips=[{min:[-outer,lowestCompatible,-outer],max:[-inner,20,outer]},{min:[inner,lowestCompatible,-outer],max:[outer,20,outer]},{min:[-outer,lowestCompatible,-outer],max:[outer,20,-inner]},{min:[-outer,lowestCompatible,inner],max:[outer,20,outer]}];
 let triangles=0;const contacts=[];for(const r of [{id,root:m.root},...ns]){r.root.updateMatrixWorld(true);r.root.traverse(o=>{if(!o.isMesh)return;const a=o.geometry.attributes.position,index=o.geometry.index;for(let i=0;i<(index?.count??a.count);i+=3){triangles++;const vs=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(a,index?index.getX(i+j):i+j).applyMatrix4(o.matrixWorld).toArray());for(let s=0;s<strips.length;s++){const box=strips[s];if([0,1,2].some(a=>Math.max(...vs.map(v=>v[a]))<box.min[a]||Math.min(...vs.map(v=>v[a]))>box.max[a]))continue;const poly=clipTriangle(vs,box.min,box.max);if(poly.length<3)continue;const p=new T.Vector3(...poly[0]);let area=0;for(let j=1;j+1<poly.length;j++)area+=new T.Vector3(...poly[j]).sub(p).cross(new T.Vector3(...poly[j+1]).sub(p)).length()/2;if(area>1e-12)contacts.push({id:r.id,node:o.name,triangle:i/3,strip:s,area});}}});}
 const report={status:contacts.length?'UNPROVEN':'HOLD',id,modelSha256:m.sha256,terrainY:k.terrainY,hostEnvelope:k.bbox,collar:{inner,outer,strips},road:{id:road.id,sha256:road.sha256,localBox:{min:entry.box.min.toArray(),max:entry.box.max.toArray()},top,exact:!!entry.exact,pillar:entry.pillar,corners},physicalFloorTolerance:.035,lowestCompatible,trianglesExamined:triangles,contacts,neighbors:ns.map(n=>({id:n.id,sha256:n.sha256})),runtime:runtimeEvidence,reason:'No decoded geometry intersects the complete exterior collar at any support-compatible height up to 20m. The unchanged road OBB covers its whole convex outer square and supplies phantom ground. No host-only geometry inside the preserved +/-1.7m envelope (even +1mm tolerance) can supply support in this exterior collar. Any continuous grounded exterior-to-foundation route crosses it.',limits:['Conditional on the frozen exact neighbor bytes and existing flat terrainY=0 contract; no live terrain/controller verification.','Not a claim about flying, teleportation or a route starting already on the host platform.','Repair requires scoped road/runtime support correction or changed external support/envelope authority; neither is authorized here.']};
 save(`${BASE}/build/${id}.approach-hold.json`,report);C.clearColliders();expect(contacts,JSON.stringify(contacts.slice(0,5))).toHaveLength(0);
},60000);
test('tower spawn contracts cannot retain a stale deployable model identity',async()=>{
 for(const id of ['nx-tower','nx-town-belltower']){const m=await loadPlayerMesh(`${BASE}/build/${id}.glb`),spawn=json(`${BASE}/build/${id}.spawn-contract.json`),h=json(`${BASE}/before/contracts.json`).find((h:any)=>h.id===id);
 expect(spawn.lib).toBe(`store/${m.sha256.slice(0,16)}.glb`);for(const key of ['id','kind','pos','yaw','scale','parent','comp'])expect(spawn[key]).toEqual(h[key]);expect(spawn.collide).toBe(id==='nx-town-belltower'?'exact':null);}
},60000);
test('belltower all four roof-post feet bear on upward-facing decoded deck triangles',async()=>{
 const id='nx-town-belltower',m=await loadPlayerMesh(`${BASE}/build/${id}.glb`),tops=new T.Group();m.root.updateMatrixWorld(true);
 m.root.traverse((o:any)=>{if(!o.isMesh)return;const a=o.geometry.attributes.position,index=o.geometry.index,vs:number[]=[];
 for(let i=0;i<(index?.count??a.count);i+=3){const t=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(a,index?index.getX(i+j):i+j).applyMatrix4(o.matrixWorld));if(t.every(v=>Math.abs(v.y-4.82)<.001)&&t[1].clone().sub(t[0]).cross(t[2].clone().sub(t[0])).normalize().y>.99)t.forEach(v=>vs.push(...v.toArray()));}
 if(vs.length){const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vs,3));const mesh=new T.Mesh(geometry);mesh.name=o.name;tops.add(mesh);}});tops.updateMatrixWorld(true);
 const results=[];for(const x of [-1.34,1.34])for(const z of [-1.20,1.24])for(const dx of [-.08,0,.08])for(const dz of [-.08,0,.08]){const p=[x+dx,4.82,z+dz],ray=new T.Raycaster(new T.Vector3(p[0],4.85,p[2]),new T.Vector3(0,-1,0)),hit=ray.intersectObject(tops,true)[0];results.push({point:p,supported:!!hit&&Math.abs(hit.point.y-4.82)<.001,surfaceY:hit?.point.y??null,node:hit?.object.name??null});}
 const report={status:results.every(r=>r.supported)?'PASS':'FAIL',modelSha256:m.sha256,evidence:'Decoded upward-facing deck-top triangles; underside of shoe/post excluded by face orientation',results};save(`${BASE}/build/${id}.structural-support.json`,report);
 expect(results).toHaveLength(36);expect(results.every(r=>r.supported),JSON.stringify(results.filter(r=>!r.supported))).toBe(true);
},60000);
test('rigid proof frame preserves scalar-yaw collider semantics for every actual neighbor',async()=>{
 const k=json(`${BASE}/build/nx-tower.upper-route.json`),m=await loadPlayerMesh(`${BASE}/build/nx-tower.glb`),ns=await loadPlayerAssembly(k,k.assembly),roots=[m.root,...ns.map(n=>n.root)];
 const A=new T.Matrix4().makeRotationY(k.proofFrameY),expected=roots.map(r=>{r.updateMatrix();return A.clone().multiply(r.matrix);});applyProofFrame(m.root,k,ns);
 for(let i=0;i<roots.length;i++){const r=roots[i];r.updateMatrix();const y=r.rotation.y,heading=Math.atan2(expected[i].elements[8],expected[i].elements[0]);expect(Math.abs(Math.atan2(Math.sin(y-heading),Math.cos(y-heading))),`wrong scalar yaw on ${i?ns[i-1].id:k.id}`).toBeLessThan(1e-12);expect(Math.abs(r.rotation.x)).toBeLessThan(1e-12);expect(Math.abs(r.rotation.z)).toBeLessThan(1e-12);expect(Math.max(...r.matrix.elements.map((v,j)=>Math.abs(v-expected[i].elements[j])))).toBeLessThan(1e-12);}
 expect(verifyPlayerMesh(m.root,k,ns).status).toBe('PASS');
},60000);
async function probe(file:string){
 const k=json(`${BASE}/build/${file}.json`),m=await loadPlayerMesh(`${BASE}/build/${k.id}.glb`),ns=await loadPlayerAssembly(k,k.assembly);
 expect(m.sha256).toBe(k.sha256);
 const roots=[m.root,...ns.map(n=>n.root)];roots.forEach(r=>{r.updateMatrixWorld(true);r.traverse(o=>{if(o.isMesh)o.material.side=T.DoubleSide;});});
 const support=(p:any)=>{const ray=new T.Raycaster(new T.Vector3(p.x,p.y+.04,p.z),new T.Vector3(0,-1,0));const hs=roots.flatMap((r,i)=>ray.intersectObject(r,true).map(h=>({y:h.point.y,id:i?ns[i-1].id:k.id,node:h.object.name}))).sort((a,b)=>b.y-a.y);return {physicalY:Math.max(k.terrainY,...hs.map(h=>h.y)),surface:hs[0]??'terrain'};};
 C.clearColliders();C.fitCollider(k.id,m.root,{scale:k.scale,collide:k.collide,localFrame:true});for(const n of ns)C.fitCollider(n.id,n.root,{scale:n.root.scale.x,collide:n.collide,localFrame:true});
 const samples=[];
 try{for(const direction of ['in','out']){const ws=direction==='in'?k.waypoints:[...k.waypoints].reverse(),pos=new T.Vector3(...ws[0].pos);const pushSample=(name:string)=>{const actual=support(pos);samples.push({direction,name,pos:pos.toArray(),...actual,error:pos.y-actual.physicalY});};pushSample(ws[0].name);
 for(let i=1;i<ws.length;i++){const dx=ws[i].pos[0]-pos.x,dz=ws[i].pos[2]-pos.z,N=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.04));for(let j=1;j<=N;j++){pos.x+=dx/N;pos.z+=dz/N;pos.y=C.resolveColliders(pos,()=>k.terrainY);pushSample(`${ws[i-1].name}->${ws[i].name}:${j}/${N}`);}}
 }}finally{C.clearColliders();}
 const result={modelSha256:m.sha256,routeSha256:sha(readFileSync(`${BASE}/build/${file}.json`)),runtime:runtimeEvidence,neighbors:ns.map(n=>({id:n.id,sha256:n.sha256})),tolerance:.035,samples,unsupported:samples.filter(s=>Math.abs(s.error)>.035)};
 save(`${BASE}/build/${file}.physical-support.json`,result);return {k,m,ns,result};
}
test('scholar entry uses real supported exterior and remains a bidirectional full-neighbor room route',async()=>{
 const {k,m,ns,result}=await probe('nx-tower.route');
 expect(k.terrainY).toBe(0);expect(k.assembly).toEqual(json(`${BASE}/neighbors/nx-tower.json`).neighbors);
 expect(k.waypoints[0].pos[2]).toBeGreaterThan(3.6);
 expect(result.unsupported,JSON.stringify(result.unsupported.slice(0,5))).toHaveLength(0);
 expect(verifyPlayerMesh(m.root,k,ns).status).toBe('PASS');
},60000);
test('scholar upper route independently consumes only its encoded proof frame, never filename knowledge',async()=>{
 const k=json(`${BASE}/build/nx-tower.upper-route.json`),original=structuredClone(k),m=await loadPlayerMesh(`${BASE}/build/nx-tower.glb`),ns=await loadPlayerAssembly(k,k.assembly);
 // Independent parent-style adapter: door prisms are ALREADY in proof frame.
 if(k.proofFrameY!==undefined){const A=new T.Matrix4().makeRotationY(k.proofFrameY);m.root.applyMatrix4(A);ns.forEach(n=>n.root.applyMatrix4(A));
 k.waypoints=k.waypoints.map(w=>({...w,pos:new T.Vector3(...w.pos).applyMatrix4(A).toArray()}));
 k.protectedVolumes=k.protectedVolumes.map(p=>{const b=new T.Box3(new T.Vector3(...p.min),new T.Vector3(...p.max)).applyMatrix4(A);return {...p,min:b.min.toArray(),max:b.max.toArray()};});}
 const report=verifyPlayerMesh(m.root,k,ns);expect(report.status,JSON.stringify(report.failures)).toBe('PASS');expect(report.doors[0].hits).toBe(0);
 expect(original.proofFrameY).toBe(-Math.PI/2);expect(k.doors).toEqual(original.doors);expect(k.pos).toEqual(original.pos);expect(k.yaw).toBe(original.yaw);expect(report.neighbors).toHaveLength(11);
},60000);
