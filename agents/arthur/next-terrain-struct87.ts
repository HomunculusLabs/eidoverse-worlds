// next-terrain-struct87.ts — read-only terrain preflight for struct-87 seat.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const pts: [string, number, number][] = [
  ["fan-center", 25.82, 48.56],
  ["fan-mast", 24.95, 49.05],      // mast at local (0,0,0) -> world seat center
  ["fan-tip-n", 27.88, 51.28],     // local z +3.2 tip -> world
  ["fan-tip-s", 22.90, 46.60],     // local z -3.2 tip
  ["fan-edge-mid", 27.4, 49.9],    // local z +1.6 post
  ["fan-edge-mid2", 24.3, 47.2],   // local z -1.6 post
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct87-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x, z, heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
