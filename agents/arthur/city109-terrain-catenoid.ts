// city109-terrain-catenoid.ts — read-only terrain preflight for city-109
// catenoid relocate. FINAL seat (-14.25, 91.25) yaw 0 (scanner rank pick,
// city109-scan.py). TRUE round base r 2.46 — 9 points: center, 4 rim,
// 4 intercardinal (struct-103 preflight chassis, WorldAgent object form).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -14.25, PZ = 91.25, RR = 2.46;
const pts: [string, number, number][] = [
  ["center", PX, PZ],
  ["rim-n", PX, PZ - RR],
  ["rim-s", PX, PZ + RR],
  ["rim-e", PX + RR, PZ],
  ["rim-w", PX - RR, PZ],
  ["rim-ne", PX + 1.74, PZ - 1.74],
  ["rim-nw", PX - 1.74, PZ - 1.74],
  ["rim-se", PX + 1.74, PZ + 1.74],
  ["rim-sw", PX - 1.74, PZ + 1.74],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-city109-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(1500);
  const hs: Array<[string, number]> = [];
  for (const [n, x, z] of pts) hs.push([n, +(await agent.heightAt(x, z)).toFixed(6)]);
  const vals = hs.map(([, h]) => h);
  const spread = Math.max(...vals) - Math.min(...vals);
  for (const [n, h] of hs) console.log(n, h);
  console.log(`SPREAD ${(spread * 1000).toFixed(1)}mm  MIN ${Math.min(...vals)}  (PY = lowest corner per city-104..108 law)`);
} finally { agent.close(); }
