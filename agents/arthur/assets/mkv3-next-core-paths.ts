// mkv3-next-core-paths.ts — commons-next accepted-core approach network.
// One four-draw ground model at world origin. Sparse pavers connect the plaza
// lamp ring to tower, court doors, and carousel while preserving the SW meadow.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g=new THREE.Group();
const soils=Array.from({length:4},(_,i)=>texMat(`next-path-${i}`,[0x756d4b,0x827858,0x665f42],{rough:.98,scale:3,weights:[2,1,1],seed:8128+i*977}));
let serial=0;
const reviewManifest:Array<{id:number,x:number,z:number,yaw:number,w:number,d:number,y:number}>=[];
function stone(x:number,z:number,yaw:number){
 const i=serial++,h=Math.abs(Math.sin((i+1)*12.9898)*43758.5453)%1;
 const w=.76+h*.16,d=.50+h*.10,y=.026+h*.004;
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,.055,d),soils[i%soils.length]);
 m.name=`npath_${i}`;m.position.set(x,y,z);m.rotation.y=yaw+(h-.5)*.14;g.add(m);
 reviewManifest.push({id:i,x,z,yaw:m.rotation.y,w,d,y});
}
function segment(a:[number,number],b:[number,number],start=true,step=.92){
 const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),n=Math.max(1,Math.floor(L/step)),yaw=Math.atan2(dx,dz)+Math.PI/2;
 for(let i=start?0:1;i<=n;i++){const t=i/n,px=a[0]+dx*t,pz=a[1]+dz*t;stone(px,pz,yaw)}
}
function route(points:Array<[number,number]>,step=.92,includeStart=true){for(let i=0;i<points.length-1;i++)segment(points[i],points[i+1],i===0?includeStart:false,step)}
// Four short plaza spokes terminate before the reviewed cardinal lamps.
route([[4.8,0],[8.9,0]],.86);route([[-4.8,0],[-8.9,0]],.86);route([[0,4.8],[0,8.9]],.86);route([[0,-4.8],[0,-8.9]],.86);
// NE tower: bypass the north lamp on its east side, then bend toward the door.
// nvp-20 visual gate: the first draft stopped/restarted across a 2m grass gap
// at each lamp and read as disconnected debris rather than one path network.
route([[0,8.9],[1.0,9.4],[1.0,10.6],[0,10.9],[4.2,10.9],[8.0,11.8],[11.271765011973791,13.529378862508514]],.92,false);
// SE work court: one trunk from the east approach, then a deliberate fork to
// each open shed. Endpoints are exact exterior-apron edges, never thresholds.
const fork:[number,number]=[12.6,-6.8];
// East lamp bypass stays on the court/south side.
route([[8.9,0],[9.4,-1.0],[10.6,-1.0],[10.9,0],[11.2,-3.7],fork],.92,false);
route([fork,[15.0,-8.0],[17.447261721904905,-9.350270511726542]],.88);
route([fork,[12.45,-10.1],[12.75,-12.7],[13.260703615912785,-14.70869670093095]],.88);
// NW carousel: bypass the west lamp on its north side; no path enters SW meadow.
route([[-8.9,0],[-9.4,1.0],[-10.6,1.0],[-10.9,0],[-10.8,4.7],[-12.1,8.8],[-14.2,12.2]],.96,false);
mergeByMaterial(g,"npath");
writeFileSync("agents/arthur/assets/village_next_core_paths.glb",toGLB(g));
writeFileSync("agents/arthur/assets/village_next_core_paths.review.json",JSON.stringify({seed:8128,pavers:reviewManifest},null,2)+"\n");
console.log("village_next_core_paths.glb —",g.children.length,"draw nodes");
