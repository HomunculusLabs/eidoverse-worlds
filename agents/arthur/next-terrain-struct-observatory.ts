// next-terrain-struct-observatory.ts — read-only heightAt preflight for the
// S-1 Observatory site (292deg/r44). Object-form WorldAgent per chassis law.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const pts: [string, number, number][] = [["rp-center", -17.08, -38.37], ["rp-n", -17.0, -33.0], ["rp-s", -17.1, -43.7], ["rp-e", -12.0, -38.3], ["rp-w", -22.2, -38.4]];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
    await agent.connect(); await Bun.sleep(2500);
    for (const [n, x, z] of pts) console.log(JSON.stringify({ name: n, x, z, heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
