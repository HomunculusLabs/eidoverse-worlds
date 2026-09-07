// next-terrain-dress102-fieldcross.ts — read-only terrain preflight for
// dress-102 (NW fieldcross v7 placement, sha 7750e9b7). Site:
// (-17.845, 84.294) yaw -2.35619 (-135deg); TRUE v7 local footprint
// x -0.843..+1.310, z -6.685..+0.004 (center +0.2336,-3.3405).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const PX=-17.845, PZ=84.294, YAW=-2.356194490192345;
const c=Math.cos(YAW), s=Math.sin(YAW);
const corners:[string,number,number][]=[
 ["c-fl",-0.843,-6.685],["c-fr",1.310,-6.685],["c-bl",-0.843,0.004],["c-br",1.310,0.004],
 ["mid",-0.843+1.0765,-3.3405],
 // corridor walk-line samples (the mown gap center, local x ~ +0.2336 line)
 ["walk-far",0.2336,-5.5],["walk-mid",0.2336,-3.34],["walk-near",0.2336,-1.2],
];
const pts:[string,number,number][] = corners.map(([n,lx,lz])=>[n,PX+lx*c+lz*s,PZ-lx*s+lz*c]);
const agent=new WorldAgent({url:cfg.url,name:"arthur-dress102-terrain",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);
 let hs:number[]=[];
 for(const [name,x,z] of pts){const h=agent.heightAt(x,z);hs.push(h);
  console.log(JSON.stringify({name,x:Math.round(x*1000)/1000,z:Math.round(z*1000)/1000,heightAt:Math.round(h*10000)/10000}));}
 console.log(JSON.stringify({spread:Math.round((Math.max(...hs)-Math.min(...hs))*10000)/10000,worst:(function(){const i=hs.indexOf(Math.min(...hs));return pts[i][0];})()}));
}finally{agent.close();}
