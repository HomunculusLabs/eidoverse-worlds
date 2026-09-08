// next-terrain-struct92.ts — read-only terrain preflight for struct-92 (Fifth Bench).
// Seat: cultivation-walk mid-gap, center (-34.8, 51.4) yaw -0.6435 rad.
// Probes the true ribbon corners/edges/center (long axis local +x).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const CX = -23.5, CZ = -51.0, YAW = -0.4328;
const cs = Math.cos(YAW), sn = Math.sin(YAW);
const pts: [string, number, number][] = [];
for (const [name, lx, lz] of [
    ["center", 0, 0],
    ["end-E-near", 6.05, 0.25], ["end-E-far", 6.05, -0.25],
    ["end-W-near", -6.05, 0.25], ["end-W-far", -6.05, -0.25],
    ["q1", 3, 0], ["q2", -3, 0],
    ["mid-near", 0, 0.25], ["mid-far", 0, -0.25],
] as [string, number, number][]) {
    pts.push([name, CX + lx * cs + lz * sn, CZ - lx * sn + lz * cs]);
}
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct92-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
    await agent.connect(); await Bun.sleep(2500);
    for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x: +x.toFixed(3), z: +z.toFixed(3), heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
