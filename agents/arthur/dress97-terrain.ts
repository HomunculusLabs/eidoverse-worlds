// dress97-terrain.ts — read-only terrain preflight for dress-97 (SW seats,
// nx-dress-sw-seats-001). FINAL pose (-57.0, -72.5) yaw 156.70deg (local +z
// faces the labyrinth). v4 decode envelope: x -1.123..2.261, z -0.312..1.281
// (center (0.569, 0.484), half 1.692 x 0.797). Samples origin + 4 OBB
// corners; py = worst corner.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -57.0, PZ = -72.5;
const YAW = 156.70 * Math.PI / 180;
const cos = Math.cos(YAW), sin = Math.sin(YAW);
const C = { x: 0.569, z: 0.484 }, H = { x: 1.692, z: 0.797 };
const localCorners: [number, number][] = [
  [C.x + H.x, C.z + H.z], [C.x + H.x, C.z - H.z],
  [C.x - H.x, C.z + H.z], [C.x - H.x, C.z - H.z],
];
const pts: [string, number, number][] = [["origin", PX, PZ]];
for (let i = 0; i < 4; i++) {
  const [lx, lz] = localCorners[i];
  pts.push([`obb-${"abcd"[i]}`, PX + lx * cos + lz * sin, PZ - lx * sin + lz * cos]);
}
const agent = new WorldAgent({ url: cfg.url, name: "arthur-dress97-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x: +x.toFixed(3), z: +z.toFixed(3), heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
