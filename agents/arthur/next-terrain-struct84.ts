// next-terrain-struct84.ts — struct-84: terrain preflight for the REULEAUX
// ROTOR seat (-12, -64.5) yaw 0. TRUE decoded envelope x/z ±1.75 (plinth
// 3.5x3.5), y 0..3.29. 9-pt envelope: center + 4 edge midpoints + 4 corners.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const CX = -12, CZ = -64.5, E = 1.75;
const pts: [string, number, number][] = [
    ["center", CX, CZ],
    ["n", CX, CZ - E], ["s", CX, CZ + E], ["e", CX + E, CZ], ["w", CX - E, CZ],
    ["ne", CX + E, CZ - E], ["nw", CX - E, CZ - E], ["se", CX + E, CZ + E], ["sw", CX - E, CZ + E],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct84-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
    await agent.connect(); await Bun.sleep(2500);
    for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x, z, heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
