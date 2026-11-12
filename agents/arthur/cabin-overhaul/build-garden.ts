// Garden-only architecture and offline acceptance gate. No live imports or verbs.
// Source of truth: assets/mkvillage-houses.ts gardenCottage (not mkv3-ring.ts).
import * as THREE from 'three';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { M, box, beam, wall, window, finish } from './kit.ts';
import { texMat } from '../assets/glbwrite.ts';

const ID='nx-town-garden-cottage', ROOT=import.meta.dir;
const FLOOR=.13;
export async function verifyGarden(file:string) {
  const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco3d.createDecoderModule()});
  const bytes=readFileSync(file),doc=await io.readBinary(new Uint8Array(bytes));
  const scene=doc.getRoot().getDefaultScene()??doc.getRoot().listScenes()[0];
  assert(scene,'default scene');
  // Threshold top is .148; min .149 excludes its support triangles by 1mm.
  // The tested free volume itself is a FULL 2.2m tall, not merely top-floor.
  const bounds=new THREE.Box3(), lane=new THREE.Box3(new THREE.Vector3(-.7,.149,-.72),new THREE.Vector3(.7,2.349,2.69));
  const conflicts:any[]=[];let triangles=0,meshes=0;
  scene.traverse(node=>{
    const mesh=node.getMesh();if(!mesh)return;meshes++;
    const mat=new THREE.Matrix4().fromArray(node.getWorldMatrix());
    for(const p of mesh.listPrimitives()){
      const a=p.getAttribute('POSITION');assert(a,'POSITION');
      const ix=p.getIndices(), count=ix?.getCount()??a.getCount();
      const vertex=(i:number)=>new THREE.Vector3().fromArray(a.getElement(ix?ix.getScalar(i):i,[])).applyMatrix4(mat);
      for(let i=0;i<count;i+=3){
        const t=new THREE.Triangle(vertex(i),vertex(i+1),vertex(i+2));triangles++;
        [t.a,t.b,t.c].forEach(v=>{assert(v.toArray().every(Number.isFinite),'finite coordinates');bounds.expandByPoint(v)});
        if(lane.intersectsTriangle(t))conflicts.push({node:node.getName(),triangle:i/3});
      }
    }
  });
  assert(triangles>100,'nonempty real mesh coverage');
  const baseline=JSON.parse(readFileSync(`${ROOT}/before/contracts.json`,'utf8')).find((e:any)=>e.id===ID);
  for(const axis of [0,2]){
    assert(bounds.min.getComponent(axis)>=baseline.bbox.min[axis]-1e-5,`min footprint axis ${axis}`);
    assert(bounds.max.getComponent(axis)<=baseline.bbox.max[axis]+1e-5,`max footprint axis ${axis}`);
  }
  assert(Math.abs(bounds.min.y+.13)<1e-5,'source foundation bottom');
  assert.equal(conflicts.length,0,`1.4m × 2.2m door/room lane has ${conflicts.length} blocking triangles: ${JSON.stringify(conflicts.slice(0,5))}`);
  const result={status:'LOCAL_GEOMETRY_PASS',file,sha256:createHash('sha256').update(bytes).digest('hex'),triangles,meshes,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},doorLane:{min:lane.min.toArray(),max:lane.max.toArray(),blockingTriangles:conflicts.length},limitations:['Local host geometry only; excludes separately owned b17 rider and neighbors.','Not a live player collision or walk verdict.']};
  console.log(JSON.stringify(result));return result;
}

// One explicit footprint, not the old accidentally origin-centered wing roof.
// The original floor is retained VERBATIM: 6.6 × 5.4 × .26, top y=.13.
// The garden wing is nested into its unused east strip rather than growing it.
const B={mainHalf:2.46,mainZ:2.07,mainRidge:4.75,mainEave:3.10,
  wingX:3.58,wingZ:-.15,wingHalf:1.68,wingRidge:4.02,wingEave:2.88};
