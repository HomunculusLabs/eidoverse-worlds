// struct105-walk-hilbert.ts — MCPL walk gate for the HILBERT LABYRINTH.
// Entity (-6.98, 99.76) yaw π. The FULL Hilbert path: enter the mouth, visit
// all 16 cells in sequence order (consecutive centers 2m apart THROUGH their
// shared door — walker threads every door midpoint), reach the heart, then
// REVERSE the entire path back out (two-way proof). Local→world (yaw π):
// wx = -6.98 - lx, wz = 99.76 - lz.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -6.98, PZ = 99.76;
const pt = (lx: number, lz: number): [number, number] => [PX - lx, PZ - lz];
const seq: Array<[number, number]> = [
    [0, 0], [0, 1], [1, 1], [1, 0], [2, 0], [3, 0], [3, 1], [2, 1],
    [2, 2], [3, 2], [3, 3], [2, 3], [1, 3], [1, 2], [0, 2], [0, 3],
];
const cx = (i: number) => (i - 1.5) * 2.0;
const cz = (i: number) => (1.5 - i) * 2.0;
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct105-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
    const start = pt(-3, 6.5);   // outside the mouth, north side
    agent.pos.x = start[0]; agent.pos.z = start[1]; agent.pos.y = agent.heightAt(...start); await Bun.sleep(250);
    await leg("entry", pt(-3, 3));                     // through the mouth into start cell
    for (let k = 0; k < seq.length; k++) await leg(`cell${k + 1}`, pt(cx(seq[k][0]), cz(seq[k][1])));
    // heart is cell16 — pin at its edge
    await leg("heart", pt(-3 + 0.5, -3));               // stand beside the pin
    for (let k = seq.length - 1; k >= 0; k--) await leg(`rev${k + 1}`, pt(cx(seq[k][0]), cz(seq[k][1])));
    await leg("exit", pt(-3, 6.5));                     // back out the mouth
    const worst = Math.max(...results.map(r => r.dist));
    console.log(JSON.stringify({ status: "ALL_PASS", legs: results.length, maxArrival: worst }, null, 2));
} finally { agent.close(); }
