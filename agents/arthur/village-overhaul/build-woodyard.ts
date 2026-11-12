// Compact timber craft/fuel bay, not a fabricated room. Local files only; original builders are read-only.
import * as THREE from 'three';
import {readFileSync,writeFileSync} from 'node:fs';
import {M,box,beam} from './kit.ts';
import {BASE,decode,components,retainComponent,barnRoof,prism,cylinder,lantern,publish} from './build-stable.ts';
const id='nx-town-woodyard',d=await decode(`${BASE}/before/${id}.glb`),cs=components(d.root),g=new THREE.Group(),retained:any[]=[];
// Every original cordwood triangle is retained in its actual served position. The full stock fits under the low joiner's bench.
for(const [i,c] of cs.entries()){
 const cord=c.max[1]<.48&&c.max[0]<1.7&&c.min[0]>-1.7,stump=c.min[0]>2.3&&c.max[1]<.41,kindling=c.min[0]>1.7&&c.min[2]>1.09&&c.max[1]<.25;
 if(cord||stump||kindling)retained.push(retainComponent(g,d.root,c,`${cord?'original_cordwood':stump?'original_stump':'original_kindling'}_${i}`,c.material==='wy_split'?M.wood:M.timber,kindling?[-.8,0,-1.65]:[0,0,0]));
}
// Preserve the exact wy_axe group name, unchanged rest transform and both source submeshes. No motion comp exists on this frozen host.
const axe=new THREE.Group();axe.name='wy_axe';for(const c of cs.filter(c=>c.mesh.startsWith('wy_axe_')))retained.push(retainComponent(axe,d.root,c,'axe_part',c.material==='wy_axe_iron'?M.iron:M.wood));g.add(axe);
// Nothing raises the floor: workbay and chopping station remain at original terrain Y=0.
// A four-post pegged frame and real masonry shoes replace the thin sticks.
const rear=-.935,front=1.20;
for(const [i,x,z] of [[0,-1.94,rear],[1,2.64,rear],[2,-1.94,front],[3,1.87,front]]){
 box(g,`stone_shoe_${i}`,.30,.13,.30,x,.065,z,M.stone);
 box(g,`oak_upright_${i}`,.21,2.45,.21,x,1.355,z);
 for(const yy of [.30,2.35]){box(g,`shoe_collar_${i}_${yy}`,.23,.055,.23,x,yy,z,M.iron);}
 // Knee braces stay above standing clearance, and within the honest roof envelope.
 const dx=x<0?.53:-.53;beam(g,`knee_front_${i}`,[x,2.28,z],[x+dx,2.52,z],.12,.12);
}
// Rear limewash windbreak: its front surface is exactly behind the preserved heartwood relief, not over it.
box(g,'lime_backing_for_fixed_heartwood',4.62,2.49,.16,.35,1.245,-.915,M.lime);
box(g,'rear_stone_sill',4.62,.15,.18,.35,.075,-.925,M.stone);
for(const x of [-1.94,1.50,2.64])box(g,'rear_batten_'+x,.075,2.36,.045,x,1.25,-1.017,M.wood);
// Side windbreaks are low, with three spandrel boards and an open working side above.
for(const [side,x] of [[-1,-1.94],[1,2.64]]){
 const depth=side===1?.82:1.96,center=side===1?-.51:.06;
 box(g,'side_low_sill_'+side,.13,.15,depth,x,.075,center,M.stone);
 for(let i=0;i<3;i++)box(g,'side_board_'+side+'_'+i,.085,.18,depth,x,.28+i*.20,center,M.wood);
 box(g,'side_rail_'+side,.16,.14,depth,x,.88,center);
 beam(g,'side_diagonal_'+side,[x,.95,-.84],[side===1?1.87:x,2.40,1.20],.10,.10);
}
// Continuous wall plates, three exposed trusses, slate courses and ridge. Exact baseline XZ edges are functional roof, never hidden padding.
const X0=d.bounds.min.x,X1=d.bounds.max.x,Z0=d.bounds.min.z,Z1=d.bounds.max.z;
const rp=barnRoof(g,'craft_roof',Z0,Z1,X0,X1,2.69,.72,'x');
for(const z of [rear,front])box(g,'wall_plate_'+z,4.74,.22,.20,.35,2.52,z);
const ridgeZ=(Z0+Z1)/2;
for(const x of [-1.94,.35,2.64]){
 box(g,'truss_tie_'+x,.15,.16,2.2,x,2.59,.15);
 beam(g,'king_post_'+x,[x,2.65,ridgeZ],[x,3.27,ridgeZ],.13,.13);
 for(const z of [rear,front])beam(g,'rafter_'+x+'_'+z,[x,rp.height(z)-.17,z],[x,3.28,ridgeZ],.13,.13);
}
// The rear spandrel follows the actual roof underside; there is no inherited kit gable wedge.
const topRear=rp.height(-.835)-.14;box(g,'rear_upper_closure',4.62,topRear-2.4,.16,.35,(topRear+2.4)/2,-.915,M.lime);
// Open triangular ends retain through-light but are framed with king posts, not left as an accidental wall/roof crack.
// Large crafted joiner's bench over the fuel store. Its low top stays below the fixed relief's bottom .75m.
for(const x of [.18,1.55])box(g,'bench_front_leg_'+x,.13,.62,.10,x,.31,.455);
box(g,'bench_rear_wall_ledger',1.72,.11,.11,.865,.555,-.78);
for(let b=0;b<5;b++)box(g,'bench_top_plank_'+b,1.64,.11,.255,.865,.665,-.63+b*.252,M.wood);
box(g,'bench_front_apron',1.72,.14,.10,.865,.54,.455);
beam(g,'bench_long_stretcher',[.18,.20,.455],[1.55,.20,.455],.10,.10);
// Face vise, handled plane, mallet and cutting stock give the workstation a clear trade identity.
box(g,'vise_fixed_jaw',.28,.16,.09,1.40,.61,.40,M.wood);box(g,'vise_sliding_jaw',.28,.16,.09,1.40,.61,.49,M.wood);
const screw=cylinder(g,'vise_screw',.031,.18,1.40,.59,.48,M.iron);screw.rotation.x=Math.PI/2;
beam(g,'vise_cross_handle',[1.25,.59,.54],[1.55,.59,.54],.026,.026,M.wood);
box(g,'plane_sole',.33,.05,.11,.58,.745,-.03,M.iron);box(g,'plane_body',.27,.10,.10,.57,.79,-.03,M.wood);beam(g,'plane_grip',[.48,.79,-.03],[.63,.87,-.03],.05,.05);
beam(g,'mallet_handle',[1.06,.75,-.22],[1.37,.75,-.22],.037,.037,M.wood);box(g,'mallet_head',.11,.12,.23,1.36,.78,-.22,M.wood);
box(g,'cutting_stock',.62,.065,.19,.48,.754,-.41,M.wood);
// Cord rack end restraints: original 87-log fuel stock remains fully present, intentionally below the relief.
for(const x of [-1.74,1.74]){box(g,'cord_rack_end_'+x,.10,.63,1.14,x,.315,-.18);box(g,'cord_rack_cap_'+x,.14,.08,1.18,x,.62,-.18,M.wood);}
// Tool board lies beyond the artwork's right edge. Three recognizable hanging tools have real handles and metal blades.
box(g,'tool_board',.59,.91,.065,2.04,1.68,-.775,M.wood);
for(const [i,x] of [[0,1.86],[1,2.04],[2,2.22]]){box(g,'tool_peg_'+i,.034,.034,.13,x,2.04,-.70,M.iron);beam(g,'tool_handle_'+i,[x,1.40,-.69],[x,1.95,-.69],.034,.034,M.wood);box(g,'tool_blade_'+i,i===1?.14:.07,.12,.025,x,1.40,-.69,M.iron);}
// A visible two-strap hanger connects the exact low sign to the new taller eave without moving or burying it.
box(g,'fixed_sign_mount',.30,.12,.14,0,2.11,1.15,M.timber);
for(const x of [-.09,.09])beam(g,'fixed_sign_suspension_'+x,[x,2.17,1.15],[x,2.51,1.15],.026,.026,M.iron);
lantern(g,'lamp_workbench',1.58,2.08,-.49);
// Explicit route does not attempt to stand on the original low log pile; feet remain on grade in a narrow frontal working aisle.
const route={doors:[{name:'left_of_fixed_hanging_sign',x:-1.07,z:[.72,1.9],floorY:0,width:1.40,headroom:2.2}],waypoints:[{name:'yard_approach',pos:[-1.07,0,2.25]},{name:'sign_left_entry',pos:[-1.07,0,1.65]},{name:'fuel_selection_station',pos:[-1.07,0,.86]},{name:'joiners_bench_station',pos:[.70,0,.86]},{name:'vise_station',pos:[1.32,0,1.02]},{name:'outside_transfer',pos:[1.32,0,1.95]},{name:'chopping_approach',pos:[2.60,0,1.95]},{name:'axe_stump_station',pos:[2.60,0,1.12]}],purpose:'Open compact fuel/joinery workbay with actual grade-level work stations. The route reaches original fuel stock, the joiner bench, vise and unchanged axe/stump. This is not an interior room.'};
const {contract}=await publish(g,id,retained,route);
const unchanged={...contract};delete unchanged.collide;delete unchanged.collisionAmendment;writeFileSync(`${BASE}/build/${id}-route-default.json`,JSON.stringify(unchanged,null,2));
