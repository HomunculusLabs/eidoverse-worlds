// next-terrain-dress5-skeps.ts — read-only terrain preflight for dress-5 (NW skeps).
// Site: plaza-facing (SE) edge of nx-cultivation-orchard-0033, ~3.2m outside.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const pts:[[string,number,number],[string,number,number],[string,number,number],[string,number,number]]=[
 ["skep-center",-53.57,54.50],
 ["row-end-a",-55.72,53.65],
 ["row-end-b",-51.20,55.28],
 ["boulder",-54.30,53.60]
];
const agent=new WorldAgent({url:cfg.url,name:"arthur-dress5-terrain",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);for(const [name,x,z] of pts)console.log(JSON.stringify({name,x,z,heightAt:agent.heightAt(x,z)}));}finally{agent.close();}
