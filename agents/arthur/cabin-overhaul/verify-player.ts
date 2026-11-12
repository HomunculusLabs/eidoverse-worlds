// Read-only PLAYER geometry gate. No network, no live verbs, no builder imports.
// bun agents/arthur/cabin-overhaul/verify-player.ts <model.glb> <route-contract.json> [report.json]
// Geometry is exact default-scene triangle soup; browser colliders are the REAL CPU module.
import { plugin } from "bun";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createHash } from "node:crypto";
const STUB = fileURLToPath(new URL("../../../tools/core-stub.mjs", import.meta.url));
plugin({ name: "cabin-player-core-only", setup(b) { b.onResolve({ filter: /^\.\/core\.js$/ }, () => ({ path: STUB })); } });
export const { THREE } = await import("../../../tools/core-stub.mjs");
const hash = (b: Buffer) => createHash("sha256").update(b).digest("hex");
const runtimeRoot=process.env.CABIN_PLAYER_RUNTIME_DIR?resolve(process.env.CABIN_PLAYER_RUNTIME_DIR):resolve(import.meta.dir,'../../../client/lib');
const pinned=process.env.CABIN_PLAYER_RUNTIME_DIR?JSON.parse(readFileSync(resolve(runtimeRoot,'manifest.json'),'utf8')):null;
const runtimeFiles:any={};
for(const name of ['colliders.js','supportclass.js']){
  const sha256=hash(readFileSync(resolve(runtimeRoot,name)));
  if(pinned&&(!/^[a-f0-9]{64}$/.test(pinned.files?.[name]?.sha256)||sha256!==pinned.files[name].sha256))throw Error(`runtime module bytes drift: ${name}`);
  runtimeFiles[name]={sha256,...(pinned?{publicPath:pinned.files[name].publicPath}:{})};
}
export const runtimeEvidence={mode:pinned?'served-override':'repo-local',root:runtimeRoot,files:runtimeFiles,threeRevision:THREE.REVISION,bindings:'repo core-stub, three and three-mesh-bvh; not a full renderer deployment clone'};
const C:any=await import(pathToFileURL(resolve(runtimeRoot,'colliders.js')).href);
const {decideSupportClass}=await import(pathToFileURL(resolve(runtimeRoot,'supportclass.js')).href);
const EPS = 0.001; // metres: tolerate boundary contact/Draco quantization, never centimetre pinches
const STEP = .55, SAMPLE = .04, FLOOR_TOL = .035;
const finiteVec=(v:any,n=3)=>Array.isArray(v)&&v.length===n&&v.every(Number.isFinite);

export async function loadPlayerMesh(path:string) {
  const { NodeIO } = await import("@gltf-transform/core");
  const { ALL_EXTENSIONS } = await import("@gltf-transform/extensions");
  const draco3d = (await import("draco3dgltf")).default;
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
    "draco3d.decoder": await draco3d.createDecoderModule(), "draco3d.encoder": await draco3d.createEncoderModule(),
  });
  const bytes=readFileSync(path), doc=await io.readBinary(new Uint8Array(bytes));
  const scenes=doc.getRoot().listScenes(), scene=doc.getRoot().getDefaultScene() ?? (scenes.length===1?scenes[0]:null);
  if(!scene)throw Error("ambiguous or absent default scene");
  const included=new Set<any>();scene.traverse(n=>included.add(n));
  const root=new THREE.Group();let n=0;
  for(const node of doc.getRoot().listNodes()) {
    if(!included.has(node))continue;
    const mesh=node.getMesh();if(!mesh)continue;
    const matrix=new THREE.Matrix4().fromArray(node.getWorldMatrix());
    for(const p of mesh.listPrimitives()) {
      if(p.getMode()!==4)throw Error("non-triangle primitive refused");
      const pos=p.getAttribute("POSITION"),idx=p.getIndices();if(!pos)throw Error("POSITION missing");
      const count=idx?idx.getCount():pos.getCount();if(count%3)throw Error("triangle count malformed");
      const vs:number[]=[],v=new THREE.Vector3(),raw=[0,0,0];
      for(let i=0;i<count;i++) {pos.getElement(idx?idx.getScalar(i):i,raw);v.fromArray(raw).applyMatrix4(matrix);if(!finiteVec(v.toArray()))throw Error("nonfinite decoded vertex");vs.push(v.x,v.y,v.z);}
      const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.Float32BufferAttribute(vs,3));
      const out=new THREE.Mesh(geo);out.name=node.getName()||`mesh-${n}`;root.add(out);n++;
    }
  }
  if(!n)throw Error("zero decoded meshes");
  return {root,sha256:hash(bytes),bytes:bytes.length,meshes:n};
}

