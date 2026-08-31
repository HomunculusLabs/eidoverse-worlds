import { readFileSync } from "node:fs";
import { WorldAgent } from "/Users/t3rpz/projects/eidoverse-worlds/mcpl/agent.ts";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const R = 57, TH = 36 * Math.PI / 180;
const x = R * Math.cos(TH), z = R * Math.sin(TH);
const a = new WorldAgent({ url: cfg.url, name: "arthur-struct19b-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
    await a.connect();
    await Bun.sleep(2200);
    a.stop();
    console.log(JSON.stringify({ pose: [x, z], hCenter: a.heightAt(x, z), hN: a.heightAt(x, z - 3), hS: a.heightAt(x, z + 3), hE: a.heightAt(x + 3, z), hW: a.heightAt(x - 3, z) }));
} finally { a.close(); }
