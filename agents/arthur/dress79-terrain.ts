// dress79-terrain.ts — read-only terrain preflight for dress-79 (SW incense
// stand, nx-dress-sw-incense-001). Final pose (post live-SAT re-site): pos
// (−55.475, −61.329), yaw −52.75° (local +z faces the walking line). v2
// decode bbox: x −0.761..0.759, z −0.770..0.750 (center (−0.001, −0.010),
// half 0.760). Samples the 4 OBB corners + center + entity origin; py = worst
// corner, flatness named.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -55.475, PZ = -61.329;
const YAW = -52.75 * Math.PI / 180;
const cos = Math.cos(YAW), sin = Math.sin(YAW);
const C = { x: -0.001, z: -0.010 }, H = { x: 0.760, z: 0.760 };
const localCorners: [number, number][] = [
  [C.x + H.x, C.z + H.z], [C.x + H.x, C.z - H.z],
  [C.x - H.x, C.z + H.z], [C.x - H.x, C.z - H.z],
];
const pts: [string, number, number][] = [["origin", PX, PZ], ["center", PX + C.x * cos + C.z * sin, PZ - C.x * sin + C.z * cos]];
for (let i = 0; i < 4; i++) {
  const [lx, lz] = localCorners[i];
  pts.push([`obb-${"abcd"[i]}`, PX + lx * cos + lz * sin, PZ - lx * sin + lz * cos]);
}
const agent = new WorldAgent({ url: cfg.url, name: "arthur-dress79-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x: +x.toFixed(3), z: +z.toFixed(3), heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
