// dress10-terrain.ts — read-only terrain preflight for dress-10 (NW log pile).
// Pose origin (-69.78, 48.60), yaw -0.785 (local +z faces az-45 corridor).
// Samples the OBB corners + center so py = worst-case and flatness is known.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const pts: [string, number, number][] = [
  ["origin", -66.8, 51.2],
  ["obb-ne", -64.27, 51.73],
  ["obb-nw", -66.27, 53.73],
  ["obb-sw", -69.33, 50.67],
  ["obb-se", -67.33, 48.67],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-dress10-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x, z, heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
