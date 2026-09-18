// fauna19-terrain.ts — read-only terrain preflight at the FINAL stable-horses
// seat (49.5, 0) yaw −1.75 (fauna19-seat-sweep best: worst solid gap 1.637m
// vs the stable itself — the yard's own design adjacency). 9 points: center
// + corners + edge mids of the decoded footprint in world coords.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
// decoded envelope local x −1.500..1.600, z −1.509..1.832 → world corners
// under yaw −1.75 (village transform: wx = px + lx·cos + lz·sin,
// wz = pz − lx·sin + lz·cos), shrunk 15% to sample the standing footprint.
const CX = 49.5, CZ = 0, YAW = -1.75;
const cos = Math.cos(YAW), sin = Math.sin(YAW);
const loc: [string, number, number][] = [
    ["c", 0.05, 0.16],
    ["nw", -1.28, -1.28], ["ne", 1.36, -1.28], ["sw", -1.28, 1.56], ["se", 1.36, 1.56],
    ["n", 0.05, -1.36], ["s", 0.05, 1.64], ["w", -1.36, 0.16], ["e", 1.44, 0.16],
];
const pts = loc.map(([n, lx, lz]) => [n, +(CX + lx * cos + lz * sin).toFixed(3), +(CZ - lx * sin + lz * cos).toFixed(3)] as [string, number, number]);
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna19-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
