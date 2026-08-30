// next-terrain-artwalk-h3.ts — read-only terrain preflight for H-3's provisional SE-spoke site.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const x=32.526911934581186,z=-32.526911934581186;
const agent=new WorldAgent({url:cfg.url,name:"arthur-artwalk-h3-terrain-read",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);console.log(JSON.stringify({name:"artwalk-h3-se-spoke-r46",x,z,heightAt:agent.heightAt(x,z)}));}
finally{agent.close()}
