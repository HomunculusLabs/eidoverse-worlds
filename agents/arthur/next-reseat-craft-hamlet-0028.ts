// next-reseat-craft-hamlet-0028.ts — improve-25 reseat (family cure rollout,
// improve-22/23/24 proven at 0007/0015). Replaces the live corrupt lib
// 032b6e24 with the fixed build 44d78463 at the SAME tuple/comp contract.
// Fail-closed: hash gate, disputed-bytes gate (any lib other than old-pin or
// new-pin dies), fresh-census rim/SAT preflight, remove+spawn (spawn alone
// does NOT move a standing entity), MANDATORY embers comp re-apply (re-place
// wipes comps), post-place tuple verify. Idempotent: entity already at new
// lib + tuple + comp => zero verbs.
import {readFileSync}from"node:fs";import{createHash}from"node:crypto";
const ROOT="/Users/t3rpz/projects/eidoverse-worlds",WORLD="commons-next",ID="nx-craft-hamlet-0028",
SHA="44d7846302be80a82996564dddb2ae79eab8e820618ea798c65a4d772aab7a48",
OLD_LIB="store/032b6e24f4c4a142.glb",
PX=65.396745,PY=0.0016023565750081304,PZ=58.883493,YAW=-2.35619449,
BW=13.987,BD=13.423;
// comp contract bound by nvp-62 review; firepit not among the 8 corrupted box()
// sites, so the local anchor is unchanged by the fix (all 5 hamlets carry it
// live, census-fresh this tick).
const COMP={particles:{preset:"embers",origin:[2.2,0.35,1.2],count:40,size:0.25,speed:0.4}};
const cfg=JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`,"utf8")),
base=cfg.url.replace("wss://","https://").replace("ws://","http://").replace("/ws","");
const bytes=new Uint8Array(readFileSync(`${ROOT}/agents/arthur/mason/glb-retex/work_1648_hamlet.glb`));
const die=(m:string):never=>{throw Error(m)},near=(a:number,b:number)=>Math.abs(a-b)<1e-6;
if(createHash("sha256").update(bytes).digest("hex")!==SHA)die("build GLB hash drift vs pinned 44d78463");
const want={lib:`store/${SHA.slice(0,16)}.glb`,pos:[PX,PY,PZ],yaw:YAW,scale:1};
async function geom(){const r=await fetch(`${base}/geom?world=${WORLD}`);if(!r.ok)die(`geom ${r.status}`);const d:any=await r.json();return Object.fromEntries((d.entities??[]).map((e:any)=>[e.id,e])) as Record<string,any>}
type O={c:[number,number],u:[number,number],v:[number,number],hu:number,hv:number};
function O(x:number,z:number,y:number,w:number,d:number):O{const c=Math.cos(y),s=Math.sin(y);return{c:[x,z],u:[c,-s],v:[s,c],hu:w/2,hv:d/2}}
function EO(e:any){const b=e.bbox,y=e.yaw??0,c=Math.cos(y),s=Math.sin(y),x=(b.min[0]+b.max[0])/2,z=(b.min[2]+b.max[2])/2;return O(e.pos[0]+x*c+z*s,e.pos[2]-x*s+z*c,y,b.max[0]-b.min[0],b.max[2]-b.min[2])}
function gap(A:O,B:O){let best=-Infinity;for(const x of[A.u,A.v,B.u,B.v]){const dd=Math.abs((B.c[0]-A.c[0])*x[0]+(B.c[1]-A.c[1])*x[1]),ra=A.hu*Math.abs(A.u[0]*x[0]+A.u[1]*x[1])+A.hv*Math.abs(A.v[0]*x[0]+A.v[1]*x[1]),rb=B.hu*Math.abs(B.u[0]*x[0]+B.u[1]*x[1])+B.hv*Math.abs(B.v[0]*x[0]+B.v[1]*x[1]);best=Math.max(best,dd-ra-rb)}return best}
const compOK=(e:any)=>{const c=e.comp?.particles;return !!c&&JSON.stringify(c)===JSON.stringify(COMP.particles)};
const tupleOK=(e:any)=>!!e&&e.lib===want.lib&&e.pos.every((n:number,i:number)=>near(n,want.pos[i]))&&near(e.yaw??0,YAW)&&e.scale===1&&compOK(e);
const before=await geom(),existing=before[ID];
if(!existing)console.log(JSON.stringify({stage:"gate",note:"not live — fresh spawn path"}));
else if(existing.lib===want.lib){ if(!tupleOK(existing))die(`${ID} at new lib but tuple/comp drift`); }
else if(existing.lib!==OLD_LIB)die(`${ID} disputed bytes: live lib ${existing.lib} is neither old ${OLD_LIB} nor new ${want.lib}`);
else { const p=existing.pos; if(!p.every((n:number,i:number)=>near(n,[PX,PY,PZ][i]))||!near(existing.yaw??0,YAW))die(`${ID} old-lib tuple drift vs contract`); }
// fresh-census rim + SAT preflight (footprint x/z unchanged by the Y-slot fix: BW/BD from decode)
const cc=Math.cos(YAW),ss=Math.sin(YAW);
let inner=Infinity,outer=0;
for(const[lx,lz]of[[-BW/2,-BD/2],[BW/2,-BD/2],[BW/2,BD/2],[-BW/2,BD/2]]){const wx=PX+lx*cc+lz*ss,wz=PZ-lx*ss+lz*cc,r=Math.hypot(wx,wz);inner=Math.min(inner,r);outer=Math.max(outer,r)}
if(inner<66||outer>108)die(`rim law violated inner=${inner} outer=${outer}`);
let minGap=Infinity,minAgainst="";
for(const e of Object.values(before).filter((e:any)=>e.bbox&&e.id!==ID)){const g=gap(O(PX,PZ,YAW,BW,BD),EO(e));if(g<minGap){minGap=g;minAgainst=e.id}if(g<-.001)die(`footprint overlaps ${e.id}: ${g}`)}
console.log(JSON.stringify({stage:"preflight",liveLib:existing?.lib??null,rim:{inner:+inner.toFixed(6),outer:+outer.toFixed(6)},minGap:+minGap.toFixed(6),minAgainst}));
if(existing&&existing.lib===want.lib){console.log(JSON.stringify({status:"ALREADY_SEATED",id:ID,verbs:0,embersRestored:compOK(existing)}));process.exit(0)}
// upload fixed bytes (shared 4/min/IP budget: 25s backoff on 429)
const u=new URL(`${base}/upload`);u.searchParams.set("token",cfg.agentToken);u.searchParams.set("name","commons-next craft hamlet 0028 improve-25");u.searchParams.set("by",cfg.id);
let lib="";for(let a=1;a<=5;a++){const r=await fetch(u,{method:"POST",body:bytes});if(r.ok){lib=(await r.json()).path;break}if(r.status===429&&a<5){await new Promise(q=>setTimeout(q,25_000));continue}die(`upload ${r.status}`)}
if(lib!==want.lib)die(`upload path ${lib}`);
console.log(JSON.stringify({stage:"uploaded",lib}));
// remove+spawn over one join (server sends ONE snapshot per join — schedule all verbs by timer)
await new Promise<void>((resolve,reject)=>{const ws=new WebSocket(cfg.url);let sent=false;const timer=setTimeout(()=>reject(Error("verb timeout")),45_000);
  ws.onopen=()=>ws.send(JSON.stringify({type:"join",world:WORLD,id:"arthur-improve25-hamlet28",avatar:cfg.avatar,token:cfg.joinToken}));
  ws.onerror=()=>reject(Error("websocket error"));
  ws.onmessage=(ev:any)=>{const x=JSON.parse(ev.data);if(x.type==="error")reject(Error(`server ${x.error}`));else if(x.type==="snapshot"&&!sent){sent=true;
    if(existing)ws.send(JSON.stringify({type:"verb",verb:"remove",args:{id:ID}}));
    setTimeout(()=>ws.send(JSON.stringify({type:"verb",verb:"spawn",args:{id:ID,lib:want.lib,pos:[PX,PY,PZ],yaw:YAW,scale:1}})),800);
    setTimeout(()=>{clearTimeout(timer);ws.close();resolve()},2400)}};
});
// MANDATORY embers comp re-apply (re-place wipes comps)
await new Promise<void>((resolve,reject)=>{const ws=new WebSocket(cfg.url);let sent=false;const timer=setTimeout(()=>reject(Error("comp verb timeout")),45_000);
  ws.onopen=()=>ws.send(JSON.stringify({type:"join",world:WORLD,id:"arthur-improve25-hamlet28c",avatar:cfg.avatar,token:cfg.joinToken}));
  ws.onerror=()=>reject(Error("websocket error"));
  ws.onmessage=(ev:any)=>{const x=JSON.parse(ev.data);if(x.type==="error")reject(Error(`server ${x.error}`));else if(x.type==="snapshot"&&!sent){sent=true;ws.send(JSON.stringify({type:"verb",verb:"comp",args:{id:ID,type:"particles",data:COMP.particles}}));setTimeout(()=>{clearTimeout(timer);ws.close();resolve()},1600)}};
});
const after=await geom(),e=after[ID];
if(!tupleOK(e))die(`post-place tuple failed: ${JSON.stringify({lib:e?.lib,pos:e?.pos,yaw:e?.yaw,comp:e?.comp})}`);
console.log(JSON.stringify({status:"PLACED_VERIFIED",id:ID,lib:e.lib,pos:e.pos,yaw:e.yaw,scale:e.scale,bboxSize:e.bbox?.size,embersRestored:compOK(e),verbs:existing?3:2}));
