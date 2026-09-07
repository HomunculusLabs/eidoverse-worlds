// next-terrain-struct73.ts — read-only terrain preflight for struct-73
// (moongate first placement, SW district threshold (-43.84,-43.84) yaw 0,
// az -135 r62 — the scan winner, on-spoke).
// 7 points: center + N/S/E/W + NE/SW corners on the TRUE envelope
// (x half 2.90, z half 0.710, no center offset).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const PX=-43.84, PZ=-43.84, YAW=0;
const cs=Math.cos(YAW), sn=Math.sin(YAW);
const pt=(lx:number,lz:number):[number,number]=>[PX+lx*cs+lz*sn,PZ-lx*sn+lz*cs];
const HX=2.90, HZ=0.710, CZ=0.0;
const pts:[string,number,number][]=[
  ["mg-center",...pt(0,CZ)],
  ["mg-N",...pt(0,CZ-HZ)],
  ["mg-S",...pt(0,CZ+HZ)],
  ["mg-E",...pt(HX,CZ)],
  ["mg-W",...pt(-HX,CZ)],
  ["mg-NE",...pt(HX,CZ-HZ)],
  ["mg-SW",...pt(-HX,CZ+HZ)]
];
const agent=new WorldAgent({url:cfg.url,name:"arthur-struct73-terrain",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);const hs=pts.map(([name,x,z])=>({name,x:+x.toFixed(3),z:+z.toFixed(3),h:+agent.heightAt(x,z).toFixed(4)}));for(const r of hs)console.log(JSON.stringify(r));const vals=hs.map(r=>r.h);console.log(JSON.stringify({spread:+(Math.max(...vals)-Math.min(...vals)).toFixed(4),min:Math.min(...vals),max:Math.max(...vals),centerPY:hs[0].h}));}finally{agent.close();}
