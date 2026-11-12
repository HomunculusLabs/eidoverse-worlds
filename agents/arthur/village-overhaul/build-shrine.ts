// LOCAL ONLY. A non-enterable, roof-capped wayside altar, not a fake room.
// bun agents/arthur/village-overhaul/build-shrine.ts [--verify|--assemblies]
import * as THREE from 'three';
import {box,M,finish} from './kit.ts';
import {texMat} from '../assets/glbwrite.ts';
import {B,roofCap,hosts,readJSON,save,sha,decodeCandidate,assembly} from './build-gates.ts';
import {readFileSync} from 'node:fs';
const water=texMat('shrine-water',[0x506a78,0x597582],{rough:.25,metal:.5,cell:128});water.emissive.set(0x2e4a58);water.emissiveIntensity=.3;
const bread=texMat('shrine-bread',[0xa5834c,0xb59256,0x96723f],{rough:.95,cell:32});
const wax=texMat('shrine-wax',[0xd7c9a0,0xcdbf97],{rough:.84,cell:128});
function cylinder(g:THREE.Group,n:string,rt:number,rb:number,h:number,x:number,y:number,z:number,m:THREE.Material){const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,24),m);o.name=n;o.position.set(x,y,z);g.add(o);return o;}
function sphere(g:THREE.Group,n:string,x:number,y:number,z:number,scale:number[],m:THREE.Material){const geometry=new THREE.SphereGeometry(1,20,12);geometry.scale(scale[0],scale[1],scale[2]);const o=new THREE.Mesh(geometry,m);o.name=n;o.position.set(x,y,z);g.add(o);return o;}
export function buildShrine(){
 const g=new THREE.Group();g.name='village-shrine-bread-water-light';
 // One substantial continuous stone monument; no advertised courtyard or room.
 box(g,'shrine_buried_foundation',2.5,.136,3.9,0,.052,.55,M.stone);
 box(g,'shrine_dressed_plinth',2.40,.095,3.80,0,.1675,.55,M.stone);
 // Broad paving joints remain below the protected star relief's lowest point.
 for(let i=0;i<6;i++)box(g,`shrine_plinth_joint_${i}`,2.33,.004,.014,0,.218,-.98+i*.61,M.timber);
 // Back screen front is behind exact art back-plane (-1.195m), no trim exemption.
 box(g,'shrine_memorial_stone_back',2.5,1.44,.204,0,.94,-1.298,M.stone);
 box(g,'shrine_memorial_oak_header',2.38,.14,.194,0,1.73,-1.293,M.timber);
 // Star artwork cantilevers 0.30m beyond the historical left edge: retain it,
 // back its in-envelope area rather than enlarge the commissioned footprint.
 box(g,'shrine_star_backing',.89,1.23,.03,-.79,.85,-1.212,M.wood);
 for(const x of [-1.205,1.205])box(g,`shrine_memorial_edge_${x}`,.09,1.52,.18,x,.965,-1.30,M.timber);
 roofCap(g,'shrine_closed_slate_coping',-1.25,1.25,-1.40,-1.01,1.88,.23);
 // Long masonry altar is right of the existing stars, so their outward face
 // stays exposed. Its forward lip can be reached without entering the bbox.
 box(g,'shrine_altar_bed',1.43,.18,3.43,.475,.305,.675,M.stone);
 box(g,'shrine_altar_core',1.24,.44,3.12,.48,.61,.72,M.stone);
 for(let i=0;i<5;i++){
  const z=-.59+i*.59;
  box(g,`shrine_altar_vertical_joint_${i}`,.008,.41,.012,-.145,.61,z,M.timber);
  box(g,`shrine_altar_end_joint_${i}`,.008,.41,.012,1.105,.61,z,M.timber);
 }
 box(g,'shrine_altar_bed_joint',1.264,.018,3.13,.48,.625,.72,M.timber);
 box(g,'shrine_heavy_offering_mensa',1.44,.135,3.38,.475,.8975,.675,M.stone);
 box(g,'shrine_front_chamfer_course',1.35,.035,.15,.475,.814,2.31,M.stone);
 // Single oak reliquary on the screen's right: no decorative field of orbs.
 box(g,'shrine_light_back',.46,.57,.12,.65,1.24,-1.112,M.timber);
 for(const s of [-1,1])box(g,`shrine_light_jamb_${s}`,.065,.57,.16,.65+s*.25,1.24,-1.09,M.wood);
 box(g,'shrine_light_hood',.62,.10,.24,.65,1.57,-1.05,M.timber);
 box(g,'shrine_light_sill',.62,.075,.24,.65,.9925,-1.05,M.stone);
 cylinder(g,'shrine_votive_saucer',.12,.10,.025,.65,1.042,-.995,M.iron);
 cylinder(g,'shrine_single_wax_candle',.046,.050,.19,.65,1.15,-.995,wax);
 sphere(g,'flame_shrine_single',.65,1.281,-.995,[.025,.055,.025],M.amber);
 // Actual bowl has an open interior: lathed rim, distinct visible water disc.
 const bowlPts=[[.02,0],[.11,0],[.18,.045],[.24,.13],[.245,.16],[.225,.175],[.20,.145],[.13,.07],[.02,.065]].map(p=>new THREE.Vector2(...p));
 const bowl=new THREE.Mesh(new THREE.LatheGeometry(bowlPts,32),M.stone);bowl.name='shrine_water_offering_bowl';bowl.position.set(.045,.965,2.045);g.add(bowl);
 cylinder(g,'shrine_offering_water',.205,.205,.009,.045,1.101,2.045,water);
 cylinder(g,'shrine_bread_tray',.26,.235,.032,.735,.983,2.045,M.wood);
 sphere(g,'shrine_daily_loaf',.735,1.073,2.045,[.205,.10,.135],bread);
 // Three shallow score marks crest the loaf, not extra token decorations.
 for(const d of [-.085,0,.085]){const o=box(g,`shrine_loaf_score_${d}`,.012,.005,.12,.735+d,1.163,2.045,M.wood);o.rotation.z=-.13;}
 return finish(g,'shrine');
}

