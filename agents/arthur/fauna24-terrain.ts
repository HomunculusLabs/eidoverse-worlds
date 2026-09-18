// fauna24-terrain.ts — read-only terrain preflight at the FINAL turkey
// seat (45.25, −6.5) yaw −1.15 (fauna24-seat-sweep best: worst solid gap
// 1.844m vs nx-town-stable — the poultry yard's own design adjacency).
// 9 points: center + corners + edge mids of the decoded footprint in
// world coords. Chassis: fauna23-terrain.ts.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
// decoded envelope local x −1.260..1.300, z −1.065..1.150 → world corners
// under yaw −1.15 (village transform), shrunk 15% to sample the standing
// footprint.
const CX = 45.25, CZ = -6.5, YAW = -1.15;
const cos = Math.cos(YAW), sin = Math.sin(YAW);
const loc: [string, number, number][] = [
    ["c", 0.02, 0.04],
    ["nw", -1.09, -0.94], ["ne", 1.11, -0.94], ["sw", -1.09, 1.02], ["se", 1.11, 1.02],
    ["n", 0.02, -0.99], ["s", 0.02, 1.07], ["w", -1.16, 0.04], ["e", 1.18, 0.04],
];
const pts = loc.map(([n, lx, lz]) => [n, +(CX + lx * cos + lz * sin).toFixed(3), +(CZ - lx * sin + lz * cos).toFixed(3)] as [string, number, number]);
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna24-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  let lowest = Infinity;
  for (const [name, x, z] of pts) {
    const h = agent.heightAt(x, z);
    if (h < lowest) lowest = h;
    console.log(JSON.stringify({ name, x, z, heightAt: +h.toFixed(5) }));
  }
  console.log(JSON.stringify({ PY: +lowest.toFixed(5) }));
} finally { agent.close(); }
