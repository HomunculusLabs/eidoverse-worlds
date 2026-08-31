// interior-place-stable.ts — interior-16 fail-closed stable re-place + warm yard light.
// First interior light for the livery: the groom's lantern glow + one light
// entity at the open front so the yard side reads warm at night.
import{readFileSync}from"node:fs";import{createHash}from"node:crypto";
const R="/Users/t3rpz/projects/eidoverse-worlds",W="commons-next",ID="nx-town-stable",LID="nx-town-stable-l",OLD="store/84ba3b1b110282d9.glb",SHA="5beff62ed41ca6cf49c4911fe26465fcc140bbc53fb842a7609b49c6a10555f1",LIB=`store/${SHA.slice(0,16)}.glb`,POS=[43,0,0],YAW=-Math.PI/2,LIGHT={id:LID,pos:[43,1.9,1.8],color:0xffb066,intensity:1.4,range:5};
const cfg=JSON.parse(readFileSync(`${R}/agents/arthur/config.json`,"utf8")),base=cfg.url.replace("wss://","https://").replace("/ws","");const bytes=new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_stable3.glb`));const die=(s:string):never=>{throw Error(s)},near=(a:number,b:number)=>Math.abs(a-b)<1e-6,vec=(a:any,b:number[])=>Array.isArray(a)&&a.length===b.length&&a.every((n:number,i:number)=>near(n,b[i])),bb=(a:any,b:number[])=>Array.isArray(a)&&a.length===b.length&&a.every((n:number,i:number)=>Math.abs(n-b[i])<1e-3),eq=(a:any,b:any)=>JSON.stringify(a)===JSON.stringify(b);
if(createHash("sha256").update(bytes).digest("hex")!==SHA)die("stable bytes drift");
async function geom(){const r=await fetch(`${base}/geom?world=${W}`,{signal:AbortSignal.timeout(20_000)});if(!r.ok)die(`geom ${r.status}`);const d:any=await r.json();return Object.fromEntries((d.entities??[]).map((e:any)=>[e.id,e])) as Record<string,any>}
const before=await geom(),e0=before[ID],l0=before[LID];
if(!e0)die("stable missing");
if(!vec(e0.pos,POS)||!near(e0.yaw??0,YAW)||(e0.scale??1)!==1||![OLD,LIB].includes(e0.lib))die(`stable tuple/lib drift ${e0.lib}`);
if(!bb(e0.bbox?.min,[-3,-0.2,-2.675])||!bb(e0.bbox?.max,[3,3.442,2.456]))die("stable bbox drift");
const bag=structuredClone(e0.comp??{});
if(l0&&!(l0.kind==="light"&&vec(l0.pos,LIGHT.pos)))die("stable light collision/drift");
const verbs:Array<[string,any]>=[];
if(e0.lib!==LIB){const u=new URL(`${base}/upload`);u.searchParams.set("token",cfg.agentToken);u.searchParams.set("name","commons-next stable interior-16");u.searchParams.set("by",cfg.id);let lib="";for(let a2=1;a2<=5;a2++){const r=await fetch(u,{method:"POST",body:bytes});if(r.ok){lib=(await r.json()).path;break}if(r.status===429&&a2<5){await Bun.sleep(25_000);continue}die(`upload ${r.status}`)}if(lib!==LIB)die(`upload path ${lib}`);verbs.push(["spawn",{id:ID,lib:LIB,pos:POS,yaw:YAW,scale:1}]);for(const[type,data]of Object.entries(bag))verbs.push(["comp",{id:ID,type,data}])}
if(!l0)verbs.push(["light",LIGHT]);
if(verbs.length)await new Promise<void>((resolve,reject)=>{const ws=new WebSocket(cfg.url);let joined=false,i=0;const t=setTimeout(()=>reject(Error("verb timeout")),90_000),paced=setInterval(()=>{if(!joined||i>=verbs.length)return;const[verb,args]=verbs[i++];ws.send(JSON.stringify({type:"verb",verb,args}));if(i===verbs.length)setTimeout(()=>{clearInterval(paced);clearTimeout(t);ws.close();resolve()},1800)},650);ws.onopen=()=>ws.send(JSON.stringify({type:"join",world:W,id:"arthur-interior-16-place",avatar:cfg.avatar,token:cfg.joinToken}));ws.onerror=()=>reject(Error("websocket"));ws.onmessage=(ev:any)=>{const m=JSON.parse(ev.data);if(m.type==="error")reject(Error(`server ${m.error}`));else if(m.type==="snapshot")joined=true}});
const after=await geom(),e=after[ID],l=after[LID];
if(!(e?.lib===LIB&&vec(e.pos,POS)&&near(e.yaw??0,YAW)&&(e.scale??1)===1&&eq(e.comp??{},bag)))die("post stable tuple/comp");
if(!(l?.kind==="light"&&vec(l.pos,LIGHT.pos)))die("post stable light");
console.log(JSON.stringify({status:"PLACED_VERIFIED",id:ID,lib:e.lib,pos:e.pos,yaw:e.yaw,compKeys:Object.keys(e.comp??{}).sort(),light:{id:LID,pos:l.pos},verbs:verbs.length}));
