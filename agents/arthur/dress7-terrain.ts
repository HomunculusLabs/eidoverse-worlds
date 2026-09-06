// dress7-terrain.ts — read-only terrain preflight for the SE cairn pose.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const pts: [string, number, number][] = [
  ["cairn-center", 58.70, -58.70],
  ["cairn-w", 58.00, -59.40],
  ["cairn-e", 59.40, -58.00],
  ["cairn-n", 59.40, -59.40],
  ["cairn-s", 58.00, -58.00],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-dress7-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x, z, heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
