// struct183-terrain-melencolia.ts — read-only terrain preflight at the FINAL
// seat from struct183-select-melencolia.ts: az98.25 r174.25, pos
// (-25.003589, 172.446754) yaw 2.5307274153917776 (145° — face normal 35°
// off the -Z approach normal, toward the walker; struct-104 oblique law).
// Melencolia decoded envelope (struct182-decode re-run ALL PASS this tick,
// D5): 3.20x3.75x0.95 SYMMETRIC — x = width, z = depth (face +Z).
// Sample the TRUE footprint corners (literal min/max), not origin-centered
// points. 9pt = center + 4 corners + 4 edge mids in WORLD coords; PY = lowest.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const YAW = 2.5307274153917776;
const PX = -25.003589, PZ = 172.446754; // struct183-select output az98.25 r174.25
const cy = Math.cos(YAW), sy = Math.sin(YAW);
console.log(`entity POS (${PX}, PY, ${PZ}) yaw ${YAW} (145°)`);
const X0 = -1.600, X1 = 1.600, Z0 = -0.475, Z1 = 0.475; // melencolia decoded envelope, symmetric
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
