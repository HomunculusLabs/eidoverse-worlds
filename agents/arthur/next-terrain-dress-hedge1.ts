// next-terrain-dress-hedge1.ts — read-only terrain preflight for dress-1 (NW hedgerow).
// Site: SE edge of nx-cultivation-lavender-0027, 2.5m outside, yaw -0.784.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const pts:[[string,number,number],[string,number,number],[string,number,number]]=[
 ["hedge-center",-35.34,62.14],
 ["hedge-end-a",-37.69,64.46],
 ["hedge-end-b",-32.99,59.82]
];
const agent=new WorldAgent({url:cfg.url,name:"arthur-dress1-terrain",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);for(const [name,x,z] of pts)console.log(JSON.stringify({name,x,z,heightAt:agent.heightAt(x,z)}));}finally{agent.close();}
