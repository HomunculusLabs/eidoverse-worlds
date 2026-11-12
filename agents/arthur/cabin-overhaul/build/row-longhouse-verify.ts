// Generated local review harness. No network, no original source side effects.
import {plugin} from 'bun';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {mergeDocuments} from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
const R=process.cwd(),D=R+'/agents/arthur/cabin-overhaul';
plugin({name:'local-core',setup(b){b.onResolve({filter:/^\.\/core\.js$/},()=>({path:R+'/tools/core-stub.mjs'}));}});
const {THREE}=await import(R+'/tools/core-stub.mjs');
const C=await import(R+'/client/lib/colliders.js');
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco3d.createDecoderModule(),'draco3d.encoder':await draco3d.createEncoderModule()});
const pin=JSON.parse(readFileSync(D+'/before/contracts.json','utf8'));
const sha=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex');
async function load(path:string,offset=[0,0,0]){
 const doc=await io.read(path),scene=doc.getRoot().getDefaultScene()??doc.getRoot().listScenes()[0];if(!scene)throw Error('missing scene');
 const verts:number[]=[],parts:any[]=[];scene.traverse(n=>{const mesh=n.getMesh();if(!mesh)return;const m=new THREE.Matrix4().fromArray(n.getWorldMatrix());for(const pr of mesh.listPrimitives()){
  const pos=pr.getAttribute('POSITION');if(!pos)throw Error('missing positions');const ix=pr.getIndices(),ct=ix?.getCount()??pos.getCount();if(ct%3)throw Error('non triangles');
  const buf:number[]=[],v=new THREE.Vector3(),p=[0,0,0];for(let i=0;i<ct;i++){pos.getElement(ix?ix.getScalar(i):i,p);v.fromArray(p).applyMatrix4(m).add(new THREE.Vector3(...offset));verts.push(...v.toArray());buf.push(...v.toArray());}parts.push({name:n.getName(),verts:buf});
 }});
 const geo=new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.computeBoundingBox();
 const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial());mesh.updateMatrixWorld(true);return{doc,scene,verts,mesh,parts,bounds:{min:geo.boundingBox.min.toArray(),max:geo.boundingBox.max.toArray()}};
}
function intersections(verts:number[],min:number[],max:number[]){const b=new THREE.Box3(new THREE.Vector3(...min),new THREE.Vector3(...max)),t=new THREE.Triangle();let ct=0;for(let i=0;i<verts.length;i+=9){t.a.fromArray(verts,i);t.b.fromArray(verts,i+3);t.c.fromArray(verts,i+6);if(b.intersectsTriangle(t))ct++;}return ct;}
const cases=[
 {id:'nx-town-row-cottage',rider:'b18',anchor:[0,2.22,2.2825],width:1.45,head:2.35,door:[-2.29,.2,1.38,-.84,2.55,2.68],mount:[0,2.45,2.25],art:[-.81,2.22,2.2501,.81,2.68,2.38],path:[[-1.565,3.2],[-1.565,.85],[0,.85],[0,-.3]],floors:[[-1.565,3,0],[-1.565,2.4,.2],[-1.565,1.7,.2],[0,0,.2]]},
 {id:'nx-town-longhouse',rider:'b19',anchor:[0,2.22,4.32],width:1.68,head:2.4,door:[-.84,.2,1.3,.84,2.6,2.7],mount:[0,2.4,4.2875],art:[-1.6,2.22,4.2876,1.6,2.54,4.46],path:[[0,5],[0,3.5],[0,1],[0,0],[-2.7,0],[0,0],[2.4,0]],floors:[[0,4.5,0],[0,4.15,0],[0,3.2,0],[0,2.53,.2],[0,1,.2]]}
];
const results=[];for(const q of cases){
 const file=D+'/build/'+q.id+'.glb',a=await load(file),before=await load(D+'/before/'+q.id+'.glb'),rider=await load(R+'/agents/arthur/assets/village_artwalk_'+q.rider+'.glb',q.anchor);
 const failures:string[]=[];const check=(x:boolean,n:string)=>{if(!x)failures.push(n);};const base=pin.find((x:any)=>x.id===q.id);
 check(!!base,'baseline count');for(const axis of[0,2])check(a.bounds.min[axis]>=base.bbox.min[axis]-1e-5&&a.bounds.max[axis]<=base.bbox.max[axis]+1e-5,'XZ envelope '+axis);
 const d=q.door,eps=1e-5;
 const corridor=intersections([...a.verts,...rider.verts],[d[0]+eps,d[1]+eps,d[2]],[d[3]-eps,d[1]+2.2-eps,d[5]]);check(corridor===0,'door triangle volume');
 let porchTriangles:null|number=null;if(q.rider==='b19'){porchTriangles=intersections([...a.verts,...rider.verts],[-.7,.001,2.70],[.7,2.19999,4.65]);check(porchTriangles===0,'porch clear 1.4x2.2');}
 const art=q.art;const buried=intersections(a.verts,art.slice(0,3),art.slice(3));check(buried===0,'rider exposed');
 C.clearColliders();C.fitCollider(q.id,a.mesh);const classification=!!C.colliders.get(q.id)?.exact;check(classification,'actual browser exact classifier');
 C.fitCollider(q.rider,rider.mesh); // unmodified rider uses its own automatic collider policy
 const floors=q.floors.map(([x,z,want])=>{const got=C.surfaceUnder(x,z,()=>0,.3).y;check(Math.abs(got-want)<1e-5,'floor '+[x,z]);return{x,z,want,got};});
 const route=[...q.path,...q.path.slice(0,-1).reverse()],samples:any[]=[];
 let maxPush=0,maxStep=0,lastY=0;for(let j=1;j<route.length;j++){const a0=route[j-1],b0=route[j],steps=Math.ceil(Math.hypot(b0[0]-a0[0],b0[1]-a0[1])/.05);
  for(let k=0;k<=steps;k++){const x=a0[0]+(b0[0]-a0[0])*k/steps,z=a0[1]+(b0[1]-a0[1])*k/steps,p=new THREE.Vector3(x,lastY,z),ground=C.resolveColliders(p,()=>0,.32,1.9),push=Math.hypot(p.x-x,p.z-z);maxPush=Math.max(maxPush,push);maxStep=Math.max(maxStep,Math.abs(ground-lastY));lastY=ground;samples.push({x,z,y:ground,push});}
 }
 check(maxPush<1e-4,'two way player push');check(maxStep<=.25001,'step increments');
 const ray=new THREE.Ray(new THREE.Vector3(q.mount[0],q.mount[1],q.mount[2]+.3),new THREE.Vector3(0,0,-1));
 const hit=C.colliders.get(q.id).exact.bvh.raycastFirst(ray,THREE.DoubleSide);check(!!hit&&Math.abs(hit.point.z-q.mount[2])<1e-5,'exact mount plane');
 // Prove detector sees a wall-spanning triangle whose corners can be outside lane.
 const control=intersections(a.verts,[-.2,1,-2.6],[.2,2,-2]);check(control>0,'positive wall detector control');
 // Local REVIEW ENSEMBLE ONLY, retained original rider bytes/materials at pinned local anchor.
 const rdoc=await io.read(R+'/agents/arthur/assets/village_artwalk_'+q.rider+'.glb');const map=mergeDocuments(a.doc,rdoc);
 const rs=map.get(rdoc.getRoot().getDefaultScene()??rdoc.getRoot().listScenes()[0]);const holder=a.doc.createNode('UNMODIFIED_RIDER_REVIEW_ONLY').setTranslation(q.anchor);
 for(const n of [...rs.listChildren()]){rs.removeChild(n);holder.addChild(n);}a.scene.addChild(holder);rs.dispose();const buffers=a.doc.getRoot().listBuffers();for(const acc of a.doc.getRoot().listAccessors())acc.setBuffer(buffers[0]);for(const buffer of buffers.slice(1))buffer.dispose();await io.write(D+'/build/'+q.id+'-rider-review.glb',a.doc);
 results.push({id:q.id,sha256:sha(file),beforeSha256:sha(D+'/before/'+q.id+'.glb'),baselineLib:base.lib,bounds:a.bounds,beforeDecoded:before.bounds,triangles:a.verts.length/9,riderTriangles:rider.verts.length/9,doorClearWidth:q.width,doorHeadroom:q.head,doorTriangleIntersections:corridor,porchTriangles,riderExposedIntersections:buried,mount:q.mount,mountHit:hit?.point.toArray(),actualBrowserExact:classification,floors,routeSamples:samples.length,maxLateralPush:maxPush,maxStep,controlHits:control,failures});
 writeFileSync(D+'/build/'+q.id+'-route-samples.json',JSON.stringify(samples,null,2));
}
writeFileSync(D+'/build/row-longhouse-verification.json',JSON.stringify({scope:'local host+rider; no live site verification',results},null,2));console.log(JSON.stringify(results,null,2));if(results.some(r=>r.failures.length))process.exit(1);
