// next-terrain-fauna8-owl-b.ts — read-only terrain preflight for fauna-8
// FINAL seat (48.8, 4.2) — the sky-lane site (backdrop arithmetic: clears
// ruledtower N edge z4.5 from road-end AND 18m road view, below wavepergola
// S edge 6.75, past the stable SE corner for the bench sightline).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const pts: [string, number, number][] = [
  ["owl-site", 48.8, 4.2], ["site-n", 48.8, 5.2], ["site-s", 48.8, 3.2],
  ["site-e", 49.8, 4.2], ["site-w", 47.8, 4.2],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna8-terrain3", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x, z, heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
