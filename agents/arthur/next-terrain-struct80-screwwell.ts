// next-terrain-struct80-screwwell.ts — read-only terrain preflight for struct-80.
// Seat: entity pos (-88, PY, 0), yaw 180 (radial, W spoke). TRUE local envelope
// x -0.15..6.06 (screw axis; sump x-, head x+), z -3.575..1.55, y 0..4.04.
// At yaw 180 the envelope spans world x -94.06..-87.85, z -1.55..3.575.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -88, PZ = 0, YAW = 180;
const D2R = Math.PI / 180;
const c = Math.cos(YAW * D2R), s = Math.sin(YAW * D2R);
const W = (lx: number, lz: number): [number, number] => [PX + lx * c + lz * s, PZ - lx * s + lz * c];
const LX0 = -0.15, LX1 = 6.06, LZ0 = -3.575, LZ1 = 1.55;
const pts: [string, number, number][] = [
  ["env-center", ...W((LX0 + LX1) / 2, (LZ0 + LZ1) / 2)],
  ["corner-00", ...W(LX0, LZ0)], ["corner-01", ...W(LX0, LZ1)],
  ["corner-10", ...W(LX1, LZ0)], ["corner-11", ...W(LX1, LZ1)],
  ["edge-sump", ...W(LX0, 0)], ["edge-head", ...W(LX1, 0)],
  ["edge-profile-n", ...W(3, LZ0)], ["edge-profile-s", ...W(3, LZ1)],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct80-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x: +x.toFixed(2), z: +z.toFixed(2), heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
