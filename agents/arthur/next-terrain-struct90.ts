// next-terrain-struct90.ts — read-only terrain preflight for struct-90 seat.
// Candidate: W spoke mid-gap station (-60, -0.03?, 0) yaw π/2 — the ∞ long
// axis on world z (face-on to W-ward walkers), beside the walking line.
// Envelope local (yaw 0 build): x ±(3.889+0.28) = ±4.17, z ±(1.375+0.28)=±1.66
// World at yaw π/2: world-x = local-z → ±1.66; world-z = local-x → ±4.17.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const CX = -60, CZ = -7, YAW = Math.PI / 2;
const cos = Math.cos(YAW), sin = Math.sin(YAW);
// local corners/edges of the ribbon envelope (with bbox margins)
const locals: [string, number, number][] = [
  ["center", 0, 0],
  ["node+e", 1.7, 0], ["node-w", -1.7, 0],
  ["loop-e-extreme", 3.9, 0], ["loop-w-extreme", -3.9, 0],
  ["loop-e-top", 1.62, 1.38], ["loop-e-bot", 1.62, -1.38],
  ["loop-w-top", -1.62, 1.38], ["loop-w-bot", -1.62, -1.38],
  ["z-edge-n", 0, 1.66], ["z-edge-s", 0, -1.66],
];
const pts = locals.map(([n, lx, lz]) => {
  const wx = CX + lx * cos + lz * sin;
  const wz = CZ - lx * sin + lz * cos;
  return [`${n} (${wx.toFixed(2)},${wz.toFixed(2)})`, wx, wz] as [string, number, number];
});
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct90b-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x: +x.toFixed(2), z: +z.toFixed(2), heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
