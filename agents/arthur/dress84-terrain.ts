// dress84-terrain.ts — read-only terrain preflight for dress-84 (SE dead
// snag, nx-dress-se-snagdead-001). Candidate pose (60.6, -30.0) yaw -135°
// (local +z hollow faces the walking line / plaza side; lean +x tips away).
// v4 decode bbox: x -0.803..1.005, z -0.961..0.780 (center (+0.101,-0.091),
// half 0.904 x 0.871). Samples origin + 4 OBB corners; py = worst corner.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = 60.6, PZ = -30.0;
const YAW = -135 * Math.PI / 180;
const cos = Math.cos(YAW), sin = Math.sin(YAW);
const C = { x: 0.101, z: -0.091 }, H = { x: 0.904, z: 0.871 };
const localCorners: [number, number][] = [
  [C.x + H.x, C.z + H.z], [C.x + H.x, C.z - H.z],
  [C.x - H.x, C.z + H.z], [C.x - H.x, C.z - H.z],
];
const pts: [string, number, number][] = [["origin", PX, PZ]];
for (let i = 0; i < 4; i++) {
  const [lx, lz] = localCorners[i];
  pts.push([`obb-${"abcd"[i]}`, PX + lx * cos + lz * sin, PZ - lx * sin + lz * cos]);
}
const agent = new WorldAgent({ url: cfg.url, name: "arthur-dress84-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x: +x.toFixed(3), z: +z.toFixed(3), heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
