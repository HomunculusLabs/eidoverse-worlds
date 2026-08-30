// next-terrain-struct-observatory.ts — read-only heightAt preflight for the
// S-1 Observatory site (292deg/r44). Object-form WorldAgent per chassis law.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const pts: [string, number, number][] = [["an-center", -23.6, -38.37], ["an-bank", -25.5, -38.4], ["an-water", -21.5, -38.35]];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
    await agent.connect(); await Bun.sleep(2500);
    for (const [n, x, z] of pts) console.log(JSON.stringify({ name: n, x, z, heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
