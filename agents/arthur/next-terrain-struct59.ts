// next-terrain-struct59.ts — read-only terrain preflight for struct-59 (R4-4 stillwind wall, W mid-ring).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const pts: [string, number, number][] = [
  ["center", -52.0, 0.0],
  ["n-end", -52.0, 7.65],
  ["s-end", -52.0, -7.65],
  ["bow-w", -53.9, -3.6],
  ["bow-e", -50.1, 3.6],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct59-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x, z, heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
