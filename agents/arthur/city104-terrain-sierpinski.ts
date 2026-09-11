// city104-terrain-sierpinski.ts — read-only terrain preflight for city-104
// (CITY-PLAN-V2 Wave A: nx-struct-sierpinski r74 brg186 antipodal stray ->
// math avenue band). NEW seat (-2.5, PY, 79.81) yaw pi [brg358.2 r80.0,
// east of ninesbridge]. TRUE footprint: bbox 6.55 x 5.693, local center
// (0, 0.924) — yaw pi flips local x: world center = (-2.5, 79.81+0.924).
// 9 points: center, 4 bbox corners, 4 edge midpoints (true-frame).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -1.5, PZ = 80.0, YAW = Math.PI;
const HX = 3.275, HZ = 2.8465, CX = 0, CZ = 0.924; // local half-extents + center
const c = Math.cos(YAW), s = Math.sin(YAW);
const world = (lx: number, lz: number): [number, number] => [PX + (lx + CX) * c + (lz + CZ) * s, PZ - (lx + CX) * s + (lz + CZ) * c];
const pts: Array<[string, number, number]> = [
  ["center", ...world(0, 0)],
  ["c++", ...world(HX, HZ)], ["c+-", ...world(HX, -HZ)], ["c-+", ...world(-HX, HZ)], ["c--", ...world(-HX, -HZ)],
  ["m+x", ...world(HX, 0)], ["m-x", ...world(-HX, 0)], ["m+z", ...world(0, HZ)], ["m-z", ...world(0, -HZ)],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-city104-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  const hs: number[] = [];
  for (const [name, x, z] of pts) { const h = agent.heightAt(x, z); hs.push(h); console.log(JSON.stringify({ name, x: +x.toFixed(2), z: +z.toFixed(2), heightAt: h })); }
  console.log(JSON.stringify({ spread_mm: +((Math.max(...hs) - Math.min(...hs)) * 1000).toFixed(1), lowest: Math.min(...hs) }));
} finally { agent.close(); }
