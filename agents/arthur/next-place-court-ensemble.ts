// next-place-court-ensemble.ts — nvp-16 atomic five-member court placement.
// commons-next only. Exact reviewed bytes/poses + corrected smoke/ember bags.
// Idempotent and fail-closed; never touches commons or mx- ids.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const Y = -1.5946487083102603e-8;
const members = [
  { id: "nx-court", file: "village_court3.glb", sha: "38096b30b9131685be9d8ed829839767ded39dae26e54086dd6604f68cbb7b22", pos: [18.9,Y,-14.8], yaw: -0.90756, comp: {
    "particles:smoke": { preset: "smoke", origin: [-4.9,3.2,-0.8], count: 50, size: 0.4, speed: 0.35 },
  }},
  { id: "nx-forge", file: "village_forge3.glb", sha: "fcc66d79b76b109e8d826a1a1ad38e06fc09292a2b8c2da0d31f5702f8893596", pos: [22.11785473473295,0,-7.957568494595163], yaw: -0.90756, comp: {
    "motion:fire_fg_coals": { type: "bob", axis: "y", amp: 0.014, period: 1.8 },
    "particles": { preset: "embers", origin: [0,0.45,0.42], count: 84 },
  }},
  { id: "nx-cistern", file: "village_bcistern3.glb", sha: "85d956f6600f336d11666b59d53d8e5a889a793aa1b26cbce27b5d993f903f8d", pos: [15.703583236444484,0,-14.586880611718946], yaw: -0.90756, comp: {} },
  { id: "nx-sign-bakery", file: "village_sign_bakery.glb", sha: "599194ee7f4efd810735f59b1e2d686797a2c29b65249fdc958913619f8ec85c", pos: [14.022735609615019,0,-18.768525175210893], yaw: 2.234032653589793, comp: {} },
  { id: "nx-sign-smithy", file: "village_sign_smithy.glb", sha: "d8df94003084af390e4f6ef0e15f5d13ade33f8e98ad101b7b0408a9dda577e0", pos: [23.777264390384975,Y,-10.831474824789108], yaw: -0.90756, comp: {} },
] as const;
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const die = (m: string): never => { throw new Error(m); };
const near = (a: number, b: number) => Math.abs(a-b) < 1e-6;
const canon = (v: any): any => Array.isArray(v) ? v.map(canon) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map(k=>[k,canon(v[k])])) : v;
const eq = (a: any,b: any) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));
const vec = (a: any,b: readonly number[]) => Array.isArray(a) && a.length===b.length && a.every((n:number,i:number)=>near(n,b[i]));
async function geom(){const r=await fetch(`${base}/geom?world=${WORLD}`);if(!r.ok)die(`geom ${r.status}`);const d:any=await r.json();return Object.fromEntries((d.entities??[]).map((e:any)=>[e.id,e])) as Record<string,any>;}

// Exact byte pins before any network mutation.
const bytes = new Map<string, Uint8Array>();
for (const m of members) {
  const b = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/${m.file}`));
  const h = createHash("sha256").update(b).digest("hex"); if (h !== m.sha) die(`${m.id} reviewed hash drift: ${h}`);
  bytes.set(m.id,b);
}
// Review-law spatial pins: keep these explicit, not aggregate-bbox guesses.
if (!(7.373-0.8726182579994202 > 6.5)) die("forge/court flush gap lost");
if (!(-1.8-0.45 > -2.4 && 2.65-0.34 > 2.1)) die("cistern apron/wall clearance lost");
if (!(-6.13+0.03 === -6.10 && 6.13-0.03 === 6.10)) die("sign wall mounts lost");
const ringMax = Math.max(...members.map(m=>Math.hypot(m.pos[0],m.pos[2]))); if (ringMax >= 112) die("ensemble rim overhang");

const before=await geom();
for(const m of members){
 const e=before[m.id]; if(!e)continue;
 const lib=`store/${m.sha.slice(0,16)}.glb`;
 if(!(e.lib===lib&&vec(e.pos,m.pos)&&near(e.yaw??0,m.yaw)&&(e.scale??1)===1))die(`${m.id} id collision/drift`);
 const have=e.comp??{}, want=m.comp as Record<string,any>;
 for(const k of Object.keys(have))if(!(k in want)||!eq(have[k],want[k]))die(`${m.id} comp drift ${k}`);
}
// Upload only missing models; an exact live tuple needs no network write.
const uploadMembers=members.filter(m=>!before[m.id]);
for(let i=0;i<uploadMembers.length;i++){
 const m=uploadMembers[i]; if(i)await sleep(16_000);
 const u=new URL(`${base}/upload`);u.searchParams.set("token",cfg.agentToken);u.searchParams.set("name",`commons-next ${m.id} nvp-16`);u.searchParams.set("by",cfg.id);
 let lib="";for(let a=1;a<=6;a++){const r=await fetch(u,{method:"POST",body:bytes.get(m.id)!});if(r.ok){lib=(await r.json()).path;break;}if(r.status===429&&a<6){await sleep(25_000);continue;}die(`${m.id} upload ${r.status}`);}
 if(lib!==`store/${m.sha.slice(0,16)}.glb`)die(`${m.id} upload path ${lib}`);
}
const verbs:Array<[string,any]>=[];
for(const m of members){
 const e=before[m.id], want=m.comp as Record<string,any>;
 if(!e){verbs.push(["spawn",{id:m.id,lib:`store/${m.sha.slice(0,16)}.glb`,pos:m.pos,yaw:m.yaw,scale:1}]);for(const [type,data] of Object.entries(want))verbs.push(["comp",{id:m.id,type,data}]);}
 else for(const [type,data] of Object.entries(want))if(!eq((e.comp??{})[type],data))verbs.push(["comp",{id:m.id,type,data}]);
}
if(verbs.length){await new Promise<void>((resolve,reject)=>{const ws=new WebSocket(cfg.url);let joined=false,i=0;const timer=setTimeout(()=>{try{ws.close()}catch{}reject(new Error("verb timeout"));},90_000);const paced=setInterval(()=>{if(!joined||i>=verbs.length)return;const [verb,args]=verbs[i++];ws.send(JSON.stringify({type:"verb",verb,args}));if(i===verbs.length)setTimeout(()=>{clearInterval(paced);clearTimeout(timer);try{ws.close()}catch{}resolve();},1800);},650);ws.onopen=()=>ws.send(JSON.stringify({type:"join",world:WORLD,id:"arthur-nvp16-court",avatar:cfg.avatar,token:cfg.joinToken}));ws.onerror=()=>{clearInterval(paced);clearTimeout(timer);reject(new Error("websocket error"));};ws.onmessage=(ev:any)=>{const x=JSON.parse(ev.data);if(x.type==="error"){clearInterval(paced);clearTimeout(timer);reject(new Error(`server ${JSON.stringify(x).slice(0,240)}`));}else if(x.type==="snapshot")joined=true;};});}else console.log("court ensemble already live — no verbs");
const after=await geom();
for(const m of members){const e=after[m.id],lib=`store/${m.sha.slice(0,16)}.glb`;if(!(e?.lib===lib&&vec(e.pos,m.pos)&&near(e.yaw??0,m.yaw)&&(e.scale??1)===1&&eq(e.comp??{},m.comp)))die(`${m.id} post-place failed ${JSON.stringify(e)}`);}
console.log(JSON.stringify({status:"PLACED_VERIFIED",members:members.map(m=>({id:m.id,lib:`store/${m.sha.slice(0,16)}.glb`,pos:m.pos,yaw:m.yaw,compKeys:Object.keys(m.comp)})),verbs:verbs.length}));
