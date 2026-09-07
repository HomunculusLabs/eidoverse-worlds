// dress78-terrain.ts — read-only terrain preflight for dress-77's deferred
// placement (SE fungus-log deadfall, nx-dress-se-funguslogs-001).
// Pose from DRESSING-PLAN dress-77 entry: pos (40.0, -63.0), yaw 210°.
// v6 decode bbox: x -2.329..4.187 (center +0.929, half 3.258),
// z -1.272..0.758 (center -0.257, half 1.015). Samples the 4 OBB corners +
// center + entity origin; py = worst corner, flatness named.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const YAW = 210 * Math.PI / 180;
const cos = Math.cos(YAW), sin = Math.sin(YAW);
const C = { x: 0.929, z: -0.257 }, H = { x: 3.258, z: 1.015 };
const localCorners: [number, number][] = [
  [C.x + H.x, C.z + H.z], [C.x + H.x, C.z - H.z],
  [C.x - H.x, C.z + H.z], [C.x - H.x, C.z - H.z],
];
const pts: [string, number, number][] = [["origin", 40.0, -63.0]];
for (let i = 0; i < 4; i++) {
  const [lx, lz] = localCorners[i];
  pts.push([`obb-${"abcd"[i]}`, 40.0 + lx * cos + lz * sin, -63.0 - lx * sin + lz * cos]);
}
const agent = new WorldAgent({ url: cfg.url, name: "arthur-dress78-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x: +x.toFixed(3), z: +z.toFixed(3), heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
