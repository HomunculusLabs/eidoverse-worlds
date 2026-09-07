// next-terrain-dress83-timberyard.ts — read-only terrain preflight for dress-83
// (NE timberyard placement). Site: the cloister-0016 <-> hamlet-0028 field gap,
// center (76.7, 69.4), yaw -2.35619, TRUE local footprint x -1.5..1.5 z -0.9..1.78.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const c=Math.cos(-2.356194490192345), s=Math.sin(-2.356194490192345);
const corners:[string,number,number][]=[
 ["c-fl",-1.5,-0.9],["c-fr",1.5,-0.9],["c-bl",-1.5,1.78],["c-br",1.5,1.78],
 ["center",0,0],
];
const pts:[string,number,number][] = corners.map(([n,lx,lz])=>[n,76.7+lx*c+lz*s,69.4-lx*s+lz*c]);
const agent=new WorldAgent({url:cfg.url,name:"arthur-dress83-terrain",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);for(const [name,x,z] of pts)console.log(JSON.stringify({name,x:Math.round(x*100)/100,z:Math.round(z*100)/100,heightAt:agent.heightAt(x,z)}));}finally{agent.close();}
