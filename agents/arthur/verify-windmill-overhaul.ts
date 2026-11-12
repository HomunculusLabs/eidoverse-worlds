#!/usr/bin/env bun
/** Read-only windmill verifier. Only stdout/stderr; never uploads, joins, writes or mutates. */
import assert from 'node:assert/strict';
import { Box3, Triangle, Vector3, Matrix4, Ray } from 'three';
import { NodeIO } from '@gltf-transform/core';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
type V = [number, number, number];
type Bounds = { min: V; max: V };
type Face = { v: [V, V, V]; node: string; material: string; moving?: string };
function triangleBox(t: Face, b: Bounds): boolean {
  // THREE implements the complete triangle/AABB separating-axis test.
  return new Box3(new Vector3(...b.min), new Vector3(...b.max)).intersectsTriangle(
    new Triangle(...t.v.map(v => new Vector3(...v)) as [Vector3, Vector3, Vector3]));
}
type Pose = {pos: V; yaw: number; scale: number};
type OBB = {center: [number,number]; axes: [[number,number],[number,number]]; half: [number,number]; y: [number,number]};
function obb(p: Pose, b: Bounds): OBB {
  const c=Math.cos(p.yaw), s=Math.sin(p.yaw);
  const x=(b.min[0]+b.max[0])*p.scale/2, z=(b.min[2]+b.max[2])*p.scale/2;
  return {center:[p.pos[0]+x*c+z*s,p.pos[2]-x*s+z*c],axes:[[c,-s],[s,c]],
    half:[(b.max[0]-b.min[0])*p.scale/2,(b.max[2]-b.min[2])*p.scale/2],
    y:[p.pos[1]+b.min[1]*p.scale,p.pos[1]+b.max[1]*p.scale]};
}
function satGap(a: OBB, b: OBB): number {
  const dot=(a:number[],b:number[])=>a[0]*b[0]+a[1]*b[1];
  return Math.max(...[...a.axes,...b.axes].map(axis=>
    Math.abs(dot([a.center[0]-b.center[0],a.center[1]-b.center[1]],axis))
    -a.axes.reduce((r,v,i)=>r+Math.abs(dot(v,axis))*a.half[i],0)
    -b.axes.reduce((r,v,i)=>r+Math.abs(dot(v,axis))*b.half[i],0)));
}
function selfTest() {
  const box: Bounds = {min: [-.5, -.5, -.5], max: [.5, .5, .5]};
  // All triangle corners OUTSIDE: a vertex/corner census falsely calls this empty.
  const face: Face = {v: [[-2,-2,0],[2,-2,0],[0,2,0]],node:'test',material:'test'};
  assert.equal(triangleBox(face, box), true, 'crossing wall triangle must block although no vertex lies in the box');
  assert.equal(triangleBox({...face,v:face.v.map(v=>[v[0],v[1],2]) as [V,V,V]},box),false,'separated triangle');
  console.log('SELF_TEST PASS triangle-vs-box crossing/no-corner and separation');
  const a = obb({pos:[0,0,0],yaw:0,scale:1},box);
  assert.equal(satGap(a,obb({pos:[4,0,0],yaw:0,scale:1},box)),3,'distant pair must separate on ANY axis, not all');
  assert.equal(satGap(a,obb({pos:[1,0,0],yaw:0,scale:1},box)),0,'touching pair');
  assert.equal(satGap(a,obb({pos:[.5,0,0],yaw:0,scale:1},box)),-.5,'overlapping pair');
  const offset=obb({pos:[10,2,20],yaw:Math.PI/2,scale:2},{min:[1,-1,3],max:[3,1,5]});
  assert.ok(Math.abs(offset.center[0]-18)<1e-10 && Math.abs(offset.center[1]-16)<1e-10,'rotate scaled LOCAL bbox center with (cos,-sin)/(sin,cos)');
  assert.deepEqual(offset.half,[2,2]);
  assert.deepEqual(offset.y,[0,4]);
  console.log('SELF_TEST PASS OBB SAT separated/touching/overlap and scaled offset center');
}
// Usage (from any cwd):
//   bun agents/arthur/verify-windmill-overhaul.ts
//   bun agents/arthur/verify-windmill-overhaul.ts --census /path/to/saved.json
//   bun agents/arthur/verify-windmill-overhaul.ts --phase post --expected-sha <64 hex>
// No arguments: fresh public GET, accepts exactly old or final-new state.
// --census is STRICTLY OFFLINE: no fetch, credential reads, or world connection.
// --phase pre/post narrows acceptance; --phase auto is the default.
// --self-test: math regressions; --fixture-test: actual local model + saved census.
// --adversarial-test: in-memory negative fixtures, zero fixture-file writes.
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const ID='nx-town-windmill', WORLD='commons-next', OLD='store/369c572480b0e786.glb';
const DEFAULT_GLB=resolve(ROOT,'agents/arthur/assets/village_windmill_overhaul.glb');
const DEFAULT_BASELINE=resolve(ROOT,'agents/arthur/reviews/windmill-overhaul/before/census.json');
const PUBLIC_ORIGIN='https://eidoverse.billding.dev';
const POSE: Pose={pos:[-40,0,0],yaw:Math.PI/2,scale:1};
const HUB: V=[0,8.2,2.92], RUNNER: V=[-1.63,.845,-.92];
const RIDERS=['nx-artwalk-b10-windmill-four-wind-crown','nx-sign-mill-001'];
const MATERIALS=['mill_limestone','mill_limewash','mill_oak','mill_weathered_boards','mill_slate','mill_iron','mill_flax_canvas','mill_bronze','mill_grain','mill_window','mill_lantern'];
const motion=(axis:V,rpm:number)=>({type:'spin',axis,pivot:[0,0,0],rpm,phase:0,t0:Date.parse('2026-09-08T00:26:01Z')});
const BAG={'motion:sails':motion([0,0,1],1.25),'motion:well_millstone':motion([0,1,0],5)};
const GEOM_EPS=1e-5, CENSUS_ROUNDING=.002;
type Options={glb?:string;review?:string;baseline?:string;census?:string;expectedSha?:string;phase?:'auto'|'pre'|'post'; censusData?:any;quiet?:boolean};
function requireThat(ok: unknown,message:string): asserts ok { if(!ok) throw Error(message); }
const sha=(bytes:Uint8Array)=>createHash('sha256').update(bytes).digest('hex');
function jsonFile(path:string) { try { return JSON.parse(readFileSync(path,'utf8')); } catch { throw Error(`unreadable/invalid JSON file: ${path}`); } }
function vector(v:any,n=3): boolean { return Array.isArray(v)&&v.length===n&&v.every(Number.isFinite); }
function validBounds(b:any,label:string) {
  requireThat(b&&vector(b.min)&&vector(b.max)&&b.min.every((v:number,i:number)=>v<=b.max[i]),`${label}: missing/nonfinite/inverted bbox`);
}
function near(a:number[],b:number[],eps=GEOM_EPS) { return a.length===b.length&&a.every((v,i)=>Number.isFinite(v)&&Number.isFinite(b[i])&&Math.abs(v-b[i])<=eps); }
function extent(vertices:V[]): Bounds {
  requireThat(vertices.length>0,'empty geometry cannot be verified');
  const b:Bounds={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};
  for(const v of vertices) for(let i=0;i<3;i++){b.min[i]=Math.min(b.min[i],v[i]);b.max[i]=Math.max(b.max[i],v[i]);}
  return b;
}
function union(a:Bounds,b:Bounds): Bounds { return {min:a.min.map((v,i)=>Math.min(v,b.min[i])) as V,max:a.max.map((v,i)=>Math.max(v,b.max[i])) as V}; }
function widen(b:Bounds,eps:number):Bounds { return {min:b.min.map(v=>v-eps) as V,max:b.max.map(v=>v+eps) as V}; }
function world(v:V,p:Pose):V {
  const c=Math.cos(p.yaw),s=Math.sin(p.yaw);
  return [p.pos[0]+p.scale*(v[0]*c+v[2]*s),p.pos[1]+p.scale*v[1],p.pos[2]+p.scale*(-v[0]*s+v[2]*c)];
}
function local(v:V,p:Pose):V {
  const c=Math.cos(p.yaw),s=Math.sin(p.yaw),x=v[0]-p.pos[0],z=v[2]-p.pos[2];
  return [(x*c-z*s)/p.scale,(v[1]-p.pos[1])/p.scale,(x*s+z*c)/p.scale];
}
function corners(b:Bounds):V[]{const out:V[]=[];for(const x of [b.min[0],b.max[0]])for(const y of [b.min[1],b.max[1]])for(const z of [b.min[2],b.max[2]])out.push([x,y,z]);return out;}
function censusMap(data:any,label:string):Map<string,any> {
  requireThat(data?.world===WORLD&&Array.isArray(data.entities)&&data.entities.length>0,`${label}: invalid/empty/wrong-world census`);
  requireThat(data.mounts&&typeof data.mounts==='object'&&!Array.isArray(data.mounts),`${label}: missing mounts map`);
  const map=new Map<string,any>();
  for(const e of data.entities){
    requireThat(e&&typeof e.id==='string'&&e.id.length>0&&!map.has(e.id),`${label}: invalid/duplicate entity id`);
    requireThat(vector(e.pos)&&Number.isFinite(e.yaw)&&Number.isFinite(e.scale)&&e.scale>0,`${label}: invalid pose ${e.id}`);
    requireThat(Object.hasOwn(e,'parent')&&e.comp&&typeof e.comp==='object'&&!Array.isArray(e.comp),`${label}: missing parent/component bag ${e.id}`);
    if(e.lib!==null){requireThat(typeof e.lib==='string'&&e.lib.length>0,`${label}: invalid lib ${e.id}`);validBounds(e.bbox,`${label} ${e.id}`);}
    if(e.bbox){validBounds(e.bbox,`${label} ${e.id}`);requireThat(e.parent===null,`${label}: parented bbox entity needs resolved transform: ${e.id}`);}
    map.set(e.id,e);
  }
  // Do not silently accept truncated responses with a contradictory count.
  for(const k of ['total','count','entity_count'])if(Object.hasOwn(data,k))requireThat(data[k]===map.size,`${label}: ${k} does not match enumerated entities`);
  requireThat(data.has_more!==true,`${label}: incomplete paginated census`);
  return map;
}
function targetTuple(e:any) {return e&&{id:e.id,lib:e.lib,kind:e.kind,pos:e.pos,yaw:e.yaw,scale:e.scale,parent:e.parent,comp:e.comp};}
function expectedTuple(lib:string,comp:any){return {id:ID,lib,kind:'thing',...POSE,parent:null,comp};}
async function freshCensus(){
  const response=await fetch(`${PUBLIC_ORIGIN}/geom?world=${WORLD}`,{method:'GET',headers:{Accept:'application/json','Cache-Control':'no-cache'},redirect:'error',signal:AbortSignal.timeout(25000)});
  const text=await response.text();
  requireThat(response.ok,`live census HTTP ${response.status} (${response.headers.get('content-type')??'unknown content type'}); no live conclusion`);
  try{return JSON.parse(text);}catch{throw Error(`live census invalid JSON (${response.status}, ${response.headers.get('content-type')??'unknown'}); no live conclusion`);}
}
// Minimum distance of a FILLED projected triangle from the axis, not its corners.
function radialMinimum(v:[V,V,V],pivot:V):number {
  const p=v.map(a=>[a[0]-pivot[0],a[1]-pivot[1]]);
  const cross=(a:number[],b:number[])=>a[0]*b[1]-a[1]*b[0];
  const signed=p.map((a,i)=>cross(a,p[(i+1)%3]));
  const area=cross([p[1][0]-p[0][0],p[1][1]-p[0][1]],[p[2][0]-p[0][0],p[2][1]-p[0][1]]);
  if(Math.abs(area)>1e-14&&(signed.every(n=>n>=0)||signed.every(n=>n<=0)))return 0;
  return Math.min(...p.map((a,i)=>{const b=p[(i+1)%3],dx=b[0]-a[0],dy=b[1]-a[1],d=dx*dx+dy*dy;const t=d?Math.max(0,Math.min(1,-(a[0]*dx+a[1]*dy)/d)):0;return Math.hypot(a[0]+t*dx,a[1]+t*dy);}));
}
// A certified LOWER bound on distance to the filled continuous rotor cylinder.
// Separate radial/axial minima may occur at different points: this can only
// UNDERESTIMATE clearance, never certify a collision as clear. No angle sampling.
function cylinderGap(t:Face,radius:number,z:[number,number],pivot:V=HUB):number {
  const radial=Math.max(0,radialMinimum(t.v,pivot)-radius);
  const low=Math.min(...t.v.map(v=>v[2])),high=Math.max(...t.v.map(v=>v[2]));
  return Math.hypot(radial,Math.max(0,z[0]-high,low-z[1]));
}
function shaftInterface(t:Face):boolean {
  // This single concentric iron windshaft physically enters the rotating hub.
  // Bound the exception by EVERY triangle vertex, material, and authored axial
  // endpoints; never exempt an entire merged bucket, bearing box, or arbitrary ID.
  return !t.moving&&t.material==='mill_iron'&&t.v.every(v=>Math.hypot(v[0]-HUB[0],v[1]-HUB[1])<=.12001&&v[2]>=.91999&&v[2]<=3.02001);
}
async function decode(bytes:Uint8Array){
  requireThat(bytes.byteLength>=20,'truncated GLB');
  const header=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  requireThat(header.getUint32(0,true)===0x46546c67&&header.getUint32(4,true)===2&&header.getUint32(8,true)===bytes.byteLength,'invalid GLB header/length');
  const doc=await new NodeIO().readBinary(bytes),root=doc.getRoot();
  requireThat(root.listScenes().length===1&&root.getDefaultScene()===root.listScenes()[0],'expected exactly one default scene');
  requireThat(root.listAnimations().length===0&&root.listSkins().length===0,'unverified animation/skinning not allowed');
  const nodes=root.listNodes();requireThat(nodes.length>0&&nodes.length<=45,`node budget exceeded: ${nodes.length}`);
  const seen=new Set<any>(),usedMeshes=new Set<any>(),usedMaterials=new Set<any>(),faces:Face[]=[];
  let primitives=0,coveredTriangles=0;
  const visit=(node:any,moving?:string)=>{
    requireThat(!seen.has(node),'multiply parented/cyclic scene graph');seen.add(node);
    if(['sails','well_millstone'].includes(node.getName()))moving=node.getName();
    const matrix=new Matrix4().fromArray(node.getWorldMatrix());
    requireThat(matrix.elements.every(Number.isFinite)&&Math.abs(matrix.determinant())>1e-12,`invalid transform ${node.getName()}`);
    const mesh=node.getMesh();
    if(mesh){usedMeshes.add(mesh);for(const p of mesh.listPrimitives()){
      primitives++;requireThat(p.getMode()===4,`non-triangle primitive ${node.getName()}`);
      requireThat(p.listTargets().length===0,`unverified morph target ${node.getName()}`);
      const pos=p.getAttribute('POSITION'),indices=p.getIndices(),normal=p.getAttribute('NORMAL'),uv=p.getAttribute('TEXCOORD_0'),mat=p.getMaterial();
      requireThat(pos&&pos.getElementSize()===3&&pos.getCount()>0,`missing positions ${node.getName()}`);
      requireThat(mat&&MATERIALS.includes(mat.getName()),`unreviewed/missing material ${node.getName()}`);usedMaterials.add(mat);
      const texture=mat.getBaseColorTexture();
      requireThat(texture?.getImage()?.length>0&&uv?.getCount()===pos.getCount(),`missing embedded texture/UV coverage ${node.getName()}`);
      requireThat(normal?.getCount()===pos.getCount(),`missing normals ${node.getName()}`);
      for(const a of [pos,normal,uv])requireThat(Array.from(a.getArray()).every(Number.isFinite),`nonfinite accessor ${node.getName()}`);
      requireThat(mat.getBaseColorFactor().every(Number.isFinite)&&Number.isFinite(mat.getRoughnessFactor())&&Number.isFinite(mat.getMetallicFactor()),`nonfinite material ${node.getName()}`);
      const count=indices?indices.getCount():pos.getCount();requireThat(count>0&&count%3===0,'invalid triangle index count');
      const vertices:V[]=[];
      for(let i=0;i<pos.getCount();i++)vertices.push(new Vector3(...pos.getElement(i,[])).applyMatrix4(matrix).toArray() as V);
      for(let i=0;i<count;i+=3){const ids=[0,1,2].map(k=>indices?indices.getScalar(i+k):i+k);requireThat(ids.every(j=>Number.isInteger(j)&&j>=0&&j<vertices.length),'invalid triangle index');faces.push({v:ids.map(j=>vertices[j]) as [V,V,V],node:node.getName(),material:mat.getName(),moving});coveredTriangles++;}
    }}
    for(const child of node.listChildren())visit(child,moving);
  };
  for(const n of root.getDefaultScene()!.listChildren())visit(n);
  requireThat(seen.size===nodes.length,`unreachable nodes: ${nodes.length-seen.size}`);
  requireThat(usedMeshes.size===root.listMeshes().length,'unreachable mesh');
  requireThat(usedMaterials.size===root.listMaterials().length&&usedMaterials.size===MATERIALS.length,'unused/missing/duplicate material coverage');
  requireThat(faces.length>0&&coveredTriangles===faces.length,'vacuous triangle coverage');
  return {doc,nodes,faces,primitives,meshes:usedMeshes.size,materials:[...usedMaterials].map(m=>({name:m.getName(),triangles:faces.filter(t=>t.material===m.getName()).length})),bounds:extent(faces.flatMap(t=>t.v))};
}
function validateAnchor(d:Awaited<ReturnType<typeof decode>>,name:string,pivot:V){
  const matches=d.nodes.filter(n=>n.getName()===name);requireThat(matches.length===1,`expected exact unique ${name} node`);
  const node=matches[0];
  requireThat(isDeepStrictEqual(node.getTranslation(),pivot)&&isDeepStrictEqual(node.getRotation(),[0,0,0,1])&&isDeepStrictEqual(node.getScale(),[1,1,1]),`${name}: exact local pivot/rest quaternion/scale drift`);
  const m=new Matrix4().fromArray(node.getWorldMatrix());
  requireThat(near(m.elements,new Matrix4().makeTranslation(...pivot).elements,1e-12),`${name}: ancestor transforms alter exact hinge frame`);
  return node;
}
function roomCheck(d:Awaited<ReturnType<typeof decode>>,map:Map<string,any>){
  const floor=.08,avatarHeight=2.1,bodyTop=floor+avatarHeight;
  const boxes:{name:string;box:Bounds}[]=[
    {name:'full_1.8m_structural_door',box:{min:[-.9+GEOM_EPS,floor+.0001,2.30],max:[.9-GEOM_EPS,2.3-.0001,3.25]}},
    {name:'central_1.8m_aisle_2.1m_avatar',box:{min:[-.9+GEOM_EPS,floor+.0001,-2.30],max:[.9-GEOM_EPS,bodyTop,3.25]}}
  ];
  const checks=boxes.map(({name,box})=>{const hits=d.faces.filter(t=>triangleBox(t,box));requireThat(!hits.length,`${name}: ${hits.length} blocking TRIANGLES ${JSON.stringify(hits.slice(0,3))}`);return {name,box,trianglesTested:d.faces.length,blockingTriangles:hits.length};});
  // A floor must actually be present, not merely an empty volume in midair.
  let floorSamples=0;
  for(const x of [-.85,-.425,0,.425,.85])for(const z of [-2.2,-1.1,0,1.1,2.2,2.5]){
    const ray=new Ray(new Vector3(x,floor+.03,z),new Vector3(0,-1,0));let top=-Infinity;
    for(const t of d.faces){const hit=ray.intersectTriangle(...t.v.map(v=>new Vector3(...v)) as [Vector3,Vector3,Vector3],false,new Vector3());if(hit)top=Math.max(top,hit.y);}
    requireThat(Math.abs(top-floor)<=.0001,`floor absent/wrong at x=${x},z=${z}: ${top}`);floorSamples++;
  }
  const riderBounds=RIDERS.map(id=>{const e=map.get(id);const b=extent(corners(e.bbox).map(v=>local(world(v,e),POSE)));const body=boxes[1].box;const separated=[0,1,2].some(i=>b.max[i]<body.min[i]||b.min[i]>body.max[i]);requireThat(separated,`preserved rider bbox obstructs 2.1m avatar: ${id}`);return {id,hostLocalBounds:b};});
  const crown=riderBounds[0].hostLocalBounds;
  const effectiveHeadroom=Math.min(2.3,crown.min[1])-floor;
  requireThat(effectiveHeadroom>=avatarHeight,'crown reduces headroom below 2.1m');
  // The rotating runner cap must also stay outside the entire visitor aisle.
  const runner=d.faces.filter(t=>t.moving==='well_millstone').flatMap(t=>t.v);
  const radius=Math.max(...runner.map(v=>Math.hypot(v[0]-RUNNER[0],v[2]-RUNNER[2])));
  requireThat(RUNNER[0]+radius<-.9,`rotating runnerstone enters central aisle: xMax=${RUNNER[0]+radius}`);
  return {avatarHeight,floorY:floor,checks,floorSamples,effectiveHeadroom,riderBounds,runnerSweepRadius:radius,runnerToAisleGap:-.9-(RUNNER[0]+radius)};
}
function rotorCheck(d:Awaited<ReturnType<typeof decode>>){
  const rotating=d.faces.filter(t=>t.moving==='sails'),statics=d.faces.filter(t=>t.moving!=='sails');
  requireThat(rotating.length>0&&statics.length>0,'empty rotor/static population');
  const verts=rotating.flatMap(t=>t.v),radius=Math.max(...verts.map(v=>Math.hypot(v[0]-HUB[0],v[1]-HUB[1]))),rest=extent(verts);
  const envelope:Bounds={min:[HUB[0]-radius,HUB[1]-radius,rest.min[2]],max:[HUB[0]+radius,HUB[1]+radius,rest.max[2]]};
  // Inspect the baked 45-degree rest state independently of the parent quaternion.
  const tipStock=rotating.filter(t=>t.material==='mill_oak').flatMap(t=>t.v).filter(v=>Math.hypot(v[0]-HUB[0],v[1]-HUB[1])>3.5);
  requireThat(tipStock.length>0,'missing sail stocks');
  const quadrants=new Set<number>();
  for(const v of tipStock){const a=Math.atan2(v[1]-HUB[1],v[0]-HUB[0]);const k=Math.round((a-Math.PI/4)/(Math.PI/2));requireThat(Math.abs(a-(Math.PI/4+k*Math.PI/2))<.025,'sail stock not baked at 45 degrees');quadrants.add((k+4)%4);}
  requireThat(quadrants.size===4,'missing one or more of four sails');
  const isContactInterface=(t:Face)=>shaftInterface(t)&&cylinderGap(t,radius,[envelope.min[2],envelope.max[2]])<=GEOM_EPS;
  const interfaceFaces=statics.filter(isContactInterface),clearFaces=statics.filter(t=>!isContactInterface(t));
  requireThat(interfaceFaces.length>0&&interfaceFaces.length<=64,'shaft exception coverage missing/excessive');
  const interfaceBounds=extent(interfaceFaces.flatMap(t=>t.v));
  requireThat(near(interfaceBounds.min,[-.12,8.08,.92])&&near(interfaceBounds.max,[.12,8.32,3.02]),'shaft exception no longer matches authored bearing-interface extent');
  const candidates=clearFaces.map(t=>({t,gap:cylinderGap(t,radius,[envelope.min[2],envelope.max[2]])}));
  const blocked=candidates.filter(x=>x.gap<=GEOM_EPS);
  requireThat(!blocked.length,`rotor FULL-TURN cylinder not separated from ${blocked.length} non-interface building triangles: ${JSON.stringify(blocked.slice(0,3))}`);
  const nearest=candidates.reduce((a,b)=>a.gap<b.gap?a:b);
  requireThat(envelope.min[1]>4.31,'rotor no longer clears galleryTop contract');
  return {pivot:HUB,axis:[0,0,1],radius,restBounds:rest,fullTurnEnvelope:envelope,rotatingTriangles:rotating.length,staticTriangles:statics.length,clearanceTriangles:clearFaces.length,mechanicalInterface:{description:'concentric iron windshaft inside hub ONLY',triangles:interfaceFaces.length,bounds:interfaceBounds},certifiedBuildingClearanceLowerBound:nearest.gap,nearestStaticTriangle:{node:nearest.t.node,material:nearest.t.material,vertices:nearest.t.v},galleryContractGap:envelope.min[1]-4.31};
}
function siteCheck(map:Map<string,any>,full:Bounds,rotor:Bounds){
  const target=obb(POSE,full),rotorOBB=obb(POSE,rotor),all:any[]=[],attached:any[]=[];
  const bboxEntities=[...map.values()].filter(e=>e.bbox);
  requireThat(bboxEntities.length>RIDERS.length+1,'vacuous site geometry population');
  for(const e of bboxEntities){
    if(e.id===ID)continue;
    // Rounding padding grows all neighbors, so 3-decimal census precision cannot
    // turn a tiny true overlap into a false separation. No ground/network skip.
    const other=obb(e,widen(e.bbox,CENSUS_ROUNDING)),horizontal=satGap(target,other);
    const vertical=Math.max(other.y[0]-target.y[1],target.y[0]-other.y[1]);
    const separation=Math.max(horizontal,vertical);
    if(RIDERS.includes(e.id)){
      const rotorGap=Math.max(satGap(rotorOBB,other),other.y[0]-rotorOBB.y[1],rotorOBB.y[0]-other.y[1]);
      requireThat(rotorGap>0,`rotor envelope contacts unchanged rider ${e.id}`);
      attached.push({id:e.id,hostFootprintGap:horizontal,rotorSeparation:rotorGap,reason:'exact full baseline record unchanged; intentional facade attachment; room bbox cleared'});continue;
    }
    requireThat(separation>0,`site OBB overlap/unproved contact ${e.id}: horizontal=${horizontal},vertical=${vertical}`);
    // A strict 1.4m solid-solid lane; ground films are not skipped from overlap.
    const solid=(e.bbox.max[1]-e.bbox.min[1])*e.scale>.5;
    requireThat(!solid||horizontal>=1.4||vertical>=1.4,`site solid-solid lane below 1.4m ${e.id}: ${separation}`);
    all.push({id:e.id,horizontalGap:horizontal,verticalGap:vertical,separation,solid});
  }
  requireThat(all.length+attached.length+1===bboxEntities.length,'incomplete SAT coverage');
  all.sort((a,b)=>a.horizontalGap-b.horizontalGap);
  return {targetFullTurnLocalBounds:full,targetOBB:target,censusBboxEntities:bboxEntities.length,otherBboxesTested:all.length,attachedRidersTested:attached.length,groundOrNetworkSkipped:0,censusPadding:CENSUS_ROUNDING,nearest:all.slice(0,8),knownNeighbors:all.filter(e=>['nx-struct-stillwind','nx-struct-hypar','nx-town-roads','nx-core-paths'].includes(e.id)),attached};
}
export async function verifyCandidate(options:Options={}){
  const glb=resolve(options.glb??DEFAULT_GLB),reviewPath=resolve(options.review??glb.replace(/\.glb$/,'.review.json'));
  const reviewBytes=readFileSync(reviewPath),review=JSON.parse(reviewBytes.toString()),bytes=readFileSync(glb),sourceSha=sha(bytes);
  requireThat(typeof review.sha256==='string'&&/^[0-9a-f]{64}$/.test(review.sha256),'review SHA format invalid');
  if(options.expectedSha!==undefined)requireThat(/^[0-9a-f]{64}$/.test(options.expectedSha)&&sourceSha===options.expectedSha,'explicit expected SHA mismatch/invalid format');
  requireThat(sourceSha===review.sha256,'exact local bytes do not match review SHA');
  requireThat(typeof review.file==='string'&&resolve(ROOT,review.file)===glb,'review describes a different model path');
  const baselinePath=resolve(options.baseline??DEFAULT_BASELINE),baselineBytes=readFileSync(baselinePath),baseline=JSON.parse(baselineBytes.toString()),baseMap=censusMap(baseline,'baseline');
  requireThat(isDeepStrictEqual(targetTuple(baseMap.get(ID)),expectedTuple(OLD,{})),'baseline windmill tuple is not original approved state');
  for(const [i,id] of RIDERS.entries()){
    const e=baseMap.get(id);requireThat(e,`missing baseline rider ${id}`);
    requireThat(near(local(e.pos,POSE),i===0?[0,2.22,2.62]:[-1.6,2.78,2.5],1e-12)&&e.yaw===POSE.yaw&&e.scale===1&&e.parent===null,`baseline rider anchor changed ${id}`);
  }
  const d=await decode(bytes);validateAnchor(d,'sails',HUB);validateAnchor(d,'well_millstone',RUNNER);
  requireThat(d.nodes.length===review.nodes&&d.meshes===review.meshes&&d.faces.length===review.triangles,'decoded node/mesh/triangle counts disagree with review');
  validBounds(review.bounds,'review');requireThat(near(d.bounds.min,review.bounds.min)&&near(d.bounds.max,review.bounds.max),'decoded rest bounds disagree with review');
  const rotor=rotorCheck(d);
  requireThat(isDeepStrictEqual(review.rotor?.pivot,HUB)&&isDeepStrictEqual(review.rotor?.axis,[0,0,1])&&Math.abs(review.rotor.radius-rotor.radius)<=GEOM_EPS&&Math.abs(review.rotor.minY-rotor.fullTurnEnvelope.min[1])<=GEOM_EPS&&Math.abs(review.rotor.maxY-rotor.fullTurnEnvelope.max[1])<=GEOM_EPS,'decoded full-turn rotor disagrees with review');
  requireThat(review.room?.floorY===.08&&review.room?.doorWidth===1.8&&review.room?.doorTop===2.3&&isDeepStrictEqual(review.room?.centralAisle,[-.9,.9]),'review room contract drift');
  requireThat(isDeepStrictEqual(review.ridersUnchanged,RIDERS),'review rider coverage drift');
  if(!options.quiet)console.log(JSON.stringify({stage:'LOCAL_GLB_DECODE_PASS',sha256:sourceSha,nodes:d.nodes.length,meshes:d.meshes,triangles:d.faces.length,rotorRadius:rotor.radius,certifiedRotorClearance:rotor.certifiedBuildingClearanceLowerBound}));
  const census=options.censusData??(options.census?jsonFile(resolve(options.census)):await freshCensus()),map=censusMap(census,options.census||options.censusData?'fixture':'live');
  requireThat(map.size>=baseMap.size,'census lost baseline entities (or response truncated); inspect before placement');
  const lib=`store/${sourceSha.slice(0,16)}.glb`,actual=targetTuple(map.get(ID)),old=isDeepStrictEqual(actual,expectedTuple(OLD,{})),updated=isDeepStrictEqual(actual,expectedTuple(lib,BAG));
  requireThat(old||updated,'live windmill not exact original or complete final new tuple/component bag');
  requireThat(options.phase!=='pre'||old,'expected PRE state, found new model');
  requireThat(options.phase!=='post'||updated,'expected POST state, found old model');
  if(old)requireThat(isDeepStrictEqual(map.get(ID),baseMap.get(ID)),'original windmill record changed despite tuple match');
  else {const b=map.get(ID).bbox;requireThat(near(b.min,d.bounds.min,.02)&&near(b.max,d.bounds.max,.02),'new live bbox does not match exact local model (2cm optimizer tolerance)');}
  for(const id of RIDERS)requireThat(isDeepStrictEqual(map.get(id),baseMap.get(id)),`complete preserved rider/sign record drift: ${id}`);
  // Parent/mount data must remain unchanged for the complete owned ensemble.
  const ensemble=new Set([ID,...RIDERS]);
  const relevantMounts=(mounts:any)=>Object.fromEntries(Object.entries(mounts).filter(([key,m]:[string,any])=>ensemble.has(key)||[m?.to,m?.parent,m?.id].some(v=>ensemble.has(v))));
  requireThat(isDeepStrictEqual(relevantMounts(census.mounts),relevantMounts(baseline.mounts)),'windmill/rider mount relationships drift');
  const room=roomCheck(d,map),site=siteCheck(map,union(d.bounds,rotor.fullTurnEnvelope),rotor.fullTurnEnvelope);
  // Defend against builder/baseline edits racing this read-only run.
  requireThat(sha(readFileSync(glb))===sourceSha&&sha(readFileSync(reviewPath))===sha(reviewBytes)&&sha(readFileSync(baselinePath))===sha(baselineBytes),'input files changed DURING verification; rerun');
  return {status:'WINDMILL_OVERHAUL_PASS',mode:options.census||options.censusData?'OFFLINE_FIXTURE_NOT_LIVE':'FRESH_LIVE_GET',world:WORLD,sourceSha256:sourceSha,reviewPath,baselinePath,baselineSha256:sha(baselineBytes),liveState:old?'ORIGINAL_PRE_PLACEMENT':'OVERHAUL_POST_PLACEMENT',tuple:actual,censusEntities:map.size,local:{nodes:d.nodes.length,meshes:d.meshes,primitives:d.primitives,triangles:d.faces.length,materialCoverage:d.materials,bounds:d.bounds},rotor,room,site,preservedFullRecords:RIDERS,mutations:0,uploads:0,websocketConnections:0,fileWrites:0,limitations:['Geometry/tuple gate, not a visual judgment or avatar locomotion simulation.','Neighbor SAT uses census base poses and conservatively padded local bboxes.','Post-placement lib pins source bytes; live optimized bbox may differ by at most 2cm.']};
}
async function adversarialTests(){
  const fixture=jsonFile(DEFAULT_BASELINE),out:string[]=[];
  const check=(name:string,fn:()=>void)=>{try{fn();out.push(name);}catch(error){throw Error(`TEST ${name}: ${error instanceof Error?error.message:String(error)}`);}};
  const reject=async(name:string,change:(j:any)=>void,pattern:RegExp)=>{const j=structuredClone(fixture);change(j);await assert.rejects(()=>verifyCandidate({censusData:j,quiet:true}),pattern);out.push(name);};
  const originalFetch=globalThis.fetch;
  globalThis.fetch=(()=>{throw Error('OFFLINE_TEST_ATTEMPTED_NETWORK');}) as typeof fetch;
  try{
    const passed=await verifyCandidate({census:DEFAULT_BASELINE,quiet:true});
    check('offline mode makes no fetch',()=>assert.equal(passed.mode,'OFFLINE_FIXTURE_NOT_LIVE'));
    await reject('empty census',j=>j.entities=[],/invalid\/empty/);
    await reject('duplicate IDs',j=>j.entities.push(j.entities[0]),/duplicate entity/);
    await reject('missing bbox',j=>delete j.entities.find((e:any)=>e.id==='nx-struct-hypar').bbox,/missing\/nonfinite\/inverted bbox/);
    await reject('wrong host yaw',j=>j.entities.find((e:any)=>e.id===ID).yaw=90,/not exact original/);
    await reject('complete sign comp drift',j=>j.entities.find((e:any)=>e.id===RIDERS[1]).comp={unexpected:{enabled:true}},/complete preserved/);
    await reject('complete crown bbox drift',j=>j.entities.find((e:any)=>e.id===RIDERS[0]).bbox.max[2]+=.001,/complete preserved/);
    await reject('offset-center neighbor overlap',j=>{const e=j.entities.find((e:any)=>e.id==='nx-struct-hypar');e.pos=[-80,0,0];e.yaw=Math.PI/2;e.bbox={min:[-1,0,39],max:[1,5,41]};},/site OBB overlap/);
    await reject('ground-network overlap is NOT skipped',j=>{const e=j.entities.find((e:any)=>e.id==='nx-core-paths');e.pos=[-40,0,0];e.bbox={min:[-1,0,-1],max:[1,.05,1]};},/site OBB overlap/);
    await assert.rejects(()=>verifyCandidate({censusData:fixture,phase:'post',quiet:true}),/expected POST/);out.push('post mode rejects old live tuple');
    await assert.rejects(()=>verifyCandidate({censusData:fixture,expectedSha:'A'.repeat(64),quiet:true}),/expected SHA/);out.push('malformed literal SHA rejected without normalization');
    const post=structuredClone(fixture),host=post.entities.find((e:any)=>e.id===ID);
    Object.assign(host,expectedTuple(`store/${passed.sourceSha256.slice(0,16)}.glb`,structuredClone(BAG)),{bbox:passed.local.bounds,tris:passed.local.triangles});
    const updated=await verifyCandidate({censusData:post,phase:'post',quiet:true});
    check('synthetic post-state contract (NOT live evidence)',()=>assert.equal(updated.liveState,'OVERHAUL_POST_PLACEMENT'));
    delete host.comp['motion:well_millstone'];
    await assert.rejects(()=>verifyCandidate({censusData:post,quiet:true}),/not exact original/);out.push('partial motion restoration rejected');
    const d=await decode(readFileSync(DEFAULT_GLB)),m=censusMap(fixture,'self-test');
    const block:Face={node:'adversarial_wall',material:'mill_oak',v:[[-2,-1,2.5],[2,-1,2.5],[0,4,2.5]]};
    check('actual decoded room plus no-corner crossing wall',()=>assert.throws(()=>roomCheck({...d,faces:[...d.faces,block]},m),/blocking TRIANGLES/));
    const rotorBlock:Face={node:'adversarial_rotor_block',material:'mill_iron',v:[[-5,3,2.95],[5,3,2.95],[0,14,2.95]]};
    check('rotor rejects triangle whose corners all miss swept cylinder',()=>assert.throws(()=>rotorCheck({...d,faces:[...d.faces,rotorBlock]}),/FULL-TURN cylinder/));
    check('projected triangle radial minimum, not vertex distance',()=>assert.equal(radialMinimum(rotorBlock.v,HUB),0));
    const pivotNode=d.nodes.find(n=>n.getName()==='sails')!;pivotNode.setTranslation([0,8.2,2.93]);
    check('exact pivot drift rejected',()=>assert.throws(()=>validateAnchor(d,'sails',HUB),/exact local pivot/));pivotNode.setTranslation(HUB);
    const parent=d.doc.createNode('adversarial_parent').setScale([2,1,1]);
    d.doc.getRoot().getDefaultScene()!.removeChild(pivotNode).addChild(parent);parent.addChild(pivotNode);
    check('ancestor nonuniform scale must fail exact hinge frame',()=>assert.throws(()=>validateAnchor(d,'sails',HUB),/ancestor/));
  }finally{globalThis.fetch=originalFetch;}
  console.log(JSON.stringify({status:'ADVERSARIAL_TEST_PASS',tests:out.length,cases:out,fixtures:'in-memory test data, NOT live-state evidence',fileWrites:0,networkRequests:0}));
}
function args():Options&{selfTest?:boolean;adversarialTest?:boolean}{
  const o:Options&{selfTest?:boolean;adversarialTest?:boolean}={phase:'auto'};
  const valueKeys:Record<string,string>={'--glb':'glb','--review':'review','--baseline':'baseline','--census':'census','--expected-sha':'expectedSha','--phase':'phase'};
  for(let i=2;i<process.argv.length;i++){const a=process.argv[i];if(a==='--self-test'){o.selfTest=true;continue;}if(a==='--adversarial-test'){o.adversarialTest=true;continue;}if(a==='--fixture-test'){o.census=DEFAULT_BASELINE;continue;}const key=valueKeys[a];requireThat(key&&i+1<process.argv.length&&!process.argv[i+1].startsWith('--'),`unknown/missing option: ${a}`);requireThat(!Object.hasOwn(o,key)||key==='phase',`duplicate option: ${a}`);(o as any)[key]=process.argv[++i];}
  requireThat(['auto','pre','post'].includes(o.phase!),'--phase must be auto/pre/post');return o;
}
if(import.meta.main){
  try {const options=args();selfTest();if(options.adversarialTest)await adversarialTests();else if(!options.selfTest){const result=await verifyCandidate(options);assert.equal(result.status,'WINDMILL_OVERHAUL_PASS');console.log(JSON.stringify(result,null,2));}}
  catch(error){console.error(JSON.stringify({status:'WINDMILL_OVERHAUL_FAIL',error:error instanceof Error?error.message:String(error),mutations:0,fileWrites:0}));process.exitCode=1;}
}
