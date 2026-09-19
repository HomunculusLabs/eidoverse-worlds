// fauna28-terrain.ts — read-only terrain preflight at the peahen's final
// seat tuple (−45.1, 67.5) yaw 0.196 (fauna28-seat-sweep best of 73:
// worst solid 1.413m vs the orchard rows — the show-corner adjacency;
// bedClear 0.82; 2.84m from the peacock, dot 0.90 between him and his
// reader). 9 points: center + corners + edge mids of the decoded
// footprint. Chassis: fauna27-terrain.ts.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const CX = -45.1, CZ = 67.5, YAW = 0.196;
const cos = Math.cos(YAW), sin = Math.sin(YAW);
const loc: [string, number, number][] = [
    ["c", 0.0, 0.02],
    ["nw", -0.10, -0.30], ["ne", 0.10, -0.30], ["sw", -0.10, 0.34], ["se", 0.10, 0.34],
    ["n", 0.0, -0.30], ["s", 0.0, 0.34], ["w", -0.10, 0.02], ["e", 0.10, 0.02],
];
const pts = loc.map(([n, lx, lz]) => [n, +(CX + lx * cos + lz * sin).toFixed(3), +(CZ - lx * sin + lz * cos).toFixed(3)] as [string, number, number]);
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna28-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
