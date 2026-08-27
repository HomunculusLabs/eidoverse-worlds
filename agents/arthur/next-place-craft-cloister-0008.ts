// next-place-craft-cloister-0008.ts — nvp-66 exact reviewed placement.
// commons-next only; fail-closed hash/tuple/SAT/rim gates. No comps contract
// (review found no comp targets in the model). No GUI dependency.
import {readFileSync}from"node:fs";import{createHash}from"node:crypto";
const ROOT="/Users/t3rpz/projects/eidoverse-worlds",WORLD="commons-next",ID="nx-craft-cloister-0008",
SHA="c6014616c233ac01a8114f14219652e4f908f719111a939dfd87b27f0af5fce9",
PX=94.154595,PY=-0.028291539908999647,PZ=30.592682,YAW=-0.785398163,
BW=11.4,BD=11.4;
const cfg=JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`,"utf8")),
base=cfg.url.replace("wss://","https://").replace("ws://","http://").replace("/ws","");
const bytes=new Uint8Array(readFileSync(`${ROOT}/agents/arthur/mason/glb-retex/work_1688_cloister.glb`));
const die=(m:string):never=>{throw Error(m)},near=(a:number,b:number)=>Math.abs(a-b)<1e-6;
if(createHash("sha256").update(bytes).digest("hex")!==SHA)die("reviewed GLB hash drift");
async function geom(){const r=await fetch(`${base}/geom?world=${WORLD}`);if(!r.ok)die(`geom ${r.status}`);const d:any=await r.json();return Object.fromEntries((d.entities??[]).map((e:any)=>[e.id,e])) as Record<string,any>}
type O={c:[number,number],u:[number,number],v:[number,number],hu:number,hv:number};
function O(x:number,z:number,y:number,w:number,d:number):O{const c=Math.cos(y),s=Math.sin(y);return{c:[x,z],u:[c,-s],v:[s,c],hu:w/2,hv:d/2}}
function EO(e:any){const b=e.bbox,y=e.yaw??0,c=Math.cos(y),s=Math.sin(y),x=(b.min[0]+b.max[0])/2,z=(b.min[2]+b.max[2])/2;return O(e.pos[0]+x*c+z*s,e.pos[2]-x*s+z*c,y,b.max[0]-b.min[0],b.max[2]-b.min[2])}
function gap(A:O,B:O){let best=-Infinity;for(const x of[A.u,A.v,B.u,B.v]){const dd=Math.abs((B.c[0]-A.c[0])*x[0]+(B.c[1]-A.c[1])*x[1]),ra=A.hu*Math.abs(A.u[0]*x[0]+A.u[1]*x[1])+A.hv*Math.abs(A.v[0]*x[0]+A.v[1]*x[1]),rb=B.hu*Math.abs(B.u[0]*x[0]+B.u[1]*x[1])+B.hv*Math.abs(B.v[0]*x[0]+B.v[1]*x[1]);best=Math.max(best,dd-ra-rb)}return best}
const want={lib:`store/${SHA.slice(0,16)}.glb`,pos:[PX,PY,PZ],yaw:YAW,scale:1};
const tupleOK=(e:any)=>!!e&&e.lib===want.lib&&e.pos.every((n:number,i:number)=>near(n,want.pos[i]))&&near(e.yaw??0,YAW)&&e.scale===1;
const before=await geom(),existing=before[ID];
if(existing&&!(e=>e&&e.lib===want.lib&&e.pos.every((n:number,i:number)=>near(n,want.pos[i]))&&near(e.yaw??0,YAW)&&e.scale===1)(existing))die(`${ID} id collision/drift`);
const cc=Math.cos(YAW),ss=Math.sin(YAW);
let inner=Infinity,outer=0;
for(const[lx,lz]of[[-BW/2,-BD/2],[BW/2,-BD/2],[BW/2,BD/2],[-BW/2,BD/2]]){const wx=PX+lx*cc+lz*ss,wz=PZ-lx*ss+lz*cc,r=Math.hypot(wx,wz);inner=Math.min(inner,r);outer=Math.max(outer,r)}
if(inner<66||outer>108)die(`rim law violated inner=${inner} outer=${outer}`);
let minGap=Infinity,minAgainst="";
for(const e of Object.values(before).filter((e:any)=>e.bbox&&e.id!==ID)){const g=gap(O(PX,PZ,YAW,BW,BD),EO(e));if(g<minGap){minGap=g;minAgainst=e.id}if(g<-.001)die(`footprint overlaps ${e.id}: ${g}`)}
console.log(JSON.stringify({stage:"preflight",rim:{inner:+inner.toFixed(6),outer:+outer.toFixed(6)},minGap:+minGap.toFixed(6),minAgainst}));
const spawned=!existing;
if(!existing){
  const u=new URL(`${base}/upload`);u.searchParams.set("token",cfg.agentToken);u.searchParams.set("name","commons-next craft cloister 0008 nvp-66");u.searchParams.set("by",cfg.id);
  let lib="";for(let a=1;a<=5;a++){const r=await fetch(u,{method:"POST",body:bytes});if(r.ok){lib=(await r.json()).path;break}if(r.status===429&&a<5){await new Promise(q=>setTimeout(q,25_000));continue}die(`upload ${r.status}`)}
  if(lib!==want.lib)die(`upload path ${lib}`);
  await new Promise<void>((resolve,reject)=>{const ws=new WebSocket(cfg.url);let joined=false,sent=false;const timer=setTimeout(()=>reject(Error("verb timeout")),45_000);
    ws.onopen=()=>ws.send(JSON.stringify({type:"join",world:WORLD,id:"arthur-nvp66-cloister08",avatar:cfg.avatar,token:cfg.joinToken}));
    ws.onerror=()=>reject(Error("websocket error"));
    ws.onmessage=(ev:any)=>{const x=JSON.parse(ev.data);if(x.type==="error")reject(Error(`server ${x.error}`));else if(x.type==="snapshot"){joined=true;if(!sent){sent=true;ws.send(JSON.stringify({type:"verb",verb:"spawn",args:{id:ID,lib,pos:[PX,PY,PZ],yaw:YAW,scale:1}}));setTimeout(()=>{clearTimeout(timer);ws.close();resolve()},1600)}}}});
}else console.log("cloister 0008 already live — no verbs");
const after=await geom(),e=after[ID];
if(!tupleOK(e))die("post-place tuple failed");
console.log(JSON.stringify({status:"PLACED_VERIFIED",id:ID,lib:e.lib,pos:e.pos,yaw:e.yaw,scale:e.scale,bboxSize:e.bbox.size,compKeys:e.compKeys,verbs:existing?0:1}));
