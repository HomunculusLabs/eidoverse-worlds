// next-place-nw-cultivation-batch.ts — nvp-74..86 exact reviewed placements.
// All 13 remaining NW Cultivation works (landmark orchard-0033 already live via nvp-24/25).
// Yaw 2.35619449 common inward. Families: lavender/orchard/garden carry NO comps.
import {readFileSync}from"node:fs";import{createHash}from"node:crypto";
const ROOT="/Users/t3rpz/projects/eidoverse-worlds",WORLD="commons-next",YAW=2.35619449;
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
 {id:"nx-cultivation-lavender-0006",file:"work_1686_lavender.glb",sha:"26f0eed96a94e0d2deac052aa7dee8578134d4f1990ee34edd51eed668ef7afa",x:-70.014900,z:-35.078289,py:-0.0004947114605311142},
 {id:"nx-cultivation-lavender-0027",file:"work_1647_lavender.glb",sha:"d4ab74d0d530b4a89ff37b466c936cb863819b9cc44a49b993bd28919c824819",x:-72.176004,z:-4.061642,py:-0.01695650782254923},
 {id:"nx-cultivation-lavender-0040",file:"work_1660_lavender.glb",sha:"56b752abf7f5eba4b816b4afb535de02578b5b22147845aade0df057c35f1936",x:-72.460363,z:16.482309,py:-0.020205272037761405},
 {id:"nx-cultivation-lavender-0053",file:"work_1673_lavender.glb",sha:"d8fac6d1e0279f07742fb72cf858cebb13015f54d661dd286e5c6f19a27e003a",x:-72.170355,z:37.064199,py:0.014363751990676512},
 {id:"nx-cultivation-orchard-0012",file:"work_1692_orchard.glb",sha:"dc4d7059985e47a87aa3d50534748a51276b9be00afd1c92fb8b9ec82b03d0bb",x:-88.057074,z:-37.432727,py:-0.004463183328288452},
 {id:"nx-cultivation-orchard-0020",file:"work_1640_orchard.glb",sha:"24bcfc6a15d556134df9b9e42e789735272c8ef69ce2819aaa88f2dbfe4b58b4",x:-84.253740,z:-22.172881,py:-0.0035455318183480068},
 {id:"nx-cultivation-orchard-0046",file:"work_1666_orchard.glb",sha:"ec93dc09acc0ddfa56e817ec3f311d4680c88e097cc1e34fada1e437a96783fd",x:-88.621635,z:27.516932,py:0.005982021495911915},
 {id:"nx-cultivation-orchard-0059",file:"work_1679_orchard.glb",sha:"8d3959f01e32c335c290d94b46da3551d45d55e624805c2c36638fa851f1672f",x:-86.667822,z:42.978943,py:0.029101749695591757},
 {id:"nx-cultivation-garden-0011",file:"work_1691_garden.glb",sha:"01a4e80c02f03de70a58699236545177fa871272015059855bb3aa1096d38b3a",x:-98.134314,z:-23.463220,py:0.006751760350572518},
 {id:"nx-cultivation-garden-0019",file:"work_1639_garden.glb",sha:"d916f37355701255d870729d39cfa3ebe495d362978faf925190aeb34faae6af",x:-100.985110,z:-11.113809,py:0.01559242508695654},
 {id:"nx-cultivation-garden-0032",file:"work_1652_garden.glb",sha:"38e4718c5efd13749ea57027ad5216254d15266d99c2526b4aa9d1b8634566fe",x:-101.258989,z:1.027643,py:0.02051678931812788},
 {id:"nx-cultivation-garden-0045",file:"work_1665_garden.glb",sha:"856d56746e3a42a33e53150d9b6107b5d2f43d1b79194b581e5bc537619e1075",x:-100.662183,z:13.757923,py:0.012185307514404756},
 {id:"nx-cultivation-garden-0058",file:"work_1678_garden.glb",sha:"e54ee386f08a7c21c4abf92a4db15224c08717a4befaf08943948954cb8b8111",x:-89.077833,z:13.853542,py:-0.0011892747779652347},
];
let n=74;
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
    const u=new URL(`${base}/upload`);u.searchParams.set("token",cfg.agentToken);u.searchParams.set("name",`commons-next nw ${s.id} nvp-${n}`);u.searchParams.set("by",cfg.id);
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
console.log("NW CULTIVATION BATCH COMPLETE");
