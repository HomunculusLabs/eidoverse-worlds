// fauna21-terrain.ts — read-only terrain preflight at the FINAL dairy-cow
// seat (24, 40.75) yaw 0.66 (fauna21-seat-sweep best: worst solid gap
// 3.361m vs the pig sty). 9 points: center + corners + edge mids of the
// decoded footprint in world coords. Chassis: fauna19-terrain.ts.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
// decoded envelope local x −1.700..1.400, z −1.150..1.864 → world corners
// under yaw 0.66 (village transform: wx = px + lx·cos + lz·sin,
// wz = pz − lx·sin + lz·cos), shrunk 15% to sample the standing footprint.
const CX = 24, CZ = 40.75, YAW = 0.66;
const cos = Math.cos(YAW), sin = Math.sin(YAW);
const loc: [string, number, number][] = [
    ["c", -0.15, 0.36],
    ["nw", -1.32, -1.02], ["ne", 1.02, -1.02], ["sw", -1.32, 1.66], ["se", 1.02, 1.66],
    ["n", -0.15, -1.10], ["s", -0.15, 1.74], ["w", -1.40, 0.36], ["e", 1.10, 0.36],
];
const pts = loc.map(([n, lx, lz]) => [n, +(CX + lx * cos + lz * sin).toFixed(3), +(CZ - lx * sin + lz * cos).toFixed(3)] as [string, number, number]);
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna21-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
