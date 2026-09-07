// next-terrain-struct85.ts — struct-85: terrain preflight for the CHAIN VAULT
// seat (62.6, -13.3) yaw -1.3614 (mouth facing plaza, ESE threshold band).
// TRUE decoded envelope local x ±3.80, z ±3.62 (corners rotated by yaw).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const CX = 52.6, CZ = -19.2, YAW = -1.2217, HX = 3.80, HZ = 3.62;
const cs = Math.cos(YAW), sn = Math.sin(YAW);
// village transform: wx = px + lx*cos + lz*sin ; wz = pz - lx*sin + lz*cos
const pts: [string, number, number][] = [
    ["center", CX, CZ],
    ["n", CX - HX * sn, CZ - HX * cs], ["s", CX + HX * sn, CZ + HX * cs],
    ["e", CX + HZ * cs, CZ - HZ * sn], ["w", CX - HZ * cs, CZ + HZ * sn],
];
for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]] as const)
    pts.push([`c${sx}${sz}`, CX + sx * HX * cs + sz * HZ * sn, CZ - sx * HX * sn + sz * HZ * cs]);
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct85-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
    await agent.connect(); await Bun.sleep(2500);
    for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x: +x.toFixed(3), z: +z.toFixed(3), heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
