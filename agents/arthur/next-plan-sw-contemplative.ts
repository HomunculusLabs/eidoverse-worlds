// next-plan-sw-contemplative.ts — nvp-75/76 read-only SW Contemplative district planner.
// Verified SAT-proof layout for 13 of 17 contemplative-family works in SW (x<0, z<0):
//   terrace x5 @ R76 (185/203/221/239/257), labyrinth x4 @ R98 (194/216/238/260),
//   seed x4 @ R71 (194/212/230/248). Common inward yaw -2.35619449.
// THE 4 MOSAICS (21m flat squares, radial span R±14.85 = [72.2,101.9] at any R in
// [80.9,93.1]) OVERLAP EVERY OTHER RING BAND in the annulus — mathematically no
// SAT-clear radius lane exists for them in SW alongside L/T/S. They are deferred
// as a separate Bill-decision (recommended: gallery row along ring road r~45,
// road-adjacent placement outside the [66,108] ring law — needs his word).
// Proves annulus [66,108], pair SAT >= 1.0, quadrant law, theme census.
import{readFileSync}from"node:fs";
const ROOT="/Users/t3rpz/projects/eidoverse-worlds",DIR=`${ROOT}/agents/arthur/mason/glb-retex`;
const slots=[
 ["0035","terrace","work_1641_terrace.glb",185,76],
 ["0037","terrace","work_1654_terrace.glb",203,76],
 ["0040","terrace","work_1667_terrace.glb",221,76],
 ["0049","terrace","work_1680_terrace.glb",239,76],
 ["0039","terrace","work_1693_terrace.glb",257,76],
 ["0004","labyrinth","work_1684_labyrinth.glb",194,98],
 ["0025","labyrinth","work_1645_labyrinth.glb",216,98],
 ["0038","labyrinth","work_1658_labyrinth.glb",238,98],
 ["0051","labyrinth","work_1671_labyrinth.glb",260,98],
 ["0003","seed","work_1644_seed.glb",194,71],
 ["0013","seed","work_1657_seed.glb",212,71],
 ["0021","seed","work_1670_seed.glb",230,71],
 ["0034","seed","work_1683_seed.glb",248,71],
];
type B={id:string,theme:string,file:string,x:number,z:number,yaw:number,min:number[],max:number[],inner:number,outer:number,width:number};
function decode(id:string,theme:string,file:string,thetaD:string,RS:string):B{
 const b=readFileSync(`${DIR}/${file}`),jl=b.readUInt32LE(12),j=JSON.parse(b.subarray(20,20+jl).toString());
 const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(const a of j.accessors??[])if(a.type==="VEC3"&&a.min)for(let k=0;k<3;k++){min[k]=Math.min(min[k],a.min[k]);max[k]=Math.max(max[k],a.max[k])}
 const th=+thetaD*Math.PI/180,R=+RS,x=R*Math.cos(th),z=R*Math.sin(th);
 const y=-2.35619449;
 const cs=Math.cos(y),sn=Math.sin(y);
 const rad=[];for(const LX of[min[0],max[0]])for(const LZ of[min[2],max[2]])rad.push(Math.hypot(x+LX*cs+LZ*sn,z-LX*sn+LZ*cs));
 return{id:`av-mason-${id}`,theme,file,x,z,yaw:y,min,max,inner:Math.min(...rad),outer:Math.max(...rad),width:Math.max(max[0]-min[0],max[2]-min[2])}
}
const B=slots.map(([a,b,c,d,e])=>decode(a as string,b as string,c as string,d as string,e as string));
type O={c:[number,number],u:[number,number],v:[number,number],hu:number,hv:number};
function ob(q:B):O{const c=Math.cos(q.yaw),s=Math.sin(q.yaw),lx=(q.min[0]+q.max[0])/2,lz=(q.min[2]+q.max[2])/2;return{c:[q.x+lx*c+lz*s,q.z-lx*s+lz*c],u:[c,-s],v:[s,c],hu:(q.max[0]-q.min[0])/2,hv:(q.max[2]-q.min[2])/2}}
function gap(A:O,B:O){let best=-Infinity;for(const x of[A.u,A.v,B.u,B.v]){const d=Math.abs((B.c[0]-A.c[0])*x[0]+(B.c[1]-A.c[1])*x[1]),a=A.hu*Math.abs(A.u[0]*x[0]+A.u[1]*x[1])+A.hv*Math.abs(A.v[0]*x[0]+A.v[1]*x[1]),b=B.hu*Math.abs(B.u[0]*x[0]+B.u[1]*x[1])+B.hv*Math.abs(B.v[0]*x[0]+B.v[1]*x[1]);best=Math.max(best,d-a-b)}return best}
if(B.length!==13||B.filter(x=>x.theme==="terrace").length!==5||B.filter(x=>x.theme==="labyrinth").length!==4||B.filter(x=>x.theme==="seed").length!==4)throw Error("theme census 5T/4L/4S");
const pairs:any[]=[];
for(let i=0;i<B.length;i++)for(let k=0;k<i;k++){const a=B[i],b=B[k],g=gap(ob(a),ob(b));pairs.push({a:a.id,b:b.id,gap:g});if(g<1.0)throw Error(`slot overlap ${a.id}/${b.id}: ${g}`)}
if(Math.min(...B.map(x=>x.inner))<66||Math.max(...B.map(x=>x.outer))>108)throw Error("annulus/rim law");
if(B.some(x=>x.x>=0||x.z>=0))throw Error("SW quadrant law (x<0, z<0)");
console.log(JSON.stringify({status:"ALL_PASS_LOCAL",district:"SW Contemplative (13 of 17; mosaics deferred to Bill)",slots:B.map(x=>({sourceId:x.id,theme:x.theme,file:x.file,pos:[+x.x.toFixed(6),"heightAt",+x.z.toFixed(6)],yaw:+x.yaw.toFixed(9),scale:1,inner:+x.inner.toFixed(6),outer:+x.outer.toFixed(6)})),minInnerEdge:Math.min(...B.map(x=>x.inner)).toFixed(6),maxOuterCorner:Math.max(...B.map(x=>x.outer)).toFixed(6),minPairGap:Math.min(...pairs.map(p=>p.gap)).toFixed(6)},null,1));