async function verifyShrine(){
 const id='nx-town-shrine',c=hosts.find((x:any)=>x.id===id),{after,stats}=await decodeCandidate(id,`${B}/build/shrine.glb`);
 const {loadPlayerAssembly,verifyPlayerMesh,THREE:T}=await import('../cabin-overhaul/verify-player.ts');
 const neighborContract=readJSON(`${B}/neighbors/${id}.json`),ns=await loadPlayerAssembly(c,neighborContract.neighbors);
 const art=readJSON(`${B}/build/shrine-gates-baseline-decode.json`).find((x:any)=>x.id===id).art;
 // These are exterior stations, not fake entryway/interior claims. A standing
 // body stays beyond the bbox's physical front edge at all approach samples.
 const k={...c,sha256:after.sha256,terrainY:-c.pos[1],doors:[{name:'exterior-offering-approach-NOT-DOOR',x:0,z:[2.85,3.10],floorY:-c.pos[1],width:1.4,headroom:2.2}],waypoints:[{name:'external-arrival',pos:[0,-c.pos[1],3.8]},{name:'water-offering-reach',pos:[.045,-c.pos[1],2.86]},{name:'bread-offering-reach',pos:[.735,-c.pos[1],2.86]}],protectedVolumes:art.map((a:any)=>({id:a.id,min:a.min,max:a.max})),assembly:neighborContract.neighbors};
 save(`${B}/build/${id}-route-contract.json`,k);
 const raw=verifyPlayerMesh(after.root,k,ns);
 // Generic room harness correctly rejects non-exact hosts. Do not rename its FAIL.
 const {probeApproach}=await import('./verify-approach.ts');
 const external=probeApproach(after.root,k,ns);
 save(`${B}/build/shrine-exterior-player.json`,{...external,modelSha256:after.sha256,verifierSha256:sha(readFileSync(`${B}/verify-approach.ts`))});
 const outdoorPass=external.status==='PASS'&&raw.doors.every((x:any)=>x.hits===0)&&raw.protectedVolumes.every((x:any)=>x.hits===0);
 const report={kind:'non-enterable-monument-exterior-stations',status:outdoorPass?'EXTERIOR_PASS_NONROOM':'EXTERIOR_FAIL',modelSha256:after.sha256,sourceSha256:sha(readFileSync(import.meta.path)),stats,rawRoomHarness:raw,roomApproval:false,terrain:'flat local stand-in at exact unchanged world-zero ground; no live terrain proof',rider:'Original star relief geometry and pose preserved; 0.30m historical left cantilever remains outside host envelope. Right-offset altar avoids its outward face.',notes:['No room, walk-in court or usable shrine platform claimed.','Exterior approach and reachable front water/bread stations only.','No collide override, components or host tuple changed.']};
 save(`${B}/build/shrine-verification.json`,report);if(!outdoorPass)process.exitCode=1;console.log(JSON.stringify({status:report.status,modelSha256:after.sha256,collider:raw.collider,walks:raw.walks.map((x:any)=>({from:x.from,to:x.to,pass:x.pass,maxPush:x.maxPush,geometryHits:x.geometryHits})),protected:raw.protectedVolumes,roomHarnessFailures:raw.failures}));
}
if(import.meta.main){
 if(process.argv.includes('--verify'))await verifyShrine();
 else if(process.argv.includes('--assemblies')){await assembly('nx-town-shrine',`${B}/before/nx-town-shrine.glb`,'before');await assembly('nx-town-shrine',`${B}/build/shrine.glb`,'after');}
 else buildShrine();
}
