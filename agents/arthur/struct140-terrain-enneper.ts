// next-terrain-struct-millrace.ts — read-only terrain preflight for struct-8.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const pts:[string,number,number][]=[
 ["c",-17.439118,249.391013],
 ["n",-17.439118,245.141013],
 ["s",-17.439118,253.641013],
 ["e",-22.289118,249.391013],
 ["w",-12.589118,249.391013],
 ["ne",-22.289118,245.141013],
 ["nw",-12.589118,245.141013],
 ["se",-22.289118,253.641013],
 ["sw",-12.589118,253.641013]
];
const agent=new WorldAgent({url:cfg.url,name:"arthur-struct140-terrain",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);for(const [name,x,z] of pts)console.log(JSON.stringify({name,x,z,heightAt:agent.heightAt(x,z)}));}finally{agent.close();}
