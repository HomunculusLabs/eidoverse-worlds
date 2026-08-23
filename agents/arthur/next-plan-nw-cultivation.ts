// next-plan-nw-cultivation.ts — nvp-23 read-only district slot verifier.
// No uploads/verbs. Validates exact source hashes, annulus/rim law, pair SAT,
// center-distance law, quadrant, and selected landmark source/live bag.
import{readFileSync}from"node:fs";import{createHash}from"node:crypto";
const ROOT="/Users/t3rpz/projects/eidoverse-worlds",DIR=`${ROOT}/agents/arthur/mason/glb-retex`,YAW=2.35619449,Q=Math.SQRT1_2;
const slots=[
 ["0006","lavender","work_1686_lavender.glb",70.014900,-35.078289],
 ["0027","lavender","work_1647_lavender.glb",72.176004,-4.061642],
 ["0040","lavender","work_1660_lavender.glb",72.460363,16.482309],
 ["0053","lavender","work_1673_lavender.glb",72.170355,37.064199],
 ["0012","orchard","work_1692_orchard.glb",88.057074,-37.432727],
 ["0020","orchard","work_1640_orchard.glb",84.253740,-22.172881],
 ["0033","orchard","work_1653_orchard.glb",87.500000,0.000000],
 ["0046","orchard","work_1666_orchard.glb",88.621635,27.516932],
 ["0059","orchard","work_1679_orchard.glb",86.667822,42.978943],
 ["0011","garden","work_1691_garden.glb",98.134314,-23.463220],
 ["0019","garden","work_1639_garden.glb",100.985110,-11.113809],
 ["0032","garden","work_1652_garden.glb",101.258989,1.027643],
 ["0045","garden","work_1665_garden.glb",100.662183,13.757923],
 ["0058","garden","work_1678_garden.glb",89.077833,13.853542],
] as const;
type B={id:string,theme:string,file:string,hash:string,r:number,t:number,x:number,z:number,yaw:number,min:number[],max:number[],inner:number,outer:number,width:number};
function decode(id:string,theme:string,file:string,r:number,t:number):B{const b=readFileSync(`${DIR}/${file}`),hash=createHash("sha256").update(b).digest("hex"),jl=b.readUInt32LE(12),j=JSON.parse(b.subarray(20,20+jl).toString()),min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(const a of j.accessors??[])if(a.type==="VEC3"&&a.min)for(let k=0;k<3;k++){min[k]=Math.min(min[k],a.min[k]);max[k]=Math.max(max[k],a.max[k])}const x=(-r+t)*Q,z=(r+t)*Q,c=Math.cos(YAW),s=Math.sin(YAW),rad:number[]=[];for(const lx of[min[0],max[0]])for(const lz of[min[2],max[2]])rad.push(Math.hypot(x+lx*c+lz*s,z-lx*s+lz*c));return{id:`av-mason-${id}`,theme,file,hash,r,t,x,z,yaw:YAW,min,max,inner:Math.min(...rad),outer:Math.max(...rad),width:Math.max(max[0]-min[0],max[2]-min[2])}}
const B=slots.map(([id,theme,file,r,t])=>decode(id,theme,file,r,t));type O={c:[number,number],u:[number,number],v:[number,number],hu:number,hv:number};function ob(q:B):O{const c=Math.cos(q.yaw),s=Math.sin(q.yaw),lx=(q.min[0]+q.max[0])/2,lz=(q.min[2]+q.max[2])/2;return{c:[q.x+lx*c+lz*s,q.z-lx*s+lz*c],u:[c,-s],v:[s,c],hu:(q.max[0]-q.min[0])/2,hv:(q.max[2]-q.min[2])/2}}function gap(A:O,B:O){let best=-Infinity;for(const x of[A.u,A.v,B.u,B.v]){const d=Math.abs((B.c[0]-A.c[0])*x[0]+(B.c[1]-A.c[1])*x[1]),a=A.hu*Math.abs(A.u[0]*x[0]+A.u[1]*x[1])+A.hv*Math.abs(A.v[0]*x[0]+A.v[1]*x[1]),b=B.hu*Math.abs(B.u[0]*x[0]+B.u[1]*x[1])+B.hv*Math.abs(B.v[0]*x[0]+B.v[1]*x[1]);best=Math.max(best,d-a-b)}return best}
const pairs:any[]=[];for(let i=0;i<B.length;i++)for(let k=0;k<i;k++){const a=B[i],b=B[k],g=gap(ob(a),ob(b)),dist=Math.hypot(a.x-b.x,a.z-b.z),law=.75*Math.max(a.width,b.width);pairs.push({a:a.id,b:b.id,gap:g,dist,law});if(g<0)throw Error(`slot overlap ${a.id}/${b.id}: ${g}`);if(dist<law)throw Error(`center law ${a.id}/${b.id}: ${dist}<${law}`)}
if(B.length!==14||B.filter(x=>x.theme==="orchard").length!==5||B.filter(x=>x.theme==="garden").length!==5||B.filter(x=>x.theme==="lavender").length!==4)throw Error("theme census");if(Math.min(...B.map(x=>x.inner))<66||Math.max(...B.map(x=>x.outer))>108)throw Error("annulus/rim law");if(B.some(x=>x.x>=0||x.z<=0))throw Error("NW quadrant law");
const cfg=JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`,"utf8")),base=cfg.url.replace("wss://","https://").replace("ws://","http://").replace("/ws","");async function ent(world:string,id:string){const r=await fetch(`${base}/geom?world=${world}`);if(!r.ok)throw Error(`geom ${world} ${r.status}`);return((await r.json())as any).entities.find((e:any)=>e.id===id)}const landmark=B.find(x=>x.id==="av-mason-0033")!;const src=await ent("commons",landmark.id),target=await ent("commons-next","nx-cultivation-orchard-0033");if(!src||src.lib!==`store/${landmark.hash.slice(0,16)}.glb`||Object.keys(src.comp??{}).length)throw Error("landmark source/live contract drift");if(target)throw Error("landmark target id already exists");
console.log(JSON.stringify({status:"ALL_PASS",district:"NW Cultivation",slots:B.map(x=>({sourceId:x.id,targetId:`nx-cultivation-${x.theme}-${x.id.slice(-4)}`,theme:x.theme,file:x.file,hash:x.hash,pos:[x.x,"heightAt",x.z],yaw:x.yaw,scale:1,inner:x.inner,outer:x.outer})),minInnerEdge:Math.min(...B.map(x=>x.inner)),maxOuterCorner:Math.max(...B.map(x=>x.outer)),minPairGap:Math.min(...pairs.map(x=>x.gap)),minCenterLawMargin:Math.min(...pairs.map(x=>x.dist-x.law)),landmark:{sourceId:landmark.id,targetId:"nx-cultivation-orchard-0033",hash:landmark.hash,pos:[landmark.x,"heightAt",landmark.z],yaw:landmark.yaw,sourceBag:src.comp??{},targetAbsent:true}},null,2));
