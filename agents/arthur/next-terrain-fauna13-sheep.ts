// next-terrain-fauna13-sheep.ts — read-only terrain preflight for fauna-13.
// Sheep-fold siting: SW/W meadow of the dyehouse, candidate zone
// x −28..−33, z −28..−34 (FAUNA-PLAN fauna-12 candidate row). 9-pt spread
// across the primary candidate seat + surround cardinal points.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const pts: [string, number, number][] = [
  ["fold-seat", -27.5, -31.5],
  ["seat-n", -27.5, -30.1],
  ["seat-s", -27.5, -32.9],
  ["seat-e", -26.1, -31.5],
  ["seat-w", -28.9, -31.5],
  ["seat-ne", -26.1, -30.1],
  ["seat-sw", -28.9, -32.9],
  ["walk-stop", -25.9, -32.1],
  ["lane-closest", -25.22, -33.18],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna13-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x, z, heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
