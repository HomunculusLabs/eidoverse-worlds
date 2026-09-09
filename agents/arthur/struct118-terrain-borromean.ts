// struct118-terrain-borromean.ts — read-only terrain preflight for the
// R10-16 Borromean Rings seat az184 r190. Dais footprint 4.22 x 4.60
// (local x ±2.11, z ±2.30): 9pt = center + 4 corners + 4 edge mids of the
// true decoded envelope, in WORLD coords at yaw pi (align-1 transform:
// wx = PX + lx*cos+lz*sin, wz = PZ - lx*sin + lz*cos). PY = lowest sample
// (base course on grade).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const YAW = Math.PI;
const az = 184 * Math.PI / 180, R = 190;
const PX = R * Math.sin(az), PZ = -R * Math.cos(az);
const cy = Math.cos(YAW), sy = Math.sin(YAW);
const local: [string, number, number][] = [
    ["center", 0, 0],
    ["corner-maxx-minz", 2.11, -2.30], ["corner-maxx-maxz", 2.11, 2.30],
    ["corner-minx-minz", -2.11, -2.30], ["corner-minx-maxz", -2.11, 2.30],
    ["mid-e", 2.11, 0], ["mid-w", -2.11, 0],
    ["mid-n", 0, -2.30], ["mid-s", 0, 2.30],
];
const pts = local.map(([n, lx, lz]) => {
    const wx = PX + lx * cy + lz * sy, wz = PZ - lx * sy + lz * cy;
    return [n, wx, wz] as [string, number, number];
});
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct118-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
    await agent.connect(); await Bun.sleep(2500);
    const hs: number[] = [];
    for (const [name, x, z] of pts) { const h = agent.heightAt(x, z); hs.push(h); console.log(JSON.stringify({ name, x: +x.toFixed(2), z: +z.toFixed(2), heightAt: h })); }
    const spread = Math.max(...hs) - Math.min(...hs);
    console.log(JSON.stringify({ spread, lowest: Math.min(...hs), PY: Math.min(...hs) }));
} finally { agent.close(); }
