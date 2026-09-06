// next-terrain-mile-nw2.ts — read-only terrain preflight for mile-5
// (NW district ARRIVAL pair, lit variant). Center M = A - 1.5*dir(315) =
// (-49.1439, 49.1439) — pulled 1.5m inward from A=pol(71,315) after the live
// SAT gate caught a 1.37m pinch vs sibling nx-dress-nw-skeps-001 (placed at
// r76.4 mid-tick); posts now clear at 2.87m. Perpendicular N(315)=dir(45);
// posts at M +/- 2.3*N (2.30m off the az315 radial, in-code verified):
//   district-side LIT   nx-mile-nw-007 (-50.7702, 47.5176) yaw -45 (arm -> lane)
//   village-side twin   nx-mile-nw-008 (-47.5176, 50.7702) yaw 135 (arm -> lane)
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const pts:[[string,number,number],[string,number,number],[string,number,number]]=[
 ["mile-nw-arrival-m",-49.1439,49.1439],
 ["mile-nw-007",-50.7702,47.5176],
 ["mile-nw-008",-47.5176,50.7702]
];
const agent=new WorldAgent({url:cfg.url,name:"arthur-mile5-terrain2",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);for(const [name,x,z] of pts)console.log(JSON.stringify({name,x,z,heightAt:agent.heightAt(x,z)}));}finally{agent.close();}
