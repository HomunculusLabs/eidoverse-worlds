// next-terrain-nw-batch.ts — terrain preflight for all 13 NW Cultivation slots (read-only).
// Slot world coords derived from NW-CULTIVATION-PLAN.md table (r*u + t*v, u=(-q,q), v=(q,q)).
// NOTE: orchard-0033 (landmark) is the 14th slot — uses village_cultivation_orchard_0033.glb, not in this batch.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));process.env.WORLD_TOKEN=cfg.joinToken;
const pts:[string,number,number][]=[
 ["lavender-0006",-70.014900,-35.078289],
 ["lavender-0027",-72.176004,-4.061642],
 ["lavender-0040",-72.460363,16.482309],
 ["lavender-0053",-72.170355,37.064199],
 ["orchard-0012",-88.057074,-37.432727],
 ["orchard-0020",-84.253740,-22.172881],
 ["orchard-0046",-88.621635,27.516932],
 ["orchard-0059",-86.667822,42.978943],
 ["garden-0011",-98.134314,-23.463220],
 ["garden-0019",-100.985110,-11.113809],
 ["garden-0032",-101.258989,1.027643],
 ["garden-0045",-100.662183,13.757923],
 ["garden-0058",-89.077833,13.853542],
];
const agent=new WorldAgent({url:cfg.url,name:"arthur-terrain-read",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);
for(const[n,x,z]of pts)console.log(JSON.stringify({name:n,x,z,heightAt:agent.heightAt(x,z)}));}
finally{agent.close()}
