// next-terrain-artwalk-h5.ts — read-only terrain preflight for H-5 entry gate.
import{WorldAgent}from"../../mcpl/agent.ts";import{readFileSync}from"node:fs";const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));process.env.WORLD_TOKEN=cfg.joinToken;
const x=19.79898987322333,z=-24.041630560342615;const agent=new WorldAgent({url:cfg.url,name:"arthur-artwalk-h5-terrain-read",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});
try{await agent.connect();await Bun.sleep(2500);console.log(JSON.stringify({name:"artwalk-h5-se-entry-r31-t-3",x,z,heightAt:agent.heightAt(x,z)}))}finally{agent.close()}
