// Read-only model/assembly verification; generated court/forge-specific evidence script.
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {loadPlayerMesh,loadPlayerAssembly,verifyPlayerMesh,clipTriangle,THREE,runtimeEvidence} from '../../cabin-overhaul/verify-player.ts';
import {probeApproach} from '../verify-approach.ts';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
const base=resolve(import.meta.dir,'..'),hash=(b:any)=>createHash('sha256').update(b).digest('hex');
const folded=JSON.parse(readFileSync(`${base}/before/folded-hosts.json`,'utf8'));
const C:any=await import(pathToFileURL(resolve(runtimeEvidence.root,'colliders.js')).href);
function soup(root:any){root.updateMatrixWorld(true);const out:any[]=[];root.traverse((m:any)=>{if(!m.isMesh)return;const p=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??p.count);i+=3)out.push({name:m.name,v:[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,ix?ix.getX(i+k):i+k).applyMatrix4(m.matrixWorld).toArray())});});return out;}
function hits(ts:any[],min:number[],max:number[]){const out:any[]=[];for(const t of ts){if([0,1,2].some(a=>Math.max(...t.v.map((v:any)=>v[a]))<min[a]||Math.min(...t.v.map((v:any)=>v[a]))>max[a]))continue;const p=clipTriangle(t.v,min,max);if(p.length<3)continue;const v=new THREE.Vector3(...p[0]);let area=0;for(let i=1;i<p.length-1;i++)area+=new THREE.Vector3(...p[i]).sub(v).cross(new THREE.Vector3(...p[i+1]).sub(v)).length()/2;if(area>1e-10)out.push(t.name);}return {hits:out.length,nodes:[...new Set(out)]};}
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco3d.createDecoderModule()});
const report:any={kind:'local-geometry-only-no-world-mutation',runtime:runtimeEvidence,models:{}};
for(const id of ['court','forge']){
 const file=`${base}/build/${id}.glb`,n=JSON.parse(readFileSync(`${base}/neighbors/nx-${id}.json`,'utf8')),h=n.host;
 const loaded=await loadPlayerMesh(file),before=await loadPlayerMesh(`${base}/before/nx-${id}.glb`);
 for(const key of ['lib','pos','yaw','scale','comp'])if(JSON.stringify(h[key])!==JSON.stringify(folded[h.id][key]))throw Error('folded contract drift '+h.id+'/'+key);
 // Final/final paired host geometry; frozen tuples and hashes for every other companion.
 const assembly=n.neighbors.map((a:any)=>{if((id==='court'&&a.id==='nx-forge')||(id==='forge'&&a.id==='nx-court')){const p=`${base}/build/${a.id.slice(3)}.glb`;return {...a,file:p,sha256:hash(readFileSync(p))};}return {...a};});
 const nb=await loadPlayerAssembly(h,assembly),all=soup(loaded.root);
 const bbox=new THREE.Box3().setFromObject(loaded.root),bb=new THREE.Box3().setFromObject(before.root);
 const protectedVolumes=n.neighbors.filter((a:any)=>/artwalk|sign-|cistern/.test(a.id)).map((a:any)=>({id:a.id,...a.hostLocalBounds}));
 const k:any={...h,id:h.id,sha256:loaded.sha256,terrainY:0,protectedVolumes,assembly,doors:id==='court'?[{name:'bakery-arch',x:-3.35,z:[1.4,2.99],width:1.4,headroom:2.2,floorY:.2},{name:'repair-arch',x:3.4,z:[1.4,2.99],width:1.8,headroom:2.2,floorY:.2},{name:'central-court',x:0,z:[.5,2.0],width:1.4,headroom:2.2,floorY:.2}]:[],waypoints:[]};
 if(id==='court')k.waypoints=[['bakery-approach',[-3.35,.06320172,3.8]],['bakery-ground-edge',[-3.35,0,3.35]],['bakery-landing',[-3.35,.2,2.7]],['bread-display',[-3.35,.2,.6]],['kneading-counter',[-3.35,.2,-.75]],['oven-station',[-3.75,.2,-.15]],['bakery-side-door',[-2,.2,.1]],['shared-court',[0,.2,.1]],['repair-side-door',[2.8,.2,.1]],['ironware-bench',[3.2,.2,-.75]],['anvil-quench-station',[4.03,.2,.45]],['repair-landing',[3.4,.2,2.7]],['repair-approach',[3.4,0,3.8]]].map(([name,pos])=>({name,pos}));
 else k.waypoints=[['fire-and-art-view',[-.3,0,1.2]],['anvil-work-apron',[.95,0,1.2]],['east-corner',[1.95,0,1.2]],['quench-service',[1.95,0,-.55]]].map(([name,pos])=>({name,pos}));
 writeFileSync(`${base}/build/${id}-routes.json`,JSON.stringify(k,null,2));
 const routes=id==='court'?verifyPlayerMesh(loaded.root,k,nb):probeApproach(loaded.root,k,nb);
 writeFileSync(`${base}/build/${id}-player-report.json`,JSON.stringify({...routes,modelSha256:loaded.sha256},null,2));
 const protectedChecks=protectedVolumes.map((p:any)=>({id:p.id,...hits(all,p.min.map((x:number)=>x+.001),p.max.map((x:number)=>x-.001))}));
 // Exposure volume must stay clear from artwork face towards the visitor; no exceptions.
 const panel=id==='forge'?n.neighbors.find((a:any)=>a.id.includes('b16')):null;
 const exposure=panel?hits(all,[-.369,1.021,.4785],[.369,1.879,1.4]):null;
 const backing:any[]=[];if(panel){const caster=new THREE.Raycaster();for(const x of [-.3,0,.3])for(const y of [1.1,1.45,1.8]){caster.set(new THREE.Vector3(x,y,.3575),new THREE.Vector3(0,0,-1));const hh=caster.intersectObject(loaded.root,true);backing.push({x,y,distance:hh[0]?.distance??null,pass:hh.length>0&&hh[0].distance<.025});}}
 const oldDoc=await io.readBinary(readFileSync(`${base}/before/nx-${id}.glb`)),newDoc=await io.readBinary(readFileSync(file));
 const names=oldDoc.getRoot().listNodes().map((a:any)=>a.getName()).filter((a:string)=>/^(fire|flame|lamp|glow)/.test(a));
 const anchorChecks=names.map((name:string)=>{const a=oldDoc.getRoot().listNodes().find((x:any)=>x.getName()===name),b=newDoc.getRoot().listNodes().find((x:any)=>x.getName()===name);const ad=a?.getMesh()?.listPrimitives()[0].getAttribute('POSITION')?.getArray(),bd=b?.getMesh()?.listPrimitives()[0].getAttribute('POSITION')?.getArray();const positionMaxError=ad&&bd&&ad.length===bd.length?Array.from(ad).reduce((n:number,x:any,i:number)=>Math.max(n,Math.abs(x-bd[i])),0):null;return {name,present:!!b,matrixEqual:b&&JSON.stringify(a.getWorldMatrix())===JSON.stringify(b.getWorldMatrix()),positionMaxError};});
 // Whole swept animated coal envelope checked against static triangles, at all phases analytically.
 let animation:any=null,smoke:any=null;
 if(id==='forge'){const moving=all.filter((a:any)=>a.name.startsWith('fire_fg_coals')),staticT=all.filter((a:any)=>!a.name.startsWith('fire_fg_coals'));const b=new THREE.Box3();for(const a of moving)for(const v of a.v)b.expandByPoint(new THREE.Vector3(...v));b.min.y-=h.comp['motion:fire_fg_coals'].amp;b.max.y+=h.comp['motion:fire_fg_coals'].amp;animation={node:'fire_fg_coals',component:h.comp['motion:fire_fg_coals'],sweptBounds:{min:b.min.toArray(),max:b.max.toArray()},staticSweep:hits(staticT,b.min.toArray(),b.max.toArray()),origin:h.comp.particles.origin};}
 else {const o=h.comp['particles:smoke'].origin;smoke={component:h.comp['particles:smoke'],openFlue:hits(all,[o[0]-.13,o[1]+.001,o[2]-.13],[o[0]+.13,5.5,o[2]+.13])};}
 // Network triangles checked locally, not broadphase AABB exemptions; count actual physical
 // contacts in the host footprint above existing terrain. Full host solid intersection is
 // not implied by zero door collisions; retained below-grade paving contacts are reported.
 const localNetwork=nb.filter((a:any)=>/roads|paths/.test(a.id)).map((a:any)=>({id:a.id,trianglesInEnvelope:hits(soup(a.root),bbox.min.toArray(),bbox.max.toArray()),standingHeight:hits(soup(a.root),[bbox.min.x,.205,bbox.min.z],[bbox.max.x,bbox.max.y,bbox.max.z])}));
 const directNeighborChecks=nb.filter((a:any)=>!/roads|paths/.test(a.id)&&!protectedVolumes.some((p:any)=>p.id===a.id)).map((a:any)=>{const b=new THREE.Box3().setFromObject(a.root);return {id:a.id,...hits(all,b.min.toArray().map((v:number)=>v+.001),b.max.toArray().map((v:number)=>v-.001))};});
 const forgeOutlet=id==='forge'?{throatToCowl:hits(all,[-.07,1.001,-.12],[.07,2.885,.02]),rainCapSideVent:hits(all,[-.06,2.86,-.40],[.06,2.89,-.05])}:null;
 report.models[id]={sha256:loaded.sha256,bytes:loaded.bytes,directNeighborChecks,forgeOutlet,bounds:{min:bbox.min.toArray(),max:bbox.max.toArray()},baselineBounds:{min:bb.min.toArray(),max:bb.max.toArray()},xzContained:[0,2].every(a=>bbox.min.getComponent(a)>=bb.min.getComponent(a)-.001&&bbox.max.getComponent(a)<=bb.max.getComponent(a)+.001),triangles:all.length,meshes:loaded.meshes,anchors:anchorChecks,protectedChecks,exposure,backing,animation,smoke,networks:localNetwork,routeStatus:routes.status,routeFailures:routes.failures??routes.walks.filter((w:any)=>!w.pass),neighbors:assembly.map((a:any)=>({id:a.id,sha256:a.sha256,file:a.file}))};
 report.models[id].xzExact=[0,2].every(a=>bbox.min.getComponent(a)===bb.min.getComponent(a)&&bbox.max.getComponent(a)===bb.max.getComponent(a));
 report.models[id].pass=routes.status==='PASS'&&report.models[id].xzExact&&report.models[id].xzContained&&anchorChecks.every((a:any)=>a.present&&a.matrixEqual&&(a.positionMaxError===null||a.positionMaxError<=1e-6))&&protectedChecks.every((a:any)=>a.hits===0)&&directNeighborChecks.every((a:any)=>a.hits===0)&&localNetwork.every((a:any)=>a.trianglesInEnvelope.hits===0)&&(!exposure||exposure.hits===0)&&backing.every((a:any)=>a.pass)&&(!animation||animation.staticSweep.hits===0)&&(!smoke||smoke.openFlue.hits===0)&&(!forgeOutlet||Object.values(forgeOutlet).every((a:any)=>a.hits===0));
 console.log(JSON.stringify({id,pass:report.models[id].pass,directNeighborChecks,forgeOutlet,routeStatus:routes.status,routeFailures:report.models[id].routeFailures,protectedChecks,animation,smoke,backing,exposure,localNetwork}));
}
writeFileSync(`${base}/build/court-forge-geometry.json`,JSON.stringify(report,null,2));
if(!Object.values(report.models).every((x:any)=>x.pass))throw Error('court/forge geometry gate failed; inspect report');
