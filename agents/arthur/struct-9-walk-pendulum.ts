// struct-9-walk-pendulum.ts — MCPL approach + circle walk around nx-struct-pendulum
// (orrery pattern: furniture-scale solid collider must produce no phantom
// blocking; walk the approach and a full circle at 2.5m radius).
import {WorldAgent}from"../../mcpl/agent.ts";import{readFileSync}from"node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const C={x:25.01,z:25.9}; // live entity pos
const pts={
  west:[C.x-9,C.z],          // approach from the village side
  rim_w:[C.x-2.5,C.z],
  rim_n:[C.x,C.z-2.5],
  rim_e:[C.x+2.5,C.z],
  rim_s:[C.x,C.z+2.5],
};
const agent=new WorldAgent({url:cfg.url,name:`arthur-struct9-walk-${process.argv[2]??"check"}`,world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
const results:any[]=[];
async function leg(name:string,end:[number,number]){const ok=await agent.walkTo(end[0],end[1],false,25_000),dist=Math.hypot(agent.pos.x-end[0],agent.pos.z-end[1]);results.push({name,ok,dist,end,arrived:[agent.pos.x,agent.pos.z]});if(!ok||dist>.55)throw Error(`${name} failed ok=${ok} dist=${dist}`)}
try{await agent.connect();await Bun.sleep(1700);agent.stop();
agent.pos.x=pts.west[0];agent.pos.z=pts.west[1];agent.pos.y=await agent.heightAt(...pts.west);await Bun.sleep(250);
for(const[n,p]of[["approach→rim_w",pts.rim_w],["rim_w→rim_n",pts.rim_n],["rim_n→rim_e",pts.rim_e],["rim_e→rim_s",pts.rim_s],["rim_s→rim_w",pts.rim_w]]as const)await leg(n,p);
console.log(JSON.stringify({status:"ALL_PASS",phase:process.argv[2]??"check",maxArrival:Math.max(...results.map(x=>x.dist)),results},null,2))}finally{agent.close()}
