// next-terrain-city4.ts — read-only terrain preflight for city-4 millrace relocation.
// Seat az175 r77, yaw 100.3607deg: pos (-76.707, 6.711), rectangle local 3.427 x 14.464
// center offset (0,3.432). 7 points: pos, 4 corners, head end (local z +10.664), basin end (z -3.8).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const PX=-76.7070, PZ=6.7110, YAW=100.3607*Math.PI/180;
const C=Math.cos(YAW), S=Math.sin(YAW);
const w=(lx:number,lz:number):[number,number]=>[PX+lx*C+lz*S, PZ-lx*S+lz*C];
const pts:[string,number,number][]=[
  ["seat-pos",PX,PZ],
  ["corner-1",...w(-1.7135,3.432-7.232)],
  ["corner-2",...w(1.7135,3.432-7.232)],
  ["corner-3",...w(-1.7135,3.432+7.232)],
  ["corner-4",...w(1.7135,3.432+7.232)],
  ["head-end",...w(0,10.664)],
  ["basin-end",...w(0,-3.8)],
];
const agent=new WorldAgent({url:cfg.url,name:"arthur-city4-terrain",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);const hs:number[]=[];for(const [name,x,z] of pts){const h=agent.heightAt(x,z);hs.push(h);console.log(JSON.stringify({name,x:Math.round(x*1000)/1000,z:Math.round(z*1000)/1000,heightAt:h}));}
const mn=Math.min(...hs),mx=Math.max(...hs);console.log(JSON.stringify({spread_mm:Math.round((mx-mn)*10000)/10,mean:Math.round((hs.reduce((a,b)=>a+b,0)/hs.length)*10000)/10000}));}finally{agent.close();}
