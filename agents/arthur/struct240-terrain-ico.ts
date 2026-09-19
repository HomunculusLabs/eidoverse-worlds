// struct240-terrain-ico.ts — read-only terrain preflight at the FINAL seat:
// az150.0 r75.0, S-SW constellation shelf beside the császár (császár
// az163 r66 -> millrace az175 r77 -> screwwell az180 r88; ico joins at
// az150 r75.0, dCS 18.3 — two rare polyhedra sharing one walk) AND the
// S-SW octant band's fourth form (soft cap 6, no exceedance). Yaw per
// the procession convention: yaw_deg = −120 − 150 = −270 -> 90deg =
// 1.570796 rad (yaw law: local az α -> world az (α − yaw); judged
// reading face local az90 at anti-travel az330 + 30deg east lean —
// struct-104 oblique band, struct-217/219/224/228/232/234/236/238
// convention; the ico is 72°-symmetric about Y — 5-fold tip seat — so
// the yaw is exact mod 72°).
// Target = the TRUE rotated ICOSAGON (R2.90, N20, corners on axes):
// 41pt = center + 20 vertices + 20 edge-mids. PY = lowest (the bank's
// dais-sole-at-grade build absorbs a small spread; császár 7cm class).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const AZ = 150.0, R = 75.0, YAW = 1.570796, PR = 2.90;
const PX = +(R * Math.cos(AZ * Math.PI / 180)).toFixed(6);
const PZ = +(R * Math.sin(AZ * Math.PI / 180)).toFixed(6);
console.log(`seat az${AZ} r${R} -> PX ${PX} PZ ${PZ} yaw ${YAW} (${(YAW * 180 / Math.PI).toFixed(2)}deg)`);
const cy = Math.cos(YAW), sy = Math.sin(YAW);
const verts: [string, number, number][] = [["center", 0, 0]];
for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    verts.push([`v${i}`, PR * Math.cos(a), PR * Math.sin(a)]);
}
for (let i = 0; i < 20; i++) {
    const a1 = (i / 20) * Math.PI * 2, a2 = ((i + 1) / 20) * Math.PI * 2;
    verts.push([`m${i}${(i + 1) % 20}`, PR / 2 * (Math.cos(a1) + Math.cos(a2)), PR / 2 * (Math.sin(a1) + Math.sin(a2))]);
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
    console.log(`${n.padEnd(5)} local(${lx.toFixed(3)},${lz.toFixed(3)}) world(${wx.toFixed(4)},${wz.toFixed(4)}) heightAt ${h.toFixed(6)}`);
}
console.log(`\n41pt spread ${((hi - lo) * 1000).toFixed(1)}mm | PY = lowest = ${lo.toFixed(6)}`);
process.exit(0);
