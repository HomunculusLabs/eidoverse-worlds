// next-terrain-dress3.ts — read-only terrain preflight for dress-3 (SE stones).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const pts: [string, number, number][] = [
  ["run-center", 52.61, -47.80],
  ["run-w-end", 48.23, -44.42],  // center - 4.5*(ux,uz) local +x dir at yaw 45deg
  ["run-e-end", 56.99, -51.18],
  ["run-n-off", 51.06, -46.25],  // center + perp offset probe
  ["run-s-off", 52.74, -47.93],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-dress3-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x, z, heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
