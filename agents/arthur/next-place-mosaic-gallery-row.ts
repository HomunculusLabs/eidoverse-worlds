// next-place-mosaic-gallery-row.ts — nvp-105..108 ring-road mosaic gallery row (4 works), fail-closed.
// BILL-APPROVED exception to the [66,108] ring law: mosaics seat at r=45 along the ring road,
// 60° apart at 30/90/150/210°, as a walkable outdoor gallery. All other chassis laws hold:
// hash gate, SAT vs live bbox geometry, tuple verify, idempotent rerun.
// Mosaic squares are 21m; at r=45 their outer edge reaches r≈55.4 (inside flatRadius-adjacent
// clear zone, outside all ring-band works). Mosaics carry NO comps.
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
 {id:"nx-gallery-mosaic-0036",file:"work_1643_mosaic.glb",sha:"1655ae806c3b8fe3b4275e8646c1f3a5c8f82c666fac36b248ffd22d887af42e",x:38.971143,z:22.5,py:-0.023302546381834918},
 {id:"nx-gallery-mosaic-0048",file:"work_1656_mosaic.glb",sha:"b6491515b25ef43928f22b3bd5348bd57bce8123bdae731078c02d16442c0aea",x:0,z:45,py:0.0015747037783233253},
 {id:"nx-gallery-mosaic-0052",file:"work_1669_mosaic.glb",sha:"83c4817f735074937430d38e42042fd8245cbfb4242f141ac780184b0bd87d7c",x:-38.971143,z:22.5,py:0.012803620215344794},
 {id:"nx-gallery-mosaic-0059",file:"work_1682_mosaic.glb",sha:"505bec0b589f786fe099c17aac3df14dd9e5154c18468c99e5dbd2cb332b3735",x:-38.971143,z:-22.5,py:-0.04073522899392348},
];
let n=105;
for(const s of SLOTS){
  const bytes=new Uint8Array(readFileSync(`${ROOT}/agents/arthur/mason/glb-retex/${s.file}`));
  const sha=createHash("sha256").update(bytes).digest("hex");
  if(sha!==s.sha)throw Error(`${s.id} hash drift: ${sha}`);
  const want={lib:`store/${s.sha.slice(0,16)}.glb`,pos:[s.x,s.py,s.z],yaw:YAW,scale:1};
  const before=await geom();const existing=before[s.id];
  if(existing&&!(e=>e&&e.lib===want.lib&&e.pos.every((nn:number,i:number)=>near(nn,want.pos[i]))&&near(e.yaw??0,YAW)&&e.scale===1)(existing))throw Error(`${s.id} id collision/drift`);
  const dims=accBounds(`${ROOT}/agents/arthur/mason/glb-retex/${s.file}`);
  let minGap=Infinity,minAgainst="";
  for(const e of Object.values(before).filter((e:any)=>e.bbox&&e.id!==s.id)){const g=gap(O(s.x,s.z,YAW,dims.w,dims.d),EO(e));if(g<minGap){minGap=g;minAgainst=e.id}if(g<-.001)throw Error(`${s.id} footprint overlaps ${e.id}: ${g}`)}
  if(minGap<2)console.log(`WARNING ${s.id} minGap ${minGap.toFixed(2)} vs ${minAgainst}`);
  if(!existing){
    const u=new URL(`${base}/upload`);u.searchParams.set("token",cfg.agentToken);u.searchParams.set("name",`commons-next gallery ${s.id} nvp-${n}`);u.searchParams.set("by",cfg.id);
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
  console.log(JSON.stringify({n:`nvp-${n}`,id:s.id,status:"PLACED_VERIFIED",minGap:+minGap.toFixed(4),minAgainst}));
  n++;
}
console.log("MOSAIC GALLERY ROW COMPLETE — VILLAGE 60/60");
