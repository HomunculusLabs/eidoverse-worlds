// fauna27-terrain.ts — read-only terrain preflight at the fauna-27 RE-SEAT
// tuple (−43.3, 69.7) yaw −2.318 (fauna27-seat-sweep best of 2 qualifying
// with the R-125 bed-rectangle gate: worst solid 1.401m vs the espalier
// rows — the orchard show-corner designed adjacency; bedClear 0.511m).
// 9 points: center + corners + edge mids of the decoded footprint (same
// shrunk local points as fauna25-terrain). Chassis: fauna25-terrain.ts.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const CX = -43.3, CZ = 69.7, YAW = -2.318;
const cos = Math.cos(YAW), sin = Math.sin(YAW);
const loc: [string, number, number][] = [
    ["c", 0.02, -0.12],
    ["nw", -0.77, -0.63], ["ne", 0.69, -0.63], ["sw", -0.77, 0.42], ["se", 0.69, 0.42],
    ["n", 0.02, -0.63], ["s", 0.02, 0.42], ["w", -0.77, -0.12], ["e", 0.69, -0.12],
];
const pts = loc.map(([n, lx, lz]) => [n, +(CX + lx * cos + lz * sin).toFixed(3), +(CZ - lx * sin + lz * cos).toFixed(3)] as [string, number, number]);
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna27-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
