// struct226-terrain-steinmetz.ts — read-only terrain preflight at the FINAL
// seat: az94.0 r460.0 ON-LINE continuation (procession line kept dead-on;
// 15m rhythm step from rupertfork r445 per struct-224's widened rhythm).
// Yaw 146deg = 2.548181 rad (yaw law: local az α -> world az (α − yaw);
// construction face local az90 -> world az304 = anti-travel az274 + 30deg
// east lean, struct-217/219 procession convention).
// Steinmetz v1 envelope (struct225-decode ALL PASS 8/8 re-run this tick):
// 5.8 x 4.578 x 5.8 ORIGIN-CENTERED square, min y 0 (plinth sole at grade,
// decode D6). 9pt = center + 4 corners + 4 edge-mids, rotated by yaw.
// PY = lowest (morley/lunes/oloid/sphericon/newtonspheres class: embed
// absorbs the spread).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const AZ = 94.0, R = 460.0, YAW = 2.548181, HALF = 2.9;
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
