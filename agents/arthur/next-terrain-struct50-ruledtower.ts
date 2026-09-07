// next-terrain-struct50-ruledtower.ts — read-only terrain preflight for
// struct-50 R4-3 THE RULED TOWER. E-axis spoke candidate: center (58, 0),
// yaw 0 (square plinth edges to the cardinal axes; the cage is 16-fold
// so yaw 0 reads identically every 22.5°). 5-point spread.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const pts: [string, number, number][] = [
  ["center", 58, 0],
  ["plinth-corner-ne", 61.3, 3.3],
  ["plinth-corner-se", 61.3, -3.3],
  ["plinth-corner-nw", 54.7, 3.3],
  ["plinth-corner-sw", 54.7, -3.3],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct50-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x, z, heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
