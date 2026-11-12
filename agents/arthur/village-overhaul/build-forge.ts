// LOCAL ONLY. Outdoor charcoal forge; no world connection or shared-kit edits.
import * as THREE from 'three';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import {M,box,beam,finish} from './kit.ts';
import {texMat} from '../assets/glbwrite.ts';
export const base=import.meta.dir;
export const sha=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
export async function source(id:string){
 const bytes=readFileSync(`${base}/before/${id}.glb`),pin=JSON.parse(readFileSync(`${base}/before/downloads.json`,'utf8')).find((x:any)=>x.id===id);
 if(sha(bytes)!==pin.sha256)throw Error('served bytes drift '+id);
 const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco3d.createDecoderModule()});
 return await io.readBinary(bytes);
}
// Retain the actual served decoded geometry, not a reconstruction from old sources.
export function retain(doc:any,g:THREE.Group,names:string[]){
 const kept:any[]=[];
 const convert=(n:any):any=>{
  const mesh=n.getMesh();let o:any;
  if(mesh){
   const p=mesh.listPrimitives();if(p.length!==1)throw Error('retained multi-primitive needs explicit handling');
   const geo=new THREE.BufferGeometry();
   for(const [key,attr] of [['POSITION','position'],['NORMAL','normal'],['TEXCOORD_0','uv']] as const){const a=p[0].getAttribute(key);if(a)geo.setAttribute(attr,new THREE.BufferAttribute(new Float32Array(a.getArray()),a.getElementSize()));}
   const ix=p[0].getIndices();if(ix)geo.setIndex(Array.from(ix.getArray()));
   const mm=p[0].getMaterial(),factor=mm?.getBaseColorFactor()??[1,1,1,1],color=p[0].getAttribute('COLOR_0');
   // Original plain writer stores tint as normalized COLOR_0; preserve that tint.
   let rgb=factor.slice(0,3);if(color){const a=[0,0,0,0];color.getElement(0,a);rgb=rgb.map((v:number,i:number)=>v*a[i]);}
   const m=new THREE.MeshStandardMaterial({color:new THREE.Color().setRGB(...rgb),roughness:mm?.getRoughnessFactor()??.8,metalness:mm?.getMetallicFactor()??0,emissive:new THREE.Color().fromArray(mm?.getEmissiveFactor()??[0,0,0])});
   o=new THREE.Mesh(geo,m);
  }else o=new THREE.Group();
  o.name=n.getName();o.position.fromArray(n.getTranslation());o.quaternion.fromArray(n.getRotation());o.scale.fromArray(n.getScale());for(const c of n.listChildren())o.add(convert(c));return o;
 };
 for(const name of names){const n=doc.getRoot().listNodes().find((n:any)=>n.getName()===name);if(!n)throw Error('missing actual functional node '+name);const o=convert(n);g.add(o);kept.push({name,matrix:n.getWorldMatrix(),children:n.listChildren().map((c:any)=>c.getName())});}
 return kept;
}
export function cyl(g:THREE.Group,n:string,r:number,rb:number,h:number,x:number,y:number,z:number,m:THREE.Material=M.wood,segments=16){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,rb,h,segments),m);o.name=n;o.position.set(x,y,z);g.add(o);return o;}
export function arch(g:THREE.Group,n:string,x:number,z:number,r:number,spring:number,t:number,depth:number,m:THREE.Material=M.stone){
 for(let i=0;i<16;i++){const a=Math.PI*i/16+.008,b=Math.PI*(i+1)/16-.008;const s=new THREE.Shape();s.moveTo(Math.cos(a)*r,Math.sin(a)*r);s.lineTo(Math.cos(a)*(r+t),Math.sin(a)*(r+t));s.lineTo(Math.cos(b)*(r+t),Math.sin(b)*(r+t));s.lineTo(Math.cos(b)*r,Math.sin(b)*r);s.closePath();const o=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:false}),m);o.name=`${n}_voussoir_${i}`;o.position.set(x,spring,z-depth/2);g.add(o);}
}
export const water=texMat('forge-water',[0x506a78,0x577780],{rough:.25,metal:.5,cell:128});water.emissive.set(0x2e4a58);water.emissiveIntensity=.45;
const brick=texMat('forge-refractory',[0x9b7965,0x92705d,0xa98773],{rough:.98,cell:32,weights:[4,2,1]});
const leather=texMat('forge-leather',[0x5d4130,0x684a38],{rough:.96,cell:64});
export async function buildForge(){
 const g=new THREE.Group(),doc=await source('nx-forge');
 const kept=retain(doc,g,['fire_fg_coals']);
 // Open arched hearth, not a box with a fire sticker. The ember source lives in its void.
 box(g,'foundation',1.22,.125,1.06,0,.0575,.0,M.stone);
 box(g,'hearth_bed',1.12,.045,.83,0,.1425,.13,brick);
 box(g,'ash_catching_lip',1.12,.025,.10,0,.1375,.5599370718002333,M.iron);
 box(g,'hearth_back',1.08,.64,.13,0,.45,-.355,brick);
 for(const s of [-1,1]){
  box(g,'hearth_cheek_'+s,.17,.47,.79,s*.47,.415,.13,brick);
  for(let k=0;k<3;k++)box(g,`ashlar_${s}_${k}`,.185,.018,.805,s*.47,.22+k*.17,.13,M.stone);
 }
 arch(g,'hearth_mouth',0,.465,.36,.485,.145,.16,brick);
 // Bond the arch crown to the hood front; keep its gathering throat open BEHIND this lip.
 // Top 1.015 stays below the frozen artwork's y=1.020 lower edge.
 box(g,'hood_gathering_lip',1.03,.04,.25,0,.995,.345,brick);
 // Panel B16 has a planar backing at z=.3515, behind its exact z=.3575 back.
 // No projected cornice or rain lip crosses the protected face/exposure column.
 box(g,'art_panel_backing',.82,.93,.10,0,1.465,.3015,M.lime);
 box(g,'hood_rear',.82,.93,.12,0,1.465,-.25,M.stone);
 for(const s of [-1,1])box(g,'hood_corner_'+s,.095,.98,.66,s*.465,1.44,.02,M.stone);
 const ring=(n:string,w:number,d:number,y:number,t:number,h:number,m:THREE.Material)=>{for(const s of [-1,1]){box(g,n+'_x',t,h,d,s*(w-t)/2,y,-.05,m);box(g,n+'_z',w-2*t,h,t,0,y,-.05+s*(d-t)/2,m);}};
 ring('smoke_throat',.8,.68,.99,.10,.12,M.iron);
 ring('chimney_shoulder_belt',1.03,.82,1.95,.10,.08,M.stone);
 const shoulder=new THREE.Mesh(new THREE.CylinderGeometry(.36,.72,.24,4,1,true),M.stone);shoulder.rotation.y=Math.PI/4;shoulder.scale.z=.78;shoulder.position.set(0,2.07,-.05);shoulder.name='hood_tapered_shoulder';shoulder.updateMatrix();shoulder.geometry.applyMatrix4(shoulder.matrix);shoulder.position.set(0,0,0);shoulder.rotation.set(0,0,0);shoulder.scale.set(1,1,1);g.add(shoulder);
 // Tall slotted stack gives the station a masonry-tool identity, not a tiny house.
 for(const s of [-1,1]){box(g,'flue_side_'+s,.11,.75,.45,s*.205,2.395,-.05,M.stone);box(g,'flue_end_'+s,.3,.75,.09,0,2.395,-.05+s*.18,M.stone);}
 for(const y of [2.1,2.42,2.7])ring('stack_band',.55,.51,y,.055,.045,M.iron);
 ring('chimney_cap',.66,.59,2.81,.11,.08,M.stone);
 box(g,'stack_cowl',.54,.06,.48,0,2.93,-.05,M.iron);
 for(const x of [-.2,.2])box(g,'cowl_leg',.035,.12,.035,x,2.87,-.05,M.iron);
 // The anvil and worker fixtures stay on their original sides, below b16.
 cyl(g,'anvil_stump',.22,.255,.47,.95,.235,.35);
 for(const y of [.09,.39]){const o=new THREE.Mesh(new THREE.TorusGeometry(.231,.014,6,20),M.iron);o.rotation.x=Math.PI/2;o.position.set(.95,y,.35);g.add(o);}
 box(g,'anvil_foot',.36,.055,.26,.95,.485,.35,M.iron);box(g,'anvil_waist',.18,.13,.15,.95,.58,.35,M.iron);box(g,'anvil_face',.45,.14,.2,.95,.715,.35,M.iron);
 const horn=new THREE.Mesh(new THREE.ConeGeometry(.088,.28,12),M.iron);horn.rotation.z=-Math.PI/2;horn.position.set(1.32,.725,.35);g.add(horn);
 box(g,'anvil_heel',.13,.12,.17,.69,.70,.35,M.iron);
 beam(g,'hammer_handle',[.66,.82,.4],[1.05,.82,.32],.031,.031,M.wood);box(g,'hammer_head',.16,.085,.09,1.04,.825,.32,M.iron);
 // Individually staved open quench barrel: geometry water with a lit blue surface.
 for(let i=0;i<16;i++){const a=i*Math.PI/8;const o=box(g,'quench_stave',.078,.55,.04,1+Math.sin(a)*.2,.275,-.55+Math.cos(a)*.2,M.wood);o.rotation.y=a;}
 cyl(g,'glow_quench_water',.179,.179,.015,1,.503,-.55,water,24);
 for(const y of [.1,.44]){const o=new THREE.Mesh(new THREE.TorusGeometry(.213,.014,6,24),M.iron);o.rotation.x=Math.PI/2;o.position.set(1,y,-.55);g.add(o);}
 cyl(g,'stool_seat',.16,.15,.055,1.26,.44,-.02);for(let i=0;i<3;i++){const a=i*2*Math.PI/3;beam(g,'stool_leg',[1.26+Math.cos(a)*.1,0,-.02+Math.sin(a)*.1],[1.26+Math.cos(a)*.08,.42,-.02+Math.sin(a)*.08],.036);}
 box(g,'toolrack',.32,.87,.07,-.70,.82,-.55,M.wood);
 for(let i=0;i<3;i++){const x=-.81+i*.11;beam(g,'file',[x,.55,-.44],[x,1.09,-.44],.026,.022,M.iron);box(g,'file_handle',.048,.15,.045,x,1.16,-.44,M.wood);}
 const b=box(g,'bellows',.09,.42,.27,-.748,.65,.1,leather);b.rotation.z=.24;
 beam(g,'bellows_handle',[-.84,.89,.1],[-.64,.89,.1],.04,.04,M.wood);
 for(let i=0;i<2;i++)beam(g,'tongs',[-.60+i*.04,.5,-.18],[-.65+i*.09,.96,-.18],.022,.022,M.iron);
 box(g,'apron',.025,.46,.3,.59,.60,-.1,leather);cyl(g,'apron_pin',.035,.035,.02,.595,.855,-.1,M.iron);
 for(const z of [-.65,-.43])box(g,'blade_rack',.5,.05,.045,.1,.25,z,M.wood);
 for(let i=0;i<3;i++)box(g,'finished_blade',.034,.018,.4-i*.025,-.04+i*.14,.29+i*.035,-.54,M.iron);
 // Deliberately retained original extents, with no apron enlargement/fake room.
 box(g,'rack_left_foot',.036,.42,.08,-.85461825,.21,-.55,M.iron);
 box(g,'quench_rear_foot',.26,.04,.045,1,.02,-.7545,M.stone);
 const stat=finish(g,'forge');
 writeFileSync(`${base}/build/forge-preservation.json`,JSON.stringify({host:JSON.parse(readFileSync(`${base}/before/contracts.json`,'utf8')).find((x:any)=>x.id==='nx-forge'),kept,originalSha256:sha(readFileSync(`${base}/before/nx-forge.glb`)),note:'Outdoor workstation; height increased but footprint remains below exact-room gate. Never authorize interior walking.'},null,2));return stat;
}
if(import.meta.main)await buildForge();
