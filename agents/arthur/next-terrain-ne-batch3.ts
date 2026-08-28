// next-terrain-ne-cloister0042.ts — terrain preflight (read-only).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));process.env.WORLD_TOKEN=cfg.joinToken;
const pts:[string,number,number][]=[["craft-cloister-0042 slot",40.266928,90.441000],["craft-cloister-0055 slot",20.152275,96.927948],["craft-hamlet-0028 slot",16.693968,68.020982],["craft-hamlet-0041 slot",53.284536,67.426945],["craft-hamlet-0054 slot",70.685634,68.463640]];
const agent=new WorldAgent({url:cfg.url,name:"arthur-terrain-read",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);
for(const[n,x,z]of pts)console.log(JSON.stringify({name:n,x,z,heightAt:agent.heightAt(x,z)}));}
finally{agent.close()}
