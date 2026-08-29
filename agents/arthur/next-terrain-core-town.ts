// next-terrain-core-town.ts — terrain preflight for 22 core town slots (read-only).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));process.env.WORLD_TOKEN=cfg.joinToken;
const pts:[string,number,number][]=[["mapboard",2.5,9.5],["market",-6.5,6.5],["monument",-7,-7],["hall",9,-26],["longhouse",9,26],["tower-house",-9,26],["bunkhouse",-9,-26],["row-cottage",-23,-17],["garden-cottage",-23,17],["inn",36,0],["stable",43,0],["windmill",-40,0],["woodyard",16,31],["kiln",31,39],["potter",26,40.5],["dyehouse",-23,-23],["shrine",-25,-4],["belltower",6.5,6.5],["gate-n",0,-19.5],["gate-s",0,19.5],["gate-e",19.5,0],["gate-w",-19.5,0]];
const agent=new WorldAgent({url:cfg.url,name:"arthur-terrain-read",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);
for(const[n,x,z]of pts)console.log(JSON.stringify({name:n,x,z,heightAt:agent.heightAt(x,z)}));}
finally{agent.close()}
