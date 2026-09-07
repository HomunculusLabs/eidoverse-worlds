// dress88-terrain.ts — read-only terrain preflight for dress-88 (NW drying
// racks placement). Site: NW approach lane's west flank at lavender-0027's
// south edge — the field-mouth headland, center (-59.0, 33.0), yaw 2.3562,
// TRUE local footprint x -2.244..2.032 z -0.724..0.731 (center -0.106,+0.0035).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const c=Math.cos(2.3562), s=Math.sin(2.3562);
const corners:[string,number,number][]=[
 ["c-fl",-2.244,-0.724],["c-fr",2.032,-0.724],["c-bl",-2.244,0.731],["c-br",2.032,0.731],
 ["center",0,0],
];
const pts:[string,number,number][] = corners.map(([n,lx,lz])=>[n,-59.0+lx*c+lz*s,33.0-lx*s+lz*c]);
const agent=new WorldAgent({url:cfg.url,name:"arthur-dress88-terrain",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);for(const [name,x,z] of pts)console.log(JSON.stringify({name,x:Math.round(x*100)/100,z:Math.round(z*100)/100,heightAt:agent.heightAt(x,z)}));}finally{agent.close();}
