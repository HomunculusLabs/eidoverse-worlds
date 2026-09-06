// next-terrain-struct43-amphi.ts — read-only terrain preflight for the
// stepped-bowl rebuild. Bowl center world (-23.32, 42.55); kerb outer r 8.78.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const pts: [string, number, number][] = [
  ["bowl-center", -23.32, 42.55],
  ["uphill-180", -23.32, 42.55 - 8.78],
  ["east-90", -23.32 + 8.78, 42.55],
  ["west-270", -23.32 - 8.78, 42.55],
  ["stage", -23.32, 42.55],
  ["approach-south", -23.32, 50.5],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct43-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x, z, heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
