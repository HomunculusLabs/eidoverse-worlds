// struct108-terrain-sunflowerdial.ts — read-only terrain preflight for the
// R10-9 sunflower dial seat az178 r71 (2.48, 70.96). 9pt over the TRUE
// ground-contact footprint (plinth r 1.42 → H 1.5); PY = lowest rim.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const CX = 2.48, CZ = 70.96, H = 1.5;
const pts: [string, number, number][] = [
  ["center", CX, CZ],
  ["rim-n", CX, CZ - H], ["rim-s", CX, CZ + H], ["rim-e", CX + H, CZ], ["rim-w", CX - H, CZ],
  ["corner-ne", CX + H, CZ - H], ["corner-nw", CX - H, CZ - H], ["corner-se", CX + H, CZ + H], ["corner-sw", CX - H, CZ + H],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct108-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  const hs: number[] = [];
  for (const [name, x, z] of pts) { const h = agent.heightAt(x, z); hs.push(h); console.log(JSON.stringify({ name, x, z, heightAt: h })); }
  const spread = Math.max(...hs) - Math.min(...hs);
  console.log(JSON.stringify({ spread, lowest: Math.min(...hs) }));
} finally { agent.close(); }
