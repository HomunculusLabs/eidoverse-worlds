// next-terrain-struct91.ts — read-only terrain preflight for struct-91 seat.
// Candidate: E spoke mid-gap station (70, -3) yaw 0 — window plane facing
// local +z (the path), beside the walking line (z=0).
// Ground contact: only the two tangent-point foot plinths at local x ±R/2
// (= ±0.875), foot 0.44x0.30 → probe both foot rectangles.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const CX = 70, CZ = -3, YAW = 0;
const cos = Math.cos(YAW), sin = Math.sin(YAW);
const locals: [string, number, number][] = [
  ["center", 0, 0],
  ["foot-w-c", -0.875, 0], ["foot-e-c", 0.875, 0],
  ["foot-w-nw", -1.095, -0.15], ["foot-w-se", -1.095, 0.15],
  ["foot-w-sw", -0.655, -0.15], ["foot-w-ne", -0.655, 0.15],
  ["foot-e-nw", 0.655, -0.15], ["foot-e-se", 0.655, 0.15],
  ["foot-e-sw", 1.095, -0.15], ["foot-e-ne", 1.095, 0.15],
  ["x-extreme-w", -2.715, 0], ["x-extreme-e", 2.715, 0],
];
const pts = locals.map(([n, lx, lz]) => {
  const wx = CX + lx * cos + lz * sin;
  const wz = CZ - lx * sin + lz * cos;
  return [`${n} (${wx.toFixed(2)},${wz.toFixed(2)})`, wx, wz] as [string, number, number];
});
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct91-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  const hs: number[] = [];
  for (const [name, x, z] of pts) {
    const h = agent.heightAt(x, z);
    hs.push(h);
    console.log(JSON.stringify({ name, x: +x.toFixed(2), z: +z.toFixed(2), heightAt: h }));
  }
  console.log(JSON.stringify({ spread: Math.max(...hs) - Math.min(...hs), mean: hs.reduce((a, b) => a + b, 0) / hs.length }));
} finally { agent.close(); }
