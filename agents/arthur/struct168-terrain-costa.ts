// struct168-terrain-costa.ts — read-only terrain preflight at the FINAL seat
// from struct168-scan-costa.ts: r127.5 az83.5 (1° off the 84.5° Math Avenue
// density-window axis), pos axis-point (14.434700, 126.675800) yaw 0.
// Costa v2 envelope 3.16x3.16x3.37 (struct-166 decode law), x/z
// ORIGIN-CENTERED => entity POS seats form-CENTER on the axis point: PX=AX.
// 9pt = center + 4 corners + 4 edge mids in WORLD coords; PY = lowest.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const YAW = 0;
const AX = 14.434700, AZ = 126.675800; // scan output r127.5 az83.5
const cy = Math.cos(YAW), sy = Math.sin(YAW);
const PX = AX, PZ = AZ; // origin-centered, yaw 0
console.log(`axis point (${AX}, ${AZ}) -> entity POS (${PX.toFixed(6)}, PY, ${PZ.toFixed(6)}) yaw ${YAW}`);
const HX = 3.16 / 2, HZ = 3.16 / 2;
const local: [string, number, number][] = [
    ["center", 0, 0],
    ["corner++", HX, HZ], ["corner+-", HX, -HZ],
    ["corner-+", -HX, HZ], ["corner--", -HX, -HZ],
    ["mid-e", HX, 0], ["mid-w", -HX, 0],
    ["mid-n", 0, -HZ], ["mid-s", 0, HZ],
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
