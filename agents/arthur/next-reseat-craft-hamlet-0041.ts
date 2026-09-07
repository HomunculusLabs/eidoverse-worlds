// next-reseat-craft-hamlet-0041.ts — improve-26 reseat (family cure rollout,
// improve-22/23/24/25 proven at 0007/0015/0028). Replaces the live corrupt lib
// 473f671c with the fixed build caa851af at the SAME tuple/comp contract.
// Fail-closed: hash gate, disputed-bytes gate (any lib other than old-pin or
// new-pin dies), fresh-census rim/SAT preflight, remove+spawn (spawn alone
// does NOT move a standing entity), MANDATORY embers comp re-apply (re-place
// wipes comps), post-place tuple verify. Idempotent: entity already at new
// lib + tuple + comp => zero verbs.
import {readFileSync}from"node:fs";import{createHash}from"node:crypto";
const ROOT="/Users/t3rpz/projects/eidoverse-worlds",WORLD="commons-next",ID="nx-craft-hamlet-0041",
SHA="caa851af0330a94965b732c2c3aba21a38d339e29d9d3d75e3307bdf87f2646f",
OLD_LIB="store/473f671c274ef653.glb",
PX=46.632895,PY=-0.023892223112273604,PZ=74.628232,YAW=-2.35619449,
BW=14.011,BD=13.43;
// comp contract bound by nvp-62 review; firepit not among the 8 corrupted box()
// sites, so the local anchor is unchanged by the fix (all 5 hamlets carry it
// live, census-fresh this tick).
const COMP={particles:{preset:"embers",origin:[2.2,0.35,1.2],count:40,size:0.25,speed:0.4}};
const cfg=JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`,"utf8")),
base=cfg.url.replace("wss://","https://").replace("ws://","http://").replace("/ws","");
const bytes=new Uint8Array(readFileSync(`${ROOT}/agents/arthur/mason/glb-retex/work_1661_hamlet.glb`));
const die=(m:string):never=>{throw Error(m)},near=(a:number,b:number)=>Math.abs(a-b)<1e-6;
if(createHash("sha256").update(bytes).digest("hex")!==SHA)die("build GLB hash drift vs pinned caa851af");
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
// SAT EXEMPTION (artwalk-34/36/37 ladder, tier b — gap-bounded exact-match):
// nx-approach-ne-lane-002 blocks at square-bbox gap -0.366, but that entity is
// a NETWORK lane (one GLB = whole path + lamps, pos (0,0,0) yaw 0). Exact
// decode-vs-decode in world frame (improve26-lane-overlap.ts + independent
// python cross-check): lane solids END at x=23.95 (paver/verge stones near
// z=64.35, y 0.15); hamlet-0041 solids START at x=40.93 (cottage corner,
// y 2.62). TRUE 3D clearance 19.4815m, plan-view 19.3245m. The -0.366 square
// read is the lane's 23.3x57.2 fat bbox corner kissing the hamlet's rotated
// square — zero lane verts in the AABB overlap band. Pre-existing condition
// (footprint x/z byte-identical 14.011x13.43 to the corrupt baseline), so this
// exemption certifies BOTH pre- and post-reseat state. HARD FAIL on any OTHER
// overlap: this skips exactly one id at exactly the measured square-gap.
for(const e of Object.values(before).filter((e:any)=>e.bbox&&e.id!==ID)){const g=gap(O(PX,PZ,YAW,BW,BD),EO(e));if(g<minGap){minGap=g;minAgainst=e.id}if(g<-.001){if(e.id==="nx-approach-ne-lane-002"&&Math.abs(g-(-0.3658))<0.01){continue}die(`footprint overlaps ${e.id}: ${g}`)}}

console.log(JSON.stringify({stage:"preflight",liveLib:existing?.lib??null,rim:{inner:+inner.toFixed(6),outer:+outer.toFixed(6)},minGap:+minGap.toFixed(6),minAgainst}));
if(existing&&existing.lib===want.lib){console.log(JSON.stringify({status:"ALREADY_SEATED",id:ID,verbs:0,embersRestored:compOK(existing)}));process.exit(0)}
// upload fixed bytes (shared 4/min/IP budget: 25s backoff on 429)
const u=new URL(`${base}/upload`);u.searchParams.set("token",cfg.agentToken);u.searchParams.set("name","commons-next craft hamlet 0041 improve-26");u.searchParams.set("by",cfg.id);
let lib="";for(let a=1;a<=5;a++){const r=await fetch(u,{method:"POST",body:bytes});if(r.ok){lib=(await r.json()).path;break}if(r.status===429&&a<5){await new Promise(q=>setTimeout(q,25_000));continue}die(`upload ${r.status}`)}
if(lib!==want.lib)die(`upload path ${lib}`);
console.log(JSON.stringify({stage:"uploaded",lib}));
// remove+spawn over one join (server sends ONE snapshot per join — schedule all verbs by timer)
await new Promise<void>((resolve,reject)=>{const ws=new WebSocket(cfg.url);let sent=false;const timer=setTimeout(()=>reject(Error("verb timeout")),45_000);
  ws.onopen=()=>ws.send(JSON.stringify({type:"join",world:WORLD,id:"arthur-improve26-hamlet41",avatar:cfg.avatar,token:cfg.joinToken}));
  ws.onerror=()=>reject(Error("websocket error"));
  ws.onmessage=(ev:any)=>{const x=JSON.parse(ev.data);if(x.type==="error")reject(Error(`server ${x.error}`));else if(x.type==="snapshot"&&!sent){sent=true;
    if(existing)ws.send(JSON.stringify({type:"verb",verb:"remove",args:{id:ID}}));
    setTimeout(()=>ws.send(JSON.stringify({type:"verb",verb:"spawn",args:{id:ID,lib:want.lib,pos:[PX,PY,PZ],yaw:YAW,scale:1}})),800);
    setTimeout(()=>{clearTimeout(timer);ws.close();resolve()},2400)}};
});
// MANDATORY embers comp re-apply (re-place wipes comps)
await new Promise<void>((resolve,reject)=>{const ws=new WebSocket(cfg.url);let sent=false;const timer=setTimeout(()=>reject(Error("comp verb timeout")),45_000);
  ws.onopen=()=>ws.send(JSON.stringify({type:"join",world:WORLD,id:"arthur-improve26-hamlet41c",avatar:cfg.avatar,token:cfg.joinToken}));
  ws.onerror=()=>reject(Error("websocket error"));
  ws.onmessage=(ev:any)=>{const x=JSON.parse(ev.data);if(x.type==="error")reject(Error(`server ${x.error}`));else if(x.type==="snapshot"&&!sent){sent=true;ws.send(JSON.stringify({type:"verb",verb:"comp",args:{id:ID,type:"particles",data:COMP.particles}}));setTimeout(()=>{clearTimeout(timer);ws.close();resolve()},1600)}};
});
const after=await geom(),e=after[ID];
if(!tupleOK(e))die(`post-place tuple failed: ${JSON.stringify({lib:e?.lib,pos:e?.pos,yaw:e?.yaw,comp:e?.comp})}`);
console.log(JSON.stringify({status:"PLACED_VERIFIED",id:ID,lib:e.lib,pos:e.pos,yaw:e.yaw,scale:e.scale,bboxSize:e.bbox?.size,embersRestored:compOK(e),verbs:existing?3:2}));
