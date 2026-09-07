// next-terrain-city7.ts — read-only terrain preflight for city-7 beacon relocation.
// Seat az312.375 r90.375 yaw-30 (60.940,-66.753) 3.1x3.1 tower, c(0,0).
// Points: 4 true corners + center + OLD pos (grade-delta reference; old
// beacon sat at terrain -0.04397, lantern light +7.344 above pos).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = 60.910952574851137, PZ = -66.764485180552654, YAW = -30 * Math.PI / 180;
const C = Math.cos(YAW), S = Math.sin(YAW);
const w = (lx: number, lz: number): [number, number] => [PX + lx * C + lz * S, PZ - lx * S + lz * C];
const pts: [string, number, number][] = [
  ["corner-1", ...w(-1.55, -1.55)],
  ["corner-2", ...w(1.55, -1.55)],
  ["corner-3", ...w(-1.55, 1.55)],
  ["corner-4", ...w(1.55, 1.55)],
  ["center", PX, PZ],
  ["old-pos", 40.8, -16.48],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-city7-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  const hs: number[] = [];
  for (const [name, x, z] of pts) { const h = agent.heightAt(x, z); hs.push(h); console.log(JSON.stringify({ name, x: Math.round(x * 1000) / 1000, z: Math.round(z * 1000) / 1000, heightAt: h })); }
  const c4 = hs.slice(0, 4);
  console.log(JSON.stringify({ lowest_corner: +Math.min(...c4).toFixed(5), spread_mm: Math.round((Math.max(...c4) - Math.min(...c4)) * 10000) / 10, old_site: hs[5] }));
} finally { agent.close(); }
