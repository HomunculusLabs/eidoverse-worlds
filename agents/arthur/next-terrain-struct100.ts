// next-terrain-struct100.ts — read-only terrain preflight for struct-100.
// Seat az354 r74 (-7.74, -73.59), yaw 0 — local z-center offset +0.925.
// 9 points across the true footprint (triangle ±3.2 x/z around local center):
// center, 3 base vertices (local), 3 edge midpoints, 2 offsets.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -7.74, PZ = -73.59, CZOFF = 0.925;
const pts: [string, number, number][] = [
  ["center", PX, PZ + CZOFF],
  ["v1(+z)", PX, PZ + CZOFF + 3.695],
  ["v2(-x-z)", PX - 3.20, PZ + CZOFF - 1.848],
  ["v3(+x-z)", PX + 3.20, PZ + CZOFF - 1.848],
  ["e12-mid", PX - 1.60, PZ + CZOFF + 0.923],
  ["e13-mid", PX + 1.60, PZ + CZOFF + 0.923],
  ["e23-mid", PX, PZ + CZOFF - 1.848],
  ["outer-n", PX, PZ + CZOFF + 4.6],
  ["outer-s", PX, PZ + CZOFF - 3.0],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct100-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x: +x.toFixed(2), z: +z.toFixed(2), heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
