// next-terrain-sw-batch.ts — terrain preflight for all 13 SW Contemplative slots (read-only).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));process.env.WORLD_TOKEN=cfg.joinToken;
const pts:[string,number,number][]=[["sw-terrace-0035",-75.710797,-6.623836],["sw-terrace-0037",-69.958369,-29.695566],["sw-terrace-0040",-57.357928,-49.860486],["sw-terrace-0049",-39.142894,-65.144715],["sw-terrace-0039",-17.09628,-74.052125],["sw-labyrinth-0004",-95.088981,-23.708346],["sw-labyrinth-0025",-79.283665,-57.602955],["sw-labyrinth-0038",-51.932088,-83.108713],["sw-labyrinth-0051",-17.017521,-96.51116],["sw-seed-0003",-68.890997,-17.176455],["sw-seed-0013",-60.211415,-37.624268],["sw-seed-0021",-45.63792,-54.389155],["sw-seed-0034",-26.597068,-65.830054]];
const agent=new WorldAgent({url:cfg.url,name:"arthur-terrain-read",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);
for(const[n,x,z]of pts)console.log(JSON.stringify({name:n,x,z,heightAt:agent.heightAt(x,z)}));}
finally{agent.close()}
