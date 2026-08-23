// next-walk-court.ts — nvp-16 two-way MCPL walk gate for both court openings.
// No world-build verbs. Uses the real headless body/collider stack, then exits.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken; // WorldAgent sends door token from env
const PX=18.9,PZ=-14.8,YAW=-0.90756,c=Math.cos(YAW),s=Math.sin(YAW);
const world=(lx:number,lz:number):[number,number]=>[PX+lx*c+lz*s,PZ-lx*s+lz*c];
const lanes=[{name:"bakery",x:-3.4},{name:"workshop",x:3.4}];
const agent=new WorldAgent({url:cfg.url,name:"arthur-nvp16-walk",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.joinToken});
const results:any[]=[];
try{
 await agent.connect(); await Bun.sleep(1800);
 for(const lane of lanes){
  const inside=world(lane.x,1.0),outside=world(lane.x,3.2);
  for(const [dir,start,end] of [["in",outside,inside],["out",inside,outside]] as const){
   agent.stop(); agent.pos.x=start[0];agent.pos.z=start[1];agent.pos.y=agent.heightAt(start[0],start[1]);agent.face(end[0],end[1]);await Bun.sleep(350);
   const ok=await agent.walkTo(end[0],end[1],false,25_000);const dist=Math.hypot(agent.pos.x-end[0],agent.pos.z-end[1]);
   results.push({lane:lane.name,dir,ok,dist,start,end,arrived:[agent.pos.x,agent.pos.z]});
   if(!ok||dist>.55)throw new Error(`${lane.name} ${dir} failed ok=${ok} dist=${dist}`);
  }
 }
 console.log(JSON.stringify({status:"ALL_PASS",results},null,2));
}finally{agent.close();}
