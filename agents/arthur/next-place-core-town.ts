// next-place-core-town.ts — nvp-109..133: village core town build-out (25 works), fail-closed.
// Adapted from old commons' proven compass layout to commons-next core (flatRadius 24 terrain
// is gentle; heightAt baked per-slot). Structures are eye-checked housekit/v3 GLBs from the
// commons lane. NOTE: belltower/market/monument slots adjusted to dodge existing nx-court,
// nx-forge, nx-cistern, nx-signs, carousel at their old-commons positions.
import {readFileSync}from"node:fs";import{createHash}from"node:crypto";
const ROOT="/Users/t3rpz/projects/eidoverse-worlds",WORLD="commons-next",ASSETS=`${ROOT}/agents/arthur/assets`;
const cfg=JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`,"utf8")),
base=cfg.url.replace("wss://","https://").replace("ws://","http://").replace("/ws","");
const near=(a:number,b:number)=>Math.abs(a-b)<1e-6;
async function geom(){const r=await fetch(`${base}/geom?world=${WORLD}`);if(!r.ok)throw Error(`geom ${r.status}`);const d:any=await r.json();return Object.fromEntries((d.entities??[]).map((e:any)=>[e.id,e])) as Record<string,any>}
type O={c:[number,number],u:[number,number],v:[number,number],hu:number,hv:number};
function O(x:number,z:number,y:number,w:number,d:number):O{const c=Math.cos(y),s=Math.sin(y);return{c:[x,z],u:[c,-s],v:[s,c],hu:w/2,hv:d/2}}
function EO(e:any){const b=e.bbox,y=e.yaw??0,c=Math.cos(y),s=Math.sin(y),x=(b.min[0]+b.max[0])/2,z=(b.min[2]+b.max[2])/2;return O(e.pos[0]+x*c+z*s,e.pos[2]-x*s+z*c,y,b.max[0]-b.min[0],b.max[2]-b.min[2])}
function gap(A:O,B:O){let best=-Infinity;for(const x of[A.u,A.v,B.u,B.v]){const dd=Math.abs((B.c[0]-A.c[0])*x[0]+(B.c[1]-A.c[1])*x[1]),ra=A.hu*Math.abs(A.u[0]*x[0]+A.u[1]*x[1])+A.hv*Math.abs(A.v[0]*x[0]+A.v[1]*x[1]),rb=B.hu*Math.abs(B.u[0]*x[0]+B.u[1]*x[1])+B.hv*Math.abs(B.v[0]*x[0]+B.v[1]*x[1]);best=Math.max(best,dd-ra-rb)}return best}
function accBounds(path:string){const b=readFileSync(path);const jl=b.readUInt32LE(12);const j=JSON.parse(b.subarray(20,20+jl).toString());const mn=[Infinity,Infinity,Infinity],mx=[-Infinity,-Infinity,-Infinity];for(const a of j.accessors??[])if(a.type==="VEC3"&&a.min)for(let k=0;k<3;k++){mn[k]=Math.min(mn[k],a.min[k]);mx[k]=Math.max(mx[k],a.max[k])}return{w:mx[0]-mn[0],d:mx[2]-mn[2]}}
// id, file, x, z, yaw, py (live heightAt, filled after preflight)
const SLOTS=[
 {id:"nx-town-mapboard",py:0,file:"village_mapboard3.glb",x:2.5,z:9.5,yaw:-2.9441970937399127,py:0},
 {id:"nx-town-market",py:0,file:"village_market3.glb",x:-6.5,z:6.5,yaw:2.356194490192345,py:0},
 {id:"nx-town-monument",py:0,file:"village_monument3.glb",x:-7.0,z:-7.0,yaw:0.7853981633974483,py:0},
 {id:"nx-town-hall",py:-0.0073017243722169846,file:"village_hall3.glb",x:9.0,z:-26.0,yaw:-0.31322457341772525,py:0},
 {id:"nx-town-longhouse",py:-0.004691321323379385,file:"village_longhouse3.glb",x:9.0,z:26.0,yaw:-2.828368080172068,py:0},
 {id:"nx-town-tower-house",py:0.0010242758615824183,file:"village_tower_house.glb",x:-9.0,z:26.0,yaw:2.828368080172068,py:0},
 {id:"nx-town-bunkhouse",py:-0.00787917887867989,file:"village_bunkhouse.glb",x:-9.0,z:-26.0,yaw:0.31322457341772525,py:0},
 {id:"nx-town-row-cottage",py:-0.0105778683937401,file:"village_row3.glb",x:-23.0,z:-17.0,yaw:0.9411511441487406,py:0},
 {id:"nx-town-garden-cottage",py:0.0009494488404761625,file:"village_garden_cottage.glb",x:-26.0,z:19.0,yaw:2.2004415094410525},
 {id:"nx-town-inn",py:-0.048584049090346276,file:"village_inn3.glb",x:36.0,z:0,yaw:-1.5707963267948966,py:0},
 {id:"nx-town-stable",py:-0.03618087206642612,file:"village_stable3.glb",x:43.0,z:0,yaw:-1.5707963267948966,py:0},
 {id:"nx-town-windmill",py:-0.030958366681304847,file:"village_windmill3.glb",x:-40.0,z:0,yaw:1.5707963267948966,py:0},
 {id:"nx-town-woodyard",py:-0.033380972749047395,file:"village_woodyard3.glb",x:16.0,z:31.0,yaw:-2.669815142409043,py:0},
 {id:"nx-town-kiln",py:-0.03849003398997436,file:"village_kiln3.glb",x:31.0,z:39.0,yaw:-2.4784945651581642,py:0},
 {id:"nx-town-potter",py:-0.026202526742712104,file:"village_potter3.glb",x:26.0,z:40.5,yaw:-2.5834592128922376,py:0},
 {id:"nx-town-dyehouse",py:-0.02198642607540493,file:"village_dyehouse3.glb",x:-23.0,z:-23.0,yaw:0.941,py:0},
 {id:"nx-town-shrine",py:-0.0012609260510534298,file:"village_shrine3.glb",x:-25.0,z:-4.0,yaw:1.4118119548622732,py:0},
 {id:"nx-town-belltower",py:0,file:"village_belltower3.glb",x:6.5,z:6.5,yaw:-2.356194490192345,py:0},
 {id:"nx-town-gate-n",py:0,file:"village_gate.glb",x:0,z:-19.5,yaw:0,py:0},
 {id:"nx-town-gate-s",py:0,file:"village_gate.glb",x:0,z:19.5,yaw:Math.PI,py:0},
 {id:"nx-town-gate-e",py:0,file:"village_gate.glb",x:19.5,z:0,yaw:Math.PI/2,py:0},
 {id:"nx-town-gate-w",py:0,file:"village_gate.glb",x:-19.5,z:0,yaw:-Math.PI/2,py:0},
 {id:"nx-town-roads",file:"village_roads3.glb",x:0,z:0,yaw:Math.PI,py:0},
 {id:"nx-town-streetlamps",file:"village_streetlamps3.glb",x:0,z:0,yaw:Math.PI,py:0},
];
let n=109;
for(const s of SLOTS){
  const bytes=new Uint8Array(readFileSync(`${ASSETS}/${s.file}`));
  const sha=createHash("sha256").update(bytes).digest("hex");
  const want={lib:`store/${sha.slice(0,16)}.glb`,pos:[s.x,s.py,s.z],yaw:s.yaw,scale:1};
  const before=await geom();const existing=before[s.id];
  if(existing&&!(e=>e&&e.lib===want.lib&&e.pos.every((nn:number,i:number)=>near(nn,want.pos[i]))&&near(e.yaw??0,s.yaw)&&e.scale===1)(existing))throw Error(`${s.id} id collision/drift`);
  const dims=accBounds(`${ASSETS}/${s.file}`);
  let minGap=Infinity,minAgainst="";
  const GROUND_LAYERS=new Set(["village_roads3.glb","village_streetlamps3.glb"]);
  if(GROUND_LAYERS.has(s.file))console.log(`${s.id} ground-layer: SAT skipped (walkable surface mesh)`);
  else for(const e of Object.values(before).filter((e:any)=>e.bbox&&e.id!==s.id&&(e.bbox.max[1]-e.bbox.min[1])>0.5&&!String(e.lib??"").includes("3b76b621559fa1a1")&&!String(e.lib??"").includes("e815a897c7d73373"))){const g=gap(O(s.x,s.z,s.yaw,dims.w,dims.d),EO(e));if(g<minGap){minGap=g;minAgainst=e.id}if(g<-.001)throw Error(`${s.id} footprint overlaps ${e.id}: ${g}`)}
  if(minGap<1)console.log(`WARNING ${s.id} minGap ${minGap.toFixed(2)} vs ${minAgainst}`);
  if(!existing){
    const u=new URL(`${base}/upload`);u.searchParams.set("token",cfg.agentToken);u.searchParams.set("name",`commons-next town ${s.id} nvp-${n}`);u.searchParams.set("by",cfg.id);
    let lib="";for(let a=1;a<=5;a++){const r=await fetch(u,{method:"POST",body:bytes});if(r.ok){lib=(await r.json()).path;break}if(r.status===429&&a<5){await new Promise(q=>setTimeout(q,25_000));continue}throw Error(`${s.id} upload ${r.status}`)}
    if(lib!==want.lib)throw Error(`${s.id} upload path ${lib}`);
    await new Promise<void>((resolve,reject)=>{const ws=new WebSocket(cfg.url);let sent=false;const timer=setTimeout(()=>reject(Error("verb timeout")),45_000);
      ws.onopen=()=>ws.send(JSON.stringify({type:"join",world:WORLD,id:`arthur-nvp${n}-place`,avatar:cfg.avatar,token:cfg.joinToken}));
      ws.onerror=()=>reject(Error("websocket error"));
      ws.onmessage=(ev:any)=>{const x=JSON.parse(ev.data);if(x.type==="error")reject(Error(`server ${x.error}`));else if(x.type==="snapshot"){if(!sent){sent=true;ws.send(JSON.stringify({type:"verb",verb:"spawn",args:{id:s.id,lib:want.lib,pos:want.pos,yaw:s.yaw,scale:1}}));setTimeout(()=>{clearTimeout(timer);ws.close();resolve()},1600)}}}});
    await new Promise(q=>setTimeout(q,400));
  } else console.log(`${s.id} already live — no verbs`);
  const after=await geom(),e=after[s.id];
  if(!e||e.lib!==want.lib||!e.pos.every((nn:number,i:number)=>near(nn,want.pos[i]))||!near(e.yaw??0,s.yaw)||e.scale!==1)throw Error(`${s.id} post-place tuple failed`);
  console.log(JSON.stringify({n:`nvp-${n}`,id:s.id,status:"PLACED_VERIFIED",minGap:+minGap.toFixed(4),minAgainst}));
  n++;
}
console.log("CORE TOWN BUILD-OUT COMPLETE");
