// struct213-terrain-lunes.ts — read-only terrain preflight at the FINAL
// seat from struct213-select-lunes.ts: az94.0 r400.0 pos (-27.902589,
// 399.025620), yaw 214deg pinned by the select scan. Lunes decoded
// envelope (struct212-decode ALL PASS 9/9, D8): 7.528x3.590x0.900
// SYMMETRIC — the curb-long footprint is 7.528 x 0.900, origin-centered
// ([-3.764,3.764]x[-0.450,0.450]), min y = 0. Sample the TRUE footprint
// corners (literal min/max), not origin-centered points.
// 9pt = center + 4 corners + 4 edge mids in WORLD coords; PY = lowest.
// Chassis: struct211-terrain-arbelos.ts (proven).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const YAW = 3.735004599267865; // struct213-select output: 214deg, +Z normal az304 (verify against select print)
const PX = -27.902589, PZ = 399.025620; // struct213-select output az94.0 r400.0 (exact)
const cy = Math.cos(YAW), sy = Math.sin(YAW);
console.log(`entity POS (${PX}, PY, ${PZ}) yaw ${YAW}`);
const X0 = -3.764, X1 = 3.764, Z0 = -0.450, Z1 = 0.450; // lunes decoded envelope, curb-long footprint 7.528 x 0.900
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
