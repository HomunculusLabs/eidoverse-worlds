// dress94-terrain-mossbowls.ts — read-only terrain preflight for
// nx-dress-se-mossbowls-001 at the chosen pose (61.31, -55.20), yaw -45°.
// 5-pt spread pins PY to the worst corner (dress-84 chassis).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const cos = Math.cos(-Math.PI / 4), sin = Math.sin(-Math.PI / 4);
const P = [61.31, -55.20];
const pts: [string, number, number][] = [
  ["center", P[0], P[1]],
  ["corner-nw", P[0] + (-1.534) * cos + (-1.190) * sin, P[1] - (-1.534) * sin + (-1.190) * cos],
  ["corner-ne", P[0] + (1.789) * cos + (-1.190) * sin, P[1] - (1.789) * sin + (-1.190) * cos],
  ["corner-sw", P[0] + (-1.534) * cos + (1.566) * sin, P[1] - (-1.534) * sin + (1.566) * cos],
  ["corner-se", P[0] + (1.789) * cos + (1.566) * sin, P[1] - (1.789) * sin + (1.566) * cos],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-dress94-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x, z, heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
