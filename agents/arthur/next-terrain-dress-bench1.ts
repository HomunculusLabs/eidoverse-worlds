// next-terrain-dress-bench1.ts — read-only terrain preflight for dress-6 (NE stone benches).
// Site: (14.23, 73.13), yaw 11deg (local +z faces az 79 outward).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const YAW=11*Math.PI/180, C=Math.cos(YAW), S=Math.sin(YAW);
const pts:[string,number,number][]=[["cluster-center",14.23,73.13]];
for(const [lx,lz] of [[-2.1,-1.1],[2.1,-1.1],[-2.1,1.1],[2.1,1.1]] as [number,number][])
 pts.push(["corner "+lx+","+lz, 14.23+lx*C+lz*S, 73.13-lx*S+lz*C]);
const agent=new WorldAgent({url:cfg.url,name:"arthur-dress6-terrain",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);for(const [name,x,z] of pts)console.log(JSON.stringify({name,x:+x.toFixed(2),z:+z.toFixed(2),heightAt:agent.heightAt(x,z)}));}finally{agent.close();}
