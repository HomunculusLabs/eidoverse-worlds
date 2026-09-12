// city105-terrain-unduloid.ts — read-only terrain preflight for city-105
// (CITY-PLAN-V2 Wave A: nx-struct-unduloid brg60 r110 stray -> math avenue
// band surfaces gate beside costa). NEW seat (4.25, PY, 128.0) yaw -0.033161
// rad [-1.9deg, avenue tangent law: bead string (local x) tangent to the
// walk, broadside read — struct-158 tangent contract adapted per city-105
// scan header]. TRUE footprint: bbox 6.567 x 2.2, local center (0, 0) —
// origin centered. 9 points: center, 4 bbox corners, 4 edge midpoints.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = 4.25, PZ = 128.0, YAW = -0.033161;
const HX = 3.2835, HZ = 1.1, CX = 0, CZ = 0; // local half-extents + center
const c = Math.cos(YAW), s = Math.sin(YAW);
const world = (lx: number, lz: number): [number, number] => [PX + (lx + CX) * c + (lz + CZ) * s, PZ - (lx + CX) * s + (lz + CZ) * c];
const pts: Array<[string, number, number]> = [
  ["center", ...world(0, 0)],
  ["c++", ...world(HX, HZ)], ["c+-", ...world(HX, -HZ)], ["c-+", ...world(-HX, HZ)], ["c--", ...world(-HX, -HZ)],
  ["m+x", ...world(HX, 0)], ["m-x", ...world(-HX, 0)], ["m+z", ...world(0, HZ)], ["m-z", ...world(0, -HZ)],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-city105-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  const hs: number[] = [];
  for (const [name, x, z] of pts) { const h = agent.heightAt(x, z); hs.push(h); console.log(JSON.stringify({ name, x: +x.toFixed(2), z: +z.toFixed(2), heightAt: h })); }
  console.log(JSON.stringify({ spread_mm: +((Math.max(...hs) - Math.min(...hs)) * 1000).toFixed(1), lowest: Math.min(...hs) }));
} finally { agent.close(); }
