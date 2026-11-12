// next-terrain-struct-orrery.ts — read-only terrain preflight for struct-7.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const pts: [string, number, number][] = [
  ["orrery-center", 25.0, -34.8],
  ["orrery-n", 25.0, -31.25],
  ["orrery-s", 25.0, -38.35],
  ["orrery-e", 28.55, -34.8],
  ["orrery-w", 21.45, -34.8],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct7-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x, z, heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
