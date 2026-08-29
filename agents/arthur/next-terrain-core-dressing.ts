// next-terrain-core-dressing.ts — terrain preflight for 16 dressing slots (read-only).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));process.env.WORLD_TOKEN=cfg.joinToken;
const pts:[string,number,number][]=[["banner",-4.0,9.5],["stringlights",-6.5,6.5],["giftshelf",-9.0,9.0],["fountain",8.5,8.5],["bench-plaza",-9.5,-9.5],["goats",36.0,8.0],["coop",36.0,-8.0],["hens",33.5,-6.0],["hutch",38.5,-9.5],["harvestcart",12.0,36.0],["churn",20.0,35.0],["milkstand",22.5,33.0],["charcoal",31.0,35.5],["stablebench",33.0,3.5],["well",30.0,-4.5],["chess",-27.5,-9.0]];
const agent=new WorldAgent({url:cfg.url,name:"arthur-terrain-read",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);
for(const[n,x,z]of pts)console.log(JSON.stringify({name:n,x,z,heightAt:agent.heightAt(x,z)}));}
finally{agent.close()}
