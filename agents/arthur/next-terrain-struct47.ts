// next-terrain-struct47.ts — read-only terrain preflight for struct-47
// Meridian Stair candidate seat (5.7, -54.7) th276/R55, portal lane radial.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const pts: [string, number, number][] = [
  ["stair-center", 5.7, -54.7],
  ["stair-lane-near", 5.7, -52.2],   // lane face toward village (local -Z)
  ["stair-lane-far", 5.7, -57.2],    // lane face away (local +Z)
  ["stair-west-post", 2.4, -54.7],
  ["stair-east-post", 9.0, -54.7],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct47-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x, z, heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
