// struct224-terrain-rupertfork.ts — read-only terrain preflight at the FINAL
// seat: az94.0 r445.0 ON-LINE continuation (procession line kept dead-on;
// rhythm honestly widened 10->15m — the 10.96m square span's half-diagonal
// 7.754m + dais r5.0 + law 1.4m forces center distance >=14.15m; first
// whole-meter lawful step = r445.0, disclosed). Yaw 101deg = 1.762783 rad
// (yaw law: local az α -> world az (α − yaw); mouth local az45 -> az304 =
// anti-travel az274 + 30deg east lean, struct-217/219 convention).
// Rupertfork v11 envelope (struct223-decode ALL PASS 18/18 re-run this tick):
// 10.96 x 5.14 x 10.96 ORIGIN-CENTERED square, min y 0 (plinths seated at
// grade, decode D7). 9pt = center + 4 corners + 4 edge-mids, rotated by yaw.
// PY = lowest (morley/lunes/oloid/sphericon/newtonspheres class: embed
// absorbs the spread).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const AZ = 94.0, R = 445.0, YAW = 1.762783, HALF = 5.48;
const PX = +(R * Math.cos(AZ * Math.PI / 180)).toFixed(6);
const PZ = +(R * Math.sin(AZ * Math.PI / 180)).toFixed(6);
console.log(`seat az${AZ} r${R} -> PX ${PX} PZ ${PZ} yaw ${YAW} (${(YAW * 180 / Math.PI).toFixed(1)}deg)`);
const cy = Math.cos(YAW), sy = Math.sin(YAW);
const pts: [string, number, number][] = [["center", 0, 0]];
for (const [sx, sz] of [[HALF, HALF], [HALF, -HALF], [-HALF, HALF], [-HALF, -HALF]] as [number, number][])
    pts.push([`corner${sx > 0 ? "+" : "-"}${sz > 0 ? "+" : "-"}x/z`, sx, sz]);
for (const [sx, sz] of [[HALF, 0], [-HALF, 0], [0, HALF], [0, -HALF]] as [number, number][])
    pts.push([`mid${sx !== 0 ? (sx > 0 ? "+x" : "-x") : (sz > 0 ? "+z" : "-z")}`, sx, sz]);
const agent = new WorldAgent({
    url: cfg.url, name: cfg.name, world: "commons-next",
    avatar: cfg.avatar ?? "explorer", agentToken: cfg.agentToken,
});
await agent.connect();
let lo = Infinity, hi = -Infinity;
for (const [n, lx, lz] of pts) {
    const wx = PX + lx * cy + lz * sy;
    const wz = PZ - lx * sy + lz * cy;
    const h = await agent.heightAt(wx, wz);
    lo = Math.min(lo, h); hi = Math.max(hi, h);
    console.log(`${n.padEnd(12)} local(${lx},${lz}) world(${wx.toFixed(4)},${wz.toFixed(4)}) heightAt ${h.toFixed(6)}`);
}
console.log(`\n9pt spread ${((hi - lo) * 1000).toFixed(1)}mm | PY = lowest = ${lo.toFixed(6)}`);
process.exit(0);
