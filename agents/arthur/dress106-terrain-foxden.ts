// dress106-terrain-foxden.ts — read-only terrain preflight for dress-107
// (nx-dress-se-foxden-001, v17 sha 856deec5…). Seat: (65.0, PY, -34.5)
// yaw 285° (4.9742 rad). TRUE v17 local envelope: HALF {x 2.379, z 2.559},
// CLOCAL {x 0.675, z 0.148} — sample center + 8 footprint corners
// (corner set rotated by yaw into world).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = 73.0, PZ = -10.5, YAW = 270 * Math.PI / 180;
const HX = 2.379, HZ = 2.559, CX = 0.675, CZ = 0.148;
const cos = Math.cos(YAW), sin = Math.sin(YAW);
const pts: [string, number, number][] = [["center", PX + CX * cos + CZ * sin, PZ - CX * sin + CZ * cos]];
for (const [su, sv] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    const lx = CX + su * HX, lz = CZ + sv * HZ;
    pts.push([`corner${su}${sv}`, PX + lx * cos + lz * sin, PZ - lx * sin + lz * cos]);
}
// also sample the mouth point (local origin → world) for reference
pts.push(["mouth", PX, PZ]);
const agent = new WorldAgent({ url: cfg.url, name: "arthur-dress107-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
    await agent.connect(); await Bun.sleep(2500);
    for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x: +x.toFixed(2), z: +z.toFixed(2), heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
