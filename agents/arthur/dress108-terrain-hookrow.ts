// dress108-terrain-hookrow.ts — read-only terrain preflight for dress-108/109
// (SW lantern hook row, nx-dress-sw-lanternhook-001). FINAL pose
// (-57.0, -70.0) yaw 282.34deg (4.92773 rad; row local +x runs N-NE along
// the corridor's W flank, hook side local -z facing E toward the walking
// line). v5 decode envelope: x -0.201..3.914, z -0.448..0.395
// (center (1.8564, -0.0263), half 2.0579 x 0.4216). Samples origin + 4 OBB
// corners + row end-post centers; py = worst (lowest) sample.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -57.0, PZ = -70.0;
const YAW = 4.927732279782902;
const cos = Math.cos(YAW), sin = Math.sin(YAW);
const C = { x: 1.8564, z: -0.0263 }, H = { x: 2.0579, z: 0.4216 };
const localCorners: [number, number][] = [
  [C.x + H.x, C.z + H.z], [C.x + H.x, C.z - H.z],
  [C.x - H.x, C.z + H.z], [C.x - H.x, C.z - H.z],
];
const pts: [string, number, number][] = [["origin", PX, PZ]];
for (let i = 0; i < 4; i++) {
  const [lx, lz] = localCorners[i];
  pts.push([`obb-${"abcd"[i]}`, PX + lx * cos + lz * sin, PZ - lx * sin + lz * cos]);
}
for (const [nm, lx, lz] of [["postA", 0.0, 0.0], ["postC", 3.7, 0.08]] as [string, number, number][]) {
  pts.push([nm, PX + lx * cos + lz * sin, PZ - lx * sin + lz * cos]);
}
const agent = new WorldAgent({ url: cfg.url, name: "arthur-dress108-terrain-read2", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
