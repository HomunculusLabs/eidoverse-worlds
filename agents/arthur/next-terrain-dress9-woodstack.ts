// next-terrain-dress9-woodstack.ts — read-only terrain preflight for dress-9.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
// final pose: pos (59.708, py, 51.781), yaw -135deg; asset half x 1.5, z 1.035
const cos = Math.cos(-135 * Math.PI / 180), sin = Math.sin(-135 * Math.PI / 180);
const pts: [string, number, number][] = [
  ["center", 59.708, 51.781],
];
for (const [sx, sz] of [[-1.5, -1.035], [1.5, -1.035], [-1.5, 1.035], [1.5, 1.035]] as const) {
  pts.push([`corner ${sx},${sz}`, 59.708 + sx * cos + sz * sin, 51.781 - sx * sin + sz * cos]);
}
const agent = new WorldAgent({ url: cfg.url, name: "arthur-dress9-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x: +x.toFixed(3), z: +z.toFixed(3), heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
