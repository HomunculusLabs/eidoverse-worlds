// next-place-sw-contemplative-batch.ts — nvp-92..104 SW Contemplative placements (13 works), fail-closed.
// Chassis identical to the proven SE batch placer: hash gate, tuple verify, rim law [66,108],
// SAT vs live bbox geometry, upload → spawn over ws, post-place tuple check.
// Yaw -2.35619449 (SW inward). Families terrace/labyrinth/seed carry NO comps.
import {readFileSync}from"node:fs";import{createHash}from"node:crypto";
const ROOT="/Users/t3rpz/projects/eidoverse-worlds",WORLD="commons-next",YAW=-2.35619449;
const cfg=JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`,"utf8")),
base=cfg.url.replace("wss://","https://").replace("ws://","http://").replace("/ws","");
const near=(a:number,b:number)=>Math.abs(a-b)<1e-6;
async function geom(){const r=await fetch(`${base}/geom?world=${WORLD}`);if(!r.ok)throw Error(`geom ${r.status}`);const d:any=await r.json();return Object.fromEntries((d.entities??[]).map((e:any)=>[e.id,e])) as Record<string,any>}
type O={c:[number,number],u:[number,number],v:[number,number],hu:number,hv:number};
function O(x:number,z:number,y:number,w:number,d:number):O{const c=Math.cos(y),s=Math.sin(y);return{c:[x,z],u:[c,-s],v:[s,c],hu:w/2,hv:d/2}}
function EO(e:any){const b=e.bbox,y=e.yaw??0,c=Math.cos(y),s=Math.sin(y),x=(b.min[0]+b.max[0])/2,z=(b.min[2]+b.max[2])/2;return O(e.pos[0]+x*c+z*s,e.pos[2]-x*s+z*c,y,b.max[0]-b.min[0],b.max[2]-b.min[2])}
function gap(A:O,B:O){let best=-Infinity;for(const x of[A.u,A.v,B.u,B.v]){const dd=Math.abs((B.c[0]-A.c[0])*x[0]+(B.c[1]-A.c[1])*x[1]),ra=A.hu*Math.abs(A.u[0]*x[0]+A.u[1]*x[1])+A.hv*Math.abs(A.v[0]*x[0]+A.v[1]*x[1]),rb=B.hu*Math.abs(B.u[0]*x[0]+B.u[1]*x[1])+B.hv*Math.abs(B.v[0]*x[0]+B.v[1]*x[1]);best=Math.max(best,dd-ra-rb)}return best}
function accBounds(path:string){const b=readFileSync(path);const jl=b.readUInt32LE(12);const j=JSON.parse(b.subarray(20,20+jl).toString());const mn=[Infinity,Infinity,Infinity],mx=[-Infinity,-Infinity,-Infinity];for(const a of j.accessors??[])if(a.type==="VEC3"&&a.min)for(let k=0;k<3;k++){mn[k]=Math.min(mn[k],a.min[k]);mx[k]=Math.max(mx[k],a.max[k])}return{w:mx[0]-mn[0],d:mx[2]-mn[2]}}
const SLOTS=[
 {id:"nx-temple-terrace-0035",file:"work_1641_terrace.glb",sha:"e8417696ee8ab62bac5655ccbabc94c5fd792cc2e8958a7ea0304c8fd2db0651",x:-75.710797,z:-6.623836,py:-0.00464027797587903},
 {id:"nx-temple-terrace-0037",file:"work_1654_terrace.glb",sha:"e8417696ee8ab62bac5655ccbabc94c5fd792cc2e8958a7ea0304c8fd2db0651",x:-69.958369,z:-29.695566,py:0.0018601911619803956},
 {id:"nx-temple-terrace-0040",file:"work_1667_terrace.glb",sha:"e8417696ee8ab62bac5655ccbabc94c5fd792cc2e8958a7ea0304c8fd2db0651",x:-57.357928,z:-49.860486,py:-0.02292796769374645},
 {id:"nx-temple-terrace-0049",file:"work_1680_terrace.glb",sha:"e8417696ee8ab62bac5655ccbabc94c5fd792cc2e8958a7ea0304c8fd2db0651",x:-39.142894,z:-65.144715,py:-0.036608129304793915},
 {id:"nx-temple-terrace-0039",file:"work_1693_terrace.glb",sha:"e8417696ee8ab62bac5655ccbabc94c5fd792cc2e8958a7ea0304c8fd2db0651",x:-17.09628,z:-74.052125,py:-0.03480033700286841},
 {id:"nx-temple-labyrinth-0004",file:"work_1684_labyrinth.glb",sha:"6ecff24946390a7d367a485dbbe9ea48fc82892c0ee5347a507d015728014864",x:-95.088981,z:-23.708346,py:0.0025339289569975775},
 {id:"nx-temple-labyrinth-0025",file:"work_1645_labyrinth.glb",sha:"3273205286ab16bb55c537b05713001c6fc9d0c0ef4da48f9f0175f1ad606820",x:-79.283665,z:-57.602955,py:-0.016928827472115132},
 {id:"nx-temple-labyrinth-0038",file:"work_1658_labyrinth.glb",sha:"2d3d2032d3e806f8ff57b8c907730227c798809c321388171435947051cd7b70",x:-51.932088,z:-83.108713,py:-0.019688843285594615},
 {id:"nx-temple-labyrinth-0051",file:"work_1671_labyrinth.glb",sha:"d93deb842f9998da905a9d8f21ea4715f2c48e1b4460fd4e73b38321bb7a2973",x:-17.017521,z:-96.51116,py:-0.01475532431470361},
 {id:"nx-temple-seed-0003",file:"work_1644_seed.glb",sha:"710ec3e5c66a0378c08eea518a597c43445ae3f15dd6249dfd5c26b41a534425",x:-68.890997,z:-17.176455,py:-0.006158492639495652},
 {id:"nx-temple-seed-0013",file:"work_1657_seed.glb",sha:"710ec3e5c66a0378c08eea518a597c43445ae3f15dd6249dfd5c26b41a534425",x:-60.211415,z:-37.624268,py:-0.016528677980768906},
 {id:"nx-temple-seed-0021",file:"work_1670_seed.glb",sha:"710ec3e5c66a0378c08eea518a597c43445ae3f15dd6249dfd5c26b41a534425",x:-45.63792,z:-54.389155,py:-0.05444576041354715},
 {id:"nx-temple-seed-0034",file:"work_1683_seed.glb",sha:"710ec3e5c66a0378c08eea518a597c43445ae3f15dd6249dfd5c26b41a534425",x:-26.597068,z:-65.830054,py:-0.04801350921268022},
];
let n=92;
for(const s of SLOTS){
  const bytes=new Uint8Array(readFileSync(`${ROOT}/agents/arthur/mason/glb-retex/${s.file}`));
  const sha=createHash("sha256").update(bytes).digest("hex");
  if(sha!==s.sha)throw Error(`${s.id} hash drift: ${sha}`);
  const want={lib:`store/${s.sha.slice(0,16)}.glb`,pos:[s.x,s.py,s.z],yaw:YAW,scale:1};
  const before=await geom();const existing=before[s.id];
  if(existing&&!(e=>e&&e.lib===want.lib&&e.pos.every((nn:number,i:number)=>near(nn,want.pos[i]))&&near(e.yaw??0,YAW)&&e.scale===1)(existing))throw Error(`${s.id} id collision/drift`);
  const cc=Math.cos(YAW),ss=Math.sin(YAW);
  const dims=accBounds(`${ROOT}/agents/arthur/mason/glb-retex/${s.file}`);
  let inner=Infinity,outer=0;
  for(const[lx,lz]of[[-dims.w/2,-dims.d/2],[dims.w/2,-dims.d/2],[dims.w/2,dims.d/2],[-dims.w/2,dims.d/2]]){const wx=s.x+lx*cc+lz*ss,wz=s.z-lx*ss+lz*cc,r=Math.hypot(wx,wz);inner=Math.min(inner,r);outer=Math.max(outer,r)}
  if(inner<66||outer>108)throw Error(`${s.id} rim law violated inner=${inner} outer=${outer}`);
  let minGap=Infinity,minAgainst="";
  for(const e of Object.values(before).filter((e:any)=>e.bbox&&e.id!==s.id)){const g=gap(O(s.x,s.z,YAW,dims.w,dims.d),EO(e));if(g<minGap){minGap=g;minAgainst=e.id}if(g<-.001)throw Error(`${s.id} footprint overlaps ${e.id}: ${g}`)}
  if(!existing){
    const u=new URL(`${base}/upload`);u.searchParams.set("token",cfg.agentToken);u.searchParams.set("name",`commons-next sw ${s.id} nvp-${n}`);u.searchParams.set("by",cfg.id);
    let lib="";for(let a=1;a<=5;a++){const r=await fetch(u,{method:"POST",body:bytes});if(r.ok){lib=(await r.json()).path;break}if(r.status===429&&a<5){await new Promise(q=>setTimeout(q,25_000));continue}throw Error(`${s.id} upload ${r.status}`)}
    if(lib!==want.lib)throw Error(`${s.id} upload path ${lib}`);
    await new Promise<void>((resolve,reject)=>{const ws=new WebSocket(cfg.url);let sent=false;const timer=setTimeout(()=>reject(Error("verb timeout")),45_000);
      ws.onopen=()=>ws.send(JSON.stringify({type:"join",world:WORLD,id:`arthur-nvp${n}-place`,avatar:cfg.avatar,token:cfg.joinToken}));
      ws.onerror=()=>reject(Error("websocket error"));
      ws.onmessage=(ev:any)=>{const x=JSON.parse(ev.data);if(x.type==="error")reject(Error(`server ${x.error}`));else if(x.type==="snapshot"){if(!sent){sent=true;ws.send(JSON.stringify({type:"verb",verb:"spawn",args:{id:s.id,lib:want.lib,pos:want.pos,yaw:YAW,scale:1}}));setTimeout(()=>{clearTimeout(timer);ws.close();resolve()},1600)}}}});
    await new Promise(q=>setTimeout(q,400));
  } else console.log(`${s.id} already live — no verbs`);
  const after=await geom(),e=after[s.id];
  if(!e||e.lib!==want.lib||!e.pos.every((nn:number,i:number)=>near(nn,want.pos[i]))||!near(e.yaw??0,YAW)||e.scale!==1)throw Error(`${s.id} post-place tuple failed`);
  console.log(JSON.stringify({n:`nvp-${n}`,id:s.id,status:"PLACED_VERIFIED",rim:{inner:+inner.toFixed(4),outer:+outer.toFixed(4)},minGap:+minGap.toFixed(4),minAgainst}));
  n++;
}
console.log("SW CONTEMPLATIVE BATCH COMPLETE");
