// next-terrain-struct82-whisperhorn.ts — read-only terrain preflight for struct-82.
// Seat: entity pos (-64.02, PY, -61.82), yaw 0 (azimuthally symmetric — no
// read dependence). TRUE local envelope is a DISC r 2.05 (base slab) so the
// 9 samples cover center + 8 rim points at r 2.05.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -64.02, PZ = -61.82, R = 2.05;
const pts: [string, number, number][] = [["center", PX, PZ]];
for (let k = 0; k < 8; k++) {
    const a = (k / 8) * 2 * Math.PI;
    pts.push([`rim-${k}`, PX + R * Math.cos(a), PZ + R * Math.sin(a)]);
}
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct82-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
    await agent.connect(); await Bun.sleep(2500);
    for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x: +x.toFixed(2), z: +z.toFixed(2), heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
