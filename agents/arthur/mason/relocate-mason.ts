// relocate-mason.ts — one-at-a-time R-116 relocation placer.
// Set MASON_ID and MASON_X/MASON_Z. Captures current lib/pose/scale/components,
// spawns the same id at the supplied site, restores components, and verifies.
import { readFileSync } from "node:fs";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const DIR = `${ROOT}/agents/arthur`;
const cfg = JSON.parse(readFileSync(process.env.PLACER_CONFIG ?? `${DIR}/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const id = process.env.MASON_ID ?? "";
const x = Number(process.env.MASON_X), z = Number(process.env.MASON_Z);
if (!/^av-mason-\d{4}$/.test(id) || !Number.isFinite(x) || !Number.isFinite(z)) throw new Error("MASON_ID, MASON_X, MASON_Z required");
type Ent = { id:string; lib:string; pos:number[]; yaw:number; scale?:number; comp?:Record<string,any> };
async function geom() { const r=await fetch(`${base}/geom?world=${cfg.world}`); if(!r.ok)throw Error(`geom ${r.status}`); const d=await r.json() as {entities:Ent[]}; return Object.fromEntries(d.entities.map(e=>[e.id,e])); }
const before=await geom(), e=before[id]; if(!e)throw Error(`missing ${id}`);
console.log("captured",JSON.stringify({id,from:e.pos,yaw:e.yaw,scale:e.scale,lib:e.lib,comps:Object.keys(e.comp??{})}));
const verbs:[string,any][]=[["spawn",{id,lib:e.lib,pos:[x,e.pos[1]??0,z],yaw:e.yaw,scale:e.scale??1}]];
for(const [type,c] of Object.entries(e.comp??{}))verbs.push(["comp",{id,type,data:c?.data??c}]);
const ws=new WebSocket(cfg.url);let n=0,last=Date.now(),pending:[string,any]|null=null,re=0;const timer=setTimeout(()=>{console.log("TIMEOUT");process.exit(1)},120000);
function send(){if(n>=verbs.length)return;pending=verbs[n++];ws.send(JSON.stringify({type:"verb",verb:pending[0],args:pending[1]}));}
ws.onopen=()=>ws.send(JSON.stringify({type:"join",world:cfg.world,id:"arthur-mason-relocate",avatar:cfg.avatar,token:cfg.joinToken}));
ws.onmessage=(ev:any)=>{const m=JSON.parse(ev.data);if(m.type==="error")console.log("SERVER ERROR",JSON.stringify(m));if(m.type!=="snapshot"&&m.type!=="log")return;last=Date.now();re=0;if(n<verbs.length)send();else pending=null;};
const wd=setInterval(()=>{if(!pending||Date.now()-last<6000)return;if(re>=3){console.log("STALLED",pending[0]);process.exit(1)}re++;ws.send(JSON.stringify({type:"verb",verb:pending[0],args:pending[1]}))},1500);
while(n<verbs.length||pending)await new Promise(r=>setTimeout(r,250));await new Promise(r=>setTimeout(r,1200));clearInterval(wd);clearTimeout(timer);try{ws.close()}catch{}
const after=await geom(),a=after[id];const ok=!!a&&a.lib===e.lib&&Math.abs(a.pos[0]-x)<.01&&Math.abs(a.pos[2]-z)<.01&&Math.abs(a.yaw-e.yaw)<.005&&Math.abs((a.scale??1)-(e.scale??1))<.01&&Object.keys(a.comp??{}).length===Object.keys(e.comp??{}).length;console.log("verify",id,ok?"PASS":"FAIL",JSON.stringify({pos:a?.pos,yaw:a?.yaw,scale:a?.scale,comps:Object.keys(a?.comp??{})}));process.exit(ok?0:1);
