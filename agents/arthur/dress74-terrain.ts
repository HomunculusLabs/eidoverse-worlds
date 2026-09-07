// dress74-terrain.ts — read-only terrain preflight for dress-74 (NW espalier
// rows). Pose center (-48.062, 67.530), yaw 2.3562 rad. Samples OBB corners +
// center: py = worst-case, flatness across the row known before placing.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const pts: [string, number, number][] = [
  ["center", -48.062, 67.530],
  ["obb-a", -45.951, 69.747],
  ["obb-b", -50.279, 65.419],
  ["obb-c", -45.856, 69.641],
  ["obb-d", -50.174, 65.313],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-dress74-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x, z, heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
