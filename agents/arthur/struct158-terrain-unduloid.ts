// struct158-terrain-unduloid.ts — read-only terrain preflight at the FINAL
// seat selected by struct158-scan-unduloid.ts: az120 R=110 yaw=-120deg
// (radians -2.0943951023931953), LAWFUL (worst-solid 2.53 law 1.4, NN
// spiralfolly 53.64 law 8.0; under-served E district per CITY-PLAN
// Amendment 1 — outer-ring E=2 pre-seat vs W=6/N=12/S=24, re-derived fresh
// this scan; "waterfront-adjacent" disposition preference OVERRIDDEN:
// reedpool sits in 2x-over-cap N — disclosed).
// TRUE decoded envelope 6.57(x) x 1.30(y) x 2.20(z), x/z ORIGIN-CENTERED
// (struct157-decode-unduloid ALL PASS 17/17, re-run this tick) => entity
// POS seats form-CENTER on the axis point: PX = AX. Bead string runs
// local x; yaw=-az seats it tangent to the ring: the az120 plaza spoke
// approach reads the full 5-bead broadside (struct-104 planar-figure
// class, chain adaptation — see scan header proof).
// 9pt = center + 4 corners + 4 edge mids of the true envelope, in WORLD
// coords (align-1 transform). PY = lowest sample (base on grade).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const YAW = -120 * Math.PI / 180;
const az = 120 * Math.PI / 180, R = 110;
const AX = R * Math.sin(az), AZ = -R * Math.cos(az);
const CX = 0, CZ = 0; // origin-centered (decode-derived)
const cy = Math.cos(YAW), sy = Math.sin(YAW);
const PX = AX - (CX * cy + CZ * sy);
const PZ = AZ - (-CX * sy + CZ * cy);
console.log(`axis point (${AX.toFixed(6)}, ${AZ.toFixed(6)}) -> entity POS (${PX.toFixed(6)}, PY, ${PZ.toFixed(6)}) yaw ${YAW.toFixed(6)} rad`);
const HX = 3.285, HZ = 1.10; // envelope half-extents x/z (decode-derived)
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
