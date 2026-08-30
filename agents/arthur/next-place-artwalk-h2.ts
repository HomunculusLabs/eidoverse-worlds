// next-place-artwalk-h2.ts — artwalk-3 H-2 reversible first siting.
// Bill waived native image inspection as a blocking gate on 2026-08-30.
// Fail-closed on exact GLB hash, art-lane band, live rotated-SAT, and tuples.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT="/Users/t3rpz/projects/eidoverse-worlds", WORLD="commons-next";
const ID="nx-artwalk-h2", LIGHT_ID=`${ID}-l`;
const SHA="f14d70564a107879977dec03fd46bf83422ecb43fa451d743502d0323bb13cd0";
const PX=27, PY=-0.03516135170548859, PZ=-27, YAW=-0.7853981633974483;
const BW=3.627726912498474, BD=3.5969358086586;
const LIGHT_POS:[number,number,number]=[PX,1.1448386482945114,PZ];
const cfg=JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`,"utf8"));
const base=cfg.url.replace("wss://","https://").replace("ws://","http://").replace("/ws","");
const bytes=new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/village_artwalk_h2.glb`));
const die=(m:string):never=>{throw Error(m)}, near=(a:number,b:number)=>Math.abs(a-b)<1e-6;
if(createHash("sha256").update(bytes).digest("hex")!==SHA)die("reviewed GLB hash drift");

async function geom(){
  const r=await fetch(`${base}/geom?world=${WORLD}`);
  if(!r.ok)die(`geom ${r.status}`);
  const d:any=await r.json();
  return Object.fromEntries((d.entities??[]).map((e:any)=>[e.id,e])) as Record<string,any>;
}
type O={c:[number,number],u:[number,number],v:[number,number],hu:number,hv:number};
function O(x:number,z:number,y:number,w:number,d:number):O{const c=Math.cos(y),s=Math.sin(y);return{c:[x,z],u:[c,-s],v:[s,c],hu:w/2,hv:d/2}}
function EO(e:any){const b=e.bbox,y=e.yaw??0,c=Math.cos(y),s=Math.sin(y),x=(b.min[0]+b.max[0])/2,z=(b.min[2]+b.max[2])/2;return O(e.pos[0]+x*c+z*s,e.pos[2]-x*s+z*c,y,b.max[0]-b.min[0],b.max[2]-b.min[2])}
function gap(A:O,B:O){let best=-Infinity;for(const x of[A.u,A.v,B.u,B.v]){const dd=Math.abs((B.c[0]-A.c[0])*x[0]+(B.c[1]-A.c[1])*x[1]),ra=A.hu*Math.abs(A.u[0]*x[0]+A.u[1]*x[1])+A.hv*Math.abs(A.v[0]*x[0]+A.v[1]*x[1]),rb=B.hu*Math.abs(B.u[0]*x[0]+B.u[1]*x[1])+B.hv*Math.abs(B.v[0]*x[0]+B.v[1]*x[1]);best=Math.max(best,dd-ra-rb)}return best}
const want={lib:`store/${SHA.slice(0,16)}.glb`,pos:[PX,PY,PZ],yaw:YAW,scale:1};
const tupleOK=(e:any)=>!!e&&e.lib===want.lib&&e.pos.every((n:number,i:number)=>near(n,want.pos[i]))&&near(e.yaw??0,YAW)&&e.scale===1&&Object.keys(e.comp??{}).length===0;
const lightOK=(e:any)=>!!e&&e.kind==="light"&&e.pos.every((n:number,i:number)=>near(n,LIGHT_POS[i]));

const before=await geom(), existing=before[ID], existingLight=before[LIGHT_ID];
if(existing&&!tupleOK(existing))die(`${ID} id collision/drift`);
if(existingLight&&!lightOK(existingLight))die(`${LIGHT_ID} id collision/drift`);
if(!!existing!==!!existingLight)die("partial prior rollout: model/light presence differs");

