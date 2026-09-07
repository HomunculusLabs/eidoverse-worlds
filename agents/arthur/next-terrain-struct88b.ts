// next-terrain-struct88b.ts — focused re-probe at TRUE yaw-corrected corners
// (struct-88 self-catch: struct-87's probe grid assumed yaw +1.0821; corrected
// orientation is -1.0821 radial-outward, which moves the far tip corners to
// (25.39,54.91) and (31.33,51.73) — never probed last tick).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const pts: [string, number, number][] = [
  ["seat-origin", 25.82, 48.56],
  ["tipN-C2", 25.39, 54.91],   // local (5.40, +3.37) at yaw -1.0821
  ["tipS-C4", 31.33, 51.73],   // local (5.40, -3.37)
  ["mastN-C1", 22.45, 49.40],  // local (-0.85, +3.37)
  ["mastS-C3", 28.39, 46.22],  // local (-0.85, -3.37)
  ["tip-mid", 25.61, 53.33],   // local (5.40, 0)
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct88-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x, z, heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
