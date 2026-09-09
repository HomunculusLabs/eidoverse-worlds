// struct129-terrain-peaucellier.ts — read-only terrain preflight for the
// FINAL seat selected by struct129-scan-peaucellier.ts: az184 r169 yaw pi
// (lawful seat closest to the contract r170, worst-solid margin 2.07 vs
// zeno). struct-128's r170 sample (-0.0464, spread 16.8mm) was indicative
// only — every rejected candidate invalidates its terrain sample, so this
// run re-samples at the final pose. TRUE decoded envelope local
// x[-2.20..4.80] z[-0.80..0.25] y[0..4.20] (struct128-decode ALL PASS
// 20/20; NOT origin-centered — pitfall-10): CX=1.30, CZ=-0.275.
// Entity POS seats form-CENTER on the axis point (galton/struct-125
// chassis): PX = AX - (CX*cos + CZ*sin), PZ = AZ - (-CX*sin + CZ*cos)
// at yaw pi. 9pt = center + 4 corners + 4 edge mids of the true
// envelope, in WORLD coords (align-1 transform). PY = lowest sample
// (base on grade).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const YAW = Math.PI;
const az = 184 * Math.PI / 180, R = 169;
const AX = R * Math.sin(az), AZ = -R * Math.cos(az);
const CX = 1.30, CZ = -0.275; // local envelope center (decode-derived)
const cy = Math.cos(YAW), sy = Math.sin(YAW);
const PX = AX - (CX * cy + CZ * sy);
const PZ = AZ - (-CX * sy + CZ * cy);
console.log(`axis point (${AX.toFixed(6)}, ${AZ.toFixed(6)}) -> entity POS (${PX.toFixed(6)}, PY, ${PZ.toFixed(6)}) yaw ${YAW}`);
const local: [string, number, number][] = [
    ["center", 1.30, -0.275],
    ["corner-maxx-minz", 4.80, -0.80], ["corner-maxx-maxz", 4.80, 0.25],
    ["corner-minx-minz", -2.20, -0.80], ["corner-minx-maxz", -2.20, 0.25],
    ["mid-e", 4.80, -0.275], ["mid-w", -2.20, -0.275],
    ["mid-n", 1.30, -0.80], ["mid-s", 1.30, 0.25],
];
const pts = local.map(([n, lx, lz]) => {
    const wx = PX + lx * cy + lz * sy, wz = PZ - lx * sy + lz * cy;
    return [n, wx, wz] as [string, number, number];
});
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct129-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
    await agent.connect(); await Bun.sleep(2500);
    const hs: number[] = [];
    for (const [name, x, z] of pts) { const h = agent.heightAt(x, z); hs.push(h); console.log(JSON.stringify({ name, x: +x.toFixed(2), z: +z.toFixed(2), heightAt: h })); }
    const spread = Math.max(...hs) - Math.min(...hs);
    console.log(JSON.stringify({ spread, lowest: Math.min(...hs), PY: Math.min(...hs) }));
} finally { agent.close(); }
