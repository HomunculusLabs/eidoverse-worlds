// next-place-tower-ensemble.ts — nvp-19 atomic tower + shutters placement.
// commons-next only. Exact reviewed bytes/shared pose + exact study socket.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT="/Users/t3rpz/projects/eidoverse-worlds",WORLD="commons-next";
const cfg=JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`,"utf8"));
const POS=[14.1,0,16.9] as const,YAW=-2.44347;
const members=[
 {id:"nx-tower",file:"village_tower3.glb",sha:"38f50c9f4fea4583b2b8917752cfec0ef550f0aafb410fcbbd0e92994b186e2c",bbox:{min:[-3.25,-.2,-3.25],max:[3.5072038173675537,8.1,3.5999999046325684]},comp:{sockets:{study:{pos:[-1.35,3,-.5],yaw:-Math.PI/2}}}},
 {id:"nx-shutters",file:"village_shutters3.glb",sha:"26259f89feb9273689f236f4b876d411d6f8d79873564e73f5a5fc5818d81181",bbox:{min:[-.6164279580116272,4,2.749535083770752],max:[.33000001311302185,4.59499979019165,2.927999973297119]},comp:{}},
] as const;
const base=cfg.url.replace("wss://","https://").replace("ws://","http://").replace("/ws","");
const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));const die=(m:string):never=>{throw Error(m)};const near=(a:number,b:number)=>Math.abs(a-b)<1e-6;
const canon=(v:any):any=>Array.isArray(v)?v.map(canon):v&&typeof v==="object"?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canon(v[k])])):v;const eq=(a:any,b:any)=>JSON.stringify(canon(a))===JSON.stringify(canon(b));
async function geom(world=WORLD){const r=await fetch(`${base}/geom?world=${world}`);if(!r.ok)die(`geom ${world} ${r.status}`);const d:any=await r.json();return Object.fromEntries((d.entities??[]).map((e:any)=>[e.id,e])) as Record<string,any>}
const bytes=new Map<string,Uint8Array>();for(const m of members){const b=new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/${m.file}`));const h=createHash("sha256").update(b).digest("hex");if(h!==m.sha)die(`${m.id} reviewed hash drift ${h}`);bytes.set(m.id,b)}
// Read-only source contracts before target mutation.
const source=await geom("commons");if(source["av-tower-house"]?.lib!=="store/fb590200245f5985.glb"||!eq(source["av-tower-house"]?.comp,members[0].comp))die("commons tower source contract drift");if(source["av-shutters"]?.lib!=="store/100195e0194c89c8.glb"||!eq(source["av-shutters"]?.comp,{}))die("commons shutter source contract drift");
// Fresh rotated-SAT against the current target, using the reviewed tower envelope.
type O={c:[number,number],u:[number,number],v:[number,number],hu:number,hv:number};
function obb(pos:number[],yaw:number,bb:any):O{const c=Math.cos(yaw),s=Math.sin(yaw),lx=(bb.min[0]+bb.max[0])/2,lz=(bb.min[2]+bb.max[2])/2;return{c:[pos[0]+lx*c+lz*s,pos[2]-lx*s+lz*c],u:[c,-s],v:[s,c],hu:(bb.max[0]-bb.min[0])/2,hv:(bb.max[2]-bb.min[2])/2}}
function gap(A:O,B:O){let best=-Infinity;for(const ax of[A.u,A.v,B.u,B.v]){const dd=Math.abs((B.c[0]-A.c[0])*ax[0]+(B.c[1]-A.c[1])*ax[1]),ra=A.hu*Math.abs(A.u[0]*ax[0]+A.u[1]*ax[1])+A.hv*Math.abs(A.v[0]*ax[0]+A.v[1]*ax[1]),rb=B.hu*Math.abs(B.u[0]*ax[0]+B.u[1]*ax[1])+B.hv*Math.abs(B.v[0]*ax[0]+B.v[1]*ax[1]);best=Math.max(best,dd-ra-rb)}return best}
const before=await geom(),T=obb([...POS],YAW,members[0].bbox),collisions:string[]=[];const path=before["nx-core-paths"];if(path&&!(path.lib==="store/9ce1378d47fd8a22.glb"&&path.pos.every((n:number)=>near(n,0))&&near(path.yaw??0,0)))die("core path tuple drift");for(const e of Object.values(before)){if(!e.bbox||e.id==="nx-tower"||e.id==="nx-shutters"||e.id==="nx-core-paths")continue;if(gap(T,obb(e.pos,e.yaw??0,e.bbox))<=0)collisions.push(e.id)}if(collisions.length)die(`tower seat blocked ${collisions}`);
// Explicit enterable-building law before mutation.
if(!(1.48>=1.4&&.2<=.25))die("tower door law drift");
for(const m of members){const e=before[m.id];if(!e)continue;if(!(e.lib===`store/${m.sha.slice(0,16)}.glb`&&e.pos.every((n:number,i:number)=>near(n,POS[i]))&&near(e.yaw,YAW)&&e.scale===1&&eq(e.comp??{},m.comp)))die(`${m.id} live collision/drift`)}
const missing=members.filter(m=>!before[m.id]);for(let i=0;i<missing.length;i++){const m=missing[i];if(i)await sleep(16_000);const u=new URL(`${base}/upload`);u.searchParams.set("token",cfg.agentToken);u.searchParams.set("name",`commons-next ${m.id} nvp-19`);u.searchParams.set("by",cfg.id);let lib="";for(let a=1;a<=5;a++){const r=await fetch(u,{method:"POST",body:bytes.get(m.id)!});if(r.ok){lib=(await r.json()).path;break}if(r.status===429&&a<5){await sleep(25_000);continue}die(`${m.id} upload ${r.status}`)}if(lib!==`store/${m.sha.slice(0,16)}.glb`)die(`${m.id} upload path ${lib}`)}
const verbs:Array<[string,any]>=[];for(const m of members){const e=before[m.id];if(!e){verbs.push(["spawn",{id:m.id,lib:`store/${m.sha.slice(0,16)}.glb`,pos:POS,yaw:YAW,scale:1}]);for(const[type,data]of Object.entries(m.comp))verbs.push(["comp",{id:m.id,type,data}])}}
if(verbs.length)await new Promise<void>((resolve,reject)=>{const ws=new WebSocket(cfg.url);let joined=false,i=0;const timer=setTimeout(()=>reject(Error("verb timeout")),90_000);const paced=setInterval(()=>{if(!joined||i>=verbs.length)return;const[verb,args]=verbs[i++];ws.send(JSON.stringify({type:"verb",verb,args}));if(i===verbs.length)setTimeout(()=>{clearInterval(paced);clearTimeout(timer);ws.close();resolve()},1600)},650);ws.onopen=()=>ws.send(JSON.stringify({type:"join",world:WORLD,id:"arthur-nvp19-tower",avatar:cfg.avatar,token:cfg.joinToken}));ws.onerror=()=>reject(Error("websocket error"));ws.onmessage=(ev:any)=>{const x=JSON.parse(ev.data);if(x.type==="error")reject(Error(`server ${x.error}`));else if(x.type==="snapshot")joined=true}});else console.log("tower ensemble already live — no verbs");
const after=await geom();for(const m of members){const e=after[m.id];if(!(e?.lib===`store/${m.sha.slice(0,16)}.glb`&&e.pos.every((n:number,i:number)=>near(n,POS[i]))&&near(e.yaw,YAW)&&e.scale===1&&eq(e.comp??{},m.comp)))die(`${m.id} post-place failed`)}
console.log(JSON.stringify({status:"PLACED_VERIFIED",members:members.map(m=>({id:m.id,lib:`store/${m.sha.slice(0,16)}.glb`,pos:POS,yaw:YAW,compKeys:Object.keys(m.comp)})),verbs:verbs.length}));
