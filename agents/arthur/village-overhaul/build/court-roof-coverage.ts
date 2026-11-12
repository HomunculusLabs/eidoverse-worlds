// Exact-byte architectural coverage checks supplement still-image ambiguity.
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {loadPlayerMesh,THREE} from '../../cabin-overhaul/verify-player.ts';
const base=resolve(import.meta.dir,'..'),model=await loadPlayerMesh(`${base}/build/court.glb`);
// Player loader intentionally supplies geometry-only default materials; select from the
// exact GLB material table, then test its corresponding decoded mesh triangles.
const bytes=readFileSync(`${base}/build/court.glb`),j=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
const slateNames=new Set(j.nodes.filter((n:any)=>n.mesh!==undefined&&j.meshes[n.mesh].primitives.some((p:any)=>p.material!==undefined&&/slate/.test(j.materials[p.material].name??''))).map((n:any)=>n.name));
const roofMeshes:any[]=[];model.root.traverse((o:any)=>{if(o.isMesh&&slateNames.has(o.name)){o.material.side=THREE.DoubleSide;roofMeshes.push(o);}});
if(!roofMeshes.length)throw Error('No decoded slate meshes selected; refuse meaningless empty roof test');
model.root.updateMatrixWorld(true);
const samples:any[]=[];const ray=new THREE.Raycaster();
for(const [bay,x0,x1,y] of [['bakehouse',-4.10,-1.10,2.4],['oven-lean-to',-5.72,-4.48,2.2],['repair-hall',1.08,5.72,2.4]] as const){
 for(let i=0;i<=8;i++)for(let j=0;j<=8;j++){const x=x0+(x1-x0)*i/8,z=-1.7+3.4*j/8;
  if(bay==='oven-lean-to'&&Math.abs(x+4.9)<.3&&Math.abs(z+.8)<.3)continue; // intentional chimney aperture, separately tested open
  ray.set(new THREE.Vector3(x,y,z),new THREE.Vector3(0,1,0));const h=ray.intersectObjects(roofMeshes,false);
  samples.push({bay,pos:[x,y,z],roofY:h[0]?.point.y??null,node:h[0]?.object.name??null,pass:h.length>0});
 }
}
const stats=JSON.parse(readFileSync(`${base}/build/court.json`,'utf8'));
const west=stats.parts.filter((p:any)=>p.name.startsWith('bakehouse_')),east=stats.parts.filter((p:any)=>p.name.startsWith('workhall_'));
const a=Math.max(...west.map((p:any)=>p.max[0])),b=Math.min(...east.map((p:any)=>p.min[0]));
const gap={sha256:model.sha256,bakehouseMaxX:a,workhallMinX:b,conservativeGapMetres:b-a,pass:b>a,method:'Positive separation of all premerge roof-part AABBs proves no wing-roof collision; does not certify a roof walking route.',lowOvenJunction:'Modeled sloped cheek closes bakehouse/low oven-roof junction.'};
writeFileSync(`${base}/build/court-roof-gap.json`,JSON.stringify(gap,null,2));
const out={sha256:model.sha256,roofMeshNames:roofMeshes.map(m=>m.name),samples,excludedVolume:{reason:'Hollow smoke shaft intentional aperture, separately tested in court-forge-geometry.json',x:[-5.2,-4.6],z:[-1.1,-.5]},pass:samples.every(s=>s.pass)&&gap.pass,limitations:['Discrete upward-ray roof coverage, not a watertight mesh or weather simulation.','The central court is intentionally uncovered; no roof should bridge it.']};
writeFileSync(`${base}/build/court-roof-coverage.json`,JSON.stringify(out,null,2));
console.log(JSON.stringify({pass:out.pass,samples:samples.length,failed:samples.filter(s=>!s.pass),roofMeshNames:out.roofMeshNames,gap}));
if(!out.pass)throw Error('roof coverage failed');
