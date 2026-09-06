// next-terrain-mile-ne2.ts — read-only terrain preflight for mile-6
// (NE district ARRIVAL pair, lit variant). Boundary A = P3 = pol(72,15) =
// (18.6346, 69.5467), end of the committed NE home straight P2=pol(54,48) ->
// P3 (mkv3-ne-approach2.ts). Segment travel u = (-0.5411, 0.8412); perp
// (16.6998, 68.3021); N = (0.8412, 0.5411). Origin is on the -N side ->
// village-side post LIT. Yaw law: arm aims at the centerline, yaw = az(post->A) - 90:
//   district-side unlit nx-mile-ne-010 = A + 2.3*N = (20.5694, 70.7913) az(post->A)=165.5 -> yaw 75.5deg
//   village-side  LIT  nx-mile-ne-009 = A - 2.3*N = (16.6998, 68.3021) az(post->A)=345.5 -> yaw 255.5deg
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const pts:[[string,number,number],[string,number,number],[string,number,number]]=[
 ["mile-ne-arrival-m",18.6346,69.5467],
 ["mile-ne-010",20.5694,70.7913],
 ["mile-ne-009",16.6998,68.3021]
];
const agent=new WorldAgent({url:cfg.url,name:"arthur-mile6-terrain",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);for(const [name,x,z] of pts)console.log(JSON.stringify({name,x,z,heightAt:agent.heightAt(x,z)}));}finally{agent.close();}
