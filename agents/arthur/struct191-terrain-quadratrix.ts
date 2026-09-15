// struct191-terrain-quadratrix.ts — read-only terrain preflight at the FINAL
// seat from struct191-select-quadratrix.ts: az94.0 r290.0, pos
// (-20.229377, 289.293575) yaw 3.735004599267865 (214° — +Z face normal
// az304, 30° off the az274 anti-travel sightline, east lean; the outbound
// walker reads the construction face obliquely on approach).
// Quadratrix decoded envelope (struct190-decode re-run ALL PASS this tick,
// D7): 3.300x2.800x0.600 SYMMETRIC — x = width, z = depth (face +Z),
// origin-centered, min y = 0.
// Sample the TRUE footprint corners (literal min/max), not origin-centered
// points. 9pt = center + 4 corners + 4 edge mids in WORLD coords; PY = lowest.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const YAW = 3.735004599267865;
const PX = -20.229377, PZ = 289.293575; // struct191-select output az94.0 r290.0
const cy = Math.cos(YAW), sy = Math.sin(YAW);
console.log(`entity POS (${PX}, PY, ${PZ}) yaw ${YAW} (214°)`);
const X0 = -1.650, X1 = 1.650, Z0 = -0.300, Z1 = 0.300; // quadratrix decoded envelope, symmetric
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
