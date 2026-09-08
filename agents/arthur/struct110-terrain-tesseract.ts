// struct110-terrain-tesseract.ts — read-only terrain preflight for the
// R10-11 tesseract seat az184 r130 (-9.07, 129.68). Square footprint
// 9.12 x 9.12: 9pt = center + 4 corners + 4 edge midpoints.
// PY = lowest sample + 0.18 (sill base on grade; sill is the only ground
// contact — LIFT-SILL = -0.18 below local y=0).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const CX = -9.07, CZ = 129.68, H = 4.56;
const pts: [string, number, number][] = [
  ["center", CX, CZ],
  ["c-sw", CX - H, CZ - H], ["c-se", CX + H, CZ - H], ["c-nw", CX - H, CZ + H], ["c-ne", CX + H, CZ + H],
  ["m-w", CX - H, CZ], ["m-e", CX + H, CZ], ["m-n", CX, CZ + H], ["m-s", CX, CZ - H],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct110-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  const hs: number[] = [];
  for (const [name, x, z] of pts) { const h = agent.heightAt(x, z); hs.push(h); console.log(JSON.stringify({ name, x: +x.toFixed(2), z: +z.toFixed(2), heightAt: h })); }
  const spread = Math.max(...hs) - Math.min(...hs);
  console.log(JSON.stringify({ spread, lowest: Math.min(...hs), PY: Math.min(...hs) + 0.18 }));
} finally { agent.close(); }
