// dress8-terrain.ts — read-only terrain preflight for dress-8 (SW prayer stones).
// Pose origin (-52.26, -64.53), yaw 127.25deg. Samples the OBB corners +
// center so py = worst-case and terrain flatness across the span is known.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const pts: [string, number, number][] = [
  ["origin", -52.26, -64.53],
  ["obb-nw", -52.78, -63.30],
  ["obb-ne", -51.19, -63.10],
  ["obb-sw", -52.78, -65.89],
  ["obb-se", -51.19, -65.70],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-dress8-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x, z, heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
