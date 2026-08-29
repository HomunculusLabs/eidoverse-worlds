// next-place-core-dressing.ts — nvp-133..148: village core dressing pass (16 pieces), fail-closed.
// Life and detail around the proven town skeleton: market square dressing, animal corner,
// homestead props, welcome touches. All eye-checked commons-lane GLBs. heightAt baked per-slot.
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
const SLOTS=[
 // market square dressing (by nx-town-market at -6.5,6.5)
 {id:"nx-dress-banner",py:0,file:"village_banner.glb",x:-4.0,z:9.5,yaw:2.356194490192345,py:0},
 {id:"nx-dress-stringlights",py:0,file:"village_stringlights.glb",x:-6.0,z:7.5,yaw:0.7853981633974483,py:2.6},
 {id:"nx-dress-giftshelf",py:0,file:"village_giftshelf3.glb",x:-9.0,z:9.0,yaw:2.356194490192345,py:0},
 // plaza seating + green (fountain at plaza edge)
 {id:"nx-dress-fountain",py:0,file:"village_fountain.glb",x:12.5,z:4.0,yaw:-0.7853981633974483,py:0},
 {id:"nx-dress-bench-plaza",py:0,file:"village_bench_arc.glb",x:-9.5,z:-9.5,yaw:0.7853981633974483,py:0},
 // animal corner (east, near stable at 43,0)
 {id:"nx-dress-goats",py:-0.04383438708259579,file:"village_goats3.glb",x:34.0,z:13.0,yaw:-1.2,py:0},
 {id:"nx-dress-coop",py:-0.03639659008669924,file:"village_coop3.glb",x:37.5,z:-6.5,yaw:-1.8,py:0},
 {id:"nx-dress-hens",py:-0.03596752741143142,file:"village_hen_a.glb",x:33.5,z:-6.0,yaw:-1.8,py:0},
 {id:"nx-dress-hutch",py:-0.03628295744660177,file:"village_hutch3.glb",x:38.5,z:-9.5,yaw:-1.9,py:0},
 // homestead props (south, near woodyard 16,31)
 {id:"nx-dress-harvestcart",py:-0.030275499863781915,file:"village_harvestcart3.glb",x:12.0,z:36.0,yaw:-2.6,py:0},
 {id:"nx-dress-churn",py:-0.03229963596222573,file:"village_churn3.glb",x:20.0,z:35.0,yaw:-2.2,py:0},
 {id:"nx-dress-milkstand",py:-0.03651407378387656,file:"village_milkstand3.glb",x:22.5,z:33.0,yaw:-2.4,py:0},
 {id:"nx-dress-charcoal",py:-0.0364397227020971,file:"village_charcoal3.glb",x:34.5,z:34.0,yaw:-2.4784945651581642,py:0},
 // inn front dressing (inn at 36,0)
 {id:"nx-dress-stablebench",py:-0.041216731702698566,file:"village_stablebench3.glb",x:42.0,z:6.0,yaw:-1.5707963267948966,py:0},
 {id:"nx-dress-well",py:-0.02300196262835136,file:"village_well.glb",x:30.0,z:-4.5,yaw:0,py:0},
 // contemplative corner (northwest inner, by shrine at -25,-4)
 {id:"nx-dress-chess",py:-0.014820017443947417,file:"village_chess.glb",x:-27.5,z:-9.0,yaw:1.2,py:0},
];
let n=133;
for(const s of SLOTS){
  const bytes=new Uint8Array(readFileSync(`${ASSETS}/${s.file}`));
  const sha=createHash("sha256").update(bytes).digest("hex");
  const want={lib:`store/${sha.slice(0,16)}.glb`,pos:[s.x,s.py,s.z],yaw:s.yaw,scale:1};
  const before=await geom();const existing=before[s.id];
  if(existing&&!(e=>e&&e.lib===want.lib&&e.pos.every((nn:number,i:number)=>near(nn,want.pos[i]))&&near(e.yaw??0,s.yaw)&&e.scale===1)(existing))throw Error(`${s.id} id collision/drift`);
  const dims=accBounds(`${ASSETS}/${s.file}`);
  let minGap=Infinity,minAgainst="";
  const SUSPENDED=new Set(["village_stringlights.glb"]);
  if(SUSPENDED.has(s.file))console.log(`${s.id} suspended decor: SAT skipped`);else
  for(const e of Object.values(before).filter((e:any)=>e.bbox&&e.id!==s.id&&(e.bbox.max[1]-e.bbox.min[1])>0.5&&!String(e.lib??"").includes("3b76b621559fa1a1")&&!String(e.lib??"").includes("e815a897c7d73373")&&!String(e.lib??"").includes("9ce1378d47fd8a22"))){const g=gap(O(s.x,s.z,s.yaw,dims.w,dims.d),EO(e));if(g<minGap){minGap=g;minAgainst=e.id}if(g<-.001)throw Error(`${s.id} footprint overlaps ${e.id}: ${g}`)}
  if(minGap<1)console.log(`WARNING ${s.id} minGap ${minGap.toFixed(2)} vs ${minAgainst}`);
  if(!existing){
    const u=new URL(`${base}/upload`);u.searchParams.set("token",cfg.agentToken);u.searchParams.set("name",`commons-next dress ${s.id} nvp-${n}`);u.searchParams.set("by",cfg.id);
    let lib="";for(let a=1;a<=5;a++){const r=await fetch(u,{method:"POST",body:bytes});if(r.ok){lib=(await r.json()).path;break}if(r.status===429&&a<5){await new Promise(q=>setTimeout(q,25_000));continue}throw Error(`${s.id} upload ${r.status}`)}
    if(lib!==want.lib)throw Error(`${s.id} upload path ${lib}`);
    await new Promise<void>((resolve,reject)=>{const ws=new WebSocket(cfg.url);let sent=false;const timer=setTimeout(()=>reject(Error("verb timeout")),45_000);
      ws.onopen=()=>ws.send(JSON.stringify({type:"join",world:WORLD,id:`arthur-nvp${n}-place`,avatar:cfg.avatar,token:cfg.joinToken}));
      ws.onerror=()=>reject(Error("websocket error"));
      ws.onmessage=(ev:any)=>{const x=JSON.parse(ev.data);if(x.type==="error")reject(Error(`server ${x.error}`));else if(x.type==="snapshot"){if(!sent){sent=true;ws.send(JSON.stringify({type:"verb",verb:"spawn",args:{id:s.id,lib:want.lib,pos:want.pos,yaw:s.yaw,scale:1}}))}else{console.log(`  verb reply:`,JSON.stringify(x).slice(0,150))}if(x.type==="verb_ok"||x.type==="verb_err"){clearTimeout(timer);ws.close();x.type==="verb_err"?reject(Error(`verb_err ${JSON.stringify(x)}`)):resolve()}else if(sent){setTimeout(()=>{clearTimeout(timer);ws.close();resolve()},1600)}}}});
    await new Promise(q=>setTimeout(q,400));
  } else console.log(`${s.id} already live — no verbs`);
  const after=await geom(),e=after[s.id];
  if(!e||e.lib!==want.lib||!e.pos.every((nn:number,i:number)=>near(nn,want.pos[i]))||!near(e.yaw??0,s.yaw)||e.scale!==1)throw Error(`${s.id} post-place tuple failed: live=${JSON.stringify(e)?.slice(0,200)} want=${JSON.stringify(want)}`);
  console.log(JSON.stringify({n:`nvp-${n}`,id:s.id,status:"PLACED_VERIFIED",minGap:+minGap.toFixed(4),minAgainst}));
  n++;
}
console.log("CORE DRESSING PASS COMPLETE");
