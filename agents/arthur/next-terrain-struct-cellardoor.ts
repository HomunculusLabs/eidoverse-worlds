import { readFileSync } from "node:fs";
import { WorldAgent } from "/Users/t3rpz/projects/eidoverse-worlds/mcpl/agent.ts";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const a = new WorldAgent({ url: cfg.url, name: "arthur-struct23-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
    await a.connect();
    await Bun.sleep(2200);
    a.stop();
    console.log(JSON.stringify({ hCenter: a.heightAt(36, 6.02), hFront: a.heightAt(36, 6.9), hE: a.heightAt(37.4, 6.02), hW: a.heightAt(34.6, 6.02) }));
} finally { a.close(); }
