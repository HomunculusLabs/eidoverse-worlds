// nx-tower only: the scholar/watch tower, NOT nx-town-tower-house.
import * as T from 'three';
import { M,box,beam,wall,window } from './kit.ts';
import { BASE,finalize,host,save,slabPoly,crown,json,verify,ensemble } from './build-belltower.ts';
export async function build(){
 const g=new T.Group(),id='nx-tower';
 const oct=(r:number)=>Array.from({length:8},(_,i)=>[r*Math.cos(Math.PI/8+i*Math.PI/4),r*Math.sin(Math.PI/8+i*Math.PI/4)]);
 slabPoly(g,'octagon_foundation',oct(3.25/Math.cos(Math.PI/8)),-.2,.20,M.stone);
 // Continuous real floors, including the exact inherited ladder hatch.
 slabPoly(g,'ground_tongued_floor',oct(2.8/.9238795325),.155,.20,M.wood);
 box(g,'floor2_w',3.73,.15,5.36,-.815,2.55,0,M.wood);box(g,'floor2_e',.33,.15,5.36,2.515,2.55,0,M.wood);
 box(g,'floor2_s',1.3,.15,3.53,1.7,2.55,-.915,M.wood);box(g,'floor2_n',1.3,.15,.43,1.7,2.55,2.465,M.wood);
 // Eight joined loadbearing faces. South entry and upper lookout door are genuine voids.
 const ap=2.78,W=2*ap*Math.tan(Math.PI/8)+.015;
 for(let i=0;i<8;i++){
  const a=i*Math.PI/4,x=ap*Math.sin(a),z=ap*Math.cos(a),yaw=a;
  const ground=i===0?[{x:0,w:1.62,bottom:0,h:2.22}]:[{x:0,w:.62,bottom:.88,h:1.04}];
  wall(g,`masonry_base_${i}`,W,.60,.28,x,.2,z,yaw,i===0?[{x:0,w:1.62,bottom:0,h:.6}]:[],M.stone);
  wall(g,`lime_ground_${i}`,W,1.675,.25,x,.8,z,yaw,i===0?[{x:0,w:1.62,bottom:0,h:1.62}]:[{x:0,w:.62,bottom:.28,h:1.04}],M.lime);
  const upper=i===2?[{x:0,w:1.6,bottom:0,h:2.24}]:i===0?[{x:-.14,w:1.20,bottom:1.22,h:.85}]:[{x:0,w:.78,bottom:.72,h:1.62}];
  wall(g,`upper_scholar_${i}`,W,2.93,.25,x,2.625,z,yaw,upper,M.lime);
  if(i!==0){window(g,`ground_window_${i}`,x,1.6,z,.62,1.04,yaw,false);if(i!==2)window(g,`study_window_${i}`,x,4.155,z,.78,1.62,yaw,i%2===0);}
  const ux=Math.cos(a),uz=-Math.sin(a);for(const s of [-1,1])box(g,`corner_joinery_${i}_${s}`,.14,5.36,.14,x+s*W*.5*ux,2.88,z+s*W*.5*uz,M.timber);
  const belt=box(g,`floor_belt_${i}`,W+.12,.17,.29,x,2.515,z,M.timber);belt.rotation.y=yaw;
  const plate=box(g,`eave_wallplate_${i}`,W+.12,.20,.29,x,5.54,z,M.timber);plate.rotation.y=yaw;
 }
 // Entry stone jambs, standing-clear lintel, flared stone stoop.
 for(const s of [-1,1]){box(g,`door_ashlar_${s}`,.18,2.22,.39,s*.9,1.31,2.78,M.stone);box(g,`upper_door_frame_${s}`,.35,2.3,.10,2.78,3.775,s*.85,M.timber);}
 box(g,'entry_lintel',1.98,.16,.42,0,2.50,2.78,M.stone);
 box(g,'upper_lintel',.36,.14,1.90,2.78,4.935,0,M.timber);
 // Shutters retain their exact world tuple; the recessed backing exposes the full swept rest silhouette.
 box(g,'shutter_backing',1.22,.87,.10,-.14,4.27,2.64,M.timber);
 box(g,'shutter_sole_support',1.2,.09,.30,-.14,3.955,2.77,M.stone);
 window(g,'heritage_study_window',0,4.3,2.62,.6,.75,0,false);
 box(g,'stoop',2.15,.20,.47,0,.10,3.365,M.stone);
 // Accessible upper balcony, no mismatched cylinder/rail coordinate systems.
 slabPoly(g,'east_lookout_deck',[[2.56,-1.13],[3.507,-1.13],[3.507,1.13],[3.15,1.8],[1.8,3.25],[1.2,3.6],[.8,3.18],[1.5,2.56],[2.56,1.5]],2.46,2.625,M.wood);
 for(const z of [-1.05,1.05]){box(g,`east_balcony_column_${z}`,.18,2.42,.18,3.26,1.41,z,M.timber);box(g,`east_balcony_foot_${z}`,.30,.28,.30,3.26,.34,z,M.stone);beam(g,`east_balcony_rail_${z}`,[2.99,3.65,z],[3.46,3.65,z],.075,.075);}
 // Continuous perimeter with supported terminal newels, fascia and southeast console.
 const perimeter=[[-1.72,2.80],[-1.72,3.04],[-1.35,3.52],[1.18,3.52],[1.75,3.17],[3.08,1.75],[3.425,1.08],[3.425,-1.05],[2.99,-1.05]];
 for(let i=0;i<perimeter.length;i++){const [x,z]=perimeter[i];box(g,`gallery_newel_${i}`,.07,1.07,.07,x,3.16,z,M.timber);if(i){const [px,pz]=perimeter[i-1];beam(g,`gallery_handrail_${i}`,[px,3.69,pz],[x,3.69,z],.085,.085,M.timber);beam(g,`gallery_fascia_${i}`,[px,2.54,pz],[x,2.54,z],.13,.11,M.timber);const N=Math.ceil(Math.hypot(x-px,z-pz)/.5);for(let j=1;j<N;j++)box(g,`gallery_baluster_${i}_${j}`,.045,1.03,.045,px+(x-px)*j/N,3.14,pz+(z-pz)*j/N,M.timber);}}
 beam(g,'southeast_load_console',[1.95,1.7,1.95],[2.4,2.46,2.4],.18,.18,M.timber);
 box(g,'southeast_column',.18,2.3,.18,2.4,1.31,2.4,M.timber);box(g,'southeast_masonry_foot',.35,.30,.35,2.4,.15,2.4,M.stone);
 slabPoly(g,'lookout_balcony',[[-1.8,2.58],[1.8,2.58],[1.80,3.1],[1.42,3.60],[-1.42,3.60],[-1.80,3.1]],2.46,2.625,M.wood);
 for(const x of [-1.42,1.42]){box(g,`porch_column_${x}`,.18,2.42,.18,x,1.41,3.34,M.timber);box(g,`column_foot_${x}`,.34,.28,.34,x,.34,3.34,M.stone);beam(g,`balcony_bracket_${x}`,[x,1.86,2.86],[x,2.42,3.35],.15,.15,M.timber);}

 // Visible study seat at the exact preserved socket. Original bed structure stays beneath.
 box(g,'daybed_mattress',.91,.25,1.81,-1.50,2.875,-.6,M.wood); // top 3, socket feet/seat support
 box(g,'daybed_cover',.80,.008,1.40,-1.50,2.996,-.45,M.lime);
 box(g,'daybed_pillow',.75,.10,.32,-1.50,3.05,-1.31,M.lime);
 // Ground desk's served pedestal had a .05m bottom gap: a visible foot closes it.
 box(g,'desk_pedestal_foot',.24,.065,.24,-.8,.2275,-1.8,M.timber);
 // Retained shelf and candle table get visible wall brackets/pedestal, not floating trim.
 for(const z of [-.04,.84])beam(g,`shelf_console_${z}`,[-2.60,1.18,z],[-2.33,1.67,z],.065,.065,M.timber);
 box(g,'upper_candle_pedestal',.16,.605,.16,-.4,2.9275,-1.6,M.timber);
 // Suspended entry lamp retains exact pose and gets a wall-to-fixture bracket.
 beam(g,'entry_lamp_mount',[0,2.50,2.99],[0,2.50,3.25],.035,.035,M.iron);beam(g,'entry_lamp_drop',[0,2.50,3.25],[0,2.22,3.25],.025,.025,M.iron);
 // Roof system: eight rafters load to octagonal wall plate; retained kingpost continues to crown.
 beam(g,'kingpost_extension',[0,4.42,0],[0,7.68,0],.18,.18,M.timber);
 for(let i=0;i<8;i++){const a=Math.PI/8+i*Math.PI/4;beam(g,`radial_rafter_${i}`,[3.01*Math.cos(a),5.55,3.01*Math.sin(a)],[0,7.68,0],.13,.16,M.timber);}
 crown(g,'scholar_slate',8,3.25/Math.cos(Math.PI/8)-.05,5.65,2.02,Math.PI/8);
 const spire=new T.Mesh(new T.ConeGeometry(.16,.65,8),M.iron);spire.position.y=8.075;spire.name='scholar_spire';g.add(spire);box(g,'spire_socket',.28,.14,.28,0,7.70,0,M.iron);
 const stats=await finalize(g,id,['tw3_4','tw3_6','tw3_7','tw3_8','tw3_9','tw3_10','tw3_11','flame','lamp']);
 const common={...host(id),sha256:stats.sha256,terrainY:0,protectedVolumes:[{id:'nx-shutters',min:[-.616428,4,2.749535],max:[.33,4.5949903,2.9279898]}],assembly:json(`${BASE}/neighbors/${id}.json`).neighbors};
 save(`${BASE}/build/${id}.route.json`,{...common,doors:[{name:'scholar-ground-entry',x:0,z:[2.32,3.10],floorY:.2,width:1.4,headroom:2.2}],waypoints:[{name:'exterior-terrain-before-stoop',pos:[.4,0,3.95]},{name:'stoop',pos:[.4,.2,3.25]},{name:'entry',pos:[.4,.2,2.15]},{name:'reading-room',pos:[.4,.2,-.9]},{name:'desk-approach',pos:[-.25,.2,-1.05]},{name:'library-center',pos:[.4,.2,-.45]},{name:'ladder-staging',pos:[1.70,.2,.92]}]});
 save(`${BASE}/build/${id}.upper-route.json`,{...common,proofFrameY:-Math.PI/2,coordinateFrames:{doors:'proof-frame',waypoints:'host-local',protectedVolumes:'host-local',assembly:'world-tuples'},doors:[{name:'east-study-lookout-door',x:0,z:[2.31,3.15],floorY:2.625,width:1.4,headroom:2.2}],waypoints:[{name:'hatch-landing',pos:[.65,2.625,1.4]},{name:'upper-circulation',pos:[.65,2.625,.55]},{name:'reading-approach',pos:[-.40,2.625,.55]},{name:'daybed-socket-step',pos:[-1.35,3,-.5]},{name:'reading-return',pos:[-.40,2.625,.55]},{name:'kingpost-bypass',pos:[.65,2.625,.75]},{name:'east-study-aisle',pos:[1.5,2.625,.05]},{name:'lookout-door',pos:[2.60,2.625,.05]},{name:'lookout',pos:[3.04,2.625,.05]}]});
 return stats;
}
if(import.meta.main){if(process.argv.includes('--verify'))await verify('nx-tower');else if(process.argv.includes('--ensemble')){await ensemble('nx-tower');await ensemble('nx-tower',true);}else await build();}
