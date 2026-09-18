// fauna23-terrain.ts — read-only terrain preflight at the FINAL donkey
// seat (−22.5, −34) yaw −1.11 (fauna23-seat-sweep best: worst solid gap
// 1.433m vs nx-dress-sheep-001 — the flock it guards). 9 points: center +
// corners + edge mids of the decoded footprint in world coords.
// Chassis: fauna21-terrain.ts.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
// decoded envelope local x −1.400..1.500, z −1.837..1.570 → world corners
// under yaw −1.11 (village transform: wx = px + lx·cos + lz·sin,
// wz = pz − lx·sin + lz·cos), shrunk 15% to sample the standing footprint.
const CX = -22.5, CZ = -34, YAW = -1.11;
const cos = Math.cos(YAW), sin = Math.sin(YAW);
const loc: [string, number, number][] = [
    ["c", 0.05, -0.13],
    ["nw", -1.19, -1.47], ["ne", 1.29, -1.47], ["sw", -1.19, 1.21], ["se", 1.29, 1.21],
    ["n", 0.05, -1.56], ["s", 0.05, 1.30], ["w", -1.28, -0.13], ["e", 1.38, -0.13],
];
const pts = loc.map(([n, lx, lz]) => [n, +(CX + lx * cos + lz * sin).toFixed(3), +(CZ - lx * sin + lz * cos).toFixed(3)] as [string, number, number]);
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna23-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
