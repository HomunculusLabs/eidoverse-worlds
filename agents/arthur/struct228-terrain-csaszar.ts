// struct228-terrain-csaszar.ts — read-only terrain preflight at the FINAL
// seat: az163.0 r66.0, W-shoulder inner constellation anchor (composes the
// shelf csaszar r66 -> millrace r77 -> screwwell r88). Yaw 77deg =
// 1.343904 rad (yaw law: local az α -> world az (α − yaw); judged reading
// face local az90 at world az13 = anti-travel az343 + 30deg east lean —
// struct-104 oblique band, struct-217/219 procession convention).
// Target = the TRUE rotated HEPTAGON (R2.75, local vertex azimuths
// 270 − i*360/7, i=0 = foot-apex vertex aimed −z): 15pt = center + 7
// vertices + 7 edge-mids. PY = lowest (morley/steinmetz class: the 7cm
// embed law already baked in the bank absorbs the spread).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const AZ = 163.0, R = 66.0, YAW = 1.343904, PR = 2.75;
const PX = +(R * Math.cos(AZ * Math.PI / 180)).toFixed(6);
const PZ = +(R * Math.sin(AZ * Math.PI / 180)).toFixed(6);
console.log(`seat az${AZ} r${R} -> PX ${PX} PZ ${PZ} yaw ${YAW} (${(YAW * 180 / Math.PI).toFixed(2)}deg)`);
const cy = Math.cos(YAW), sy = Math.sin(YAW);
const verts: [string, number, number][] = [["center", 0, 0]];
for (let i = 0; i < 7; i++) {
    const az = (270 - i * 360 / 7) * Math.PI / 180;
    verts.push([`v${i}`, PR * Math.cos(az), PR * Math.sin(az)]);
}
for (let i = 0; i < 7; i++) {
    const a1 = (270 - i * 360 / 7) * Math.PI / 180, a2 = (270 - ((i + 1) % 7) * 360 / 7) * Math.PI / 180;
    verts.push([`m${i}${(i + 1) % 7}`, PR / 2 * (Math.cos(a1) + Math.cos(a2)), PR / 2 * (Math.sin(a1) + Math.sin(a2))]);
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
console.log(`\n15pt spread ${((hi - lo) * 1000).toFixed(1)}mm | PY = lowest = ${lo.toFixed(6)}`);
process.exit(0);
