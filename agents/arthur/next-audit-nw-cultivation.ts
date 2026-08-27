// next-audit-nw-cultivation.ts — nvp-52 read-only district completion audit.
// Parses the committed planner slot table verbatim, then proves against LIVE
// /geom: 14/14 exact-hash occupancy, all-pairs rotated-SAT positive among the
// 14 district works, and rim annulus [66,108] honored by every live center.
import {readFileSync}from"node:fs";import{createHash}from"node:crypto";
const ROOT="/Users/t3rpz/projects/eidoverse-worlds";
const src=readFileSync(`${ROOT}/agents/arthur/next-plan-nw-cultivation.ts`,"utf8");
const block=src.slice(src.indexOf("const slots=["),src.indexOf("] as const"));
const rows=[...block.matchAll(/\[\s*"(\d+)"\s*,\s*"(\w+)"\s*,\s*"([^"]+)"\s*,\s*([\d.]+)\s*,\s*(-?[\d.]+)\s*\]/g)].map(m=>({id:m[1],theme:m[2],file:m[3]}));
if(rows.length!==14)throw Error(`slot table parse ${rows.length} != 14`);
const YAW=2.35619449,c=Math.cos(YAW),s=Math.sin(YAW);
const cfg=JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`,"utf8"));
const base=cfg.url.replace("wss://","https://").replace("ws://","http://").replace("/ws","");
const g=await(await fetch(`${base}/geom?world=commons-next`)).json();
const live=Object.fromEntries((g.entities??[]).map((e:any)=>[e.id,e]));
type O={c:[number,number],u:[number,number],v:[number,number],hu:number,hv:number};
function EO(e:any):O{const b=e.bbox,y=e.yaw??0,cc=Math.cos(y),ss=Math.sin(y),x=(b.min[0]+b.max[0])/2,z=(b.min[2]+b.max[2])/2;return{c:[e.pos[0]+x*cc+z*ss,e.pos[2]-x*ss+z*cc],u:[cc,-ss],v:[ss,cc],hu:(b.max[0]-b.min[0])/2,hv:(b.max[2]-b.min[2])/2}}
function gap(A:O,B:O){let best=-Infinity;for(const x of[A.u,A.v,B.u,B.v]){const dd=Math.abs((B.c[0]-A.c[0])*x[0]+(B.c[1]-A.c[1])*x[1]),ra=A.hu*Math.abs(A.u[0]*x[0]+A.u[1]*x[1])+A.hv*Math.abs(A.v[0]*x[0]+A.v[1]*x[1]),rb=B.hu*Math.abs(B.u[0]*x[0]+B.u[1]*x[1])+B.hv*Math.abs(B.v[0]*x[0]+B.v[1]*x[1]);best=Math.max(best,dd-ra-rb)}return best}
let placed=0;const issues:string[]=[];
const ids:string[]=[];
for(const row of rows){
  const targetId=`nx-cultivation-${row.theme}-${row.id.slice(-4)}`;
  const e=live[targetId];
  if(!e||!e.bbox){issues.push(`${targetId}: ABSENT or no bbox`);continue}
  let bytes:Buffer;
  if(row.file.startsWith("agents/"))bytes=readFileSync(`${ROOT}/${row.file}`);
  else bytes=readFileSync(`${ROOT}/agents/arthur/mason/glb-retex/${row.file}`);
  const sha16=createHash("sha256").update(new Uint8Array(bytes)).digest("hex").slice(0,16);
  if(e.lib!==`store/${sha16}.glb`)issues.push(`${targetId}: lib ${e.lib} != store/${sha16}.glb`);
  const lx=(e.bbox.min[0]+e.bbox.max[0])/2,lz=(e.bbox.min[2]+e.bbox.max[2])/2;
  const rad=Math.hypot(e.pos[0]+lx*c+lz*s,e.pos[2]-lx*s+lz*c);
  if(rad<66||rad>108)issues.push(`${targetId}: rim ${rad.toFixed(3)} outside [66,108]`);
  ids.push(targetId);placed++;
}
let satPairs=0,minGap=Infinity,minPair="";
for(let i=0;i<ids.length;i++)for(let k=i+1;k<ids.length;k++){
  const gp=gap(EO(live[ids[i]]),EO(live[ids[k]]));satPairs++;
  if(gp<minGap){minGap=gp;minPair=`${ids[i]}/${ids[k]}`}
  if(gp<-.001)issues.push(`SAT overlap ${ids[i]}/${ids[k]}: ${gp}`);
}
console.log(JSON.stringify({status:issues.length?"FAIL":"ALL_PASS",occupancy:`${placed}/14`,district:"NW Cultivation",libRimIssues:issues,satPairsChecked:satPairs,minLivePairGap:+minGap.toFixed(6),minPair},null,1));
