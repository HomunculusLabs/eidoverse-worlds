// next-terrain-fauna8-owl.ts — read-only terrain preflight for fauna-8.
// Barn owl siting: livery east lawn (47.6, 1.6) + surround points + the
// walk-path anchors (road-end arrival, corner-rounding point).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const pts: [string, number, number][] = [
  ["owl-site", 47.6, 1.6],
  ["site-n", 47.6, 2.6],
  ["site-s", 47.6, 0.6],
  ["site-e", 48.6, 1.6],
  ["site-w", 46.6, 1.6],
  ["road-end", 41.0, 2.0],
  ["corner-s", 42.0, 4.0],
  ["bench", 42.0, 6.0],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna8-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x, z, heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
