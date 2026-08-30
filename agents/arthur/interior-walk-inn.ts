// interior-walk-inn.ts — interior-0 before/after door-to-common-room route.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));process.env.WORLD_TOKEN=cfg.joinToken;
const PX=36,PZ=0,YAW=-Math.PI/2,c=Math.cos(YAW),s=Math.sin(YAW);
const world=(x:number,z:number):[number,number]=>[PX+x*c+z*s,PZ-x*s+z*c];
// Preserve local-X ±0.7m door lane; turn west of the tables after entry.
const pts={outside:world(0,5.2),threshold:world(0,2.4),inside:world(-1.15,1.45),room:world(-1.35,0)};
const agent=new WorldAgent({url:cfg.url,name:`arthur-interior-inn-${process.argv[2]??"check"}`,world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
const results:any[]=[];
async function leg(name:string,end:[number,number]){const start:[number,number]=[agent.pos.x,agent.pos.z];const ok=await agent.walkTo(end[0],end[1],false,25_000);const dist=Math.hypot(agent.pos.x-end[0],agent.pos.z-end[1]);results.push({name,ok,dist,start,end,arrived:[agent.pos.x,agent.pos.z]});if(!ok||dist>.55)throw Error(`${name} failed ok=${ok} dist=${dist}`)}
try{await agent.connect();await Bun.sleep(1700);agent.stop();agent.pos.x=pts.outside[0];agent.pos.z=pts.outside[1];agent.pos.y=agent.heightAt(...pts.outside);await Bun.sleep(250);await leg("outside→threshold",pts.threshold);await leg("threshold→inside",pts.inside);await leg("inside→room",pts.room);await leg("room→inside",pts.inside);await leg("inside→threshold",pts.threshold);await leg("threshold→outside",pts.outside);console.log(JSON.stringify({status:"ALL_PASS",phase:process.argv[2]??"check",maxArrival:Math.max(...results.map(x=>x.dist)),results},null,2))}finally{agent.close()}
