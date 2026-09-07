// next-terrain-city5.ts — read-only terrain preflight for city-5 reedpool+angler relocation.
// NEW seat az276.1 r91.5 (9.723,-90.982) yaw 0; angler world center (3.783,-92.922).
// 8 points: new pos, 4 pool corners, angler center, + OLD pool pos (grade-delta
// reference so PY preserves the accepted embed/waterline relationship exactly).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const PX=9.723, PZ=-90.982, YAW=0;
const C=Math.cos(YAW), S=Math.sin(YAW);
const w=(lx:number,lz:number):[number,number]=>[PX+lx*C+lz*S, PZ-lx*S+lz*C];
const pts:[string,number,number][]=[
  ["corner-1",...w(-5.187,-4)],
  ["corner-2",...w(5.187,-4)],
  ["corner-3",...w(-5.187,4)],
  ["corner-4",...w(5.187,4)],
  // angler TRUE OBB corners = world center (3.783,-92.922) ± (2.28, 3.04)
  // (self-catch: first probe used pos-point ± extents, off by center offset 0.58)
  ["angler-c1",3.783-2.28,-92.922-3.04],
  ["angler-c2",3.783+2.28,-92.922-3.04],
  ["angler-c3",3.783-2.28,-92.922+3.04],
  ["angler-c4",3.783+2.28,-92.922+3.04],
];
const agent=new WorldAgent({url:cfg.url,name:"arthur-city5-terrain",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);const hs:number[]=[];for(const [name,x,z] of pts){const h=agent.heightAt(x,z);hs.push(h);console.log(JSON.stringify({name,x:Math.round(x*1000)/1000,z:Math.round(z*1000)/1000,heightAt:h}));}
const poolC=hs.slice(0,4),angC=hs.slice(4,8);
console.log(JSON.stringify({pool_lowest:+Math.min(...poolC).toFixed(5),angler_lowest:+Math.min(...angC).toFixed(5),pool_spread_mm:Math.round((Math.max(...poolC)-Math.min(...poolC))*10000)/10,angler_spread_mm:Math.round((Math.max(...angC)-Math.min(...angC))*10000)/10}));}finally{agent.close();}
