// city9-terrain-needlerest.ts — read-only terrain preflight for city-9 needlerest relocation.
// Seat (10.273, 68.737) yaw 171.5deg; true local bbox 4.4 x 2.859, center offset (0, +0.35).
// 5 points: seat pos + 4 true corners.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = 10.273, PZ = 68.737, YAW = 171.5 * Math.PI / 180;
const C = Math.cos(YAW), S = Math.sin(YAW);
const w = (lx: number, lz: number): [number, number] => [PX + lx * C + lz * S, PZ - lx * S + lz * C];
const pts: [string, number, number][] = [
    ["seat-pos", PX, PZ],
    ["corner-1", ...w(-2.2, -1.079)],
    ["corner-2", ...w(2.2, -1.079)],
    ["corner-3", ...w(-2.2, 1.779)],
    ["corner-4", ...w(2.2, 1.779)],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-city9-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
    await agent.connect(); await Bun.sleep(2500);
    const hs: number[] = [];
    for (const [name, x, z] of pts) { const h = agent.heightAt(x, z); hs.push(h); console.log(JSON.stringify({ name, x: Math.round(x * 1000) / 1000, z: Math.round(z * 1000) / 1000, heightAt: h })); }
    const mn = Math.min(...hs), mx = Math.max(...hs);
    console.log(JSON.stringify({ spread_mm: Math.round((mx - mn) * 10000) / 10, mean: Math.round((hs.reduce((a, b) => a + b, 0) / hs.length) * 10000) / 10000 }));
} finally { agent.close(); }
