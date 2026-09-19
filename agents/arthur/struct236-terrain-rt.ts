// struct236-terrain-rt.ts — read-only terrain preflight at the FINAL seat:
// az359.5 r87.5, E-axis procession terminus (tower r58 az0 -> ssd r66 az9 ->
// tetrahelix r76 az4 -> rt r87.5 az359.5, ~12m rhythm) AND the N-E octant's
// second form (vesicawindow az357.5 r70.1 the first). Yaw per the procession
// convention: yaw_deg = −120 − seat_az = −479.5 -> 240.50deg = 4.197517 rad
// (yaw law: local az α -> world az (α − yaw); judged reading face local
// az90 at anti-travel az179.5 + 30deg east lean — struct-104 oblique band,
// struct-217/219/224/228/232/234 convention; the rt is 120°-symmetric about
// Y so the yaw is exact mod 120°).
// Target = the TRUE rotated TRIACONTAGON (R4.0, N30, corners on axes):
// 61pt = center + 30 vertices + 30 edge-mids. PY = lowest (the bank's
// dais-sole-at-grade build absorbs a small spread; császár 7cm class).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const AZ = 359.5, R = 87.5, YAW = 4.197517, PR = 4.0;
const PX = +(R * Math.cos(AZ * Math.PI / 180)).toFixed(6);
const PZ = +(R * Math.sin(AZ * Math.PI / 180)).toFixed(6);
console.log(`seat az${AZ} r${R} -> PX ${PX} PZ ${PZ} yaw ${YAW} (${(YAW * 180 / Math.PI).toFixed(2)}deg)`);
const cy = Math.cos(YAW), sy = Math.sin(YAW);
const verts: [string, number, number][] = [["center", 0, 0]];
for (let i = 0; i < 30; i++) {
    const a = (i / 30) * Math.PI * 2;
    verts.push([`v${i}`, PR * Math.cos(a), PR * Math.sin(a)]);
}
for (let i = 0; i < 30; i++) {
    const a1 = (i / 30) * Math.PI * 2, a2 = ((i + 1) / 30) * Math.PI * 2;
    verts.push([`m${i}${(i + 1) % 30}`, PR / 2 * (Math.cos(a1) + Math.cos(a2)), PR / 2 * (Math.sin(a1) + Math.sin(a2))]);
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
console.log(`\n61pt spread ${((hi - lo) * 1000).toFixed(1)}mm | PY = lowest = ${lo.toFixed(6)}`);
process.exit(0);
