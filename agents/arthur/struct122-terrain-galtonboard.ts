// struct122-terrain-galtonboard.ts — read-only terrain preflight for the
// R10-18 Galton Board seat az184 r210, CAND_A (yaw pi, board face toward the
// village). TRUE decoded envelope local x[-2.35..2.35] z[-0.10..0.87]
// (NOT origin-centered on z; center +0.385z): 9pt = center + 4 corners +
// 4 edge mids of the true envelope, in WORLD coords at yaw pi (align-1
// transform: wx = PX + lx*cos+lz*sin, wz = PZ - lx*sin + lz*cos).
// Entity POS seats form-center on the axis point. PY = lowest sample
// (base course on grade).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const YAW = Math.PI;
const az = 184 * Math.PI / 180, R = 210;
const AX = R * Math.sin(az), AZ = -R * Math.cos(az);
const CX = 0, CZ = 0.385; // local envelope center (decode-derived)
const cy = Math.cos(YAW), sy = Math.sin(YAW);
const PX = AX - (CX * cy + CZ * sy);
const PZ = AZ - (-CX * sy + CZ * cy);
console.log(`entity POS (${PX.toFixed(6)}, PY, ${PZ.toFixed(6)}) yaw ${YAW}`);
const local: [string, number, number][] = [
    ["center", 0, 0.385],
    ["corner-maxx-minz", 2.35, -0.10], ["corner-maxx-maxz", 2.35, 0.87],
    ["corner-minx-minz", -2.35, -0.10], ["corner-minx-maxz", -2.35, 0.87],
    ["mid-e", 2.35, 0.385], ["mid-w", -2.35, 0.385],
    ["mid-n", 0, -0.10], ["mid-s", 0, 0.87],
];
const pts = local.map(([n, lx, lz]) => {
    const wx = PX + lx * cy + lz * sy, wz = PZ - lx * sy + lz * cy;
    return [n, wx, wz] as [string, number, number];
});
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct122-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
    await agent.connect(); await Bun.sleep(2500);
    const hs: number[] = [];
    for (const [name, x, z] of pts) { const h = agent.heightAt(x, z); hs.push(h); console.log(JSON.stringify({ name, x: +x.toFixed(2), z: +z.toFixed(2), heightAt: h })); }
    const spread = Math.max(...hs) - Math.min(...hs);
    console.log(JSON.stringify({ spread, lowest: Math.min(...hs), PY: Math.min(...hs) }));
} finally { agent.close(); }
