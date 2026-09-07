// next-terrain-struct66.ts — read-only terrain preflight for struct-66
// (R-122 court reseat at (-3.75,·,-50.75) yaw π/2, world-Z major axis).
// 7 points: center, both walk-axis ends (local major x = ±6.97 rotated to
// world Z), both foci (local x = ±5.6), both minor extremes (local z ±4.475
// rotated to world X).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const PX=-3.75, PZ=-50.75, YAW=Math.PI/2;
const cs=Math.cos(YAW), sn=Math.sin(YAW);
const pt=(lx:number,lz:number):[number,number]=>[PX+lx*cs+lz*sn,PZ-lx*sn+lz*cs];
const pts:[string,number,number][]=[
  ["court-center",...pt(0,0)],
  ["court-end1",...pt(6.97,0)],
  ["court-end2",...pt(-6.97,0)],
  ["court-focus1",...pt(5.6,0)],
  ["court-focus2",...pt(-5.6,0)],
  ["court-east",...pt(0,4.475)],
  ["court-west",...pt(0,-4.475)]
];
const agent=new WorldAgent({url:cfg.url,name:"arthur-struct66-terrain",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);const hs=pts.map(([name,x,z])=>({name,x:+x.toFixed(3),z:+z.toFixed(3),h:+agent.heightAt(x,z).toFixed(4)}));for(const r of hs)console.log(JSON.stringify(r));const vals=hs.map(r=>r.h);console.log(JSON.stringify({spread:+(Math.max(...vals)-Math.min(...vals)).toFixed(4),min:Math.min(...vals),max:Math.max(...vals)}));}finally{agent.close();}
