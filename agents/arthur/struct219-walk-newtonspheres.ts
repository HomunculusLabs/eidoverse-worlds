// struct219-walk-newtonspheres.ts — struct-219: MCPL rim circuit walk owed by
// the carry contract (real trimesh: footprint 100m² >= 16 AND 5.52 >= 2.2;
// folly class — probe L4 seals the center, no door exists, so the walk proves
// the dais approach + ground circuit + no phantom collider).
// Entity nx-struct-newtonspheres pos (-29.995283, -0.045211, 428.952541) yaw
// 2.548181 (146 deg). Dais r 5.0, h 0.34 (single rise — the dais-top leg is
// disclosed threshold-dependent: 0.34 > the 0.25 door-threshold-rise law; the
// engine may refuse the step, which is an honest threshold report, not a
// defect). Ground circuit at 8m standoff clears the 10m disc by 3m.
// Legs: two-way procession approach (anti-travel az274 side, the reading
// face) -> 4-leg ground circuit CW -> optional dais-top rim leg (az304 inlay
// side, r4.2 on the dais top).
// Chassis: struct88-walk-conoidfan.ts (proven).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const EX = -29.995283, EZ = 428.952541, ST = 8;
const results: any[] = [];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct219-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
    // procession approach: r421 az94 (just past the sphericon) -> rim point az274 (village-side reading face)
    const r421: [number, number] = [-29.365, 419.976];
    const rim274: [number, number] = [-29.577, 422.967];
    tp(r421[0], r421[1]); await Bun.sleep(250);
    const a1 = await leg("approachIn_rim274", rim274);
    const a2 = await leg("approachOut_back", r421);
    // ground circuit CW at 8m standoff (phantom-collider + obstruction check)
    tp(EX, EZ - ST); await Bun.sleep(250);
    const c1 = await leg("n->e", [EX + ST, EZ]);
    const c2 = await leg("e->s", [EX, EZ + ST]);
    const c3 = await leg("s->w", [EX - ST, EZ]);
    const c4 = await leg("w->n", [EX, EZ - ST]);
    // dais-top rim leg (DISCLOSED threshold-dependent: 0.34m single rise):
    // from ground r5.6 az304 to dais-top r4.2 az304 (the inlay reading side)
    const g304: [number, number] = [-26.864, 424.311];
    const top304: [number, number] = [-27.647, 425.471];
    tp(g304[0], g304[1]); await Bun.sleep(250);
    let topVerdict = "SKIP";
    try {
        const ok = await agent.walkTo(top304[0], top304[1], false, 20_000);
        const dist = Math.hypot(agent.pos.x - top304[0], agent.pos.z - top304[1]);
        topVerdict = ok && dist <= .6 ? "PASS" : "BLOCKED";
        results.push({ name: "daisTop_rim304", ok, dist: +dist.toFixed(3), pass: ok && dist <= .6 });
        console.log(`${topVerdict} daisTop_rim304 ok=${ok} dist=${dist.toFixed(3)} (0.34m single rise — threshold class, disclosed)`);
    } catch (e: any) {
        topVerdict = "BLOCKED";
        results.push({ name: "daisTop_rim304", ok: false, dist: -1, pass: false });
        console.log(`BLOCKED daisTop_rim304 (throw: ${String(e).slice(0, 80)}) — threshold class, disclosed`);
    }
    const core = a1 && a2 && c1 && c2 && c3 && c4;
    const maxArr = Math.max(...results.filter(r => r.dist >= 0).map(r => r.dist));
    console.log(JSON.stringify({ status: core ? "CORE_ALL_PASS" : "CORE_FAIL", legs: results.length, daisTop: topVerdict, maxArrival: +maxArr.toFixed(3), results }, null, 2));
    if (!core) process.exitCode = 1;
} finally { agent.close(); }
