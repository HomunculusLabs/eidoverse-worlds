// struct156-terrain-villarceau.ts — read-only terrain preflight at the FINAL
// seat selected by struct156-scan-villarceau.ts: az45 R=64 yaw 0, LAWFUL
// (worst-solid 2.00 law 1.4, NN northneedle 13.51 law 8.0; under-served E
// district per CITY-PLAN Amendment 1 — outer-ring E 1/6 vs W 6/6-at-cap /
// N 12/6 / S 24/6, re-derived fresh this scan; az90 R82 deliberately NOT
// taken: reserved by tensegrity v6's banked authored contract, struct-145).
// TRUE decoded envelope 3.48 x 3.47 x 2.20, x/z ORIGIN-CENTERED
// (struct155-decode-villarceau ALL PASS 18/18) => entity POS seats
// form-CENTER on the axis point: PX = AX. Ring plane vertical facing ±z at
// yaw 0; plaza approach along the az45 diagonal reads the face at 45 deg
// oblique (struct-104 planar-figure law). 9pt = center + 4 corners +
// 4 edge mids of the true envelope, in WORLD coords (align-1 transform).
// PY = lowest sample (base on grade).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const YAW = 0;
const az = 45 * Math.PI / 180, R = 64;
const AX = R * Math.sin(az), AZ = -R * Math.cos(az);
const CX = 0, CZ = 0; // origin-centered (decode-derived)
const cy = Math.cos(YAW), sy = Math.sin(YAW);
const PX = AX - (CX * cy + CZ * sy);
const PZ = AZ - (-CX * sy + CZ * cy);
console.log(`axis point (${AX.toFixed(6)}, ${AZ.toFixed(6)}) -> entity POS (${PX.toFixed(6)}, PY, ${PZ.toFixed(6)}) yaw ${YAW}`);
const HX = 1.74, HZ = 1.10; // envelope half-extents x/z (decode-derived)
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
