// next-walk-orchard.ts — nvp-25 real MCPL two-way orchard aisle gate.
// Aisle is local +Z→−Z at 1.65m width; gate posts sit at local z≈+7.02.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));process.env.WORLD_TOKEN=cfg.joinToken;
const PX=-61.87184335382291,PZ=61.87184335382291,YAW=2.35619449,c=Math.cos(YAW),s=Math.sin(YAW);
const world=(x:number,z:number):[number,number]=>[PX+x*c+z*s,PZ-x*s+z*c];
// lane x=0: approach apron (z=9), just past gate (z=5.5), mid aisle (z=0),
// far end (z=-6.6). X keeps 1.4m law inside the 1.65m soil strip.
const pts={apron:world(0,9.2),insideGate:world(0,5.5),midAisle:world(0,0),farEnd:world(0,-6.6)};
const agent=new WorldAgent({url:cfg.url,name:"arthur-nvp25-walk",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
const results:any[]=[];
async function leg(name:string,end:[number,number]){const start:[number,number]=[agent.pos.x,agent.pos.z];const ok=await agent.walkTo(end[0],end[1],false,25_000);const dist=Math.hypot(agent.pos.x-end[0],agent.pos.z-end[1]);results.push({name,ok,dist,start,end,arrived:[agent.pos.x,agent.pos.z]});if(!ok||dist>.55)throw Error(`${name} failed ok=${ok} dist=${dist}`)}
try{await agent.connect();await Bun.sleep(1700);agent.stop();
agent.pos.x=pts.apron[0];agent.pos.z=pts.apron[1];agent.pos.y=agent.heightAt(...pts.apron);await Bun.sleep(250);
await leg("approach→gate",pts.insideGate);
await leg("gate→mid",pts.midAisle);
await leg("mid→farEnd",pts.farEnd);
await leg("farEnd→mid (return)",pts.midAisle);
await leg("mid→gate (return)",pts.insideGate);
await leg("gate→approach (exit)",pts.apron);
console.log(JSON.stringify({status:"ALL_PASS",legs:results.length,maxArrival:+Math.max(...results.map(r=>r.dist)).toFixed(3)},null,2))}finally{agent.close()}
