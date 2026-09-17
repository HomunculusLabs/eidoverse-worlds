// next-terrain-fauna2-hens.ts — read-only terrain preflight for fauna-2.
// Flock reseat target (34.0, -8.0) + surrounding yard points + the old
// lone-hen spot (33.5, -6) for continuity reference.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const pts: [string, number, number][] = [
  ["flock-center", 34.0, -8.0],
  ["flock-n", 34.0, -6.9],
  ["flock-s", 34.0, -9.1],
  ["flock-e", 35.1, -8.0],
  ["flock-w", 32.9, -8.0],
  ["old-hen-spot", 33.5, -6.0],
  ["coop-front", 36.4, -7.4],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna2-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x, z, heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
