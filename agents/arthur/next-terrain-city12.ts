// next-terrain-city12.ts — read-only terrain preflight for city-12 charcoal
// ring-edge relocation. NEW seat az50.2 r35.5 (22.724,27.274) yaw -2.4785
// (preserved exactly), true OBB 4.161x2.871 c(0.59,0.232). Points: 4 true
// OBB corners + center + OLD pos (34.5,34) grade-delta reference.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = 22.724, PZ = 27.274, YAW = -2.4784945651581642;
const C = Math.cos(YAW), S = Math.sin(YAW);
const CX = 0.59, CZ = 0.232, HX = 4.161 / 2, HZ = 2.871 / 2;
const w = (lx: number, lz: number): [number, number] => [PX + (CX + lx) * C + (CZ + lz) * S, PZ - (CX + lx) * S + (CZ + lz) * C];
const pts: [string, number, number][] = [
  ["corner-1", ...w(-HX, -HZ)],
  ["corner-2", ...w(HX, -HZ)],
  ["corner-3", ...w(-HX, HZ)],
  ["corner-4", ...w(HX, HZ)],
  ["center", ...w(0, 0)],
  ["old-pos", 34.5, 34],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-city12-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  const hs: number[] = [];
  for (const [name, x, z] of pts) { const h = agent.heightAt(x, z); hs.push(h); console.log(JSON.stringify({ name, x: Math.round(x * 1000) / 1000, z: Math.round(z * 1000) / 1000, heightAt: h })); }
  const c4 = hs.slice(0, 4);
  console.log(JSON.stringify({ lowest_corner: +Math.min(...c4).toFixed(5), spread_mm: Math.round((Math.max(...c4) - Math.min(...c4)) * 10000) / 10, old_site: hs[5] }));
} finally { agent.close(); }
