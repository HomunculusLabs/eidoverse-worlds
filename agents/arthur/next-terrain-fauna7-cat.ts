// next-terrain-fauna7-cat.ts — read-only terrain preflight for fauna-7.
// Barn cat siting: coop-yard east pocket (40.7,-7.5) + surround points +
// the SAT candidate spot grid (x 40.2..41.2, z -8.0..-7.0).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const pts: [string, number, number][] = [
  ["cat-site", 40.7, -7.5],
  ["site-n", 40.7, -6.4],
  ["site-s", 40.7, -8.3],
  ["site-e", 41.8, -7.5],
  ["site-w", 39.6, -7.5],
  ["lane-mid", 36.0, -7.5],
  ["flock-center", 34.0, -8.0],
  ["coop-front", 36.4, -7.4],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna7-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x, z, heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
