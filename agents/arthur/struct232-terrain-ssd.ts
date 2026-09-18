// struct232-terrain-ssd.ts — read-only terrain preflight at the FINAL seat:
// az9.0 r66.0, E-band inner anchor (composes the E terminus: ruledtower r58
// az0 + ssd r66 az9 — two forms where the octant had none). Yaw per the
// procession convention: yaw_deg = −120 − seat_az = −129 -> 231 deg =
// 4.039190 rad (yaw law: local az α -> world az (α − yaw); judged reading
// face local az90 at anti-travel az189 + 30deg east lean — struct-104
// oblique band, struct-217/219/224/228 convention).
// Target = the TRUE rotated DODECAGON (R2.75, ROT=0, corners on axes):
// 25pt = center + 12 vertices + 12 edge-mids. PY = lowest (the bank's
// dais-sole-at-grade build absorbs a small spread; császár 7cm class).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const AZ = 9.0, R = 66.0, YAW = 4.039190, PR = 2.75;
const PX = +(R * Math.cos(AZ * Math.PI / 180)).toFixed(6);
const PZ = +(R * Math.sin(AZ * Math.PI / 180)).toFixed(6);
console.log(`seat az${AZ} r${R} -> PX ${PX} PZ ${PZ} yaw ${YAW} (${(YAW * 180 / Math.PI).toFixed(2)}deg)`);
const cy = Math.cos(YAW), sy = Math.sin(YAW);
const verts: [string, number, number][] = [["center", 0, 0]];
for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    verts.push([`v${i}`, PR * Math.cos(a), PR * Math.sin(a)]);
}
for (let i = 0; i < 12; i++) {
    const a1 = (i / 12) * Math.PI * 2, a2 = ((i + 1) / 12) * Math.PI * 2;
    verts.push([`m${i}${(i + 1) % 12}`, PR / 2 * (Math.cos(a1) + Math.cos(a2)), PR / 2 * (Math.sin(a1) + Math.sin(a2))]);
}
const agent = new WorldAgent({
    url: cfg.url, name: cfg.name, world: "commons-next",
    avatar: cfg.avatar ?? "explorer", agentToken: cfg.agentToken,
});
await agent.connect();
let lo = Infinity, hi = -Infinity;
for (const [n, lx, lz] of verts) {
    const wx = PX + lx * cy + lz * sy;
    const wz = PZ - lx * sy + lz * cy;
    const h = await agent.heightAt(wx, wz);
    lo = Math.min(lo, h); hi = Math.max(hi, h);
    console.log(`${n.padEnd(4)} local(${lx.toFixed(3)},${lz.toFixed(3)}) world(${wx.toFixed(4)},${wz.toFixed(4)}) heightAt ${h.toFixed(6)}`);
}
console.log(`\n25pt spread ${((hi - lo) * 1000).toFixed(1)}mm | PY = lowest = ${lo.toFixed(6)}`);
process.exit(0);
