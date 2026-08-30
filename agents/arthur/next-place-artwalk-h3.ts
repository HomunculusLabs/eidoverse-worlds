// next-place-artwalk-h3.ts — artwalk-4 H-3 reversible first siting.
// Bill's lane waiver makes native image inspection non-blocking; all technical
// gates remain fail-closed. Exact bbox-center-aware SAT and corner-band math.
import {readFileSync}from"node:fs";import{createHash}from"node:crypto";
const ROOT="/Users/t3rpz/projects/eidoverse-worlds",WORLD="commons-next",ID="nx-artwalk-h3",LIGHT_ID=`${ID}-l`;
const SHA="f33e9839b5d9524109f86d70f07ef67d1a6bf1b2c8aa276913ea601d4328f84a";
const PX=32.526911934581186,PY=-0.0313912325769002,PZ=-32.526911934581186,YAW=-0.7853981633974483;
const OLD_POS=[31.819805153394636,-0.032464677320055146,-31.819805153394636] as const;
const MINX=-2.4700000286102295,MAXX=2.4700000286102295,MINZ=-2.4700000286102295,MAXZ=5.170000076293945;
const BW=MAXX-MINX,BD=MAXZ-MINZ,CX=(MINX+MAXX)/2,CZ=(MINZ+MAXZ)/2;
const LIGHT_POS:[number,number,number]=[PX,2.4486087674231,PZ],OLD_LIGHT_POS=[31.819805153394636,2.447535322679945,-31.819805153394636] as const;
const cfg=JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`,"utf8")),base=cfg.url.replace("wss://","https://").replace("ws://","http://").replace("/ws","");
const bytes=new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/village_artwalk_h3.glb`));
const die=(m:string):never=>{throw Error(m)},near=(a:number,b:number)=>Math.abs(a-b)<1e-6;
if(createHash("sha256").update(bytes).digest("hex")!==SHA)die("reviewed GLB hash drift");
async function geom(){const r=await fetch(`${base}/geom?world=${WORLD}`);if(!r.ok)die(`geom ${r.status}`);const d:any=await r.json();return Object.fromEntries((d.entities??[]).map((e:any)=>[e.id,e])) as Record<string,any>}
type O={c:[number,number],u:[number,number],v:[number,number],hu:number,hv:number};
function O(x:number,z:number,y:number,w:number,d:number):O{const c=Math.cos(y),s=Math.sin(y);return{c:[x,z],u:[c,-s],v:[s,c],hu:w/2,hv:d/2}}
function EO(e:any){const b=e.bbox,y=e.yaw??0,c=Math.cos(y),s=Math.sin(y),x=(b.min[0]+b.max[0])/2,z=(b.min[2]+b.max[2])/2;return O(e.pos[0]+x*c+z*s,e.pos[2]-x*s+z*c,y,b.max[0]-b.min[0],b.max[2]-b.min[2])}
function gap(A:O,B:O){let best=-Infinity;for(const x of[A.u,A.v,B.u,B.v]){const dd=Math.abs((B.c[0]-A.c[0])*x[0]+(B.c[1]-A.c[1])*x[1]),ra=A.hu*Math.abs(A.u[0]*x[0]+A.u[1]*x[1])+A.hv*Math.abs(A.v[0]*x[0]+A.v[1]*x[1]),rb=B.hu*Math.abs(B.u[0]*x[0]+B.u[1]*x[1])+B.hv*Math.abs(B.v[0]*x[0]+B.v[1]*x[1]);best=Math.max(best,dd-ra-rb)}return best}
const cc=Math.cos(YAW),ss=Math.sin(YAW),target=O(PX+CX*cc+CZ*ss,PZ-CX*ss+CZ*cc,YAW,BW,BD);
const want={lib:`store/${SHA.slice(0,16)}.glb`,pos:[PX,PY,PZ],yaw:YAW,scale:1};
const tupleOK=(e:any)=>!!e&&e.lib===want.lib&&e.pos.every((n:number,i:number)=>near(n,want.pos[i]))&&near(e.yaw??0,YAW)&&e.scale===1&&Object.keys(e.comp??{}).length===0;
const lightOK=(e:any)=>!!e&&e.kind==="light"&&e.pos.every((n:number,i:number)=>near(n,LIGHT_POS[i]));
const oldTupleOK=(e:any)=>!!e&&e.lib===want.lib&&e.pos.every((n:number,i:number)=>near(n,OLD_POS[i]))&&near(e.yaw??0,YAW)&&e.scale===1&&Object.keys(e.comp??{}).length===0;
const oldLightOK=(e:any)=>!!e&&e.kind==="light"&&e.pos.every((n:number,i:number)=>near(n,OLD_LIGHT_POS[i]));
const before=await geom(),existing=before[ID],existingLight=before[LIGHT_ID];
if(existing&&!tupleOK(existing)&&!oldTupleOK(existing))die(`${ID} id collision/drift`);if(existingLight&&!lightOK(existingLight)&&!oldLightOK(existingLight))die(`${LIGHT_ID} id collision/drift`);if(!!existing!==!!existingLight)die("partial prior rollout");
const needsMove=!!existing&&oldTupleOK(existing)&&oldLightOK(existingLight);
let inner=Infinity,outer=0;for(const[lx,lz]of[[MINX,MINZ],[MAXX,MINZ],[MAXX,MAXZ],[MINX,MAXZ]]){const wx=PX+lx*cc+lz*ss,wz=PZ-lx*ss+lz*cc,r=Math.hypot(wx,wz);inner=Math.min(inner,r);outer=Math.max(outer,r)}
if(inner<30||outer>50)die(`art-lane corridor violated inner=${inner} outer=${outer}`);
const groundIds=new Set(["nx-core-paths","nx-town-roads"]);let minGap=Infinity,minAgainst="";
for(const e of Object.values(before).filter((e:any)=>e.bbox&&e.id!==ID)){const h=e.bbox.max[1]-e.bbox.min[1];if(groundIds.has(e.id)||h<=0.5)continue;const g=gap(target,EO(e));if(g<minGap){minGap=g;minAgainst=e.id}if(g<-.001)die(`footprint overlaps ${e.id}: ${g}`)}
if(minGap<1.4)die(`walkable lane pinch ${minGap} against ${minAgainst}`);
console.log(JSON.stringify({stage:"preflight",centerRadius:+Math.hypot(PX,PZ).toFixed(6),corridor:{inner:+inner.toFixed(6),outer:+outer.toFixed(6)},minGap:+minGap.toFixed(6),minAgainst,nativeVisual:"waived-by-Bill"}));
if(!existing||needsMove){let lib=want.lib;if(!existing){const u=new URL(`${base}/upload`);u.searchParams.set("token",cfg.agentToken);u.searchParams.set("name","the ruled sky — artwalk H-3");u.searchParams.set("by",cfg.id);lib="";for(let a=1;a<=5;a++){const r=await fetch(u,{method:"POST",body:bytes});if(r.ok){lib=(await r.json()).path;break}if(r.status===429&&a<5){await new Promise(q=>setTimeout(q,25_000));continue}die(`upload ${r.status}`)}if(lib!==want.lib)die(`upload path ${lib}`)}
const verbs:[string,any][]=[["spawn",{id:ID,lib,pos:[PX,PY,PZ],yaw:YAW,scale:1}],["light",{id:LIGHT_ID,pos:LIGHT_POS,color:0xffc98a,intensity:1.5,range:5.2}]];
await new Promise<void>((resolve,reject)=>{const ws=new WebSocket(cfg.url);let joined=false,i=0;const timer=setTimeout(()=>reject(Error("verb timeout")),45_000);ws.onopen=()=>ws.send(JSON.stringify({type:"join",world:WORLD,id:"arthur-artwalk-h3-builder",avatar:cfg.avatar,token:cfg.joinToken}));ws.onerror=()=>reject(Error("websocket error"));ws.onmessage=(ev:any)=>{const x=JSON.parse(ev.data);if(x.type==="error")reject(Error(`server ${x.error}`));else if(x.type==="snapshot"&&!joined){joined=true;const paced=setInterval(()=>{if(i>=verbs.length){clearInterval(paced);setTimeout(()=>{clearTimeout(timer);ws.close();resolve()},1800);return}const[verb,args]=verbs[i++];ws.send(JSON.stringify({type:"verb",verb,args}))},700)}}})}else console.log("H-3 already live at final pose — zero verbs");
const after=await geom(),e=after[ID],l=after[LIGHT_ID];if(!tupleOK(e))die("post-place model tuple failed");if(!lightOK(l))die("post-place light tuple failed");
console.log(JSON.stringify({status:"PLACED_VERIFIED",id:ID,lib:e.lib,pos:e.pos,yaw:e.yaw,scale:e.scale,bboxSize:e.bbox.size,compKeys:Object.keys(e.comp??{}),light:{id:LIGHT_ID,pos:l.pos},verbs:(!existing||needsMove)?2:0}));
