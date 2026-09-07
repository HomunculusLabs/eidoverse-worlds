// next-terrain-struct65.ts — read-only terrain preflight for struct-65
// (wave pergola at (51,·,9) yaw 0 — wave axis on world X, E-spoke north verge).
// 5 points: center, both rail ends (x ±7.09), both crest points (x ±3.5).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const pts:[string,number,number][]=[
  ["center",51,9],
  ["end-w",43.91,9],
  ["end-e",58.09,9],
  ["crest-w",47.5,9],
  ["crest-e",54.5,9],
  ["north-post",51,11.2],
  ["south-post",51,6.8]
];
const agent=new WorldAgent({url:cfg.url,name:"arthur-struct65-terrain",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);const hs=pts.map(([name,x,z])=>({name,x,z,h:agent.heightAt(x,z)}));for(const r of hs)console.log(JSON.stringify(r));const vals=hs.map(r=>r.h);console.log(JSON.stringify({spread:Math.max(...vals)-Math.min(...vals),min:Math.min(...vals),max:Math.max(...vals)}));}finally{agent.close();}
