// struct161-terrain-boy-v2.ts — read-only terrain preflight at the FINAL
// seat selected by struct161-scan-boy-v2.ts: az90 E R=110 yaw=-40deg
// (radians -0.6981317007977318), LAWFUL (worst-solid 3.44 law 1.4, NN
// 40.11 law 8.0; under-served E district per CITY-PLAN Amendment 1 —
// outer-ring E=3 pre-seat vs W=5/N=12/S=24, re-derived fresh this scan).
// TRUE decoded envelope 10.10(x) x 6.52(y) x 7.10(z), x/z ORIGIN-CENTERED
// (struct160-decode-boy-v2 ALL PASS 32/32 + independent TRS-walk envelope
// decode THIS tick) => entity POS seats form-CENTER on the axis point:
// PX = AX. Axle runs local x; yaw=-40deg at az90 seats the axle 40deg off
// the radial E-spoke approach (struct-159 committed law band 35-45deg,
// midpoint chosen; header proof in the scan).
// 9pt = center + 4 corners + 4 edge mids of the true envelope, in WORLD
// coords (align-1 transform). PY = lowest sample (grade-based build).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const YAW = -40 * Math.PI / 180;
const az = 90 * Math.PI / 180, R = 110;
const AX = R * Math.sin(az), AZ = -R * Math.cos(az);
const CX = 0, CZ = 0; // origin-centered (decode-derived)
const cy = Math.cos(YAW), sy = Math.sin(YAW);
const PX = AX - (CX * cy + CZ * sy);
const PZ = AZ - (-CX * sy + CZ * cy);
console.log(`axis point (${AX.toFixed(6)}, ${AZ.toFixed(6)}) -> entity POS (${PX.toFixed(6)}, PY, ${PZ.toFixed(6)}) yaw ${YAW.toFixed(6)} rad`);
const HX = 5.05, HZ = 3.55; // envelope half-extents x/z (decode-derived)
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
