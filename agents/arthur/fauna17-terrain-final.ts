// fauna17-terrain-final.ts — read-only terrain preflight at the FINAL dovecote
// seat candidate (-50.5, 62.55) yaw 2.577 (pure-north 0.2m move off the
// fauna-16 seat to cure the 1.390m sub-1.4 adjacency vs orchard-rows-001).
// 5-pt spread at the final tuple only.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const pts: [string, number, number][] = [
  ["final", -50.5, 62.55],
  ["final-n", -50.5, 61.95],
  ["final-s", -50.5, 63.15],
  ["final-e", -49.9, 62.55],
  ["final-w", -51.1, 62.55],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna17-terrain-final", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x, z, heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
