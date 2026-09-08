// next-terrain-struct96.ts — read-only terrain preflight for struct-96
// (Sliding Ladder placement). Candidate seat: center (3.5, 58.0) yaw 0 —
// TRUE local bbox x −0.22..4.18 (center offset cx 1.98), z ±0.79 (cz 0),
// so corner envelope at yaw 0 = center ± (2.20, 0.79).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const c: [number, number] = [3.5, 58.0];
const HX = 2.20, HZ = 0.79;   // true local half-extents from decoded bbox
const pts: [string, number, number][] = [
    ["center", c[0], c[1]],
    ["corner-pp", c[0] + HX, c[1] + HZ],
    ["corner-pm", c[0] + HX, c[1] - HZ],
    ["corner-mp", c[0] - HX, c[1] + HZ],
    ["corner-mm", c[0] - HX, c[1] - HZ],
    ["edge-x+", c[0] + HX, c[1]],
    ["edge-x-", c[0] - HX, c[1]],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct96-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
    await agent.connect(); await Bun.sleep(2500);
    for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x: +x.toFixed(2), z: +z.toFixed(2), heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
