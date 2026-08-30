// verify-interior0.ts — persistent focused gate for the commons-next inn room.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
const ROOT="/Users/t3rpz/projects/eidoverse-worlds",WORLD="commons-next",ID="nx-town-inn",LID="nx-town-inn-l",SHA="9fdf24522f0de63fbab86c044609681e6361912dc7dabfa6778f8e7af413bcee";
const cfg=JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`,"utf8")),base=cfg.url.replace("wss://","https://").replace("ws://","http://").replace("/ws","");let fails=0;const ck=(n:string,c:boolean,d="")=>{console.log(`${c?"PASS":"FAIL"} ${n}${d?" — "+d:""}`);if(!c)fails++},near=(a:number,b:number)=>Math.abs(a-b)<1e-6,vec=(a:any,b:number[])=>Array.isArray(a)&&a.length===b.length&&a.every((n:number,i:number)=>near(n,b[i]));
const file=`${ROOT}/agents/arthur/assets/village_inn3.glb`,buf=readFileSync(file),jl=buf.readUInt32LE(12),j=JSON.parse(buf.subarray(20,20+jl).toString()),names=j.nodes.map((n:any)=>n.name);
ck("reviewed bytes",createHash("sha256").update(buf).digest("hex")===SHA);
ck("healthy node/draw budget",j.nodes.length===30&&j.meshes.length===29,`${j.nodes.length} nodes ${j.meshes.length} meshes`);
ck("fire/sign/light anchors",["fire","flame","sign","lamp","lamp2"].every(n=>names.includes(n)));
ck("source keeps 1.4m corridor",/local x ±0\.7/.test(readFileSync(`${ROOT}/agents/arthur/assets/mkv3-landmarks.ts`,"utf8")));
const r=await fetch(`${base}/geom?world=${WORLD}`),d:any=await r.json(),by=Object.fromEntries(d.entities.map((e:any)=>[e.id,e])) as Record<string,any>,e=by[ID],l=by[LID];
ck("live inn exact tuple",e?.lib===`store/${SHA.slice(0,16)}.glb`&&vec(e.pos,[36,0,0])&&near(e.yaw,-Math.PI/2)&&e.scale===1&&Object.keys(e.comp??{}).length===0);
ck("warm light identity + pose",l?.kind==="light"&&vec(l.pos,[36,2.35,0]));
const authored=await new Promise<any>((resolve,reject)=>{const ws=new WebSocket(cfg.url),out:any={},t=setTimeout(()=>reject(Error("history timeout")),30_000);ws.onopen=()=>ws.send(JSON.stringify({type:"join",world:WORLD,id:"arthur-interior0-verify",avatar:cfg.avatar,token:cfg.joinToken,spectate:true}));ws.onerror=()=>reject(Error("history ws"));ws.onmessage=(ev:any)=>{const m=JSON.parse(ev.data);if(m.type==="snapshot")ws.send(JSON.stringify({type:"history",verbs:["light"],limit:300}));else if(m.type==="history"){for(const z of m.entries??[]){const x=z.args??z;if(x.id!==LID)continue;for(const k of ["pos","color","intensity","range"])if(x[k]!==undefined)out[k]=x[k]}clearTimeout(t);ws.close();resolve(out)}}});
ck("warm light authored params",authored.color===0xffb066&&near(authored.intensity,1.6)&&near(authored.range,6),JSON.stringify(authored));
const walk=execSync("bun agents/arthur/interior-walk-inn.ts verify",{cwd:ROOT,encoding:"utf8",timeout:90_000});ck("two-way MCPL walk",walk.includes('"status": "ALL_PASS"')&&walk.includes('"maxArrival": 0.36403413979301175'));
const gate=execSync("bun agents/arthur/verify-repairs.ts",{cwd:ROOT,encoding:"utf8",timeout:120_000});ck("standing gate",gate.includes("ALL PASS"));
console.log(fails?`${fails} FAIL`:"ALL PASS");process.exit(fails?1:0);
