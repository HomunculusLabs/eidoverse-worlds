// struct224-walk-rupertfork.ts — struct-224: MCPL ground circuit walk owed by
// the carry contract ("if seated walkable around, a circuit walk at
// placement"). Real trimesh: footprint 120.1m² >= 16 AND 5.14 >= 2.2. The
// throat is intentionally plugged (folly by presentation) — the walk proves
// the approach + full ground circuit + no phantom collider.
// Entity nx-struct-rupertfork pos (-31.041631, -0.046430, 443.916002) yaw
// 1.762783 (101 deg). Envelope 10.96 x 5.14 x 10.96 (decode D8): ground
// circuit at 9m standoff clears the true rotated square by ~1.25m min
// (half-diagonal 7.754m).
// Legs: two-way procession approach (anti-travel az274 side, the near-mouth
// reading face) -> 4-leg ground circuit CW.
// Chassis: struct219-walk-newtonspheres.ts (proven).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const EX = -31.041631, EZ = 443.916002, ST = 9;
const results: any[] = [];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct224-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
    // procession approach: r436 az94 (just past newtonspheres) -> near-mouth
    // reading point az274 at 10m center distance (mouth world az304; the
    // oblique reading vantage between the anti-travel line and the mouth)
    const r436: [number, number] = [-30.352, 434.001];
    const rim274: [number, number] = [-33.552, 434.429];
    tp(r436[0], r436[1]); await Bun.sleep(250);
    const a1 = await leg("approachIn_mouth274", rim274);
    const a2 = await leg("approachOut_back", r436);
    // ground circuit CW at 9m standoff (phantom-collider + obstruction check)
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
