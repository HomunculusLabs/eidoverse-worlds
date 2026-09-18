// next-terrain-fauna16-dovecote.ts — read-only terrain preflight for fauna-16.
// Dovecote siting: orchard-edge meadow at (-50.5, 62.75), face SE (yaw 2.577)
// toward the stile/visitor approach. 9-pt spread across the seat + the walk
// vantage + lane points.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const pts: [string, number, number][] = [
  ["seat", -50.5, 62.75],
  ["seat-n", -50.5, 61.35],
  ["seat-s", -50.5, 64.15],
  ["seat-e", -49.1, 62.75],
  ["seat-w", -51.9, 62.75],
  ["seat-ne", -49.1, 61.35],
  ["seat-sw", -51.9, 64.15],
  ["walk-vantage", -49.4, 61.0],
  ["lane-007", -47.5, 50.8],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna16-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x, z, heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
