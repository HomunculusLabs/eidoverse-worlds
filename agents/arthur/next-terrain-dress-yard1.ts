// next-terrain-dress-yard1.ts — read-only terrain preflight for dress-2 (NE work yard).
// Site: (55.91, 87.10), yaw az+90 = 147.3deg; yard local bbox x -1.40..1.405, z -2.025..1.445.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const YAW=147.3*Math.PI/180, C=Math.cos(YAW), S=Math.sin(YAW);
const pts:[string,number,number][]=[
 ["yard-center",55.91,87.10],
];
for(const [lx,lz] of [[-1.4,-2.025],[1.4,-2.025],[-1.4,1.445],[1.4,1.445]] as [number,number][])
 pts.push(["corner "+lx+","+lz, 55.91+lx*C+lz*S, 87.10-lx*S+lz*C]);
const agent=new WorldAgent({url:cfg.url,name:"arthur-dress2-terrain",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);for(const [name,x,z] of pts)console.log(JSON.stringify({name,x:+x.toFixed(2),z:+z.toFixed(2),heightAt:agent.heightAt(x,z)}));}finally{agent.close();}