const mainY=(x:number)=>B.mainRidge-(B.mainRidge-B.mainEave)*Math.abs(x)/B.mainHalf;
const wingY=(z:number)=>B.wingRidge-(B.wingRidge-B.wingEave)*Math.abs(z-B.wingZ)/B.wingHalf;
type P=[number,number];
function clip(poly:P[],f:(p:P)=>number):P[]{
  const result:P[]=[];
  for(let i=0;i<poly.length;i++){
    const a=poly[i],b=poly[(i+1)%poly.length],fa=f(a),fb=f(b);
    if(fa>=-1e-9)result.push(a);
    if((fa>0&&fb<0)||(fa<0&&fb>0)){
      const t=fa/(fa-fb);result.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);
    }
  }
  return result;
}
// Closed planar prisms: overlapping slate courses, no floaty slat roofs.
function plate(g:THREE.Group,n:string,points:P[],height:(p:P)=>number,thick:number,m:THREE.Material){
  if(points.length<3)return;
  let area=points.reduce((a,p,i)=>a+p[0]*points[(i+1)%points.length][1]-points[(i+1)%points.length][0]*p[1],0);
  if(Math.abs(area)<1e-8)return;
  const poly=area>0?[...points].reverse():points;
  const pos:number[]=[],uv:number[]=[];
  const vert=(p:P,bottom=false)=>[p[0],height(p)-(bottom?thick:0),p[1]];
  const tri=(a:number[],b:number[],c:number[])=>{for(const v of [a,b,c]){pos.push(...v);uv.push(v[0],v[2]);}};
  for(let i=1;i<poly.length-1;i++){
    tri(vert(poly[0]),vert(poly[i]),vert(poly[i+1]));
    tri(vert(poly[0],true),vert(poly[i+1],true),vert(poly[i],true));
  }
  for(let i=0;i<poly.length;i++){
    const a=poly[i],b=poly[(i+1)%poly.length];
    tri(vert(a),vert(a,true),vert(b,true));tri(vert(a),vert(b,true),vert(b));
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();
  const mesh=new THREE.Mesh(geo,m);mesh.name=n;g.add(mesh);return mesh;
}
function crossRoof(g:THREE.Group){
  // Piecewise planar clipping removes BOTH buried roof surfaces at the valleys.
  // Split at every crease/domain edge; each clip is against a linear half-plane.
  const surfaces:{name:string,poly:P[],height:(p:P)=>number,axis:0|1,side:number}[]=[];
  const rect=(x0:number,x1:number,z0:number,z1:number):P[]=>[[x0,z0],[x1,z0],[x1,z1],[x0,z1]];
  surfaces.push({name:'main_west',poly:rect(-B.mainHalf,0,-B.mainZ,B.mainZ),height:p=>mainY(p[0]),axis:0,side:-1});
  const zz=[-B.mainZ,B.wingZ-B.wingHalf,B.wingZ,B.wingZ+B.wingHalf,B.mainZ];
  for(let i=0;i<zz.length-1;i++){
    let p=rect(0,B.mainHalf,zz[i],zz[i+1]);
    if(i===1||i===2)p=clip(p,q=>mainY(q[0])-wingY(q[1]));
    surfaces.push({name:`main_east_${i}`,poly:p,height:q=>mainY(q[0]),axis:0,side:1});
  }
  for(const s of [-1,1])for(const split of [0,1]){
    const z0=B.wingZ+(s<0?-B.wingHalf:0),z1=B.wingZ+(s<0?0:B.wingHalf);
    let p=rect(split===0?.6:B.mainHalf,split===0?B.mainHalf:B.wingX,z0,z1);
    if(split===0)p=clip(p,q=>wingY(q[1])-mainY(q[0]));
    surfaces.push({name:`wing_${s}_${split}`,poly:p,height:q=>wingY(q[1]),axis:1,side:s});
  }
  for(const sf of surfaces){
    if(sf.poly.length<3)continue;
    plate(g,`gc_roof_${sf.name}_deck`,sf.poly,sf.height,.12,M.roof);
    const axis=sf.axis,along=axis===0?1:0,center=axis===0?0:B.wingZ,run=axis===0?B.mainHalf:B.wingHalf;
    const rows=Math.ceil(run/.32),step=run/rows;
    const lo=Math.min(...sf.poly.map(p=>p[along])),hi=Math.max(...sf.poly.map(p=>p[along]));
    for(let k=0;k<rows;k++){
      const r0=k*step,r1=Math.min(run,(k+1)*step+.024);
      let band=clip(sf.poly,p=>sf.side*(p[axis]-center)-r0);
      band=clip(band,p=>r1-sf.side*(p[axis]-center));
      const start=Math.floor(lo/.58)*.58-(k%2)*.29;
      for(let a=start,j=0;a<hi;a+=.58,j++){
        let tile=clip(band,p=>p[along]-Math.max(lo,a+.009));
        tile=clip(tile,p=>Math.min(hi,a+.571)-p[along]);
        plate(g,`gc_slate_${sf.name}_${k}_${j}`,tile,p=>sf.height(p)+.032+.023*(sf.side*(p[axis]-center)-r0)/step,.052,(k+j)%4===1?M.roofAlt:M.roof);
      }
    }
  }
  // Continuous ridges and exposed timber verges terminate cleanly at valleys.
  beam(g,'gc_main_ridge',[0,4.815,-2.10],[0,4.815,2.10],.14,.18,M.iron);
  const valleyX=(B.mainRidge-B.wingRidge)/( (B.mainRidge-B.mainEave)/B.mainHalf );
  beam(g,'gc_wing_ridge',[valleyX,4.085,B.wingZ],[B.wingX+.015,4.085,B.wingZ],.14,.18,M.iron);
  for(const z of [-B.mainZ+.035,B.mainZ-.035])for(const s of [-1,1])
    beam(g,`gc_main_verge_${z}_${s}`,[s*B.mainHalf,3.09,z],[0,4.79,z],.15,.15);
  for(const s of [-1,1])beam(g,`gc_wing_verge_${s}`,[B.wingX-.035,2.86,B.wingZ+s*B.wingHalf],[B.wingX-.035,4.06,B.wingZ],.15,.15);
  beam(g,'gc_west_eave',[-B.mainHalf,3.065,-B.mainZ],[-B.mainHalf,3.065,B.mainZ],.15,.15);
  for(const s of [-1,1]){
    const meetZ=B.wingZ+s*(B.wingRidge-B.mainEave)/((B.wingRidge-B.wingEave)/B.wingHalf);
    // Thin folded zinc valley: follows the proven plane intersection; the
    // original .11m dark beam read as exposed structure in the first aerial.
    beam(g,`gc_valley_${s}`,[valleyX,4.057,B.wingZ],[B.mainHalf,3.137,meetZ],.035,.055,M.roofAlt);
    const edge=s<0?-B.mainZ:B.mainZ;
    beam(g,`gc_east_eave_${s}`,[B.mainHalf,3.065,edge],[B.mainHalf,3.065,meetZ],.15,.15);
    beam(g,`gc_wing_eave_${s}`,[2.30,2.84,B.wingZ+s*B.wingHalf],[B.wingX,2.84,B.wingZ+s*B.wingHalf],.15,.15);
  }
}
function gable(g:THREE.Group,n:string,half:number,base:number,peak:number,x:number,z:number,yaw=0){
  const shape=new THREE.Shape();shape.moveTo(-half,base);shape.lineTo(half,base);shape.lineTo(0,peak);shape.closePath();
  const mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.19,bevelEnabled:false}),M.lime);mesh.name=n;
  mesh.position.set(x,0,z);mesh.rotation.y=yaw;g.add(mesh);
}
const foliage=texMat('garden-sage',[0x667652,0x72805b,0x56684a],{rough:.95,scale:2,cell:64});
const soil=texMat('garden-earth',[0x514737,0x5d503c],{rough:1,scale:2,cell:32});
const linen=texMat('garden-linen',[0xbbbea1,0xafb28f],{rough:.95,scale:2,stripe:24});
const fireMat=texMat('garden-hearth',[0xffa04b,0xef853b],{rough:.55,scale:1,cell:128});
fireMat.emissive.set(0xff8537);fireMat.emissiveIntensity=.8;
function cylinder(g:THREE.Group,n:string,r:number,h:number,x:number,y:number,z:number,m:THREE.Material,rb=r){
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,rb,h,10),m);mesh.name=n;mesh.position.set(x,y,z);g.add(mesh);return mesh;
}
function sprig(g:THREE.Group,n:string,x:number,y:number,z:number,size=.2){
  beam(g,`${n}_stem`,[x,y,z],[x,y+size*.85,z],.018,.018,M.wood);
  for(const s of [-1,1]){
    const leaf=new THREE.Mesh(new THREE.IcosahedronGeometry(size,0),foliage);leaf.name=`${n}_leaf_${s}`;
    leaf.position.set(x+s*size*.34,y+size*.6,z);leaf.scale.set(.8,.55,.7);g.add(leaf);
  }
}
function gardenBuild(){
  const g=new THREE.Group();g.name='garden_keeper_cottage';
  box(g,'gc_floor',6.6,.26,5.4,0,0,0,M.stone);
  // Main framed hall: original wall footprint; raised eaves buy real headroom.
  const H=3.23-FLOOR,door={x:0,w:1.78,bottom:0,h:2.45};
  wall(g,'gc_front',4.4,H,.2,0,FLOOR,1.7,0,[door,{x:-1.48,w:.8,bottom:.99,h:1.1},{x:1.48,w:.8,bottom:.99,h:1.1}]);
  wall(g,'gc_back',4.4,H,.2,0,FLOOR,-1.7,Math.PI,[{x:1.33,w:1.0,bottom:1.01,h:1.08}]);
  wall(g,'gc_west',3.4,H,.2,-2.1,FLOOR,0,-Math.PI/2,[{x:-.63,w:1.00,bottom:1.01,h:1.12}]);
  // Wide internal connection to a garden/potting alcove on the SAME floor.
  wall(g,'gc_east',3.4,H,.2,2.1,FLOOR,0,Math.PI/2,[{x:.6,w:1.65,bottom:0,h:2.45}]);
  for(const z of [-1.71,1.71])gable(g,`gc_gable_${z}`,2.2,3.22,4.73,0,z-.095);
  for(const x of [-2.10,2.10])for(const z of [-1.7,1.7])box(g,`gc_corner_${x}_${z}`,.19,3.10,.22,x,1.68,z);
  for(const z of [-1.71,1.71]){
    box(g,`gc_plate_${z}`,4.42,.18,.24,0,z>0?3.20:3.16,z); // front underside 3.11 clears approved rider top 3.08
    for(const x of [-1,1])beam(g,`gc_front_brace_${z}_${x}`,[x*2.1,2.47,z],[x*1.6,3.12,z],.12,.13);
    beam(g,`gc_gable_principal_${z}`,[0,3.20,z],[0,4.68,z],.14,.14);
    for(const x of [-1,1])beam(g,`gc_gable_brace_${z}_${x}`,[x*1.58,3.23,z],[x*.52,4.22,z],.13,.14);
  }
  for(const x of [-2.11,2.11])box(g,`gc_side_plate_${x}`,.22,.18,3.42,x,3.16,0);
  // Broken stone base courses never cross the door or create a second floor.
  for(const x of [-1.54,1.54])box(g,`gc_front_plinth_${x}`,1.26,.38,.25,x,.32,1.70,M.stone);
  box(g,'gc_back_plinth',4.42,.38,.25,0,.32,-1.70,M.stone);
  box(g,'gc_west_plinth',.25,.38,3.4,-2.1,.32,0,M.stone);
  for(const x of [-.97,.97])box(g,`gc_door_jamb_${x}`,.16,2.48,.26,x,1.37,1.67);
  box(g,'gc_door_head',2.10,.18,.24,0,2.61,1.68);
  // b17 lives separately. Leave the complete 1.5 × .46 mounting rectangle
  // exposed on z=1.8. Parent-approved rider bottom y=2.62 (+.54m), with
  // .10m backing below and .04m above. Exact threshold/head clearance remains
  // 2.372m; the rider itself is NEVER built here or moved by this script.
  box(g,'gc_rider_mount_panel',1.80,.60,.12,0,2.82,1.74,M.lime);
  for(const x of [-1.48,1.48])window(g,`gc_front_window_${x}`,x,1.67,1.805,.8,1.10);
  window(g,'gc_kitchen_window',-1.33,1.68,-1.805,1.0,1.08,Math.PI,false);
  window(g,'gc_garden_window',-2.205,1.7,-.63,1.0,1.12,-Math.PI/2,false);
  window(g,'gc_loft_window',0,4.00,1.825,.64,.54,0,false);
  // Modest bracketed slate rain-hood, not a third competing full gable.
  const hoodY=(p:P)=>3.55-(p[1]-1.82)*.36;
  plate(g,'gc_entry_hood_deck',[[-1.2,1.82],[1.2,1.82],[1.2,2.43],[-1.2,2.43]],hoodY,.10,M.roof);
  for(let i=0;i<3;i++){
    const a=1.82+i*.20,b=Math.min(2.43,a+.218);
    plate(g,`gc_entry_hood_course_${i}`,[[-1.2,a],[1.2,a],[1.2,b],[-1.2,b]],p=>hoodY(p)+.028,.04,i===1?M.roofAlt:M.roof);
  }
  beam(g,'gc_hood_fascia',[-1.22,3.28,2.43],[1.22,3.28,2.43],.13,.13);
  for(const x of [-1.12,1.12])beam(g,`gc_hood_bracket_${x}`,[x,2.92,1.84],[x,3.36,2.36],.10,.12);
  // Flush threshold: source floor is already at +.13 all the way to z=2.7.
  // Recessed joint strips articulate a generous landing without step hazards.
  box(g,'gc_entry_threshold',1.76,.018,.36,0,.139,1.90,M.wood);
  for(const x of [-1,1])box(g,`gc_landing_border_${x}`,.045,.012,.87,x,.136,2.235,M.wood);
  // Two cottage door leaves held fully open, each within the old apron.
  // No invisible/closed door plane; the centered 1.4m lane remains clear.
  for(const s of [-1,1]){
    const x=s*.97;
    box(g,`gc_open_door_leaf_${s}`,.075,2.25,.80,x,1.295,2.17,M.wood);
    for(const y of [.58,2.05])box(g,`gc_door_hinge_${s}_${y}`,.087,.06,.53,x,y,2.07,M.iron);
    box(g,`gc_door_handle_${s}`,.12,.075,.045,x-s*.045,1.35,2.46,M.iron);
  }
  // Wing walls terminate on the original floor x=3.3. Its cross-gable projects
  // to x=3.58, well inside the old x=4.4 envelope.
  const wz=B.wingZ,wingTop=2.88;
  wall(g,'gc_wing_front',1.18,wingTop-FLOOR,.18,2.65,FLOOR,1.35,0,[{x:0,w:.77,bottom:1.00,h:1.05}]);
  wall(g,'gc_wing_back',1.18,wingTop-FLOOR,.18,2.65,FLOOR,-1.65,Math.PI,[{x:0,w:.70,bottom:1.1,h:.94}]);
  wall(g,'gc_wing_end',3.00,wingTop-FLOOR,.18,3.19,FLOOR,wz,Math.PI/2,[{x:0,w:1.43,bottom:1.0,h:1.1}]);
  gable(g,'gc_wing_gable',1.5,2.87,4.0,3.095,wz,Math.PI/2);
  for(const z of [-1.65,1.35]){
    box(g,`gc_wing_corner_${z}`,.18,2.73,.18,3.19,1.495,z);
    box(g,`gc_wing_front_plate_${z}`,1.25,.16,.22,2.64,2.82,z);
    box(g,`gc_wing_front_plinth_${z}`,1.18,.36,.24,2.65,.31,z,M.stone);
  }
  box(g,'gc_wing_end_plate',.22,.16,3.05,3.19,2.82,wz);
  box(g,'gc_wing_end_plinth',.24,.36,3.00,3.19,.31,wz,M.stone);
  beam(g,'gc_wing_kingpost',[3.205,2.90,wz],[3.205,3.95,wz],.13,.13);
  for(const s of [-1,1])beam(g,`gc_wing_gable_brace_${s}`,[3.205,2.9,wz+s*1.1],[3.205,3.69,wz+s*.33],.12,.12);
  window(g,'gc_wing_front_window',2.65,1.655,1.455,.77,1.05,0,false);
  window(g,'gc_wing_back_window',2.65,1.70,-1.755,.70,.94,Math.PI,false);
  window(g,'gc_wing_end_window',3.295,1.68,wz,1.43,1.1,Math.PI/2,false);
  crossRoof(g);
  // Hearth and chimney share one true flue axis: the old chimney was remote
  // from its indoor hearth. The substantial rear stack is now structurally legible.
  const hx=.91,hz=-1.40;
  box(g,'gc_hearth_slab',1.23,.12,.72,hx,.19,hz,M.stone);
  for(const s of [-1,1])box(g,`gc_hearth_pier_${s}`,.22,.92,.48,hx+s*.48,.70,hz,M.stone);
  box(g,'gc_hearth_back',.78,.82,.10,hx,.70,hz-.18,M.iron);
  box(g,'gc_hearth_lintel',1.22,.23,.58,hx,1.225,hz,M.stone);
  box(g,'gc_mantel',1.34,.13,.65,hx,1.405,hz,M.timber);
  box(g,'gc_flue_breast',.90,1.34,.55,hx,2.10,hz,M.stone);
  box(g,'gc_chimney_shaft',.79,2.82,.72,hx,4.10,hz,M.stone);
  // Roof-cut apron: thin visible flashing follows the actual main slope.
  plate(g,'gc_chimney_flashing',[[hx-.46,hz-.43],[hx+.46,hz-.43],[hx+.46,hz+.43],[hx-.46,hz+.43]],p=>mainY(p[0])+.060,.035,M.iron);
  for(let i=0;i<9;i++)box(g,`gc_chimney_course_${i}`,.81,.027,.74,hx,2.81+i*.31,hz,M.wood);
  box(g,'gc_chimney_crown',1.04,.20,.95,hx,5.59,hz,M.stone);
  for(const x of [hx-.22,hx+.22]){
    cylinder(g,`gc_flue_pot_${x}`,.135,.28,x,5.82,hz,M.iron);
    cylinder(g,`gc_flue_rim_${x}`,.164,.055,x,5.973,hz,M.stone);
  }
  for(const s of [-1,1]){const log=cylinder(g,`gc_hearth_log_${s}`,.055,.47,hx+s*.10,.30,hz+.08,M.wood);log.rotation.z=Math.PI/2;}
  const fire=new THREE.Mesh(new THREE.ConeGeometry(.115,.31,5),fireMat);fire.name='fire_gc_hearth';fire.scale.set(1,1,.72);fire.position.set(hx,.435,hz+.13);g.add(fire);
  const flame=new THREE.Mesh(new THREE.ConeGeometry(.075,.21,5),fireMat);flame.name='gc_hearth_small_flame';flame.scale.set(1,1,.72);flame.position.set(hx+.13,.385,hz+.11);g.add(flame);
  // Kitchen remains northwest: real sink rim and visible water; rack + 3 pots.
  box(g,'gc_counter',1.52,.65,.59,-1.23,.455,-1.36,M.wood);
  box(g,'gc_countertop',1.61,.09,.64,-1.23,.82,-1.36,M.stone);
  cylinder(g,'gc_basin',.235,.12,-1.66,.92,-1.36,M.iron,.19);
  cylinder(g,'gc_basin_water',.192,.015,-1.66,.989,-1.36,M.glass);
  beam(g,'gc_potrack',[-1.97,2.23,-1.49],[-.56,2.23,-1.49],.045,.045,M.iron);
  for(let i=0;i<3;i++){
    const x=-1.75+i*.43;beam(g,`gc_pothook_${i}`,[x,2.23,-1.49],[x,2.03,-1.49],.018,.018,M.iron);
    cylinder(g,`gc_pot_${i}`,.105,.17,x,1.94,-1.49,M.iron,.08);
  }
  // Work table moves from the center of the original door lane to the west.
  box(g,'gc_worktable',1.11,.08,.78,-1.34,.87,-.02,M.wood);
  for(const x of [-1.78,-.9])for(const z of [-.32,.28])box(g,`gc_table_leg_${x}_${z}`,.075,.70,.075,x,.52,z);
  cylinder(g,'gc_stool',.20,.08,-1.40,.52,.68,M.wood);
  for(const x of [-1.52,-1.28])box(g,`gc_stool_leg_${x}`,.07,.35,.07,x,.305,.68);
  cylinder(g,'gc_basket',.18,.18,-1.29,1.0,-.02,M.wood,.135);
  for(let i=0;i<3;i++)sprig(g,`gc_basket_herb_${i}`,-1.39+i*.10,1.07,-.02,.075);
  box(g,'gc_seed_shelf',.26,.07,1.00,-1.965,1.54,.62,M.wood);
  for(let i=0;i<3;i++){
    cylinder(g,`gc_seedjar_${i}`,.075,.18,-1.925,1.665,.28+i*.33,i%2?linen:foliage,.085);
    cylinder(g,`gc_seedlid_${i}`,.082,.035,-1.925,1.765,.28+i*.33,M.wood);
  }
  // A recognizable sleeper remains in the east corner, never across the lane.
  box(g,'gc_bedframe',.97,.22,1.78,1.49,.24,.65,M.wood);
  box(g,'gc_mattress',.88,.15,1.65,1.49,.425,.65,linen);
  box(g,'gc_blanket',.9,.055,1.0,1.49,.525,.32,foliage);
  box(g,'gc_pillow',.58,.13,.32,1.49,.53,1.23,M.lime);
  box(g,'gc_headboard',1.01,.66,.12,1.49,.56,1.58,M.wood);
  // The wing is a sunny potting bench, not an unfloored empty appendage.
  box(g,'gc_potting_bench',.49,.08,1.50,2.86,.91,-.16,M.wood);
  for(const z of [-.80,.48])box(g,`gc_potting_leg_${z}`,.35,.74,.09,2.86,.50,z);
  for(let i=0;i<3;i++){
    cylinder(g,`gc_potting_pot_${i}`,.13,.20,2.86,1.05,-.68+i*.47,M.wood,.10);
    sprig(g,`gc_potting_herb_${i}`,2.86,1.14,-.68+i*.47,.145);
  }
  // Garden identity: original west/back boundary, two productive raised beds,
  // a supported bench and a trained vine. Nothing scattered on the approach.
  for(const [n,cx,cz,len,yaw] of [['west',-3.8,-1.2,5.2,Math.PI/2],['back',-2.8,-3.6,4.4,0]] as const){
    const axis=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
    const o=box(g,`gc_garden_wall_${n}`,len,.59,.14,cx,.295,cz,M.wood);o.rotation.y=yaw;
    const cap=box(g,`gc_garden_cap_${n}`,len,.07,.20,cx,.625,cz,M.stone);cap.rotation.y=yaw;
    const count=Math.floor(len/.85);
    for(let i=0;i<=count;i++){
      const t=-len/2+i*len/count,x=cx+axis.x*t,z=cz+axis.z*t;
      box(g,`gc_garden_post_${n}_${i}`,.16,.76,.16,x,.38,z);
      box(g,`gc_garden_postcap_${n}_${i}`,.20,.05,.20,x,.785,z,M.stone);
    }
  }
  for(const [i,x,z,w] of [[0,-3.12,-2.58,1.1],[1,-3.17,-1.55,.9]] as const){
    box(g,`gc_planter_soil_${i}`,w,.25,.49,x,.125,z,soil);
    for(const s of [-1,1]){
      box(g,`gc_planter_long_${i}_${s}`,w+.08,.35,.065,x,.175,z+s*.27,M.wood);
      box(g,`gc_planter_end_${i}_${s}`,.065,.35,.54,x+s*w/2,.175,z,M.wood);
    }
    for(let j=0;j<4;j++)sprig(g,`gc_planter_${i}_${j}`,x-w*.35+j*w*.23,.32,z+(j%2?-.08:.08),.18);
  }
  box(g,'gc_garden_bench',1.32,.08,.38,-2.99,.47,-3.12,M.wood);
  for(const x of [-3.50,-2.48]){
    box(g,`gc_garden_benchleg_${x}`,.12,.44,.33,x,.22,-3.12);
    box(g,`gc_garden_benchbackpost_${x}`,.10,.74,.10,x,.53,-3.29);
  }
  box(g,'gc_garden_benchback',1.32,.24,.08,-2.99,.78,-3.29,M.wood);
  for(const z of [-.12,.14])beam(g,`gc_vine_support_${z}`,[-2.235,.35,z],[-2.235,2.71,z],.035,.035,M.wood);
  for(let i=0;i<5;i++)sprig(g,`gc_trained_vine_${i}`,-2.27,.50+i*.42,.08+Math.sin(i)*.12,.17);
  // Windows/panes are actual openings. Exposed roof ties stay safely overhead.
  for(const z of [-.95,.85]){
    beam(g,`gc_inside_tie_${z}`,[-2.02,3.10,z],[2.02,3.10,z],.15,.16);
    for(const x of [-1,1])beam(g,`gc_inside_rafter_${z}_${x}`,[x*2.06,3.25,z],[0,4.62,z],.12,.13);
  }
  // Source inherited fence-crossing beds/bench. Keep the replacements entirely
  // on the garden side of the west fence, not merely inside the entity bbox.
  g.updateMatrixWorld(true);
  for(const child of g.children)if(/^gc_planter_|^gc_garden_bench/.test(child.name))
    assert(new THREE.Box3().setFromObject(child).min.x>=-3.73,'garden furniture crosses west fence');
  return g;
}

