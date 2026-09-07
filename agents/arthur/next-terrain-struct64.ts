// next-terrain-struct64.ts — read-only terrain preflight for struct-64
// (ellipse court placement at (0,·,−47) yaw π/2, world-Z major axis).
// 7 points: center, both walk-axis ends (true decoded envelope z ±6.97),
// both foci (z ±5.6), both minor-axis extremes (x ±4.475).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const pts:[string,number,number][]=[
  ["court-center",0,-47],
  ["court-endS",0,-40.03],
  ["court-endN",0,-53.97],
  ["court-focusS",0,-41.3],
  ["court-focusN",0,-52.6],
  ["court-east",4.475,-47],
  ["court-west",-4.475,-47]
];
const agent=new WorldAgent({url:cfg.url,name:"arthur-struct64-terrain",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);const hs=pts.map(([name,x,z])=>({name,x,z,h:agent.heightAt(x,z)}));for(const r of hs)console.log(JSON.stringify(r));const vals=hs.map(r=>r.h);console.log(JSON.stringify({spread:Math.max(...vals)-Math.min(...vals),min:Math.min(...vals),max:Math.max(...vals)}));}finally{agent.close();}
