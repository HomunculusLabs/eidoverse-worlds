// struct120-terrain-brachistochrone.ts — read-only terrain preflight for
// the R10-17 Brachistochrone seat az184 r200, CAND_A (yaw -pi/2, crest
// village-side). TRUE decoded envelope local x[-0.67..8.07] z[-1.07..1.07]
// (NOT origin-centered; center +3.70x): 9pt = center + 4 corners + 4 edge
// mids of the true envelope, in WORLD coords at yaw -pi/2 (align-1
// transform: wx = PX + lx*cos+lz*sin, wz = PZ - lx*sin + lz*cos).
// Entity POS (-13.9513, PY, 195.8128) seats form-center on the axis point
// (-13.9513, 199.5128). PY = lowest sample (base course on grade).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const YAW = -Math.PI / 2;
const az = 184 * Math.PI / 180, R = 200;
const AX = R * Math.sin(az), AZ = -R * Math.cos(az);
const CX = 3.70, CZ = 0; // local envelope center
const cy = Math.cos(YAW), sy = Math.sin(YAW);
const PX = AX - (CX * cy + CZ * sy);
const PZ = AZ - (-CX * sy + CZ * cy);
console.log(`entity POS (${PX.toFixed(6)}, PY, ${PZ.toFixed(6)}) yaw ${YAW}`);
const local: [string, number, number][] = [
    ["center", 3.70, 0],
    ["corner-maxx-minz", 8.07, -1.07], ["corner-maxx-maxz", 8.07, 1.07],
    ["corner-minx-minz", -0.67, -1.07], ["corner-minx-maxz", -0.67, 1.07],
    ["mid-e", 8.07, 0], ["mid-w", -0.67, 0],
    ["mid-n", 3.70, -1.07], ["mid-s", 3.70, 1.07],
];
const pts = local.map(([n, lx, lz]) => {
    const wx = PX + lx * cy + lz * sy, wz = PZ - lx * sy + lz * cy;
    return [n, wx, wz] as [string, number, number];
});
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct120-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
    await agent.connect(); await Bun.sleep(2500);
    const hs: number[] = [];
    for (const [name, x, z] of pts) { const h = agent.heightAt(x, z); hs.push(h); console.log(JSON.stringify({ name, x: +x.toFixed(2), z: +z.toFixed(2), heightAt: h })); }
    const spread = Math.max(...hs) - Math.min(...hs);
    console.log(JSON.stringify({ spread, lowest: Math.min(...hs), PY: Math.min(...hs) }));
} finally { agent.close(); }
