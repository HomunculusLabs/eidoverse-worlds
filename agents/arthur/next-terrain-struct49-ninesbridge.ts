// next-terrain-struct49-ninesbridge.ts — read-only terrain preflight for
// struct-49 R4-2 THE BRIDGE OF NINES (recovery of interrupted pre-place
// window, artwalk-32 class). S-axis spoke site: center (-7.28, 69.62),
// yaw -1.67552 (span along the plaza->S axis — local-x world dir
// (-0.1046, 0.9945), 24.3m local x). 5-point spread on the TRUE final
// pose axis (v1 sample vectors were wrong — probe self-catch, world fine).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const yaw = -1.67552;
const u = [Math.cos(yaw), -Math.sin(yaw)]; // local-x world direction
const p = [-u[1], u[0]];                   // local-z world direction
const C = [-7.28, 69.62];
const pts: [string, number, number][] = [
  ["center", C[0], C[1]],
  ["span-end-w", C[0] + u[0] * 14.6, C[1] + u[1] * 14.6],
  ["span-end-e", C[0] - u[0] * 14.6, C[1] - u[1] * 14.6],
  ["side-n", C[0] + p[0] * 2.0, C[1] + p[1] * 2.0],
  ["side-s", C[0] - p[0] * 2.0, C[1] - p[1] * 2.0],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct49-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x: +x.toFixed(2), z: +z.toFixed(2), heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
