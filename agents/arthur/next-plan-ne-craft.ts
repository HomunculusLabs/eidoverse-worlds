// next-plan-ne-craft.ts — nvp-53 read-only NE Craft district slot planner.
// Polar placement on the NE quadrant: works sit at angle theta on ring radius
// R with inward-facing yaw -2.35619449 (cloisters rotated +90 degrees so their
// narrow long axis follows the arc). Proves annulus [66,108], pair SAT > 0,
// center-distance law, quadrant law, and live target absence. No uploads.
import{readFileSync}from"node:fs";import{createHash}from"node:crypto";
const ROOT="/Users/t3rpz/projects/eidoverse-worlds",DIR=`${ROOT}/agents/arthur/mason/glb-retex`;
const slots=[
 ["0005","statuary","work_1685_statuary.glb",18,74],
 ["0026","statuary","work_1646_statuary.glb",33,74],
 ["0039","statuary","work_1659_statuary.glb",48,74],
 ["0052","statuary","work_1672_statuary.glb",63,74],
 ["0007","hamlet","work_1687_hamlet.glb",10,88],
 ["0015","hamlet","work_1635_hamlet.glb",26,88],
 ["0028","hamlet","work_1648_hamlet.glb",42,88],
 ["0041","hamlet","work_1661_hamlet.glb",58,88],
 ["0054","hamlet","work_1674_hamlet.glb",74,88],
 ["0008","cloister","work_1688_cloister.glb",18,99],
 ["0016","cloister","work_1636_cloister.glb",34,99],
 ["0029","cloister","work_1649_cloister.glb",50,99],
 ["0042","cloister","work_1662_cloister.glb",66,99],
 ["0055","cloister","work_1675_cloister.glb",82,99],
];
type B={id:string,theme:string,file:string,x:number,z:number,yaw:number,min:number[],max:number[],inner:number,outer:number,width:number};
function decode(id:string,theme:string,file:string,thetaD:string,RS:string):B{
 const b=readFileSync(`${DIR}/${file}`),jl=b.readUInt32LE(12),j=JSON.parse(b.subarray(20,20+jl).toString());
 const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(const a of j.accessors??[])if(a.type==="VEC3"&&a.min)for(let k=0;k<3;k++){min[k]=Math.min(min[k],a.min[k]);max[k]=Math.max(max[k],a.max[k])}
 const th=+thetaD*Math.PI/180,R=+RS,x=R*Math.cos(th),z=R*Math.sin(th);
 const y=(-2.35619449)+(theme==="cloister"?Math.PI/2:0);
 const cs=Math.cos(y),sn=Math.sin(y);
 const lx=(min[0]+max[0])/2,lz=(min[2]+max[2])/2;
 const rad=[];for(const LX of[min[0],max[0]])for(const LZ of[min[2],max[2]])rad.push(Math.hypot(x+LX*cs+LZ*sn,z-LX*sn+LZ*cs));
 return{id:`av-mason-${id}`,theme,file,x,z,yaw:y,min,max,inner:Math.min(...rad),outer:Math.max(...rad),width:Math.max(max[0]-min[0],max[2]-min[2])}
}
const B=slots.map(s=>decode(...s));

type O={c:[number,number],u:[number,number],v:[number,number],hu:number,hv:number};
function ob(q:B):O{const c=Math.cos(q.yaw),s=Math.sin(q.yaw),lx=(q.min[0]+q.max[0])/2,lz=(q.min[2]+q.max[2])/2;return{c:[q.x+lx*c+lz*s,q.z-lx*s+lz*c],u:[c,-s],v:[s,c],hu:(q.max[0]-q.min[0])/2,hv:(q.max[2]-q.min[2])/2}}
function gap(A:O,B:O){let best=-Infinity;for(const x of[A.u,A.v,B.u,B.v]){const d=Math.abs((B.c[0]-A.c[0])*x[0]+(B.c[1]-A.c[1])*x[1]),a=A.hu*Math.abs(A.u[0]*x[0]+A.u[1]*x[1])+A.hv*Math.abs(A.v[0]*x[0]+A.v[1]*x[1]),b=B.hu*Math.abs(B.u[0]*x[0]+B.u[1]*x[1])+B.hv*Math.abs(B.v[0]*x[0]+B.v[1]*x[1]);best=Math.max(best,d-a-b)}return best}
if(B.length!==14||B.filter(x=>x.theme==="hamlet").length!==5||B.filter(x=>x.theme==="cloister").length!==5||B.filter(x=>x.theme==="statuary").length!==4)throw Error("theme census");
const pairs:any[]=[];
for(let i=0;i<B.length;i++)for(let k=0;k<i;k++){const a=B[i],b=B[k],g=gap(ob(a),ob(b)),dist=Math.hypot(a.x-b.x,a.z-b.z),law=.75*Math.max(a.width,b.width);pairs.push({a:a.id,b:b.id,gap:g,dist,law});if(g<0)throw Error(`slot overlap ${a.id}/${b.id}: ${g}`);if(dist<law)throw Error(`center law ${a.id}/${b.id}: ${dist}<${law}`)}
if(Math.min(...B.map(x=>x.inner))<66||Math.max(...B.map(x=>x.outer))>108)throw Error("annulus/rim law");
if(B.some(x=>x.x<=0||x.z<=0))throw Error("NE quadrant law");
const cfg=JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`,"utf8")),base=cfg.url.replace("wss://","https://").replace("ws://","http://").replace("/ws","");
const resp=await fetch(`${base}/geom?world=commons-next`);const data:any=await resp.json();
const taken=new Set((data.entities??[]).map((e:any)=>e.id as string));
const hashes=B.map(q=>{const b=readFileSync(`${DIR}/${q.file}`);return createHash("sha256").update(new Uint8Array(b)).digest("hex")});
for(let i=0;i<B.length;i++){const tid=`nx-craft-${B[i].theme}-${B[i].id.slice(-4)}`;if(taken.has(tid))throw Error(`target exists: ${tid}`)}
console.log(JSON.stringify({status:"ALL_PASS",district:"NE Craft",slots:B.map((x,i)=>({targetId:`nx-craft-${x.theme}-${x.id.slice(-4)}`,sourceId:x.id,file:x.file,hash:hashes[i],pos:[+x.x.toFixed(6),"heightAt",+x.z.toFixed(6)],yaw:+x.yaw.toFixed(9),scale:1,inner:+x.inner.toFixed(6),outer:+x.outer.toFixed(6)})),minInnerEdge:Math.min(...B.map(x=>x.inner)).toFixed(6),maxOuterCorner:Math.max(...B.map(x=>x.outer)).toFixed(6),minPairGap:Math.min(...pairs.map(p=>p.gap)).toFixed(6)},null,1));