// Art-walk provisional spoke band: every footprint corner stays within r30..45.
const cc=Math.cos(YAW),ss=Math.sin(YAW);let inner=Infinity,outer=0;
for(const[lx,lz]of[[-BW/2,-BD/2],[BW/2,-BD/2],[BW/2,BD/2],[-BW/2,BD/2]]){const wx=PX+lx*cc+lz*ss,wz=PZ-lx*ss+lz*cc,r=Math.hypot(wx,wz);inner=Math.min(inner,r);outer=Math.max(outer,r)}
if(inner<30||outer>45)die(`art-lane band violated inner=${inner} outer=${outer}`);

// Fresh rotated-SAT. Ground layers are exempt in both directions by contract.
const groundIds=new Set(["nx-core-paths","nx-town-roads"]);let minGap=Infinity,minAgainst="";
for(const e of Object.values(before).filter((e:any)=>e.bbox&&e.id!==ID)){
  const h=e.bbox.max[1]-e.bbox.min[1];if(groundIds.has(e.id)||h<=0.5)continue;
  const g=gap(O(PX,PZ,YAW,BW,BD),EO(e));if(g<minGap){minGap=g;minAgainst=e.id}if(g<-.001)die(`footprint overlaps ${e.id}: ${g}`);
}
console.log(JSON.stringify({stage:"preflight",band:{inner:+inner.toFixed(6),outer:+outer.toFixed(6)},minGap:+minGap.toFixed(6),minAgainst,nativeVisual:"waived-by-Bill"}));

if(!existing){
  const u=new URL(`${base}/upload`);u.searchParams.set("token",cfg.agentToken);u.searchParams.set("name","the golden measure — artwalk H-2");u.searchParams.set("by",cfg.id);
  let lib="";for(let a=1;a<=5;a++){const r=await fetch(u,{method:"POST",body:bytes});if(r.ok){lib=(await r.json()).path;break}if(r.status===429&&a<5){await new Promise(q=>setTimeout(q,25_000));continue}die(`upload ${r.status}`)}
  if(lib!==want.lib)die(`upload path ${lib}`);
  const verbs:[string,any][]=[
    ["spawn",{id:ID,lib,pos:[PX,PY,PZ],yaw:YAW,scale:1}],
    ["light",{id:LIGHT_ID,pos:LIGHT_POS,color:0xffc98a,intensity:1.4,range:4.5}],
  ];
  await new Promise<void>((resolve,reject)=>{const ws=new WebSocket(cfg.url);let joined=false,i=0;const timer=setTimeout(()=>reject(Error("verb timeout")),45_000);
    ws.onopen=()=>ws.send(JSON.stringify({type:"join",world:WORLD,id:"arthur-artwalk-h2-builder",avatar:cfg.avatar,token:cfg.joinToken}));
    ws.onerror=()=>reject(Error("websocket error"));
    ws.onmessage=(ev:any)=>{const x=JSON.parse(ev.data);if(x.type==="error")reject(Error(`server ${x.error}`));else if(x.type==="snapshot"&&!joined){joined=true;const paced=setInterval(()=>{if(i>=verbs.length){clearInterval(paced);setTimeout(()=>{clearTimeout(timer);ws.close();resolve()},1800);return}const[verb,args]=verbs[i++];ws.send(JSON.stringify({type:"verb",verb,args}))},700)}};
  });
}else console.log("H-2 already live — zero verbs");

const after=await geom(), e=after[ID], l=after[LIGHT_ID];
if(!tupleOK(e))die("post-place model tuple failed");
if(!lightOK(l))die("post-place light tuple failed");
console.log(JSON.stringify({status:"PLACED_VERIFIED",id:ID,lib:e.lib,pos:e.pos,yaw:e.yaw,scale:e.scale,bboxSize:e.bbox.size,compKeys:Object.keys(e.comp??{}),light:{id:LIGHT_ID,pos:l.pos},verbs:existing?0:2}));
