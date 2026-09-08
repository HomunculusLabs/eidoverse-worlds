// struct107-terrain-dodecahedron.ts — read-only terrain preflight for the
// R10-8 dodecahedron seat az184 r110 (-7.67, 109.73). 9pt: center + 4 rim
// (square half 3.15) + 4 corners, spread law, PY = lowest rim.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const CX = -7.67, CZ = 109.73, H = 3.15;
const pts: [string, number, number][] = [
  ["center", CX, CZ],
  ["rim-n", CX, CZ - H], ["rim-s", CX, CZ + H], ["rim-e", CX + H, CZ], ["rim-w", CX - H, CZ],
  ["corner-ne", CX + H, CZ - H], ["corner-nw", CX - H, CZ - H], ["corner-se", CX + H, CZ + H], ["corner-sw", CX - H, CZ + H],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct107-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  const hs: number[] = [];
  for (const [name, x, z] of pts) { const h = agent.heightAt(x, z); hs.push(h); console.log(JSON.stringify({ name, x, z, heightAt: h })); }
  const spread = Math.max(...hs) - Math.min(...hs);
  console.log(JSON.stringify({ spread, lowest: Math.min(...hs) }));
} finally { agent.close(); }
