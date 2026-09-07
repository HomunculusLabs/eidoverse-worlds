// dress76-terrain.ts — read-only terrain preflight for dress-76 (NE anvil pad).
// Pad center (24.765, -4.570), yaw -0.90756, v5 bbox x -1.42..1.20 z ±0.80.
// Samples the 4 OBB corners + center: py = worst corner, flatness named.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const pts: [string, number, number][] = [
  ["center", 24.765, -4.570],
  ["obb-a", 24.52, -6.18],
  ["obb-b", 26.13, -4.12],
  ["obb-c", 23.26, -5.20],
  ["obb-d", 24.87, -3.13],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-dress76-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x, z, heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
