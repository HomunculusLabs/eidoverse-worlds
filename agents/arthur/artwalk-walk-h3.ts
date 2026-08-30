// artwalk-walk-h3.ts — H-3 transverse two-way walk through the open hypar canopy.
import {WorldAgent}from"../../mcpl/agent.ts";import{readFileSync}from"node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));process.env.WORLD_TOKEN=cfg.joinToken;
const PX=32.526911934581186,PZ=-32.526911934581186,YAW=-0.7853981633974483,c=Math.cos(YAW),s=Math.sin(YAW);
const world=(x:number,z:number):[number,number]=>[PX+x*c+z*s,PZ-x*s+z*c];
const pts={left:world(-3.4,0),center:world(0,0),right:world(3.4,0)};
const agent=new WorldAgent({url:cfg.url,name:`arthur-artwalk-h3-walk-${process.argv[2]??"check"}`,world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});const results:any[]=[];
async function leg(name:string,end:[number,number]){const ok=await agent.walkTo(end[0],end[1],false,25_000),dist=Math.hypot(agent.pos.x-end[0],agent.pos.z-end[1]);results.push({name,ok,dist,end,arrived:[agent.pos.x,agent.pos.z]});if(!ok||dist>.55)throw Error(`${name} failed ok=${ok} dist=${dist}`)}
try{await agent.connect();await Bun.sleep(1700);agent.stop();agent.pos.x=pts.left[0];agent.pos.z=pts.left[1];agent.pos.y=agent.heightAt(...pts.left);await Bun.sleep(250);for(const[n,p]of[["left→center",pts.center],["center→right",pts.right],["right→center",pts.center],["center→left",pts.left]]as const)await leg(n,p);console.log(JSON.stringify({status:"ALL_PASS",phase:process.argv[2]??"check",maxArrival:Math.max(...results.map(x=>x.dist)),points:pts,results},null,2))}finally{agent.close()}
