// interior-place-dyehouse.ts — interior-17 fail-closed dyehouse re-place + warm work light.
import{readFileSync}from"node:fs";import{createHash}from"node:crypto";
const R="/Users/t3rpz/projects/eidoverse-worlds",W="commons-next",ID="nx-town-dyehouse",LID="nx-town-dyehouse-l",OLD="store/8d750d7826584d9d.glb",SHA="888be3597d2f772f7c62052b8757b51b8fa0e248408969096142d6b5ed542b4c",LIB=`store/${SHA.slice(0,16)}.glb`,POS=[-23,0,-23],YAW=0.941,LIGHT={id:LID,pos:[-23.625,1.62,-21.971],color:0xffb066,intensity:1.35,range:4.5};
const cfg=JSON.parse(readFileSync(`${R}/agents/arthur/config.json`,"utf8")),base=cfg.url.replace("wss://","https://").replace("/ws","");const bytes=new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_dyehouse3.glb`));const die=(s:string):never=>{throw Error(s)},near=(a:number,b:number)=>Math.abs(a-b)<1e-6,vec=(a:any,b:number[])=>Array.isArray(a)&&a.length===b.length&&a.every((n:number,i:number)=>near(n,b[i])),bb=(a:any,b:number[])=>Array.isArray(a)&&a.length===b.length&&a.every((n:number,i:number)=>Math.abs(n-b[i])<1e-3),eq=(a:any,b:any)=>JSON.stringify(a)===JSON.stringify(b);
if(createHash("sha256").update(bytes).digest("hex")!==SHA)die("dyehouse bytes drift");
async function geom(){const r=await fetch(`${base}/geom?world=${W}`,{signal:AbortSignal.timeout(20_000)});if(!r.ok)die(`geom ${r.status}`);const d:any=await r.json();return Object.fromEntries((d.entities??[]).map((e:any)=>[e.id,e])) as Record<string,any>}
const before=await geom(),e0=before[ID],l0=before[LID];
if(!e0)die("dyehouse missing");
if(!vec(e0.pos,POS)||!near(e0.yaw??0,YAW)||(e0.scale??1)!==1||![OLD,LIB].includes(e0.lib))die(`dyehouse tuple/lib drift ${e0.lib}`);
if(!bb(e0.bbox?.min,[-1.5,0,-1.046])||!bb(e0.bbox?.max,[1.775,2.141,1.146]))die("dyehouse bbox drift");
const bag=structuredClone(e0.comp??{});
if(l0&&!(l0.kind==="light"&&vec(l0.pos,LIGHT.pos)))die("dyehouse light collision/drift");
const verbs:Array<[string,any]>=[];
if(e0.lib!==LIB){const u=new URL(`${base}/upload`);u.searchParams.set("token",cfg.agentToken);u.searchParams.set("name","commons-next dyehouse interior-17");u.searchParams.set("by",cfg.id);let lib="";for(let a2=1;a2<=5;a2++){const r=await fetch(u,{method:"POST",body:bytes});if(r.ok){lib=(await r.json()).path;break}if(r.status===429&&a2<5){await Bun.sleep(25_000);continue}die(`upload ${r.status}`)}if(lib!==LIB)die(`upload path ${lib}`);verbs.push(["spawn",{id:ID,lib:LIB,pos:POS,yaw:YAW,scale:1}]);for(const[type,data]of Object.entries(bag))verbs.push(["comp",{id:ID,type,data}])}
if(!l0)verbs.push(["light",LIGHT]);
if(verbs.length)await new Promise<void>((resolve,reject)=>{const ws=new WebSocket(cfg.url);let joined=false,i=0;const t=setTimeout(()=>reject(Error("verb timeout")),90_000),paced=setInterval(()=>{if(!joined||i>=verbs.length)return;const[verb,args]=verbs[i++];ws.send(JSON.stringify({type:"verb",verb,args}));if(i===verbs.length)setTimeout(()=>{clearInterval(paced);clearTimeout(t);ws.close();resolve()},1800)},650);ws.onopen=()=>ws.send(JSON.stringify({type:"join",world:W,id:"arthur-interior-17-place",avatar:cfg.avatar,token:cfg.joinToken}));ws.onerror=()=>reject(Error("websocket"));ws.onmessage=(ev:any)=>{const m=JSON.parse(ev.data);if(m.type==="error")reject(Error(`server ${m.error}`));else if(m.type==="snapshot")joined=true}});
const after=await geom(),e=after[ID],l=after[LID];
if(!(e?.lib===LIB&&vec(e.pos,POS)&&near(e.yaw??0,YAW)&&(e.scale??1)===1&&eq(e.comp??{},bag)))die("post dyehouse tuple/comp");
if(!(l?.kind==="light"&&vec(l.pos,LIGHT.pos)))die("post dyehouse light");
console.log(JSON.stringify({status:"PLACED_VERIFIED",id:ID,lib:e.lib,pos:e.pos,yaw:e.yaw,compKeys:Object.keys(e.comp??{}).sort(),light:{id:LID,pos:l.pos},verbs:verbs.length}));
