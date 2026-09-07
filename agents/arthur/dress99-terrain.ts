// dress99-terrain.ts — read-only terrain preflight for dress-99 (SW offering
// niche, nx-dress-sw-offering-001). FINAL pose (-45.001, -84.454) yaw 1.7623
// rad (local +z outward radial at seat local 214deg r7.06, re-derived fresh
// vs live host tuple this tick). v3 decode envelope: x -0.444..0.437,
// z -0.188..0.416 (center (-0.0039, 0.1143), half 0.4405 x 0.3021).
// Samples origin + 4 OBB corners; py = worst (lowest) corner.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -45.001, PZ = -84.454;
const YAW = 1.7623;
const cos = Math.cos(YAW), sin = Math.sin(YAW);
const C = { x: -0.0039, z: 0.1143 }, H = { x: 0.4405, z: 0.3021 };
const localCorners: [number, number][] = [
  [C.x + H.x, C.z + H.z], [C.x + H.x, C.z - H.z],
  [C.x - H.x, C.z + H.z], [C.x - H.x, C.z - H.z],
];
const pts: [string, number, number][] = [["origin", PX, PZ]];
for (let i = 0; i < 4; i++) {
  const [lx, lz] = localCorners[i];
  pts.push([`obb-${"abcd"[i]}`, PX + lx * cos + lz * sin, PZ - lx * sin + lz * cos]);
}
const agent = new WorldAgent({ url: cfg.url, name: "arthur-dress99-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  let worst = Infinity;
  for (const [name, x, z] of pts) {
    const h = agent.heightAt(x, z);
    worst = Math.min(worst, h);
    console.log(JSON.stringify({ name, x: +x.toFixed(3), z: +z.toFixed(3), heightAt: h }));
  }
  console.log(`PY_PIN ${worst}`);
} finally { agent.close(); }
