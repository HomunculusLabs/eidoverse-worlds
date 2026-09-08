// struct112-terrain-chladni.ts — read-only terrain preflight for the
// R10-13 Chladni seat az184 r150 (-10.46, 149.63). Plinth footprint
// 3.7 x 1.0: 9pt = center + 4 corners (±1.7, ±0.4) + 4 edge mids.
// PY = lowest sample (plinth base at local y=0 sits on grade).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const CX = -10.46, CZ = 149.63;
const pts: [string, number, number][] = [
    ["center", CX, CZ],
    ["corner-nw", CX - 1.7, CZ - 0.4], ["corner-ne", CX + 1.7, CZ - 0.4],
    ["corner-sw", CX - 1.7, CZ + 0.4], ["corner-se", CX + 1.7, CZ + 0.4],
    ["mid-w", CX - 1.7, CZ], ["mid-e", CX + 1.7, CZ],
    ["mid-n", CX, CZ - 0.4], ["mid-s", CX, CZ + 0.4],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct112-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
    await agent.connect(); await Bun.sleep(2500);
    const hs: number[] = [];
    for (const [name, x, z] of pts) { const h = agent.heightAt(x, z); hs.push(h); console.log(JSON.stringify({ name, x: +x.toFixed(2), z: +z.toFixed(2), heightAt: h })); }
    const spread = Math.max(...hs) - Math.min(...hs);
    console.log(JSON.stringify({ spread, lowest: Math.min(...hs), PY: Math.min(...hs) }));
} finally { agent.close(); }
