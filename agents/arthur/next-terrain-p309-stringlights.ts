// next-terrain-p309-stringlights.ts — terrain preflight for the polish-309
// festoon poles' feet (read-only). Strand entity at (-6, 2.6, 7.5) yaw pi/4;
// pole local x = +-(span/2 + 0.04) = +-3.04 -> world via village transform.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const yaw = 0.7853981633974483;
const lx = 3.04;
const pts: [string, number, number][] = [
  ["pole-w", -6 + (-lx) * Math.cos(yaw), 7.5 - (-lx) * Math.sin(yaw)],
  ["pole-e", -6 + lx * Math.cos(yaw), 7.5 - lx * Math.sin(yaw)],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-terrain-p309", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect();
  await Bun.sleep(2500);
  for (const [n, x, z] of pts) console.log(JSON.stringify({ name: n, x, y: agent.heightAt(x, z), z }));
} finally { agent.close(); }
