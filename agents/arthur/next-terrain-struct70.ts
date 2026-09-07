// next-terrain-struct70.ts — read-only terrain preflight for struct-70
// (R-123 dial reseat at (6,·,−45) yaw 0 — instrument cluster, N spoke).
// 7 points: center, N/S/E/W at the apothem (3.42, where the flats sit),
// plus two opposite diagonal corners (circumradius 3.7).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const PX=6, PZ=-45, YAW=0;
const cs=Math.cos(YAW), sn=Math.sin(YAW);
const pt=(lx:number,lz:number):[number,number]=>[PX+lx*cs+lz*sn,PZ-lx*sn+lz*cs];
const APO=3.42, CIRC=3.7;
const diag=CIRC*Math.SQRT1_2; // 22.5° off-axis corner components
const pts:[string,number,number][]=[
  ["dial-center",...pt(0,0)],
  ["dial-N",...pt(0,-APO)],
  ["dial-S",...pt(0,APO)],
  ["dial-E",...pt(APO,0)],
  ["dial-W",...pt(-APO,0)],
  ["dial-NE-corner",...pt(diag,-diag)],
  ["dial-SW-corner",...pt(-diag,diag)]
];
const agent=new WorldAgent({url:cfg.url,name:"arthur-struct70-terrain",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);const hs=pts.map(([name,x,z])=>({name,x:+x.toFixed(3),z:+z.toFixed(3),h:+agent.heightAt(x,z).toFixed(4)}));for(const r of hs)console.log(JSON.stringify(r));const vals=hs.map(r=>r.h);console.log(JSON.stringify({spread:+(Math.max(...vals)-Math.min(...vals)).toFixed(4),min:Math.min(...vals),max:Math.max(...vals),centerPY:hs[0].h}));}finally{agent.close();}
