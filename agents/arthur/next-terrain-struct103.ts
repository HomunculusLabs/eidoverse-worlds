// next-terrain-struct103.ts — read-only terrain preflight for struct-103
// catenoid. Seat az26 r60 (26.30, -53.93), yaw π/2 (door due W toward the
// N-ray mathematics walk). TRUE round base r 2.46 — 9 points: center, 4
// rim, 4 intercardinal.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = 26.30, PZ = -53.93, RR = 2.46;
const pts: [string, number, number][] = [
  ["center", PX, PZ],
  ["rim-n", PX, PZ - RR],
  ["rim-s", PX, PZ + RR],
  ["rim-e", PX + RR, PZ],
  ["rim-w", PX - RR, PZ],
  ["rim-ne", PX + 1.74, PZ - 1.74],
  ["rim-nw", PX - 1.74, PZ - 1.74],
  ["rim-se", PX + 1.74, PZ + 1.74],
  ["rim-sw", PX - 1.74, PZ + 1.74],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct103-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  let lo = Infinity;
  for (const [name, x, z] of pts) {
    const h = agent.heightAt(x, z);
    if (h < lo) lo = h;
    console.log(JSON.stringify({ name, x: +x.toFixed(2), z: +z.toFixed(2), heightAt: h }));
  }
  console.log(JSON.stringify({ lowest: lo }));
} finally { agent.close(); }