export function placeNeighborInHostFrame(root:any,host:any,entity:any) {
  for(const e of [host,entity])if(!finiteVec(e.pos)||!Number.isFinite(e.yaw)||!Number.isFinite(e.scale)||!(e.scale>0))throw Error('invalid world assembly transform');
  const dx=entity.pos[0]-host.pos[0],dz=entity.pos[2]-host.pos[2],c=Math.cos(host.yaw),s=Math.sin(host.yaw);
  root.position.set((dx*c-dz*s)/host.scale,(entity.pos[1]-host.pos[1])/host.scale,(dx*s+dz*c)/host.scale);
  root.rotation.y=entity.yaw-host.yaw;root.scale.setScalar(entity.scale/host.scale);root.updateMatrixWorld(true);return root;
}

/** Load decoded neighbors from explicit served-byte pins; no network or builder imports.
 * Each item: {id,file,sha256,pos,yaw,scale,collide?}; files resolve from current cwd.
 * Keep a documented migration as an explicit final entity tuple, never a hidden offset. */
export async function loadPlayerAssembly(host:any,items:any[]) {
  if(!Array.isArray(items))throw Error('explicit assembly array required');
  const out:any[]=[];
  for(const e of items){
    if(!e.id||!e.file||!/^[a-f0-9]{64}$/.test(e.sha256))throw Error('assembly entity requires id/file/full served SHA');
    const loaded=await loadPlayerMesh(e.file);if(loaded.sha256!==e.sha256)throw Error(`assembly bytes drift ${e.id}`);
    placeNeighborInHostFrame(loaded.root,host,e);
    out.push({...loaded,id:e.id,collide:e.collide,sourceTuple:{pos:e.pos,yaw:e.yaw,scale:e.scale,lib:e.lib??null}});
  }return out;
}

// Clip the triangle itself, not its vertices/bbox. A spanning triangle with
// every corner outside a doorway STILL clips to a real polygon inside it.
export function clipTriangle(vertices:number[][],min:number[],max:number[]) {
  let poly=vertices.map(v=>[...v]);
  for(let a=0;a<3;a++)for(const lower of [true,false]) {
    const bound=lower?min[a]:max[a],next:number[][]=[];
    const inside=(v:number[])=>lower?v[a]>=bound:v[a]<=bound;
    for(let i=0;i<poly.length;i++) {
      const p=poly[i],q=poly[(i+1)%poly.length],ip=inside(p),iq=inside(q);
      if(ip)next.push(p);
      if(ip!==iq){const t=(bound-p[a])/(q[a]-p[a]);next.push(p.map((v,k)=>v+t*(q[k]-v)));}
    }
    poly=next;if(!poly.length)return [];
  }
  return poly;
}
function triangleSoup(root:any) {
  root.updateMatrixWorld(true);const out:any[]=[];
  root.traverse((m:any)=>{
    if(!m.isMesh)return;
    const a=m.geometry.attributes.position,idx=m.geometry.index,count=idx?.count??a.count;
    for(let i=0;i<count;i+=3){const vs=[];for(let k=0;k<3;k++)vs.push(new THREE.Vector3().fromBufferAttribute(a,idx?idx.getX(i+k):i+k).applyMatrix4(m.matrixWorld).toArray());out.push({name:m.name,triangle:i/3,vertices:vs});}
  });return out;
}
function inVolume(soup:any[],min:number[],max:number[],allowance?:any) {
  // Shrink exactly 1mm so touching surfaces are not false intersections.
  const lo=min.map(x=>x+EPS),hi=max.map(x=>x-EPS);let hits=0;const examples:any[]=[];
  for(const tri of soup) {
    if(tri.vertices.some((v:any)=>!finiteVec(v)))throw Error("nonfinite triangle");
    if([0,1,2].some(a=>Math.max(...tri.vertices.map((v:any)=>v[a]))<lo[a]||Math.min(...tri.vertices.map((v:any)=>v[a]))>hi[a]))continue;
    const clipped=clipTriangle(tri.vertices,lo,hi);if(clipped.length<3)continue;
    const p=new THREE.Vector3(...clipped[0]);let area=0;
    for(let i=1;i+1<clipped.length;i++)area+=new THREE.Vector3(...clipped[i]).sub(p).cross(new THREE.Vector3(...clipped[i+1]).sub(p)).length()/2;
    if(area<1e-12)continue;
    if(allowance && clipped.every((v:any)=>v.every((x:number,a:number)=>x>=allowance.min[a]-EPS&&x<=allowance.max[a]+EPS)))continue;
    hits++;if(examples.length<8)examples.push({node:tri.name,triangle:tri.triangle,intersectionMin:[0,1,2].map(a=>Math.min(...clipped.map(v=>v[a]))),intersectionMax:[0,1,2].map(a=>Math.max(...clipped.map(v=>v[a])))});
  }return {hits,examples};
}

