// next-terrain-city8.ts — read-only terrain preflight for city-8 observatory
// relocation. Seat az245.5 r96 (-39.811,-87.356) yaw 24.47deg radial-inward.
// Points: 4 TRUE local corners (x +/-3.37, z -3.32/+4.0 — asymmetric bbox
// center offset c(0,0.34)) + center + OLD pos (grade-delta reference; old
// site terrain -0.05244, companion light +1.55244 above host pos).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -39.811, PZ = -87.356, YAW = 24.47 * Math.PI / 180;
const C = Math.cos(YAW), S = Math.sin(YAW);
const w = (lx: number, lz: number): [number, number] => [PX + lx * C + lz * S, PZ - lx * S + lz * C];
const pts: [string, number, number][] = [
  ["corner-nw", ...w(-3.37, -3.32)],
  ["corner-ne", ...w(3.37, -3.32)],
  ["corner-sw", ...w(-3.37, 4.0)],
  ["corner-se", ...w(3.37, 4.0)],
  ["door-mid", ...w(0, 3.37)],
  ["center", PX, PZ],
  ["old-pos", 16.48, -40.8],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-city8-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  const hs: number[] = [];
  for (const [name, x, z] of pts) { const h = agent.heightAt(x, z); hs.push(h); console.log(JSON.stringify({ name, x: +x.toFixed(3), z: +z.toFixed(3), heightAt: h })); }
  const c4 = hs.slice(0, 4);
  console.log(JSON.stringify({ lowest_corner: +Math.min(...c4).toFixed(5), spread_mm: Math.round((Math.max(...c4) - Math.min(...c4)) * 10000) / 10, old_site: hs[6] }));
} finally { agent.close(); }
