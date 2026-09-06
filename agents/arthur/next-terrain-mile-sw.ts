// next-terrain-mile-sw.ts — read-only terrain preflight for mile-3 (SW midpoint pair).
// Posts derive from the committed SW leg polyline (mkv3-sw-approach3.ts): straight
// radial az217.25 r24->71; midpoint M=pol(47,217.25)=(-28.4488,-37.4121);
// pol: x=r*sin(az), z=r*cos(az) (matches mkv3-ne-approach2 P1=pol(48,54)=(38.8328,28.2161)).
// Straight leg -> pair straddles perpendicular (pair axis az307.25/127.25), N=(cos,-sin);
// posts at M +/- 2.3*N. Centerline clearance 2.3 - 0.46 paver half = 1.84m (>1.4 pinch law).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const pts:[[string,number,number],[string,number,number],[string,number,number]]=[
 ["mile-sw-mid",-28.4488,-37.4121],
 ["mile-sw-005",-27.0566,-35.5813],
 ["mile-sw-006",-29.8410,-39.2429]
];
const agent=new WorldAgent({url:cfg.url,name:"arthur-mile3-terrain",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);for(const [name,x,z] of pts)console.log(JSON.stringify({name,x,z,heightAt:agent.heightAt(x,z)}));}finally{agent.close();}
