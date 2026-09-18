// struct226-walk-steinmetz.ts — struct-226: MCPL ground circuit walk owed by
// the carry contract ("circuit walk at placement if seated walkable"). Real
// trimesh: footprint 33.6m² >= 16 AND 4.578 >= 2.2. The solid itself is the
// sculpture (folly by presentation) — the walk proves the approach + full
// ground circuit + no phantom collider.
// Entity nx-struct-steinmetz pos (-32.087978, -0.032464, 458.879463) yaw
// 2.548181 (146 deg). Envelope 5.8 x 4.578 x 5.8 (decode D7): ground circuit
// at 6m standoff clears the true rotated square by ~1.9m min (half-diagonal
// 4.10m).
// Legs: two-way procession approach (anti-travel az274 side, the construction
// face reading vantage) -> 4-leg ground circuit CW.
// Chassis: struct224-walk-rupertfork.ts (proven).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const EX = -32.087978, EZ = 458.879463, ST = 6;
const results: any[] = [];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct226-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
async function leg(name: string, end: [number, number]) {
    const ok = await agent.walkTo(end[0], end[1], false, 20_000);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    const pass = ok && dist <= .6;
    results.push({ name, ok, dist: +dist.toFixed(3), pass });
    console.log(`${pass ? "PASS" : "FAIL"} ${name} ok=${ok} dist=${dist.toFixed(3)}`);
    return pass;
}
function tp(x: number, z: number) {
    agent.stop();
    agent.pos.x = x; agent.pos.z = z; agent.pos.y = agent.heightAt(x, z);
}
try {
    await agent.connect(); await Bun.sleep(1700);
    // procession approach: the in-world walker threads the 4.33m on-line gap
    // between rupertfork and steinmetz (rupertfork's throat is plugged — folly
    // presentation, detour around a flank re-enters the line in the gap).
    // P0 = gap center r453.9 az94 (-31.663, 452.797): 2.19m clear of
    // rupertfork's edge (along-line half-extent 6.71), 2.14m clear of
    // steinmetz's (3.96). Reading vantage = construction face world az304 at
    // 7m (-28.174, 453.076): dead-on the face normal (local-u ≈ 0), 4.10m
    // clear of the square's face, 4.06m clear of rupertfork's rotated square —
    // the procession read.
    const p0: [number, number] = [-31.663, 452.797];
    const rim304: [number, number] = [-28.174, 453.076];
    tp(p0[0], p0[1]); await Bun.sleep(250);
    const a1 = await leg("approachIn_face304", rim304);
    const a2 = await leg("approachOut_back", p0);
    // ground circuit CW at 6m standoff (phantom-collider + obstruction check)
    tp(EX, EZ - ST); await Bun.sleep(250);
    const c1 = await leg("n->e", [EX + ST, EZ]);
    const c2 = await leg("e->s", [EX, EZ + ST]);
    const c3 = await leg("s->w", [EX - ST, EZ]);
    const c4 = await leg("w->n", [EX, EZ - ST]);
    const core = a1 && a2 && c1 && c2 && c3 && c4;
    const maxArr = Math.max(...results.filter(r => r.dist >= 0).map(r => r.dist));
    console.log(JSON.stringify({ status: core ? "CORE_ALL_PASS" : "CORE_FAIL", legs: results.length, maxArrival: +maxArr.toFixed(3), results }, null, 2));
    if (!core) process.exitCode = 1;
} finally { agent.close(); }
