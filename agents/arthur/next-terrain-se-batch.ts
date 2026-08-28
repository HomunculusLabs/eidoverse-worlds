// next-terrain-se-batch.ts — terrain preflight for all 15 SE Wild slots (read-only).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));process.env.WORLD_TOKEN=cfg.joinToken;
const pts:[string,number,number][]=[["se-forest-0010",10.577156,-75.260373],["se-forest-0018",30.911985,-69.429455],["se-forest-0044",48.851858,-58.219378],["se-forest-0057",63.006856,-42.498661],["se-forest-0031",72.280295,-23.485292],["se-cairn-0022",28.73858,-88.448256],["se-cairn-0048",52.00494,-77.100494],["se-cairn-0043",71.242133,-59.779248],["se-cairn-0047",84.959728,-37.826508],["se-cairn-0050",92.09493,-12.943098],["se-wayside-0009",17.538466,-99.465583],["se-wayside-0030",44.275486,-90.778199],["se-wayside-0045",67.582191,-75.057627],["se-wayside-0056",85.652858,-53.521846],["se-wayside-0058x",97.087431,-27.839373]];
const agent=new WorldAgent({url:cfg.url,name:"arthur-terrain-read",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);
for(const[n,x,z]of pts)console.log(JSON.stringify({name:n,x,z,heightAt:agent.heightAt(x,z)}));}
finally{agent.close()}
