// next-terrain-dress92-glazier.ts — read-only terrain preflight for dress-92
// (NE glazier rack). Site: gallery-lane pocket (60.95, 28.42), yaw -2.35619,
// TRUE local footprint x -1.9..1.42 z -0.66..0.66 (v5 53b31cfd decode).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const c=Math.cos(-2.356194490192345), s=Math.sin(-2.356194490192345);
const corners:[string,number,number][]=[
 ["c-fl",-1.9,-0.66],["c-fr",1.42,-0.66],["c-bl",-1.9,0.66],["c-br",1.42,0.66],
 ["center",0,0],
];
const pts:[string,number,number][] = corners.map(([n,lx,lz])=>[n,60.95+lx*c+lz*s,28.42-lx*s+lz*c]);
const agent=new WorldAgent({url:cfg.url,name:"arthur-dress92-terrain",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);for(const [name,x,z] of pts)console.log(JSON.stringify({name,x:Math.round(x*100)/100,z:Math.round(z*100)/100,heightAt:agent.heightAt(x,z)}));}finally{agent.close();}
