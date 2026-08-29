// next-terrain-mosaic-row.ts — terrain preflight for the 4 ring-road mosaic slots (read-only).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));process.env.WORLD_TOKEN=cfg.joinToken;
const pts:[string,number,number][]=[["mosaic-30deg",38.971143,22.5],["mosaic-90deg",0,45],["mosaic-150deg",-38.971143,22.5],["mosaic-210deg",-38.971143,-22.5]];
const agent=new WorldAgent({url:cfg.url,name:"arthur-terrain-read",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);
for(const[n,x,z]of pts)console.log(JSON.stringify({name:n,x,z,heightAt:agent.heightAt(x,z)}));}
finally{agent.close()}
