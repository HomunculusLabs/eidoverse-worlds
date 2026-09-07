// next-terrain-dress80-compost.ts — read-only terrain preflight for dress-80
// (NW compost). Site: headland at garden-0019's plaza-facing (+z) edge,
// center (-72.78, 57.68), yaw 2.35619, footprint x -1.77..2.02 z -0.63..0.81.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const c=Math.cos(2.35619449), s=Math.sin(2.35619449);
const corners:[string,number,number][]=[
 ["c-fl",-1.77,-0.63],["c-fr",2.02,-0.63],["c-bl",-1.77,0.81],["c-br",2.02,0.81],
 ["center",0,0],
];
const pts:[string,number,number][] = corners.map(([n,lx,lz])=>[n,-72.78+lx*c+lz*s,57.68-lx*s+lz*c]);
const agent=new WorldAgent({url:cfg.url,name:"arthur-dress80-terrain",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);for(const [name,x,z] of pts)console.log(JSON.stringify({name,x:Math.round(x*100)/100,z:Math.round(z*100)/100,heightAt:agent.heightAt(x,z)}));}finally{agent.close();}
