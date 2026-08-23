// next-walk-core-paths.ts — nvp-21 real MCPL walk every reviewed route both ways.
import{WorldAgent}from"../../mcpl/agent.ts";import{readFileSync}from"node:fs";const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));process.env.WORLD_TOKEN=cfg.joinToken;
const routes:{name:string,pts:Array<[number,number]>}[]=[
 {name:"tower",pts:[[0,4.8],[0,8.9],[1,9.4],[1,10.6],[0,10.9],[4.2,10.9],[8,11.8],[11.271765011973791,13.529378862508514]]},
 {name:"court-workshop",pts:[[4.8,0],[8.9,0],[9.4,-1],[10.6,-1],[10.9,0],[11.2,-3.7],[12.6,-6.8],[15,-8],[17.447261721904905,-9.350270511726542]]},
 {name:"court-bakery",pts:[[4.8,0],[8.9,0],[9.4,-1],[10.6,-1],[10.9,0],[11.2,-3.7],[12.6,-6.8],[12.45,-10.1],[12.75,-12.7],[13.260703615912785,-14.70869670093095]]},
 {name:"carousel",pts:[[-4.8,0],[-8.9,0],[-9.4,1],[-10.6,1],[-10.9,0],[-10.8,4.7],[-12.1,8.8],[-14.2,12.2]]},
 {name:"south-spoke",pts:[[0,-4.8],[0,-8.9]]},
];
const agent=new WorldAgent({url:cfg.url,name:"arthur-nvp21-path-walk",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});const results:any[]=[];
async function leg(route:string,dir:string,i:number,end:[number,number]){const ok=await agent.walkTo(end[0],end[1],false,25_000),dist=Math.hypot(agent.pos.x-end[0],agent.pos.z-end[1]);results.push({route,dir,leg:i,ok,dist,end,arrived:[agent.pos.x,agent.pos.z]});if(!ok||dist>.55)throw Error(`${route} ${dir} leg${i} failed ok=${ok} dist=${dist}`)}
try{await agent.connect();await Bun.sleep(1700);for(const r of routes){agent.stop();const start=r.pts[0];agent.pos.x=start[0];agent.pos.z=start[1];agent.pos.y=agent.heightAt(...start);await Bun.sleep(180);for(let i=1;i<r.pts.length;i++)await leg(r.name,"out",i,r.pts[i]);for(let i=r.pts.length-2;i>=0;i--)await leg(r.name,"back",i,r.pts[i])}console.log(JSON.stringify({status:"ALL_PASS",routes:routes.map(r=>r.name),legs:results.length,maxArrival:Math.max(...results.map(x=>x.dist)),results},null,2))}finally{agent.close()}
