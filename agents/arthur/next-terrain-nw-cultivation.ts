// next-terrain-nw-cultivation.ts — REVIEW-tick terrain preflight (read-only).
// Joins commons-next headless and prints WorldAgent.heightAt at given coords.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));process.env.WORLD_TOKEN=cfg.joinToken;
const pts:[string,number,number][]=[["craft-0015 slot",79.285079,38.519433]];
const agent=new WorldAgent({url:cfg.url,name:"arthur-terrain-read",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);
for(const[n,x,z]of pts)console.log(JSON.stringify({name:n,x,z,heightAt:agent.heightAt(x,z)}));}
finally{agent.close()}
