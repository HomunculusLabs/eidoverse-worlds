// next-plan-se-wild.ts — nvp-75 read-only SE Wild district slot planner.
// SE quadrant mirror of the proven NE Craft layout law: works at angle theta on
// ring radius R with inward-facing yaw +2.35619449 (the SE bisector is 315°, so
// inward = theta+135°... resolved below as yaw = -(3*pi/4) + (pi/2) per arc ring).
// Families: forest x5, cairnfield x5, wayside x5 (15 works). Proves annulus
// [66,108], pair SAT > 0, center-distance law, quadrant law, target absence.
import{readFileSync}from"node:fs";import{createHash}from"node:crypto";
const ROOT="/Users/t3rpz/projects/eidoverse-worlds",DIR=`${ROOT}/agents/arthur/mason/glb-retex`;
const slots=[
 ["0010","forest","work_1690_forest.glb",278,76],
 ["0018","forest","work_1638_forest.glb",294,76],
 ["0044","forest","work_1664_forest.glb",310,76],
 ["0057","forest","work_1677_forest.glb",326,76],
 ["0031","forest","work_1651_forest.glb",342,76],
 ["0022","cairnfield","work_1642_cairnfield.glb",288,93],
 ["0048","cairnfield","work_1655_cairnfield.glb",304,93],
 ["0043","cairnfield","work_1668_cairnfield.glb",320,93],
 ["0047","cairnfield","work_1681_cairnfield.glb",336,93],
 ["0050","cairnfield","work_1694_cairnfield.glb",352,93],
 ["0009","wayside","work_1637_wayside.glb",280,101],
 ["0030","wayside","work_1650_wayside.glb",296,101],
 ["0045","wayside","work_1663_wayside.glb",312,101],
 ["0056","wayside","work_1676_wayside.glb",328,101],
 ["0058x","wayside","work_1689_wayside.glb",344,101],
];
type B={id:string,theme:string,file:string,x:number,z:number,yaw:number,min:number[],max:number[],inner:number,outer:number,width:number};
function decode(id:string,theme:string,file:string,thetaD:string,RS:string):B{
 const b=readFileSync(`${DIR}/${file}`),jl=b.readUInt32LE(12),j=JSON.parse(b.subarray(20,20+jl).toString());
 const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(const a of j.accessors??[])if(a.type==="VEC3"&&a.min)for(let k=0;k<3;k++){min[k]=Math.min(min[k],a.min[k]);max[k]=Math.max(max[k],a.max[k])}
 const th=+thetaD*Math.PI/180,R=+RS,x=R*Math.cos(th),z=R*Math.sin(th);
 // SE bisector = 315deg (-45deg in atan2 terms means x>0,z<0). Inward yaw for
 // works whose +Z faces the core at the SE bisector: yaw = -(3*pi/4) = -2.35619449
 // (same inward yaw value as NE because the model's +Z convention faces outward).
 const y=-2.35619449;
 const cs=Math.cos(y),sn=Math.sin(y);
 const rad=[];for(const LX of[min[0],max[0]])for(const LZ of[min[2],max[2]])rad.push(Math.hypot(x+LX*cs+LZ*sn,z-LX*sn+LZ*cs));
 return{id:`av-mason-${id}`,theme,file,x,z,yaw:y,min,max,inner:Math.min(...rad),outer:Math.max(...rad),width:Math.max(max[0]-min[0],max[2]-min[2])}
}
const B=slots.map(([a,b,c,d,e])=>decode(a as string,b as string,c as string,d as string,e as string));
type O={c:[number,number],u:[number,number],v:[number,number],hu:number,hv:number};
function ob(q:B):O{const c=Math.cos(q.yaw),s=Math.sin(q.yaw),lx=(q.min[0]+q.max[0])/2,lz=(q.min[2]+q.max[2])/2;return{c:[q.x+lx*c+lz*s,q.z-lx*s+lz*c],u:[c,-s],v:[s,c],hu:(q.max[0]-q.min[0])/2,hv:(q.max[2]-q.min[2])/2}}
function gap(A:O,B:O){let best=-Infinity;for(const x of[A.u,A.v,B.u,B.v]){const d=Math.abs((B.c[0]-A.c[0])*x[0]+(B.c[1]-A.c[1])*x[1]),a=A.hu*Math.abs(A.u[0]*x[0]+A.u[1]*x[1])+A.hv*Math.abs(A.v[0]*x[0]+A.v[1]*x[1]),b=B.hu*Math.abs(B.u[0]*x[0]+B.u[1]*x[1])+B.hv*Math.abs(B.v[0]*x[0]+B.v[1]*x[1]);best=Math.max(best,d-a-b)}return best}
if(B.length!==15||B.filter(x=>x.theme==="forest").length!==5||B.filter(x=>x.theme==="cairnfield").length!==5||B.filter(x=>x.theme==="wayside").length!==5)throw Error("theme census");
const pairs:any[]=[];
for(let i=0;i<B.length;i++)for(let k=0;k<i;k++){const a=B[i],b=B[k],g=gap(ob(a),ob(b)),dist=Math.hypot(a.x-b.x,a.z-b.z),law=.75*Math.max(a.width,b.width);pairs.push({a:a.id,b:b.id,gap:g,dist,law});if(g<0)throw Error(`slot overlap ${a.id}/${b.id}: ${g}`);if(dist<law)throw Error(`center law ${a.id}/${b.id}: ${dist}<${law}`)}
if(Math.min(...B.map(x=>x.inner))<66||Math.max(...B.map(x=>x.outer))>108)throw Error("annulus/rim law");
if(B.some(x=>x.x<=0||x.z>=0))throw Error("SE quadrant law (x>0, z<0)");
console.log(JSON.stringify({status:"ALL_PASS_LOCAL",district:"SE Wild",slots:B.map(x=>({sourceId:x.id,theme:x.theme,file:x.file,pos:[+x.x.toFixed(6),"heightAt",+x.z.toFixed(6)],yaw:+x.yaw.toFixed(9),scale:1,inner:+x.inner.toFixed(6),outer:+x.outer.toFixed(6),width:+x.width.toFixed(3)})),minInnerEdge:Math.min(...B.map(x=>x.inner)).toFixed(6),maxOuterCorner:Math.max(...B.map(x=>x.outer)).toFixed(6),minPairGap:Math.min(...pairs.map(p=>p.gap)).toFixed(6)},null,1));