export function verifyPlayerMesh(root:any,k:any,neighbors:any[]=[]) {
  if(!k||typeof k.id!=="string"||!(k.scale>0)||!Number.isFinite(k.scale)||!Number.isFinite(k.terrainY))throw Error("invalid id/scale/terrainY contract");
  if(!Array.isArray(k.doors)||!k.doors.length||!Array.isArray(k.waypoints)||k.waypoints.length<2)throw Error("nonempty door and route coverage required");
  if(!Array.isArray(k.protectedVolumes))throw Error("explicit protectedVolumes array required");
  const s=k.scale,failures:string[]=[];
  for(const d of k.doors)if(typeof d.name!=="string"||!Number.isFinite(d.x)||!finiteVec(d.z,2)||!(d.z[1]>d.z[0])||!Number.isFinite(d.floorY)||!Number.isFinite(d.width)||!Number.isFinite(d.headroom)||!(d.width*s>=1.4)||!(d.headroom*s>=2.2))throw Error("door contract must require >=1.4m width and >=2.2m headroom");
  for(const p of k.waypoints)if(!finiteVec(p.pos)||typeof p.name!=="string")throw Error("invalid waypoint");
  for(const p of k.protectedVolumes){if(typeof p.id!=="string"||!finiteVec(p.min)||!finiteVec(p.max)||p.min.some((x:number,a:number)=>x>=p.max[a]))throw Error("invalid protected volume");if(p.allowance&&(!p.allowance.reason||!finiteVec(p.allowance.min)||!finiteVec(p.allowance.max)))throw Error("protected allowance requires explicit box and reason");}
  C.clearColliders();root.scale.setScalar(s);root.updateMatrixWorld(true);
  try {
    C.fitCollider(k.id,root,{scale:s,collide:k.collide,localFrame:true});
    const entry=C.colliders.get(k.id);if(!entry)throw Error("no fitted collider");
    const bb=new THREE.Box3().setFromObject(root),size=bb.getSize(new THREE.Vector3());
    const cls=decideSupportClass({w:size.x,d:size.z,h:size.y});
    if(!entry.exact)failures.push("host is not an exact browser collider");
    const hostSoup=triangleSoup(root),soup=[...hostSoup],neighborEvidence:any[]=[];
    const ids=new Set([k.id]);
    for(const n of neighbors){
      if(!n.id||ids.has(n.id)||!n.root)throw Error('invalid or duplicate assembly entity');ids.add(n.id);
      // n.root is expressed in HOST-LOCAL MODEL units before world scale s.
      n.root.position.multiplyScalar(s);n.root.scale.multiplyScalar(s);n.root.updateMatrixWorld(true);
      C.fitCollider(n.id,n.root,{scale:n.root.scale.x,collide:n.collide,localFrame:true});
      const triangles=triangleSoup(n.root);for(const tri of triangles)tri.name=`${n.id}/${tri.name}`;soup.push(...triangles);
      neighborEvidence.push({id:n.id,triangles:triangles.length,sha256:n.sha256??null,sourceTuple:n.sourceTuple??null,colliderExact:!!C.colliders.get(n.id)?.exact});
    }
    const doors=k.doors.map((d:any)=>{
      const min=[(d.x-d.width/2)*s,d.floorY*s,d.z[0]*s],max=[(d.x+d.width/2)*s,(d.floorY+d.headroom)*s,d.z[1]*s];
      const hit=inVolume(soup,min,max);
      if(hit.hits)failures.push(`door ${d.name}: ${hit.hits} triangles intrude into required ${d.width*s}m x ${d.headroom*s}m clearance`);
      return {name:d.name,requiredWidth:d.width*s,requiredHeadroom:d.headroom*s,min,max,...hit};
    });
    const protectedVolumes=k.protectedVolumes.map((p:any)=>{
      const scaled={min:p.min.map((v:number)=>v*s),max:p.max.map((v:number)=>v*s)};
      const allowance=p.allowance?{...p.allowance,min:p.allowance.min.map((v:number)=>v*s),max:p.allowance.max.map((v:number)=>v*s)}:undefined;
      const hit=inVolume(hostSoup,scaled.min,scaled.max,allowance);
      if(hit.hits)failures.push(`protected rider ${p.id}: ${hit.hits} unauthorized host triangles`);
      return {id:p.id,...scaled,allowance:allowance??null,...hit};
    });
    const walks:any[]=[];
    const terrain=()=>k.terrainY*s;
    for(const direction of ["in","out"]){
      const points=direction==="in"?k.waypoints:[...k.waypoints].reverse();
      const pos=new THREE.Vector3(...points[0].pos.map((v:number)=>v*s));
      for(let i=1;i<points.length;i++){
        const start=points[i-1],end=points[i],target=new THREE.Vector3(...end.pos.map((v:number)=>v*s));
        const startPos=pos.clone(),dx=target.x-startPos.x,dz=target.z-startPos.z,steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/SAMPLE));
        let maxPush=0,maxRise=0,minY=pos.y,maxY=pos.y,geometryHits=0;const issues:any[]=[];
        const low=Math.min(start.pos[1],end.pos[1])*s-FLOOR_TOL,high=Math.max(start.pos[1],end.pos[1])*s+FLOOR_TOL;
        for(let j=1;j<=steps;j++) {
          pos.x+=dx/steps;pos.z+=dz/steps;
          const before=pos.clone(),ground=C.resolveColliders(pos,terrain);const push=Math.hypot(pos.x-before.x,pos.z-before.z);
          maxPush=Math.max(maxPush,push);maxRise=Math.max(maxRise,ground-pos.y);pos.y=ground;minY=Math.min(minY,ground);maxY=Math.max(maxY,ground);
          // Conservative continuous swept square enclosing the standing cylinder.
          // Cover both horizontal axes and the entire previous->current segment,
          // not a narrow Z slice: the hip-only browser probe misses high side beams.
          // A declared step's support band is allowed; the collider/floor-profile
          // checks still refuse surfaces above it or an untraversable step rise.
          const supportCeiling=Math.max(start.pos[1],end.pos[1])*s;
          const hit=inVolume(soup,
            [Math.min(before.x-dx/steps,pos.x)-.32,Math.max(Math.min(before.y,ground),supportCeiling),Math.min(before.z-dz/steps,pos.z)-.32],
            [Math.max(before.x-dx/steps,pos.x)+.32,Math.max(before.y,ground)+1.9,Math.max(before.z-dz/steps,pos.z)+.32]);
          geometryHits+=hit.hits;
          if((push>EPS||ground<low||ground>high||hit.hits)&&issues.length<6)issues.push({sample:j,pos:pos.toArray(),push,ground,geometry:hit.examples});
        }
        const dist=Math.hypot(pos.x-target.x,pos.z-target.z),floorError=Math.abs(pos.y-target.y);
        const pass=maxPush<=EPS&&maxRise<=STEP+EPS&&dist<=.01&&floorError<=FLOOR_TOL&&minY>=low&&maxY<=high&&geometryHits===0;
        if(!pass)failures.push(`walk ${direction} ${start.name}->${end.name} failed`);
        walks.push({direction,from:start.name,to:end.name,pass,steps,maxPush,maxRise,minY,maxY,expectedFloorRange:[low,high],arrivalXZ:dist,floorError,geometryHits,arrived:pos.toArray(),issues});
      }
    }
    return {status:failures.length?"FAIL":"PASS",runtime:runtimeEvidence,evidenceKind:"actual-browser-collider-local-geometry-not-live-walk",id:k.id,
      bounds:{min:bb.min.toArray(),max:bb.max.toArray()},triangles:soup.length,collider:{exact:!!entry.exact,pillar:!!entry.pillar,classification:cls},
      constants:{requiredWidth:1.4,requiredHeadroom:2.2,bodyRadius:.32,bodyHeight:1.9,sampleStep:SAMPLE,boundaryTolerance:EPS,floorTolerance:FLOOR_TOL},
      doors,walks,protectedVolumes,neighbors:neighborEvidence,failures,limitations:["Only explicitly supplied assembly neighbors are checked; coverage and terrain remain caller contracts.","Door floorY is the highest authorized threshold surface, not a fabricated clearance lift.","Swept square conservatively encloses the standing body and may reject near-corner contacts.","Physical geometry checks do not prove visual quality or live runtime deployment parity."]};
  } finally { C.clearColliders(); }
}

if(import.meta.main){
  try {
    if(!process.argv[2]||!process.argv[3])throw Error("usage: bun verify-player.ts <model.glb> <route-contract.json> [report.json]");
    const p=resolve(process.argv[2]),contractBytes=readFileSync(process.argv[3]),k=JSON.parse(contractBytes.toString());
    const loaded=await loadPlayerMesh(p);
    if(k.sha256&&k.sha256!==loaded.sha256)throw Error("pinned model hash drift");
    const neighbors=k.assembly?await loadPlayerAssembly(k,k.assembly):[];
    const result={...verifyPlayerMesh(loaded.root,k,neighbors),modelFile:p,modelSha256:loaded.sha256,contractSha256:hash(contractBytes),verifierSha256:hash(readFileSync(import.meta.path)),meshes:loaded.meshes};
    if(process.argv[4]){const out=resolve(process.argv[4]);mkdirSync(dirname(out),{recursive:true});writeFileSync(out,JSON.stringify(result,null,2)+"\n");}
    console.log(JSON.stringify(result,null,2));process.exitCode=result.status==="PASS"?0:1;
  }catch(e){console.error(JSON.stringify({status:"ERROR",error:String(e)}));process.exitCode=2;}
}
