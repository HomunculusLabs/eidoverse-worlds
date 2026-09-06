// next-terrain-mile-ne.ts — read-only terrain preflight for mile-2 (NE jink pivot pair).
// Posts derive from the committed NE polyline (mkv3-ne-approach2.ts):
// P0=pol(24,54) P1=pol(48,54) P2=pol(54,48) P3=pol(72,15); pol: x=r*sin(az), z=r*cos(az).
// Jink pivot B=P1=(38.8328,28.2161); run heading az54, jink heading az9.312;
// bisector az31.660, N=(cos,-sin)=(0.85111,-0.52497); posts at B +/- 2.3*N.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const pts:[[string,number,number],[string,number,number],[string,number,number]]=[
 ["mile-ne-pivot",38.8328,28.2161],
 ["mile-ne-003",36.8751,29.4211],
 ["mile-ne-004",40.7905,27.0110]
];
const agent=new WorldAgent({url:cfg.url,name:"arthur-mile2-terrain",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);for(const [name,x,z] of pts)console.log(JSON.stringify({name,x,z,heightAt:agent.heightAt(x,z)}));}finally{agent.close();}
