// next-terrain-artwalk-h2.ts — read-only terrain preflight for H-2's provisional SE-spoke site.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const x=27,z=-27;
const agent=new WorldAgent({url:cfg.url,name:"arthur-artwalk-terrain-read",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);console.log(JSON.stringify({name:"artwalk-h2-se-spoke",x,z,heightAt:agent.heightAt(x,z)}));}
finally{agent.close()}
