// city110-terrain-lemniscate.ts — read-only terrain preflight for city-110
// lemniscateseat relocate. FINAL seat (1.50, 107.75) yaw pi (scanner pick
// with SAT-margin preference, city110-scan.py + city110-verify-seat.py).
// TRUE footprint 8.328 x 3.299 c(0,0) at yaw pi -> world AABB
// x -2.664..5.664, z 106.100..109.400. 9 points: center, 4 corners,
// 4 edge midpoints (struct-103/109 chassis, WorldAgent object form).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = 1.5, PZ = 107.75, HX = 4.164, HZ = 1.6495;
const pts: [string, number, number][] = [
  ["center", PX, PZ],
  ["corner-sw", PX - HX, PZ - HZ],
  ["corner-se", PX + HX, PZ - HZ],
  ["corner-nw", PX - HX, PZ + HZ],
  ["corner-ne", PX + HX, PZ + HZ],
  ["mid-w", PX - HX, PZ],
  ["mid-e", PX + HX, PZ],
  ["mid-s", PX, PZ - HZ],
  ["mid-n", PX, PZ + HZ],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-city110-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(1500);
  const hs: Array<[string, number]> = [];
  for (const [n, x, z] of pts) hs.push([n, +(await agent.heightAt(x, z)).toFixed(6)]);
  const vals = hs.map(([, h]) => h);
  const spread = Math.max(...vals) - Math.min(...vals);
  for (const [n, h] of hs) console.log(n, h);
  const corners = hs.filter(([n]) => n.startsWith("corner")).map(([, h]) => h);
  console.log(`SPREAD ${(spread * 1000).toFixed(1)}mm  MIN ${Math.min(...vals)}  CORNER-MIN ${Math.min(...corners)} (PY = lowest corner per city-104..109 law)`);
} finally { agent.close(); }
