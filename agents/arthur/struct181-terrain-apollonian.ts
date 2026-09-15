// struct181-terrain-apollonian.ts — read-only terrain preflight at the FINAL
// seat from struct181-select-apollonian.ts: az89.50 r164.25, pos (1.433333,
// 164.243746) yaw 0.8726646259971648 (50° oblique, struct-104 law — disc
// face normal 40° off the avenue walk line). Apollonian decoded envelope
// (struct180-decode re-run ALL PASS this tick, D5): 0.70x5.58x4.80
// SYMMETRIC — x = disc thickness, z = disc width. Sample the TRUE footprint
// corners (literal min/max), not origin-centered points. 9pt = center +
// 4 corners + 4 edge mids in WORLD coords; PY = lowest.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const YAW = 0.8726646259971648;
const PX = 1.433333, PZ = 164.243746; // struct181-select output az89.50 r164.25
const cy = Math.cos(YAW), sy = Math.sin(YAW);
console.log(`entity POS (${PX}, PY, ${PZ}) yaw ${YAW} (50°)`);
const X0 = -0.350, X1 = 0.350, Z0 = -2.400, Z1 = 2.400; // apollonian decoded envelope, symmetric
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
    console.log(`${n.padEnd(8)} (${wx.toFixed(4)}, ${wz.toFixed(4)}) heightAt ${h.toFixed(6)}`);
}
console.log(`\n9pt spread ${((hi - lo) * 1000).toFixed(1)}mm | PY = lowest = ${lo.toFixed(6)}`);
process.exit(0);
