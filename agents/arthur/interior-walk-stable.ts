// interior-walk-stable.ts — interior-16 open-front approach + stall-entry route.
import{WorldAgent}from"../../mcpl/agent.ts";import{readFileSync}from"node:fs";const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));process.env.WORLD_TOKEN=cfg.joinToken;const PX=43,PZ=0,YAW=-Math.PI/2,c=Math.cos(YAW),s=Math.sin(YAW),world=(x:number,z:number):[number,number]=>[PX+x*c+z*s,PZ-x*s+z*c];
// Local frame: open front faces -z (toward the village), stalls behind the
// partition. Route: yard → front lip → stall 0 center → back stall (saddle
// corner view) → back out. All legs keep ≥1.2m from the partition and walls.
const pts={yard:world(0,-4.6),front:world(0,-2.6),stall0:world(-1.4,0.3),backStall:world(1.4,1.4),front2:world(0,-2.6),yard2:world(0,-4.6)};
const a=new WorldAgent({url:cfg.url,name:`arthur-interior-stable-${process.argv[2]??"check"}`,world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken}),results:any[]=[];
async function leg(name:string,end:[number,number]){const ok=await a.walkTo(end[0],end[1],false,25_000),dist=Math.hypot(a.pos.x-end[0],a.pos.z-end[1]);results.push({name,ok,dist,end,arrived:[a.pos.x,a.pos.z]});if(!ok||dist>.55)throw Error(`${name} failed ok=${ok} dist=${dist}`)}
try{await a.connect();await Bun.sleep(1700);a.stop();a.pos.x=pts.yard[0];a.pos.z=pts.yard[1];a.pos.y=a.heightAt(...pts.yard);await Bun.sleep(250);for(const[n,p]of[["yard→front",pts.front],["front→stall0",pts.stall0],["stall0→backStall",pts.backStall],["backStall→front",pts.front2],["front→yard",pts.yard2]]as const)await leg(n,p);console.log(JSON.stringify({status:"ALL_PASS",phase:process.argv[2]??"check",maxArrival:Math.max(...results.map(x=>x.dist)),results},null,2))}finally{a.close()}
