// next-terrain-mile-swfix.ts — read-only terrain preflight for mile-4
// (CORRECTIVE RESEAT of the SW midpoint pair). mile-3's placer derived the
// perpendicular offset with N=(cos(pa),-sin(pa)), pa=az+90 — that is the
// direction of azimuth pa+90 = the NEGATED leg travel direction, not the
// perpendicular, so the live posts sit ON the centerline (r44.7/r49.3, on
// the 1.8m pavers). Fix: dir(az)=(sin,cos) convention (same as pol()); the
// perpendicular axis az307.25/127.25 was correct, the formula was not.
// M=pol(47,217.25)=(-28.4488,-37.4121); posts at M +/- 2.3*dir(127.25).
// True centerline clearance: 2.3 - 0.9 paver half = 1.4m verge clearance
// (paver edge to post center), minus post half 0.21 -> 1.19m solid-to-paver,
// matching the accepted mile-1/mile-2 geometry (2.29m/2.13m centerline).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const pts:[[string,number,number],[string,number,number],[string,number,number]]=[
 ["mile-sw-mid",-28.4488,-37.4121],
 ["mile-sw-005-fix",-26.6191,-38.8057],
 ["mile-sw-006-fix",-30.2785,-36.0185]
];
const agent=new WorldAgent({url:cfg.url,name:"arthur-mile4-terrain",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);for(const [name,x,z] of pts)console.log(JSON.stringify({name,x,z,heightAt:agent.heightAt(x,z)}));}finally{agent.close();}
