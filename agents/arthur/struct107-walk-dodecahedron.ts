// struct107-walk-dodecahedron.ts — MCPL walk gate for the DODECAHEDRON.
// Entity (-7.67, 109.73) yaw π, door local +z (world: wx = -7.67 - lx,
// wz = 109.73 - lz → door lane at x -7.67, z ≈ 107.9). Two-way proof:
// approach from the village side (smaller z), thread the door aperture,
// reach the interior center where the facets converge overhead, reverse
// back out through the same aperture.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -7.67, PZ = 109.73;
const pt = (lx: number, lz: number): [number, number] => [PX - lx, PZ - lz];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct107-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
async function leg(name: string, end: [number, number]) {
    const ok = await agent.walkTo(end[0], end[1], false, 20_000);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    const pass = ok && dist <= 0.6;
    results.push({ name, ok, dist: +dist.toFixed(3), pass });
    if (!pass) throw Error(`${name} failed ok=${ok} dist=${dist}`);
}
try {
    await agent.connect(); await Bun.sleep(1700); agent.stop();
    const start = pt(0, -6.5);   // village side, ~4m out from the door face
    agent.pos.x = start[0]; agent.pos.z = start[1]; agent.pos.y = agent.heightAt(...start); await Bun.sleep(250);
    await leg("approach", pt(0, -4.5));      // on the door axis, just outside the face
    await leg("threshold", pt(0, -2.6));     // through the notch aperture
    await leg("interior", pt(0, -0.8));      // inside the shell
    await leg("center", pt(0, 0));           // interior center, facets converge overhead
    await leg("rev-interior", pt(0, -2.6));  // reverse back to the threshold
    await leg("exit", pt(0, -6.5));          // back out the door to the start
    const worst = Math.max(...results.map(r => r.dist));
    console.log(JSON.stringify({ status: "ALL_PASS", legs: results.length, maxArrival: worst }, null, 2));
} finally { agent.close(); }
