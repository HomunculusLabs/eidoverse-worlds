// interior-place-kiln.ts — interior-18 fail-closed kiln re-place + warm burn light.
import{readFileSync}from"node:fs";import{createHash}from"node:crypto";
const R="/Users/t3rpz/projects/eidoverse-worlds",W="commons-next",ID="nx-town-kiln",LID="nx-town-kiln-l",OLD="store/69c0e48a917d4ed2.glb",SHA="4d8ef8fc0b0955deafea356dc72eef3d08609e168da9f944db4e069afe6d60c9",LIB=`store/${SHA.slice(0,16)}.glb`,POS=[31,0,39],YAW=-2.4784945651581642,LIGHT={id:LID,pos:[30.5,1.1,40.4],color:0xffb066,intensity:1.4,range:4.5};
const cfg=JSON.parse(readFileSync(`${R}/agents/arthur/config.json`,"utf8")),base=cfg.url.replace("wss://","https://").replace("/ws","");const bytes=new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_kiln3.glb`));const die=(s:string):never=>{throw Error(s)},near=(a:number,b:number)=>Math.abs(a-b)<1e-6,vec=(a:any,b:number[])=>Array.isArray(a)&&a.length===b.length&&a.every((n:number,i:number)=>near(n,b[i])),bb=(a:any,b:number[])=>Array.isArray(a)&&a.length===b.length&&a.every((n:number,i:number)=>Math.abs(n-b[i])<1e-3),eq=(a:any,b:any)=>JSON.stringify(a)===JSON.stringify(b);
if(createHash("sha256").update(bytes).digest("hex")!==SHA)die("kiln bytes drift");
async function geom(){const r=await fetch(`${base}/geom?world=${W}`,{signal:AbortSignal.timeout(20_000)});if(!r.ok)die(`geom ${r.status}`);const d:any=await r.json();return Object.fromEntries((d.entities??[]).map((e:any)=>[e.id,e])) as Record<string,any>}
const before=await geom(),e0=before[ID],l0=before[LID];
if(!e0)die("kiln missing");
if(!vec(e0.pos,POS)||!near(e0.yaw??0,YAW)||(e0.scale??1)!==1||![OLD,LIB].includes(e0.lib))die(`kiln tuple/lib drift ${e0.lib}`);
if(!bb(e0.bbox?.min,[-2.228,-0.029,-1.3])||!bb(e0.bbox?.max,[2.65,3.006,1.708]))die("kiln bbox drift");
const bag=structuredClone(e0.comp??{});
if(l0&&!(l0.kind==="light"&&vec(l0.pos,LIGHT.pos)))die("kiln light collision/drift");
const verbs:Array<[string,any]>=[];
if(e0.lib!==LIB){const u=new URL(`${base}/upload`);u.searchParams.set("token",cfg.agentToken);u.searchParams.set("name","commons-next kiln interior-18");u.searchParams.set("by",cfg.id);let lib="";for(let a2=1;a2<=5;a2++){const r=await fetch(u,{method:"POST",body:bytes});if(r.ok){lib=(await r.json()).path;break}if(r.status===429&&a2<5){await Bun.sleep(25_000);continue}die(`upload ${r.status}`)}if(lib!==LIB)die(`upload path ${lib}`);verbs.push(["spawn",{id:ID,lib:LIB,pos:POS,yaw:YAW,scale:1}]);for(const[type,data]of Object.entries(bag))verbs.push(["comp",{id:ID,type,data}])}
if(!l0)verbs.push(["light",LIGHT]);
if(verbs.length)await new Promise<void>((resolve,reject)=>{const ws=new WebSocket(cfg.url);let joined=false,i=0;const t=setTimeout(()=>reject(Error("verb timeout")),90_000),paced=setInterval(()=>{if(!joined||i>=verbs.length)return;const[verb,args]=verbs[i++];ws.send(JSON.stringify({type:"verb",verb,args}));if(i===verbs.length)setTimeout(()=>{clearInterval(paced);clearTimeout(t);ws.close();resolve()},1800)},650);ws.onopen=()=>ws.send(JSON.stringify({type:"join",world:W,id:"arthur-interior-18-place",avatar:cfg.avatar,token:cfg.joinToken}));ws.onerror=()=>reject(Error("websocket"));ws.onmessage=(ev:any)=>{const m=JSON.parse(ev.data);if(m.type==="error")reject(Error(`server ${m.error}`));else if(m.type==="snapshot")joined=true}});
const after=await geom(),e=after[ID],l=after[LID];
if(!(e?.lib===LIB&&vec(e.pos,POS)&&near(e.yaw??0,YAW)&&(e.scale??1)===1&&eq(e.comp??{},bag)))die("post kiln tuple/comp");
if(!(l?.kind==="light"&&vec(l.pos,LIGHT.pos)))die("post kiln light");
console.log(JSON.stringify({status:"PLACED_VERIFIED",id:ID,lib:e.lib,pos:e.pos,yaw:e.yaw,compKeys:Object.keys(e.comp??{}).sort(),light:{id:LID,pos:l.pos},verbs:verbs.length}));
