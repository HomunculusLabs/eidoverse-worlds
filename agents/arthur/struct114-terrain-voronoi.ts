// struct114-terrain-voronoi.ts — read-only terrain preflight for the R10-14
// Shattered Monolith (voronoi family) seat az184 r160 (-11.16, 159.61).
// Monolith footprint ~5.36 x 3.82: 9pt = center + 4 corners (±2.6, ±1.8)
// + 4 edge mids. PY = lowest sample (base course on grade, local y0 = 0 is
// the design base; envelope minY -0.09 is bead drift tolerance, decode
// base-on-grade check passed at 0.0000 for the stone buckets).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const CX = -11.16, CZ = 159.61;
const pts: [string, number, number][] = [
    ["center", CX, CZ],
    ["corner-nw", CX - 2.6, CZ - 1.8], ["corner-ne", CX + 2.6, CZ - 1.8],
    ["corner-sw", CX - 2.6, CZ + 1.8], ["corner-se", CX + 2.6, CZ + 1.8],
    ["mid-w", CX - 2.6, CZ], ["mid-e", CX + 2.6, CZ],
    ["mid-n", CX, CZ - 1.8], ["mid-s", CX, CZ + 1.8],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct114-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
    await agent.connect(); await Bun.sleep(2500);
    const hs: number[] = [];
    for (const [name, x, z] of pts) { const h = agent.heightAt(x, z); hs.push(h); console.log(JSON.stringify({ name, x: +x.toFixed(2), z: +z.toFixed(2), heightAt: h })); }
    const spread = Math.max(...hs) - Math.min(...hs);
    console.log(JSON.stringify({ spread, lowest: Math.min(...hs), PY: Math.min(...hs) }));
} finally { agent.close(); }
