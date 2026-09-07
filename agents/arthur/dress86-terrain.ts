// dress86-terrain.ts — read-only terrain preflight for dress-86 (SW bell
// post, nx-dress-sw-bellpost-001). FINAL pose (-54.0, -69.8) yaw -24.7°
// (re-sited from the dead dress-85 hand pocket (-44.6,-68.8), which fresh
// census SAT killed at -3.13m vs terrace-0049 + sat inside the labyrinth's
// 18m approach cone). v4 decode bbox: x -0.551..0.549, z -0.499..0.871
// (center (-0.001, +0.186), half 0.550 x 0.685). Samples origin + 4 OBB
// corners; py = worst corner.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -54.0, PZ = -69.8;
const YAW = -24.7 * Math.PI / 180;
const cos = Math.cos(YAW), sin = Math.sin(YAW);
const C = { x: -0.001, z: 0.186 }, H = { x: 0.550, z: 0.685 };
const localCorners: [number, number][] = [
  [C.x + H.x, C.z + H.z], [C.x + H.x, C.z - H.z],
  [C.x - H.x, C.z + H.z], [C.x - H.x, C.z - H.z],
];
const pts: [string, number, number][] = [["origin", PX, PZ]];
for (let i = 0; i < 4; i++) {
  const [lx, lz] = localCorners[i];
  pts.push([`obb-${"abcd"[i]}`, PX + lx * cos + lz * sin, PZ - lx * sin + lz * cos]);
}
const agent = new WorldAgent({ url: cfg.url, name: "arthur-dress86-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x: +x.toFixed(3), z: +z.toFixed(3), heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
