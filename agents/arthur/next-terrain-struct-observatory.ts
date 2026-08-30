// next-terrain-struct-observatory.ts — read-only heightAt preflight for the
// S-1 Observatory site (292deg/r44). Object-form WorldAgent per chassis law.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const pts: [string, number, number][] = [["sk-center", -23.32, 48.05], ["sk-n", -23.3, 47.0], ["sk-s", -23.4, 49.1]];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
    await agent.connect(); await Bun.sleep(2500);
    for (const [n, x, z] of pts) console.log(JSON.stringify({ name: n, x, z, heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
