// struct207-terrain-viviani.ts — read-only terrain preflight at the FINAL
// seat from struct207-select-viviani.ts: az94.0 r370.0 pos (-25.809895,
// 369.098699), yaw 214deg pinned by the select scan. Viviani decoded
// envelope (struct206-decode re-run ALL PASS 8/8 this tick, D7):
// 3.40x3.35x3.40 SYMMETRIC — the circumscribed square footprint is
// 3.40 x 3.40, origin-centered, min y = 0. Sample the TRUE footprint corners
// (literal min/max), not origin-centered points. 9pt = center + 4 corners +
// 4 edge mids in WORLD coords; PY = lowest.
// Chassis: struct205-terrain-mandelbrot.ts (proven).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const YAW = 3.735004599267865; // struct207-select output: 214deg, +Z normal az304 (verify against select print)
const PX = -25.809895, PZ = 369.098699; // struct207-select output az94.0 r370.0 (exact)
const cy = Math.cos(YAW), sy = Math.sin(YAW);
console.log(`entity POS (${PX}, PY, ${PZ}) yaw ${YAW}`);
const X0 = -1.700, X1 = 1.700, Z0 = -1.700, Z1 = 1.700; // viviani decoded envelope, square footprint 3.40 x 3.40
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
