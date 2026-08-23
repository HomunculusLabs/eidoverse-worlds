// next-walk-tower.ts — nvp-19 real MCPL door→ladder two-way gate.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));process.env.WORLD_TOKEN=cfg.joinToken;
const PX=14.1,PZ=16.9,YAW=-2.44347,c=Math.cos(YAW),s=Math.sin(YAW);
const world=(x:number,z:number):[number,number]=>[PX+x*c+z*s,PZ-x*s+z*c];
const pts={outside:world(0,4.2),inside:world(0,1.3),ladder:world(1.7,1.55)};
const agent=new WorldAgent({url:cfg.url,name:"arthur-nvp19-walk",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
const results:any[]=[];
async function leg(name:string,end:[number,number]){const start:[number,number]=[agent.pos.x,agent.pos.z];const ok=await agent.walkTo(end[0],end[1],false,25_000);const dist=Math.hypot(agent.pos.x-end[0],agent.pos.z-end[1]);results.push({name,ok,dist,start,end,arrived:[agent.pos.x,agent.pos.z]});if(!ok||dist>.55)throw Error(`${name} failed ok=${ok} dist=${dist}`)}
try{await agent.connect();await Bun.sleep(1700);agent.stop();agent.pos.x=pts.outside[0];agent.pos.z=pts.outside[1];agent.pos.y=agent.heightAt(...pts.outside);await Bun.sleep(250);await leg("outside→inside",pts.inside);await leg("inside→ladder",pts.ladder);await leg("ladder→inside",pts.inside);await leg("inside→outside",pts.outside);console.log(JSON.stringify({status:"ALL_PASS",results},null,2))}finally{agent.close()}