if(process.argv[2]==='--verify'){
  const r=await verifyGarden(process.argv[3]??`${ROOT}/build/${ID}.glb`);
  if(process.argv[4])writeFileSync(process.argv[4],JSON.stringify(r,null,2)+'\n');
}else{
  finish(gardenBuild(),ID);
  const result=await verifyGarden(`${ROOT}/build/${ID}.glb`);
  writeFileSync(`${ROOT}/build/${ID}.verification.json`,JSON.stringify(result,null,2)+'\n');
  const route={id:ID,sha256:result.sha256,scale:1,terrainY:0,
    sourceFloorY:FLOOR,thresholdTop:.148,
    doors:[{name:'front-to-gardener-room',x:0,z:[-.72,2.69],floorY:.148,width:1.4,headroom:2.2}],
    waypoints:[
      {name:'front-path',pos:[0,0,3.18]},
      {name:'stone-apron',pos:[0,.13,2.5]},
      {name:'threshold',pos:[0,.148,1.90]},
      {name:'inside-door',pos:[0,.13,1.30]},
      {name:'worktable-and-bed',pos:[0,.13,.40]},
      {name:'kitchen-hearth-view',pos:[0,.13,-.55]},
    ],
    protectedVolumes:[{id:'nx-artwalk-b17-garden-seed-lattice',min:[-.75,2.62,1.8],max:[.75,3.08,1.94]}],
    riderMigration:{status:'PROPOSED_PARENT_AUTHORIZED_NOT_EXECUTED',oldLocal:[0,2.08,1.8325],newLocal:[0,2.62,1.8325],deltaLocal:[0,.54,0],unchanged:['x','z','yaw','scale','artwork bytes'],
      exposedBacking:{min:[-.9,2.52,1.8],max:[.9,3.12,1.8]},
      clearanceOnlyMinimumDelta:.268,fullyBackedMinimumDelta:.44,
      rationale:'Parent selected +.54m: preserves 2.372m host headroom, fully backs the original .46m rider with .10m lower and .04m upper margin. +.268m is only the theoretical 2.2m collision limit over the .148m threshold, not a fully backed mount.'},
  };
  writeFileSync(`${ROOT}/build/${ID}-route-contract.json`,JSON.stringify(route,null,2)+'\n');
}
