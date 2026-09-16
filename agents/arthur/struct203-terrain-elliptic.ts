// struct203-terrain-elliptic.ts — read-only terrain preflight at the FINAL
// seat from struct203-select-elliptic.ts: az94.0 r350.0 pos (-24.414766,
// 349.147418), yaw 214deg pinned by the select scan. Elliptic decoded
// envelope (struct202-decode re-run ALL PASS 9/9 this tick, D8):
// 5.400x5.161x1.100 SYMMETRIC — x = width 5.40, z = depth 1.10
// (oval+wing composition), origin-centered, min y = 0. Sample the TRUE
// footprint corners (literal min/max), not origin-centered points. 9pt =
// center + 4 corners + 4 edge mids in WORLD coords; PY = lowest.
// Chassis: struct201-terrain-versiera.ts (proven).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const YAW = 3.735004599267865; // struct203-select output: 214deg, +Z normal az304 (verify against select print)
const PX = -24.414766, PZ = 349.147418; // struct203-select output az94.0 r350.0 (exact)
const cy = Math.cos(YAW), sy = Math.sin(YAW);
console.log(`entity POS (${PX}, PY, ${PZ}) yaw ${YAW}`);
const X0 = -2.700, X1 = 2.700, Z0 = -0.550, Z1 = 0.550; // elliptic decoded envelope, oval+wing 5.40 x 1.10
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
