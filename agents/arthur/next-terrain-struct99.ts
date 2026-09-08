// next-terrain-struct99.ts — read-only terrain preflight for struct-99
// (Koch Snowflake Garden placement). Seat: center (-6.28, 89.78) yaw 0.
// True local bbox x ±2.78, z ±3.12 (centered, cx=cz=0); grown world
// half-extents at yaw 0: HX 2.78, HZ 3.12.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const c: [number, number] = [-6.28, 89.78];
const HX = 2.78, HZ = 3.12;   // grown world-axis half-extents at yaw 0
const pts: [string, number, number][] = [
    ["center", c[0], c[1]],
    ["corner-pp", c[0] + HX, c[1] + HZ],
    ["corner-pm", c[0] + HX, c[1] - HZ],
    ["corner-mp", c[0] - HX, c[1] + HZ],
    ["corner-mm", c[0] - HX, c[1] - HZ],
    ["edge-x+", c[0] + HX, c[1]],
    ["edge-x-", c[0] - HX, c[1]],
    ["edge-z+", c[0], c[1] + HZ],
    ["edge-z-", c[0], c[1] - HZ],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct99-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
    await agent.connect(); await Bun.sleep(2500);
    let lo = Infinity;
    for (const [name, x, z] of pts) {
        const h = agent.heightAt(x, z);
        if (h < lo) lo = h;
        console.log(JSON.stringify({ name, x: +x.toFixed(2), z: +z.toFixed(2), heightAt: h }));
    }
    const hs = pts.map(([, x, z]) => agent.heightAt(x, z));
    console.log(`spread ${(Math.max(...hs) - Math.min(...hs)).toFixed(4)} | lowest ${Math.min(...hs).toFixed(4)} -> PY`);
} finally { agent.close(); }
