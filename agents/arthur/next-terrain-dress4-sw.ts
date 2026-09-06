// next-terrain-dress4-sw.ts — read-only terrain preflight for dress-4 (SW gravel path).
// Path continues the SW approach leg (az 217.25, r24->71) outward into the
// temple grounds: center pol(74.7,217.25), span r71.2..78.2, yaw 127.25deg
// (local +x = outward walking direction). pol: x=r*sin(az), z=r*cos(az).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const d2r = (d: number) => (d * Math.PI) / 180;
const pol = (r: number, az: number): [number, number] => [r * Math.sin(d2r(az)), r * Math.cos(d2r(az))];
const pts: Array<[string, number, number]> = [
    ["path-near-end", ...pol(71.4, 217.25)],
    ["path-center", ...pol(74.7, 217.25)],
    ["path-far-end", ...pol(78.0, 217.25)],
    ["walk-start", ...pol(66, 217.25)],
    ["walk-end", ...pol(78, 217.25)],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-dress4-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
    await agent.connect(); await Bun.sleep(2500);
    for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x: +x.toFixed(2), z: +z.toFixed(2), heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
