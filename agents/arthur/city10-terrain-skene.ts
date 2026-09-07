// city10-terrain-skene.ts — read-only terrain preflight for city-10 skene relocation.
// Seat (8.258, 78.567) yaw 186deg; true local bbox 9.6604 x 1.2761, center offset (0, +0.373).
// 7 points: seat pos + 4 true corners + 2 wall-face midpoints (9.66m span).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = 8.258, PZ = 78.567, YAW = 186 * Math.PI / 180;
const C = Math.cos(YAW), S = Math.sin(YAW);
const w = (lx: number, lz: number): [number, number] => [PX + lx * C + lz * S, PZ - lx * S + lz * C];
const pts: [string, number, number][] = [
    ["seat-pos", PX, PZ],
    ["corner-1", ...w(-4.83, -0.265)],
    ["corner-2", ...w(4.83, -0.252)],
    ["corner-3", ...w(-4.83, 1.011)],
    ["corner-4", ...w(4.83, 1.011)],
    ["face-mid-niche", ...w(0, 1.011)],
    ["face-mid-back", ...w(0, -0.265)],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-city10-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
    await agent.connect(); await Bun.sleep(2500);
    const hs: number[] = [];
    for (const [name, x, z] of pts) { const h = agent.heightAt(x, z); hs.push(h); console.log(JSON.stringify({ name, x: Math.round(x * 1000) / 1000, z: Math.round(z * 1000) / 1000, heightAt: h })); }
    const mn = Math.min(...hs), mx = Math.max(...hs);
    console.log(JSON.stringify({ spread_mm: Math.round((mx - mn) * 10000) / 10, mean: Math.round((hs.reduce((a, b) => a + b, 0) / hs.length) * 10000) / 10000 }));
} finally { agent.close(); }
