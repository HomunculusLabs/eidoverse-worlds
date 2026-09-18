// fauna9-terrain-robin.ts — read-only terrain preflight at the FINAL seat.
// SEAT MOVED (fauna-9 bank decode): pool-local (-3.4,+2.4) is INSIDE the
// water basin (radial profile: water 0.140 to r=3.0, bank ring 0.207-0.261
// at r=3.5-4.0 — the "reed clump" stands IN water, not on a bank; the robin
// dangled below the rim, judge caught it). NEW seat: grass OUTSIDE the N
// rim — world (6.3, -86.35), ~0.6m N of the rim edge (local z +4.0 = world
// -86.98), facing N (yaw pi/2, bib toward the village approach). 9pt grid
// over the TRUE envelope corners. Decoded envelope: 0.527 x 0.220 x 0.203,
// origin x-offset +0.044 (bbox x [-0.220, 0.308]). PY = lowest.
// Chassis: struct215-terrain-oloid.ts (proven WorldAgent object form).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = 6.3, PZ = -86.35;
const cy = Math.cos(Math.PI / 2), sy = Math.sin(Math.PI / 2); // yaw pi/2 — full transform for the envelope grid
console.log(`entity POS (${PX}, PY, ${PZ}) yaw pi/2`);
const X0 = -0.220, X1 = 0.308, Z0 = -0.102, Z1 = 0.102; // decoded envelope, literal corners
const XC = (X0 + X1) / 2, ZC = (Z0 + Z1) / 2;
const local: [string, number, number][] = [
    ["center", XC, ZC],
    ["corner++", X1, Z1], ["corner+-", X1, Z0],
    ["corner-+", X0, Z1], ["corner--", X0, Z0],
    ["mid-e", X1, ZC], ["mid-w", X0, ZC],
    ["mid-n", XC, Z0], ["mid-s", XC, Z1],
];
const pts = local.map(([n, lx, lz]) => {
    const wx = PX + lx * cy + lz * sy, wz = PZ - lx * sy + lz * cy;
    return [n, wx, wz] as [string, number, number];
});
const agent = new WorldAgent({
    url: cfg.url, name: cfg.name, world: "commons-next",
    avatar: cfg.avatar ?? "explorer", agentToken: cfg.agentToken,
});
await agent.connect();
let lo = Infinity, hi = -Infinity;
for (const [n, wx, wz] of pts) {
    const h = await agent.heightAt(wx, wz);
    lo = Math.min(lo, h); hi = Math.max(hi, h);
    console.log(`${n.padEnd(8)} (${wx.toFixed(4)},${wz.toFixed(4)}) heightAt ${h.toFixed(6)}`);
}
console.log(`\n9pt spread ${((hi - lo) * 1000).toFixed(1)}mm | PY = lowest = ${lo.toFixed(6)}`);
process.exit(0);
