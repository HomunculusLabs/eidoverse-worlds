// city108-terrain-rotor.ts — read-only terrain preflight for city-108
// (CITY-PLAN-V2 Wave A: nx-struct-reuleauxrotor brg190.5 r65.6 stray ->
// math avenue geometry-chapter east flank, seat (1.50, PY, 87.50), yaw 0
// preserved — spinning kinetic form, struct-84 contract). TRUE footprint:
// bbox 3.5 x 3.5, local center (0,0). 9 points: center, 4 corners, 4 edge
// midpoints.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = 1.50, PZ = 87.50, YAW = 0;
const HX = 1.75, HZ = 1.75, CX = 0, CZ = 0;
const c = Math.cos(YAW), s = Math.sin(YAW);
const world = (lx: number, lz: number): [number, number] => [PX + (lx + CX) * c + (lz + CZ) * s, PZ - (lx + CX) * s + (lz + CZ) * c];
const pts: Array<[string, number, number]> = [
  ["center", ...world(0, 0)],
  ["c++", ...world(HX, HZ)], ["c+-", ...world(HX, -HZ)], ["c-+", ...world(-HX, HZ)], ["c--", ...world(-HX, -HZ)],
  ["m+x", ...world(HX, 0)], ["m-x", ...world(-HX, 0)], ["m+z", ...world(0, HZ)], ["m-z", ...world(0, -HZ)],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-city108-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  const hs: number[] = [];
  for (const [name, x, z] of pts) { const h = agent.heightAt(x, z); hs.push(h); console.log(JSON.stringify({ name, x: +x.toFixed(2), z: +z.toFixed(2), heightAt: h })); }
  console.log(JSON.stringify({ brg_deg: +((Math.atan2(PX, PZ) * 180 / Math.PI + 360) % 360).toFixed(4), r: +Math.hypot(PX, PZ).toFixed(3), spread_mm: +((Math.max(...hs) - Math.min(...hs)) * 1000).toFixed(1), lowest: Math.min(...hs) }));
} finally { agent.close(); }
