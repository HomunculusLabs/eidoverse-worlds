// next-terrain-artwalk-h4.ts — read-only terrain preflight for H-4 side-stop.
import{WorldAgent}from"../../mcpl/agent.ts";import{readFileSync}from"node:fs";
const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));process.env.WORLD_TOKEN=cfg.joinToken;
const x=35.70889244992065,z=-23.68807716974934;
const agent=new WorldAgent({url:cfg.url,name:"arthur-artwalk-h4-terrain-read",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);console.log(JSON.stringify({name:"artwalk-h4-se-side-stop-r42-t8.5",x,z,heightAt:agent.heightAt(x,z)}))}finally{agent.close()}
