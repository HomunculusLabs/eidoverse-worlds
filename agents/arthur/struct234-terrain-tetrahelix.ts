// struct234-terrain-tetrahelix.ts — read-only terrain preflight at the FINAL
// seat: az4 r76, E-terminus procession anchor (tower r58 az0 -> ssd r66 az9
// -> tetrahelix r76 az4, ~12m rhythm matching the tower-ssd pair). Yaw per
// the procession convention: yaw_deg = −120 − seat_az = −124 -> 236 deg =
// 4.118977 rad (yaw law: local az α -> world az (α − yaw); judged reading
// face local az90 at anti-travel az184 + 30deg east lean — struct-104
// oblique band, struct-217/219/224/228/232 convention).
// Target = the TRUE rotated HEXAGON (R2.2, N6, ROT=0, corners on axes):
// 13pt = center + 6 vertices + 6 edge-mids. PY = lowest (the bank's
// dais-sole-at-grade build absorbs a small spread; császár 7cm class).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const AZ = 4.0, R = 76.0, YAW = 4.118977, PR = 2.2;
const PX = +(R * Math.cos(AZ * Math.PI / 180)).toFixed(6);
const PZ = +(R * Math.sin(AZ * Math.PI / 180)).toFixed(6);
console.log(`seat az${AZ} r${R} -> PX ${PX} PZ ${PZ} yaw ${YAW} (${(YAW * 180 / Math.PI).toFixed(2)}deg)`);
const cy = Math.cos(YAW), sy = Math.sin(YAW);
const verts: [string, number, number][] = [["center", 0, 0]];
for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    verts.push([`v${i}`, PR * Math.cos(a), PR * Math.sin(a)]);
}
for (let i = 0; i < 6; i++) {
    const a1 = (i / 6) * Math.PI * 2, a2 = ((i + 1) / 6) * Math.PI * 2;
    verts.push([`m${i}${(i + 1) % 6}`, PR / 2 * (Math.cos(a1) + Math.cos(a2)), PR / 2 * (Math.sin(a1) + Math.sin(a2))]);
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
console.log(`\n13pt spread ${((hi - lo) * 1000).toFixed(1)}mm | PY = lowest = ${lo.toFixed(6)}`);
process.exit(0);
