// city107-terrain-catenarygate.ts — read-only terrain preflight for
// city-107 (CITY-PLAN-V2 Wave A: nx-struct-catenarygate brg180 r60.5
// stray -> math avenue geometry->chaos threshold flank). NEW seat
// (-1.50, PY, 115.50), yaw = brg-180 (struct-72 radial opening law,
// re-based to seat bearing). TRUE footprint: bbox 9.04 x 1.896, local
// center (0, 0.078). 9 points: center, 4 bbox corners, 4 edge midpoints.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -1.50, PZ = 115.50;
const brgDeg = (Math.atan2(PX, PZ) * 180 / Math.PI + 360) % 360;
const YAW = (brgDeg - 180) * Math.PI / 180;
const HX = 4.52, HZ = 0.948, CX = 0, CZ = 0.078; // local half-extents + center
const c = Math.cos(YAW), s = Math.sin(YAW);
const world = (lx: number, lz: number): [number, number] => [PX + (lx + CX) * c + (lz + CZ) * s, PZ - (lx + CX) * s + (lz + CZ) * c];
const pts: Array<[string, number, number]> = [
  ["center", ...world(0, 0)],
  ["c++", ...world(HX, HZ)], ["c+-", ...world(HX, -HZ)], ["c-+", ...world(-HX, HZ)], ["c--", ...world(-HX, -HZ)],
  ["m+x", ...world(HX, 0)], ["m-x", ...world(-HX, 0)], ["m+z", ...world(0, HZ)], ["m-z", ...world(0, -HZ)],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-city107-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  const hs: number[] = [];
  for (const [name, x, z] of pts) { const h = agent.heightAt(x, z); hs.push(h); console.log(JSON.stringify({ name, x: +x.toFixed(2), z: +z.toFixed(2), heightAt: h })); }
  console.log(JSON.stringify({ brg_deg: +brgDeg.toFixed(4), yaw_deg: +((YAW * 180 / Math.PI).toFixed(4)), yaw_rad: +YAW.toFixed(6), spread_mm: +((Math.max(...hs) - Math.min(...hs)) * 1000).toFixed(1), lowest: Math.min(...hs) }));
} finally { agent.close(); }
