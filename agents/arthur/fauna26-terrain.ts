// fauna26-terrain.ts — read-only terrain preflight at the FINAL rooster
// seat (31.25, −9) yaw −1.3 (sweep best: worst solid gap 1.439m vs
// nx-dress-hens — the flock's own sentinel adjacency; qualifying seats
// nearer the flock center do not exist, the hens' wide 3-bird OBB pins
// every sub-1.4 seat within 3m). 9 points: center + corners + edge
// mids of the decoded footprint in world coords. Chassis: fauna24-terrain.ts.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
// decoded envelope v12: local x −0.219..0.217, z −0.752..0.413 → world
// corners under yaw −1.3 (village transform), shrunk 15% to sample the
// standing footprint.
const CX = 31.25, CZ = -9, YAW = -1.3;
const cos = Math.cos(YAW), sin = Math.sin(YAW);
const loc: [string, number, number][] = [
    ["c", 0.0, -0.17],
    ["nw", -0.19, -0.64], ["ne", 0.19, -0.64], ["sw", -0.19, 0.30], ["se", 0.19, 0.30],
    ["n", 0.0, -0.69], ["s", 0.0, 0.35], ["w", -0.22, -0.17], ["e", 0.22, -0.17],
];
const pts = loc.map(([n, lx, lz]) => [n, +(CX + lx * cos + lz * sin).toFixed(3), +(CZ - lx * sin + lz * cos).toFixed(3)] as [string, number, number]);
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna26-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
