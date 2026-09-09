// struct125-terrain-clothoid.ts — read-only terrain preflight for the
// R10-19 Clothoid Spiral seat az184 r220 (deferred contract step 2 from
// struct-124; extends the S mathematics axis past galton r210:
// ... zeno r180 -> borromean r190 -> brachistochrone r200 -> galton r210
// -> CLOTHOID r220 — the road that learns to turn, past order-out-of-chaos).
// TRUE decoded envelope local x[-0.35..3.56] z[-0.47..0.25] y[0..4.60]
// (struct-124 decode 13/13; NOT origin-centered — pitfall-10):
// CX=1.605, CZ=-0.11. Yaw pi face-on family law (zeno/borromean/galton
// precedent) — the rise+coil plane spans tangential (E-W), thin z-axis
// radial, coil face toward the village approach.
// Entity POS seats form-CENTER on the axis point (galton chassis):
// PX = AX - (CX*cos + CZ*sin), PZ = AZ - (-CX*sin + CZ*cos) at yaw pi.
// 9pt = center + 4 corners + 4 edge mids of the true envelope, in WORLD
// coords (align-1 transform). PY = lowest sample (base on grade).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const YAW = Math.PI;
const az = 184 * Math.PI / 180, R = 220;
const AX = R * Math.sin(az), AZ = -R * Math.cos(az);
const CX = 1.605, CZ = -0.11; // local envelope center (decode-derived)
const cy = Math.cos(YAW), sy = Math.sin(YAW);
const PX = AX - (CX * cy + CZ * sy);
const PZ = AZ - (-CX * sy + CZ * cy);
console.log(`axis point (${AX.toFixed(6)}, ${AZ.toFixed(6)}) -> entity POS (${PX.toFixed(6)}, PY, ${PZ.toFixed(6)}) yaw ${YAW}`);
const local: [string, number, number][] = [
    ["center", 1.605, -0.11],
    ["corner-maxx-minz", 3.56, -0.47], ["corner-maxx-maxz", 3.56, 0.25],
    ["corner-minx-minz", -0.35, -0.47], ["corner-minx-maxz", -0.35, 0.25],
    ["mid-coil-e", 3.56, -0.11], ["mid-rise-w", -0.35, -0.11],
    ["mid-n", 1.605, -0.47], ["mid-s", 1.605, 0.25],
];
const pts = local.map(([n, lx, lz]) => {
    const wx = PX + lx * cy + lz * sy, wz = PZ - lx * sy + lz * cy;
    return [n, wx, wz] as [string, number, number];
});
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct125-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
    await agent.connect(); await Bun.sleep(2500);
    const hs: number[] = [];
    for (const [name, x, z] of pts) { const h = agent.heightAt(x, z); hs.push(h); console.log(JSON.stringify({ name, x: +x.toFixed(2), z: +z.toFixed(2), heightAt: h })); }
    const spread = Math.max(...hs) - Math.min(...hs);
    console.log(JSON.stringify({ spread, lowest: Math.min(...hs), PY: Math.min(...hs) }));
} finally { agent.close(); }
