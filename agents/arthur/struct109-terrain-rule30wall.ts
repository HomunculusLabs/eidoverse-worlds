// struct109-terrain-rule30wall.ts — read-only terrain preflight for the
// R10-10 rule 30 wall seat az184 r120 (-8.37, 119.71), yaw 0 (wall runs E-W).
// Strip footprint 23.87 x 1.16: 9pt = center + ends + quarters + z-offsets.
// PY = lowest sample + 0.42 (s2 plinth base on grade; courses visible).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const CX = -8.37, CZ = 119.71, HX = 11.94, HZ = 0.66;
const pts: [string, number, number][] = [
  ["center", CX, CZ],
  ["end-w", CX - HX, CZ], ["end-e", CX + HX, CZ],
  ["q-w", CX - 6, CZ], ["q-e", CX + 6, CZ],
  ["front-c", CX, CZ + HZ], ["back-c", CX, CZ - HZ],
  ["corner-we", CX - HX, CZ + HZ], ["corner-ee", CX + HX, CZ + HZ],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct109-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  const hs: number[] = [];
  for (const [name, x, z] of pts) { const h = agent.heightAt(x, z); hs.push(h); console.log(JSON.stringify({ name, x: +x.toFixed(2), z: +z.toFixed(2), heightAt: h })); }
  const spread = Math.max(...hs) - Math.min(...hs);
  console.log(JSON.stringify({ spread, lowest: Math.min(...hs), PY: Math.min(...hs) + 0.42 }));
} finally { agent.close(); }
