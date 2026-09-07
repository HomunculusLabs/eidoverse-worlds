// next-terrain-struct77-ogeegate.ts — read-only terrain preflight for struct-77.
// Seat: center (22.71, 65.75), yaw -32.7deg (opening axis on the lane tangent
// t=(-0.5399,0.8417)); TRUE envelope half-x 2.93 (tangential), half-z 0.82.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const t = [-0.5399, 0.8417];           // lane tangent (unit)
const p = [-t[1], t[0]];               // perpendicular (tangential axis)
const c: [number, number] = [22.71, 65.75];
const HX = 2.93, HZ = 0.82;
const pts: [string, number, number][] = [
    ["center", c[0], c[1]],
    ["corner-pp", c[0] + HX * p[0] + HZ * t[0], c[1] + HX * p[1] + HZ * t[1]],
    ["corner-pm", c[0] + HX * p[0] - HZ * t[0], c[1] + HX * p[1] - HZ * t[1]],
    ["corner-mp", c[0] - HX * p[0] + HZ * t[0], c[1] - HX * p[1] + HZ * t[1]],
    ["corner-mm", c[0] - HX * p[0] - HZ * t[0], c[1] - HX * p[1] - HZ * t[1]],
    ["edge-x+", c[0] + HX * p[0], c[1] + HX * p[1]],
    ["edge-x-", c[0] - HX * p[0], c[1] - HX * p[1]],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct77-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
    await agent.connect(); await Bun.sleep(2500);
    for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x: +x.toFixed(2), z: +z.toFixed(2), heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
