// Restored accepted geometry; +1m constraint was withdrawn as a parent error. Keep real support/backing tests.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {THREE,loadPlayerMesh,loadPlayerAssembly,verifyPlayerMesh} from '../../cabin-overhaul/verify-player.ts';
import {probeApproach} from '../verify-approach.ts';
const base=import.meta.dir,sha=(b:any)=>createHash('sha256').update(b).digest('hex'),read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const save=(p:string,v:any)=>writeFileSync(p,JSON.stringify(v,null,2)+'\n');
function tris(root:any){const ts:any[]=[];root.traverse((m:any)=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i+=3){const vs=[0,1,2].map(j=>[a.getX(i+j),a.getY(i+j),a.getZ(i+j)]);ts.push({key:vs.map(v=>v.map((n:number)=>n.toFixed(5)).join(',')).sort().join('|'),minY:Math.min(...vs.map(v=>v[1]))});}});return ts;}
function materialBytes(file:string){const b=readFileSync(file),j=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString());return {materials:j.materials,textures:j.textures,samplers:j.samplers,images:j.images.map((im:any)=>{const v=j.bufferViews[im.bufferView],start=28+b.readUInt32LE(12)+v.byteOffset;return {mimeType:im.mimeType,sha256:sha(b.subarray(start,start+v.byteLength))};})};}
for(const id of ['nx-town-stable','nx-town-woodyard']){
 const prefix=`${base}/${id}`,isStable=id.endsWith('stable'),current=await loadPlayerMesh(prefix+'.glb'),old=await loadPlayerMesh(prefix+'-pre-roof.glb');
 assert.equal(current.sha256,old.sha256,'must restore exact accepted GLB, not a height-reduced substitute');
 // Stable roof underdeck reaches the fixed 3.04m eave underside; woodyard rear roof closure starts at 2.4m.
 const a=tris(old.root),b=tris(current.root),lo=isStable?3.04:2.4;
 assert.deepEqual(a.filter(t=>t.minY<lo-.00001).map(t=>t.key).sort(),b.filter(t=>t.minY<lo-.00001).map(t=>t.key).sort(),'geometry below roof correction zone changed');
 assert.equal(a.length,b.length,'structural/roof triangles removed');
 assert.deepEqual(materialBytes(prefix+'-pre-roof.glb'),materialBytes(prefix+'.glb'),'serialized material or embedded texture changed');
 const preParts=read(prefix+'-pre-roof.json'),parts=read(prefix+'.json');assert.equal(parts.sha256,current.sha256);
 const allowed=isStable?/^(barn_|front_closed_gable|rear_closed_gable|kingpost_|truss_rafter_|loft_)/:/^(craft_roof_|king_post_|rafter_|rear_upper_closure)/;
 assert.deepEqual(preParts.parts.filter((p:any)=>!allowed.test(p.name)),parts.parts.filter((p:any)=>!allowed.test(p.name)),'non-roof architectural parts changed');
 const oldCounts=new Map<string,number>();for(const t of a)oldCounts.set(t.key,(oldCounts.get(t.key)??0)+1);let unchanged=0;for(const t of b)if(oldCounts.get(t.key)){unchanged++;oldCounts.set(t.key,oldCounts.get(t.key)!-1);}
 current.root.traverse((m:any)=>{if(m.isMesh)m.material.side=THREE.DoubleSide;});
 const rays:any[]=[];
 function witness(name:string,at:number[],direction:number[],distance:number){const ray=new THREE.Raycaster(new THREE.Vector3(...at),new THREE.Vector3(...direction),0,distance),hit=ray.intersectObject(current.root,true)[0];rays.push({name,at,direction,maxDistance:distance,hit:hit?{distance:hit.distance,point:hit.point.toArray(),mesh:hit.object.name}:null,pass:!!hit});assert.ok(hit,'missing real backing '+name);}
 // Board back planes come from exact decoded frozen companion bounds; rays enter the actual host wall.
 const near=read(`${base}/../neighbors/${id}.json`);
 const art=near.neighbors.find((n:any)=>n.id.includes(isStable?'artwalk-b8-':'artwalk-b11-')).hostLocalBounds;
 for(const xf of [.15,.5,.85])for(const yf of [.15,.5,.85])witness('fixed artwork backing',[art.min[0]+xf*(art.max[0]-art.min[0]),art.min[1]+yf*(art.max[1]-art.min[1]),art.min[2]+.001],[0,0,-1],.025);
 if(isStable){for(const x of [-.15,0,.15])for(const y of [2.12,2.35,2.60])witness('fixed sign backing',[x,y,2.101],[0,0,-1],.025);}
 else {for(const x of [-.09,.09])witness('fixed sign top to visible hanger',[x,2.049,1.215],[0,1,0],.015);}
 // First downward skin hit along every exposed truss must be slate/cap, not a timber poke-through.
 const skin:any[]=[];
 const roof=read(`${base}/../build/${id}.json`).parts.filter((p:any)=>p.name.includes('_solid_'));assert.equal(roof.length,2);
 const raw=readFileSync(prefix+'.glb'),j=JSON.parse(raw.subarray(20,20+raw.readUInt32LE(12)).toString());
 // Resolve opaque merged-bucket IDs through actual serialized node→mesh→material links.
 const materialByNode=new Map(j.nodes.filter((n:any)=>n.mesh!==undefined).map((n:any)=>{const ps=j.meshes[n.mesh].primitives;assert.equal(ps.length,1);return [n.name,j.materials[ps[0].material].name];}));
 const across=isStable?[-2.4,-1.8,-1.2,-.6,.6,1.2,1.8,2.4]:[-.85,-.55,-.25,.05,.40,.70,1.0,1.15];
 const along=isStable?[-1.9,.30,2.03]:[-1.94,.35,2.64];
 for(const v of along)for(const u of across){const at=isStable?[u,6,v]:[v,6,u],ray=new THREE.Raycaster(new THREE.Vector3(...at),new THREE.Vector3(0,-1,0)),hit=ray.intersectObject(current.root,true)[0];const material=hit?materialByNode.get(hit.object.name):null,pass=!!hit&&/slate|iron/i.test(String(material));skin.push({at,first:hit?.object.name,material,point:hit?.point.toArray(),pass});assert.ok(pass,'roof skin interrupted '+JSON.stringify(skin.at(-1)));}
 const report:any={status:'PASS',id,modelSha256:current.sha256,preRoofSha256:old.sha256,triangleCount:b.length,unchangedTriangles:unchanged,changedTriangles:b.length-unchanged,allGeometryBelowYUnchanged:lo,nonRoofPartsIdentical:true,materialTextureBytesIdentical:true,backing:rays,roofSkin:skin};
 for(const mode of ['main','context','baseline']){
  const label=mode==='main'?'':'-'+mode,k=read(prefix+'-route'+label+'.json'),loaded=mode==='baseline'?await loadPlayerMesh(`${base}/../before/${id}.glb`):await loadPlayerMesh(prefix+'.glb');assert.equal(k.sha256,loaded.sha256);
  assert.equal(k.collide,undefined,'no unneeded collision amendment');assert.equal(k.collisionAmendment,undefined);
  const ns=await loadPlayerAssembly(k,k.assembly);
  const geometry={...verifyPlayerMesh(loaded.root.clone(true),k,ns.map(n=>({...n,root:n.root.clone(true)}))),modelSha256:loaded.sha256,contractSha256:sha(readFileSync(prefix+'-route'+label+'.json'))};
  const approach={...probeApproach(loaded.root.clone(true),k,ns.map(n=>({...n,root:n.root.clone(true)}))),modelSha256:loaded.sha256,contractSha256:geometry.contractSha256};
  save(prefix+'-player'+label+'.json',geometry);save(prefix+'-approach'+label+'.json',approach);
  if(mode!=='baseline'){
   assert.equal(approach.status,'PASS',JSON.stringify(approach));assert.ok(approach.physicalSupport.pass);
   assert.equal(approach.walks.length,isStable?20:14);assert.ok(geometry.doors.every((d:any)=>d.hits===0));assert.ok(geometry.protectedVolumes.every((p:any)=>p.hits===0));
   if(isStable)assert.equal(geometry.status,'PASS');
   else {assert.equal(geometry.status,'FAIL');assert.equal(geometry.failures.length,1);assert.match(geometry.failures[0],/exact|pillar/);}
  }else assert.equal(geometry.status,'FAIL','retain honest baseline negative control');
  report[mode]={geometryStatus:geometry.status,geometryFailures:geometry.failures,accessStatus:approach.status,collider:geometry.collider,routeCount:approach.walks.length,routesPassed:approach.walks.filter((w:any)=>w.pass).length,physicalSupport:approach.physicalSupport.pass,supportSamples:approach.physicalSupport.samples.length,neighbors:ns.map(n=>n.id),doors:geometry.doors,protectedVolumes:geometry.protectedVolumes};
 }
 if(!isStable){save(prefix+'-player-default.json',read(prefix+'-player.json'));save(prefix+'-approach-default.json',read(prefix+'-approach.json'));}
 save(prefix+'-roof-verification.json',report);console.log(JSON.stringify({id,sha256:current.sha256,unchanged,changed:b.length-unchanged,backingRays:rays.length,skinRays:skin.length,main:report.main,context:report.context}));
}
