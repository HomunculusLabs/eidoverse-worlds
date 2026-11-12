// Substantial two-bay produce counter pavilion; deliberately NOT a walk-in shop.
import * as THREE from 'three';
import {M,box,beam,finish} from './kit.ts';
import {texMat} from '../assets/glbwrite.ts';
import {T,mesh,cyl,torus,openRoof,lamp,audit,ensemble} from './build-dyehouse.ts';
const P={apple:texMat('orchard-apples',[0xa94f3d,0xbd6449],{rough:.62,cell:128}),green:texMat('market-leaf',[0x5f7945,0x78944f],{rough:.84,cell:64}),bread:texMat('market-bread',[0xc49b63,0xd9b276],{rough:.94,cell:64}),root:texMat('market-roots',[0xb9793e,0xd59445],{rough:.8,cell:64})};
function crate(g:THREE.Group,x:number,z:number,w:number,d:number){
 box(g,'crate_bottom',w,.035,d,x,1.0075,z,M.wood);
 for(const dx of [-w/2+.022,w/2-.022])box(g,'crate_end',.045,.15,d,x+dx,1.07,z,M.wood);
 for(const dz of [-d/2+.022,d/2-.022])for(const y of [1.03,1.105])box(g,'crate_slat',w,.045,.04,x,y,z+dz,M.wood);
}
export function buildMarket(){
 const g=new THREE.Group();
 // Full inherited footprint is an honest stone counter foundation, not an invisible room-class shim.
 box(g,'market_foundation',3.9000000953674316,.095,1.0722944736480713,0,.04642254441510886,.033841848373413086,M.stone);
 for(const sx of [-1,1]){
  box(g,'lime_counter_body',1.70,.77,.77,sx,.48,-.015,M.lime);
  box(g,'counter_plinth',1.79,.16,.86,sx,.17,-.015,M.stone);
  // Faces stop BEFORE both pinned art layers. No new panel masks the artwork.
  box(g,'art_backer',1.53,.55,.045,sx,.63,.3545,M.wood);
  box(g,'stone_counter_sill',1.77,.10,.87,sx,.935,-.005,M.stone);
  box(g,'cedar_counter',1.77,.055,.86,sx,1.0125,-.005,M.wood);
  for(const x of [sx-.78,sx+.78])box(g,'counter_front_stile',.08,.70,.045,x,.53,.357,M.wood);
  // Useful lower storage, seen from the merchant-side rear.
  box(g,'rear_cupboard',1.46,.55,.05,sx,.52,-.421,M.wood);
  for(const x of [sx-.4,sx+.4])box(g,'cupboard_pull',.11,.028,.032,x,.62,-.459,M.iron);
  box(g,'rear_display_shelf',1.45,.065,.16,sx,1.39,-.34,M.wood);
  for(const x of [sx-.65,sx+.65])beam(g,'shelf_bracket',[x,1.14,-.39],[x,1.36,-.27],.045,.045);
 }
 // Three proper bent frames, not awning poles. Braced cantilevered counter canopy.
 for(const x of [-1.83,0,1.83]){
  for(const z0 of [-.355,.36]){const z=x===0&&z0>0?.27:z0;box(g,'pier',.23,.23,.24,x,.21,z,M.stone);box(g,'oak_post',.14,2.18,.14,x,1.43,z);}
  box(g,'cross_tie',.16,.15,.89,x,2.41,.012);
  for(const z of [-.355,.36])beam(g,'depth_brace',[x,2.01,z],[x,2.34,.015],.078,.08);
 }
 for(const z of [-.355,.36]){
  box(g,'front_bressummer',3.80,.20,.14,0,2.40,z);
  for(const x of [-1.83,1.83])beam(g,'bay_knee',[x,1.99,z],[x-Math.sign(x)*.38,2.32,z],.10,.10);
 }
 openRoof(g,'produce_shelter',-1.9500000476837158,1.9500000476837158,-.5023053884506226,.5699890851974487,2.55,.34);
 // Retain exact heritage awning anchor names, now small textile valances beneath a REAL roof.
 for(const [i,x] of [-1,1].entries()){
  const group=new THREE.Group();group.name='mk_awn_'+i;
  box(group,'woven_valance',1.58,.14,.028,x,2.36,.52,i===0?T.pale:T.weld);
  for(let j=0;j<8;j++)box(group,'valance_tab',.18,.06,.028,x-.69+j*.197,2.28,.52,i===0?T.pale:T.weld);
  g.add(group);
 }
 // Four filled produce crates, with larger readable shapes rather than tiny uniform dots.
 for(const [index,x] of [-1.43,-.68,.65,1.38].entries()){
  crate(g,x,.11,.59,.42);
  for(let row=0;row<2;row++)for(let col=0;col<3;col++){
   const xx=x+(col-1)*.145,zz=.04+row*.15;
   if(index===0){const a=mesh(g,'apple',new THREE.IcosahedronGeometry(.088,1),P.apple,xx,1.15,zz);a.scale.y=.9;box(g,'apple_stem',.015,.06,.015,xx,1.23,zz,M.wood);}
   if(index===1){const a=mesh(g,'loaf',new THREE.SphereGeometry(.09,8,5),P.bread,xx,1.15,zz);a.scale.set(.65,.62,1.08);for(let k=0;k<2;k++)box(g,'bread_score',.07,.007,.014,xx,1.206,zz-.035+k*.06,T.pale);}
   if(index===2){const a=mesh(g,'cabbage',new THREE.IcosahedronGeometry(.102,1),P.green,xx,1.17,zz);a.rotation.set(row*.2,col*.7,col*.3);for(let k=0;k<3;k++){const l=mesh(g,'cabbage_leaf',new THREE.SphereGeometry(.065,6,4),P.green,xx+Math.sin(k*2.1)*.05,1.19,zz+Math.cos(k*2.1)*.05);l.scale.y=.35;}}
   if(index===3){const a=cyl(g,'carrot',.046,.012,.20,xx,1.13,zz,P.root,7);a.rotation.x=Math.PI/2;box(g,'root_tops',.045,.075,.026,xx,1.19,zz-.095,P.green);}
  }
 }
 // Trading equipment remains: pan balance, coin till, and a small cloth bolt on the rear shelf.
 box(g,'balance_foot',.20,.055,.12,-1.0,1.455,-.33,M.iron);
 box(g,'balance_upright',.035,.39,.035,-1.0,1.65,-.33,M.iron);
 box(g,'balance_crossbar',.64,.035,.035,-1.0,1.84,-.33,T.brass);
 for(const x of [-1.25,-.75]){box(g,'scale_chain',.012,.18,.012,x,1.73,-.33,M.iron);cyl(g,'balance_pan',.115,.080,.025,x,1.6275,-.33,T.brass,12);}
 box(g,'coin_till',.32,.17,.20,1.47,1.52,-.33,M.wood);box(g,'coin_slot',.17,.013,.02,1.47,1.611,-.33,M.iron);
 const bolt=cyl(g,'heritage_cloth_bolt',.085,.085,.66,.72,1.51,-.33,T.indigo,12);bolt.rotation.z=Math.PI/2;
 // The light entity is fixed: a supported central lantern makes its unchanged origin honest.
 lamp(g,0,1.75,.40000000000000047,2.30);
 return finish(g,'nx-town-market');
}
if(import.meta.main){if(process.argv[2]==='--audit')await audit('nx-town-market');else if(process.argv[2]==='--ensemble')await ensemble('nx-town-market',process.argv[3]??'after');else buildMarket();}
