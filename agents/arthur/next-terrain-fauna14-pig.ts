// next-terrain-fauna14-pig.ts — read-only terrain preflight for fauna-14.
// Pig-sty siting: meadow S of the kiln yard, E of the SE lane's mosaic 0048
// edge. Seat law: pigs root BESIDE art, never on it (sheep law) — the
// candidate seat (15.0, 40.2) keeps the film's NE edge 3.49m off along its
// normal. 9-pt spread across the seat + surround cardinals.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const pts: [string, number, number][] = [
  ["sty-seat", 15.0, 40.2],
  ["seat-n", 15.0, 38.8],
  ["seat-s", 15.0, 41.6],
  ["seat-e", 16.4, 40.2],
  ["seat-w", 13.6, 40.2],
  ["seat-ne", 16.4, 38.8],
  ["seat-sw", 13.6, 41.6],
  ["walk-stop", 16.3, 39.0],
  ["lane-closest", 12.9, 43.2],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna14-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x, z, heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
