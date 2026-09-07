// next-terrain-dress105-streamstones.ts — read-only terrain preflight for
// dress-105 (SE streamstones v5, sha aabbc23d). Site:
// (75.05, -46.90) yaw -2.356194490192345 (-45deg); TRUE v5 local
// footprint x -4.155..4.531, z -2.127..2.127 (center +0.188, 0.000).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const PX=75.05, PZ=-46.90, YAW=-2.356194490192345;
const c=Math.cos(YAW), s=Math.sin(YAW);
const corners:[string,number,number][]=[
 ["c-fl",-4.155,-2.127],["c-fr",4.531,-2.127],["c-bl",-4.155,2.127],["c-br",4.531,2.127],
 ["mid",0.188,0.0],
 // run-axis end samples (head +x = forest end, tail -x = field end)
 ["head",4.531,0.0],["tail",-4.155,0.0],
];
const pts:[string,number,number][] = corners.map(([n,lx,lz])=>[n,PX+lx*c+lz*s,PZ-lx*s+lz*c]);
const agent=new WorldAgent({url:cfg.url,name:"arthur-dress105-terrain",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);
 let hs:number[]=[];
 for(const [name,x,z] of pts){const h=agent.heightAt(x,z);hs.push(h);
  console.log(JSON.stringify({name,x:Math.round(x*1000)/1000,z:Math.round(z*1000)/1000,heightAt:Math.round(h*10000)/10000}));}
 console.log(JSON.stringify({spread:Math.round((Math.max(...hs)-Math.min(...hs))*10000)/10000,minIdx:(function(){const i=hs.indexOf(Math.min(...hs));return pts[i][0];})()}));
}finally{agent.close();}
