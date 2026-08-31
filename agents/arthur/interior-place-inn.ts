// interior-place-inn.ts — interior-0 fail-closed inn re-place + warm room light.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT="/Users/t3rpz/projects/eidoverse-worlds",WORLD="commons-next",ID="nx-town-inn",LIGHT_ID="nx-town-inn-l";
const OLD_LIB="store/9fdf24522f0de63f.glb",SHA="c180c26f4a3fb8ad0b4bb9584df2e6e6b4ba30fb15aad99e5e5ceb72f6ece74c",LIB=`store/${SHA.slice(0,16)}.glb`;
const POS=[36,0,0],YAW=-Math.PI/2,LIGHT={id:LIGHT_ID,pos:[36,2.35,0],color:0xffb066,intensity:1.6,range:6};
const cfg=JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`,"utf8")),base=cfg.url.replace("wss://","https://").replace("ws://","http://").replace("/ws","");
const bytes=new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/village_inn3.glb`));
const die=(s:string):never=>{throw Error(s)},near=(a:number,b:number)=>Math.abs(a-b)<1e-6,vec=(a:number[],b:number[])=>a.length===b.length&&a.every((n,i)=>near(n,b[i])),vecBbox=(a:number[],b:number[])=>a.length===b.length&&a.every((n,i)=>Math.abs(n-b[i])<1e-3),eq=(a:any,b:any)=>JSON.stringify(a)===JSON.stringify(b);
if(createHash("sha256").update(bytes).digest("hex")!==SHA)die("reviewed inn bytes drift");
async function geom(){const r=await fetch(`${base}/geom?world=${WORLD}`,{signal:AbortSignal.timeout(20_000)});if(!r.ok)die(`geom ${r.status}`);const d:any=await r.json();return Object.fromEntries((d.entities??[]).map((e:any)=>[e.id,e])) as Record<string,any>}
// /geom projects only light identity + pose; fold authored light parameters
// from light-verb history, in world order, for the authority check.
async function lightFold(){return await new Promise<any>((resolve,reject)=>{const ws=new WebSocket(cfg.url),out:any={};const timer=setTimeout(()=>reject(Error("light history timeout")),30_000);ws.onopen=()=>ws.send(JSON.stringify({type:"join",world:WORLD,id:"arthur-interior-0-lightread",avatar:cfg.avatar,token:cfg.joinToken,spectate:true}));ws.onerror=()=>reject(Error("light history websocket"));ws.onmessage=(ev:any)=>{const m=JSON.parse(ev.data);if(m.type==="error")reject(Error(`light history ${m.error}`));else if(m.type==="snapshot")ws.send(JSON.stringify({type:"history",verbs:["light"],limit:300}));else if(m.type==="history"){for(const r of m.entries??[]){const x=r.args??r;if(x.id!==LIGHT_ID)continue;for(const k of ["pos","color","intensity","range"])if(x[k]!==undefined)out[k]=x[k]}clearTimeout(timer);ws.close();resolve(out)}}})}
const before=await geom(),beforeLight=await lightFold(),target=before[ID],light=before[LIGHT_ID];
if(!target)die("inn missing");
if(!vec(target.pos,POS)||!near(target.yaw??0,YAW)||(target.scale??1)!==1)die("inn pose/yaw/scale drift");
if(target.lib!==OLD_LIB&&target.lib!==LIB)die(`inn unexpected lib ${target.lib}`);
const wantBounds={min:[-4.5,-.2,-4],max:[4.5,6.868531703948975,4.900000095367432]};
// /geom rounds decoded bounds to millimetres; compare at that declared precision.
if(!vecBbox(target.bbox?.min??[],wantBounds.min)||!vecBbox(target.bbox?.max??[],wantBounds.max))die("inn live footprint/bounds drift — SAT equivalence unavailable");
const capturedBag=structuredClone(target.comp??{});
if(light&&!(light.kind==="light"&&vec(light.pos,LIGHT.pos)&&beforeLight.color===LIGHT.color&&near(beforeLight.intensity,LIGHT.intensity)&&near(beforeLight.range,LIGHT.range)))die("inn light collision/drift");
const verbs:Array<[string,any]>=[];
if(target.lib!==LIB){
  const u=new URL(`${base}/upload`);u.searchParams.set("token",cfg.agentToken);u.searchParams.set("name","commons-next inn interior-0");u.searchParams.set("by",cfg.id);
  let uploaded="";for(let a=1;a<=5;a++){const r=await fetch(u,{method:"POST",body:bytes});if(r.ok){uploaded=(await r.json()).path;break}if(r.status===429&&a<5){await Bun.sleep(25_000);continue}die(`upload ${r.status}`)}
  if(uploaded!==LIB)die(`upload path ${uploaded}`);
  verbs.push(["spawn",{id:ID,lib:LIB,pos:POS,yaw:YAW,scale:1}]);
  for(const [type,data] of Object.entries(capturedBag))verbs.push(["comp",{id:ID,type,data}]);
}
if(!light)verbs.push(["light",LIGHT]);
if(verbs.length){
  await new Promise<void>((resolve,reject)=>{const ws=new WebSocket(cfg.url);let joined=false;const timer=setTimeout(()=>reject(Error("verb timeout")),60_000);
    ws.onerror=()=>reject(Error("websocket error"));
    ws.onopen=()=>ws.send(JSON.stringify({type:"join",world:WORLD,id:"arthur-interior-0-place",avatar:cfg.avatar,token:cfg.joinToken}));
    ws.onmessage=(ev:any)=>{const m=JSON.parse(ev.data);if(m.type==="error")reject(Error(`server ${m.error}`));if(m.type==="snapshot"&&!joined){joined=true;(async()=>{for(const [verb,args] of verbs){ws.send(JSON.stringify({type:"verb",verb,args}));await Bun.sleep(650)}await Bun.sleep(1600);clearTimeout(timer);ws.close();resolve()})().catch(reject)}};
  });
}
const after=await geom(),afterLight=await lightFold(),e=after[ID],l=after[LIGHT_ID];
if(!(e?.lib===LIB&&vec(e.pos,POS)&&near(e.yaw??0,YAW)&&(e.scale??1)===1&&eq(e.comp??{},capturedBag)))die("post-place inn tuple/comp failed");
if(!(l?.kind==="light"&&vec(l.pos,LIGHT.pos)&&afterLight.color===LIGHT.color&&near(afterLight.intensity,LIGHT.intensity)&&near(afterLight.range,LIGHT.range)))die(`post-place light failed ${JSON.stringify({geom:l,authored:afterLight})}`);
console.log(JSON.stringify({status:"PLACED_VERIFIED",id:ID,lib:e.lib,pos:e.pos,yaw:e.yaw,compKeys:Object.keys(e.comp??{}).sort(),light:{id:l.id,pos:l.pos,...afterLight},verbs:verbs.length,capturedCompKeys:Object.keys(capturedBag).sort()}));
