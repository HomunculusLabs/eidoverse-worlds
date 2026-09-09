// struct115-terrain-zeno.ts — read-only terrain preflight for the R10-15
// Zeno Gates seat az184 r170. Run footprint 3.20 x 8.47 (local x ±1.60,
// z -0.19..8.28): 9pt = stele + 4 corners + 4 edge mids of the true decoded
// envelope, in WORLD coords at yaw pi (local x -> world x, local z -> world
// -z... via the align-1 transform: wx = PX + lx*cos+lz*sin, wz = PZ - lx*sin + lz*cos).
// PY = lowest sample (base course on grade).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const YAW = Math.PI;
const az = 184 * Math.PI / 180, R = 180;
const PX = R * Math.sin(az), PZ = -R * Math.cos(az) - 0.10;
const cy = Math.cos(YAW), sy = Math.sin(YAW);
const local: [string, number, number][] = [
    ["stele", 0, -0.10],
    ["corner-maxx-minz", 1.60, -0.19], ["corner--maxx-maxz", 1.60, 8.28],
    ["corner-minx-minz", -1.60, -0.19], ["corner-minx-maxz", -1.60, 8.28],
    ["mid-e", 1.60, 4.045], ["mid-w", -1.60, 4.045],
    ["mid-n", 0, -0.19], ["mid-s", 0, 8.28],
];
const pts = local.map(([n, lx, lz]) => {
    const wx = PX + lx * cy + lz * sy, wz = PZ - lx * sy + lz * cy;
    return [n, wx, wz] as [string, number, number];
});
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct115-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
    await agent.connect(); await Bun.sleep(2500);
    const hs: number[] = [];
    for (const [name, x, z] of pts) { const h = agent.heightAt(x, z); hs.push(h); console.log(JSON.stringify({ name, x: +x.toFixed(2), z: +z.toFixed(2), heightAt: h })); }
    const spread = Math.max(...hs) - Math.min(...hs);
    console.log(JSON.stringify({ spread, lowest: Math.min(...hs), PY: Math.min(...hs) }));
} finally { agent.close(); }
