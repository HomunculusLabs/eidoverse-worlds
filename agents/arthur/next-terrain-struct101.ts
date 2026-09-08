// next-terrain-struct101.ts — read-only terrain preflight for struct-101.
// Seat az164 r60 (16.54, 57.68), yaw 0 — round plinth r 3.55 (entry faces -z
// = toward village center). 9 points: center, 4 rim, 4 intercardinal.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = 16.54, PZ = 57.68, RR = 3.55;
const pts: [string, number, number][] = [
  ["center", PX, PZ],
  ["rim-n", PX, PZ - RR],
  ["rim-s", PX, PZ + RR],
  ["rim-e", PX + RR, PZ],
  ["rim-w", PX - RR, PZ],
  ["rim-ne", PX + 2.51, PZ - 2.51],
  ["rim-nw", PX - 2.51, PZ - 2.51],
  ["rim-se", PX + 2.51, PZ + 2.51],
  ["rim-sw", PX - 2.51, PZ + 2.51],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct101-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
