// next-terrain-dress11.ts — read-only terrain preflight for dress-11 stile.
import{WorldAgent}from"../../mcpl/agent.ts";import{readFileSync}from"node:fs";const cfg=JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json","utf8"));process.env.WORLD_TOKEN=cfg.joinToken;
const pts=[[-45.25,54.45]];
const agent=new WorldAgent({url:cfg.url,name:"arthur-dress11-terrain-read",world:"commons-next",avatar:cfg.avatar,agentToken:cfg.agentToken});try{await agent.connect();await Bun.sleep(2500);for(const[x,z]of pts)console.log(JSON.stringify({name:"dress11-stile-r70.5-ne",x,z,heightAt:agent.heightAt(x,z)}))}finally{agent.close()}
