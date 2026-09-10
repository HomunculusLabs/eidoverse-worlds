// struct137-terrain-boy.ts — read-only terrain preflight at the FINAL
// seat selected by struct137-scan-boy.ts v2: az270 R=100 yaw pi, LAWFUL
// (worst solid screwwell +2.47, NN 12.00 >= 8 floor, under-served
// W-quadrant rotation per CITY-PLAN Amendment 1). TRUE decoded envelope
// 6.98 x 7.02 x 6.98, slab plan 6.98 ORIGIN-CENTERED (struct136-decode-boy
// ALL PASS 30/30) => entity POS seats form-CENTER on the axis point:
// PX = AX. 9pt = center + 4 corners + 4 edge mids of the true envelope,
// in WORLD coords (align-1 transform). PY = lowest sample (base on grade).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const YAW = Math.PI;
const az = 270 * Math.PI / 180, R = 100;
const AX = R * Math.sin(az), AZ = -R * Math.cos(az);
const CX = 0, CZ = 0; // origin-centered (decode-derived)
const cy = Math.cos(YAW), sy = Math.sin(YAW);
const PX = AX - (CX * cy + CZ * sy);
const PZ = AZ - (-CX * sy + CZ * cy);
console.log(`axis point (${AX.toFixed(6)}, ${AZ.toFixed(6)}) -> entity POS (${PX.toFixed(6)}, PY, ${PZ.toFixed(6)}) yaw ${YAW}`);
const E = 3.49; // envelope half-extent x/z (decode-derived, 6.98/2)
const local: [string, number, number][] = [
    ["center", 0, 0],
    ["corner++", E, E], ["corner+-", E, -E],
    ["corner-+", -E, E], ["corner--", -E, -E],
    ["mid-e", E, 0], ["mid-w", -E, 0],
    ["mid-n", 0, -E], ["mid-s", 0, E],
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
