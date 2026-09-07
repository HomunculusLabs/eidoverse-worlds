// dress95-terrain.ts — read-only terrain preflight for dress-95 (NW rain
// barrel, nx-dress-nw-rainbarrel-001). Pose: (-59.72, 52.73) yaw 2.3562
// (135deg, skeps-row-parallel). v6 decode bbox: x -0.51..0.51, z -0.52..0.84
// (center (0, +0.16), half x 0.51 z 0.68). Samples the 4 OBB corners +
// center + entity origin; py = worst corner, flatness named.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -56.22, PZ = 53.41;
const YAW = 2.3562;
const cos = Math.cos(YAW), sin = Math.sin(YAW);
const C = { x: 0.0, z: 0.209 }, H = { x: 0.51, z: 0.639 };
const localCorners: [number, number][] = [
  [C.x + H.x, C.z + H.z], [C.x + H.x, C.z - H.z],
  [C.x - H.x, C.z + H.z], [C.x - H.x, C.z - H.z],
];
const pts: [string, number, number][] = [["origin", PX, PZ], ["center", PX + C.x * cos + C.z * sin, PZ - C.x * sin + C.z * cos]];
for (let i = 0; i < 4; i++) {
  const [lx, lz] = localCorners[i];
  pts.push([`obb-${"abcd"[i]}`, PX + lx * cos + lz * sin, PZ - lx * sin + lz * cos]);
}
const agent = new WorldAgent({ url: cfg.url, name: "arthur-dress95-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x: +x.toFixed(3), z: +z.toFixed(3), heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
