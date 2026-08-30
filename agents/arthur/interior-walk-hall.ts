// interior-walk-hall.ts — interior-1 two-door hall flow, before/after.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));process.env.WORLD_TOKEN=cfg.joinToken;
const PX=9,PZ=-26,YAW=-0.31322457341772525,c=Math.cos(YAW),s=Math.sin(YAW);
const world=(x:number,z:number):[number,number]=>[PX+x*c+z*s,PZ-x*s+z*c];
const pts={south:world(0,4.7),southDoor:world(0,2.4),room:world(0,0),northDoor:world(0,-2.4),north:world(0,-4.4)};
const agent=new WorldAgent({url:cfg.url,name:`arthur-interior-hall-${process.argv[2]??"check"}`,world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});const results:any[]=[];
async function leg(name:string,end:[number,number]){const ok=await agent.walkTo(end[0],end[1],false,25_000),dist=Math.hypot(agent.pos.x-end[0],agent.pos.z-end[1]);results.push({name,ok,dist,end,arrived:[agent.pos.x,agent.pos.z]});if(!ok||dist>.55)throw Error(`${name} failed ok=${ok} dist=${dist}`)}
try{await agent.connect();await Bun.sleep(1700);agent.stop();agent.pos.x=pts.south[0];agent.pos.z=pts.south[1];agent.pos.y=agent.heightAt(...pts.south);await Bun.sleep(250);for(const [n,p] of [["south→door",pts.southDoor],["door→room",pts.room],["room→northDoor",pts.northDoor],["northDoor→north",pts.north],["north→northDoor",pts.northDoor],["northDoor→room",pts.room],["room→southDoor",pts.southDoor],["southDoor→south",pts.south]] as const)await leg(n,p);console.log(JSON.stringify({status:"ALL_PASS",phase:process.argv[2]??"check",maxArrival:Math.max(...results.map(x=>x.dist)),results},null,2))}finally{agent.close()}
