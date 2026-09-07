// next-terrain-struct72.ts — read-only terrain preflight for struct-72
// (catenarygate deferred placement, N meridian threshold (0,-60.5) yaw 0).
// 7 points: center + N/S/E/W + NE/SW corners on the TRUE envelope
// (x half 4.52, z half 0.95, local center offset z +0.078).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const PX=0, PZ=-60.5, YAW=0;
const cs=Math.cos(YAW), sn=Math.sin(YAW);
const pt=(lx:number,lz:number):[number,number]=>[PX+lx*cs+lz*sn,PZ-lx*sn+lz*cs];
const HX=4.52, HZ=0.95, CZ=0.078;
const pts:[string,number,number][]=[
  ["cg-center",...pt(0,CZ)],
  ["cg-N",...pt(0,CZ-HZ)],
  ["cg-S",...pt(0,CZ+HZ)],
  ["cg-E",...pt(HX,CZ)],
  ["cg-W",...pt(-HX,CZ)],
  ["cg-NE",...pt(HX,CZ-HZ)],
  ["cg-SW",...pt(-HX,CZ+HZ)]
];
const agent=new WorldAgent({url:cfg.url,name:"arthur-struct72-terrain",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);const hs=pts.map(([name,x,z])=>({name,x:+x.toFixed(3),z:+z.toFixed(3),h:+agent.heightAt(x,z).toFixed(4)}));for(const r of hs)console.log(JSON.stringify(r));const vals=hs.map(r=>r.h);console.log(JSON.stringify({spread:+(Math.max(...vals)-Math.min(...vals)).toFixed(4),min:Math.min(...vals),max:Math.max(...vals),centerPY:hs[0].h}));}finally{agent.close();}
