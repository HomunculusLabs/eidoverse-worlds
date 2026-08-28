// next-place-se-wild-batch.ts — nvp-77..81 SE Wild placements (15 works), fail-closed.
// Chassis identical to the proven NW batch placer: hash gate, tuple verify, rim law
// [66,108], SAT vs live bbox geometry, upload → spawn over ws, post-place tuple check.
// Yaw -2.35619449 (SE inward). Families forest/cairnfield/wayside carry NO comps.
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
 {id:"nx-wild-forest-0010",file:"work_1690_forest.glb",sha:"e7d130f7747d9e9a2fa58e9e7e0b27a3217511e6142b076b3c828a36385fe2cb",x:10.577156,z:-75.260373,py:-0.05003665249372835},
 {id:"nx-wild-forest-0018",file:"work_1638_forest.glb",sha:"546718f819b5f70227fdbaaf962edc067748e0fb4ea0d05a86b7706dae711e45",x:30.911985,z:-69.429455,py:-0.05120935668377804},
 {id:"nx-wild-forest-0044",file:"work_1664_forest.glb",sha:"43e4c8c3a843881d69c7e2a32f0b0c89bf5ac463b872e6d8db50dc6dabc5929d",x:48.851858,z:-58.219378,py:-0.020292638346832616},
 {id:"nx-wild-forest-0057",file:"work_1677_forest.glb",sha:"18ea1385cf64d504d32ea72f5a0d9aa285b98dbb1c63ff2ab193970848e28017",x:63.006856,z:-42.498661,py:-0.019491742981888435},
 {id:"nx-wild-forest-0031",file:"work_1651_forest.glb",sha:"f61645b4aba14fc6a8c562d1e467dc6be9369b432c3006b75b0720ce2e81592d",x:72.280295,z:-23.485292,py:-0.05215550130320002},
 {id:"nx-wild-cairn-0022",file:"work_1642_cairnfield.glb",sha:"a4450b4094f75297fcb5fe00b83197bfa030ff792429b1eab2a070cd8bf78539",x:28.73858,z:-88.448256,py:-0.07426829800275718},
 {id:"nx-wild-cairn-0048",file:"work_1655_cairnfield.glb",sha:"09ed84ef059f3bc7d5f1608485bdbd1794f483711a28ab45cb0006aee9ce4420",x:52.00494,z:-77.100494,py:-0.0345969160626097},
 {id:"nx-wild-cairn-0043",file:"work_1668_cairnfield.glb",sha:"5d6c3edda71cc22809ffaeb3cc6f450401b7179fc7754b1e7db589d5d7368fc6",x:71.242133,z:-59.779248,py:0.007238005337997962},
 {id:"nx-wild-cairn-0047",file:"work_1681_cairnfield.glb",sha:"109e5bc57c5f7cb00e985f4fa94907e68d8522814f1181548ce14cd384059a45",x:84.959728,z:-37.826508,py:-0.02598558885747508},
 {id:"nx-wild-cairn-0050",file:"work_1694_cairnfield.glb",sha:"efedd3614fe4ae8814f79cb358d406003b6e99bc1e58840010f68a9db03433a7",x:92.09493,z:-12.943098,py:-0.028882407863270138},
 {id:"nx-wild-wayside-0009",file:"work_1637_wayside.glb",sha:"b46c543afae781a01c36126229ea6399c7ab608e6896039e1eea142280fe3f58",x:17.538466,z:-99.465583,py:-0.06309466104089798},
 {id:"nx-wild-wayside-0030",file:"work_1650_wayside.glb",sha:"d2a2b028b1ce9077005c7081acf298d630d9fc7622cfde9565d6cd77856030ca",x:44.275486,z:-90.778199,py:-0.05134727600764112},
 {id:"nx-wild-wayside-0045",file:"work_1663_wayside.glb",sha:"b693c67eaedeb71b8d31fd50e422ed7ca173ff2cd497562462c3fcc49bd55013",x:67.582191,z:-75.057627,py:0.0104828796429387},
 {id:"nx-wild-wayside-0056",file:"work_1676_wayside.glb",sha:"21dd4ad5c0ad0b5397322c799c51e2e1d571076ec9960f8814101336de9773f1",x:85.652858,z:-53.521846,py:-0.009906056426071697},
 {id:"nx-wild-wayside-0058",file:"work_1689_wayside.glb",sha:"91f2a1bf9b997abe0e8481208927c00a67be5aa64fbbed97e42d32477de7bded",x:97.087431,z:-27.839373,py:-0.017884173579467824},
];
let n=77;
for(const s of SLOTS){
  const bytes=new Uint8Array(readFileSync(`${ROOT}/agents/arthur/mason/glb-retex/${s.file}`));
  const sha=createHash("sha256").update(bytes).digest("hex");
  if(sha!==s.sha)throw Error(`${s.id} hash drift: ${sha}`);
  const want={lib:`store/${s.sha.slice(0,16)}.glb`,pos:[s.x,s.py,s.z],yaw:YAW,scale:1};
  const before=await geom();const existing=before[s.id];
  if(existing&&!(e=>e&&e.lib===want.lib&&e.pos.every((nn:number,i:number)=>near(nn,want.pos[i]))&&near(e.yaw??0,YAW)&&e.scale===1)(existing))throw Error(`${s.id} id collision/drift`);
  const cc=Math.cos(YAW),ss=Math.sin(YAW);
  const dims=accBounds(`${ROOT}/agents/arthur/mason/glb-retex/${s.file}`);
  let inner=Infinity,outer=0;
  for(const[lx,lz]of[[-dims.w/2,-dims.d/2],[dims.w/2,-dims.d/2],[dims.w/2,dims.d/2],[-dims.w/2,dims.d/2]]){const wx=s.x+lx*cc+lz*ss,wz=s.z-lx*ss+lz*cc,r=Math.hypot(wx,wz);inner=Math.min(inner,r);outer=Math.max(outer,r)}
  if(inner<66||outer>108)throw Error(`${s.id} rim law violated inner=${inner} outer=${outer}`);
  let minGap=Infinity,minAgainst="";
  for(const e of Object.values(before).filter((e:any)=>e.bbox&&e.id!==s.id)){const g=gap(O(s.x,s.z,YAW,dims.w,dims.d),EO(e));if(g<minGap){minGap=g;minAgainst=e.id}if(g<-.001)throw Error(`${s.id} footprint overlaps ${e.id}: ${g}`)}
  if(!existing){
    const u=new URL(`${base}/upload`);u.searchParams.set("token",cfg.agentToken);u.searchParams.set("name",`commons-next se ${s.id} nvp-${n}`);u.searchParams.set("by",cfg.id);
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
  console.log(JSON.stringify({n:`nvp-${n}`,id:s.id,status:"PLACED_VERIFIED",rim:{inner:+inner.toFixed(4),outer:+outer.toFixed(4)},minGap:+minGap.toFixed(4),minAgainst}));
  n++;
}
console.log("SE WILD BATCH COMPLETE");
