// next-terrain-struct71.ts — read-only terrain preflight for struct-71
// (CITY-PLAN wave-1 relocation #1: soundmirror -> SE wild edge (35.46,-55.66)
// az -57.5 r 66, yaw 0). 7 points: center + N/S/E/W + NE/SW rim on the
// true disc r2.30 (bbox half-extent — the five rings are full circles).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const PX=35.46, PZ=-55.66, YAW=0;
const cs=Math.cos(YAW), sn=Math.sin(YAW);
const pt=(lx:number,lz:number):[number,number]=>[PX+lx*cs+lz*sn,PZ-lx*sn+lz*cs];
const R=2.30, diag=R*Math.SQRT1_2;
const pts:[string,number,number][]=[
  ["sm-center",...pt(0,0)],
  ["sm-N",...pt(0,-R)],
  ["sm-S",...pt(0,R)],
  ["sm-E",...pt(R,0)],
  ["sm-W",...pt(-R,0)],
  ["sm-NE-rim",...pt(diag,-diag)],
  ["sm-SW-rim",...pt(-diag,diag)]
];
const agent=new WorldAgent({url:cfg.url,name:"arthur-struct71-terrain",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);const hs=pts.map(([name,x,z])=>({name,x:+x.toFixed(3),z:+z.toFixed(3),h:+agent.heightAt(x,z).toFixed(4)}));for(const r of hs)console.log(JSON.stringify(r));const vals=hs.map(r=>r.h);console.log(JSON.stringify({spread:+(Math.max(...vals)-Math.min(...vals)).toFixed(4),min:Math.min(...vals),max:Math.max(...vals),centerPY:hs[0].h}));}finally{agent.close();}
