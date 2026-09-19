// struct254-walk-srcubo.ts — struct-254: MCPL ground circuit walk owed by
// the carry contract (folly class — ground circuit walk at placement, no
// door). The srcubo is a PANELLED SOLID (like the tcube/tdodec/tico/toct/
// tret): the walk proves the two-way village approach on the az261.5
// arrival line (anti-travel az81.5), the reading-face vantage at 7m on
// the az111.5 face normal (anti-travel + 30deg east lean), and a full CW
// standoff circuit at 8m — approach, vantage, no phantom collider.
// Entity nx-struct-srcubo pos (-12.415991, -83.077333) yaw 5.907940 rad
// (338.50deg). Footprint = 26-gon dais R3.50 apothem 3.474 (reach+rod
// 3.361 — never overhangs): 7m vantage points clear by >= 3.53m; the
// 8m-corner square circuit's TIGHTEST point is the chord midpoint
// 8.00 - 3.474 = 4.53m (corners 4.50m) — above the 1.4 law (struct-253
// disposition: 8m standoff law applies directly, no tret-class widening).
// Chassis: struct252-walk-tdodec.ts (proven).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const EX = -12.415991, EZ = -83.077333, ST = 8;
const results: any[] = [];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct254-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
    // village approach: walker arrives along the az261.5 outbound ray
    // (anti-travel az81.5). P0 = 10m village-side on the arrival line;
    // V1 = 7m on the same line from the seat center (outside the 3.50m
    // dais by ~3.5m — the approach stop point). The P0->V1 leg walks the
    // arrival line up TO the solid without entering it.
    const aAT = 81.5 * Math.PI / 180;
    const p0: [number, number] = [EX + 10 * Math.cos(aAT), EZ + 10 * Math.sin(aAT)];
    const v1: [number, number] = [EX + 7 * Math.cos(aAT), EZ + 7 * Math.sin(aAT)];
    tp(p0[0], p0[1]); await Bun.sleep(250);
    const a1 = await leg("approachIn_arrival", v1);
    const a2 = await leg("approachOut_back", p0);
    // reading-face vantage: 7m out on the az111.5 face normal (the judged
    // read direction — anti-travel + 30deg east lean). V2 -> V1 is the
    // oblique vantage chord (min 6.76m from center — clear by ~3.3m).
    const aRF = 111.5 * Math.PI / 180;
    const v2: [number, number] = [EX + 7 * Math.cos(aRF), EZ + 7 * Math.sin(aRF)];
    tp(v2[0], v2[1]); await Bun.sleep(250);
    const a3 = await leg("vantageRead_face", v1);
    // ground circuit CW at 8m standoff (phantom-collider + obstruction check)
    tp(EX, EZ - ST); await Bun.sleep(250);
    const c1 = await leg("n->e", [EX + ST, EZ]);
    const c2 = await leg("e->s", [EX, EZ + ST]);
    const c3 = await leg("s->w", [EX - ST, EZ]);
    const c4 = await leg("w->n", [EX, EZ - ST]);
    const core = a1 && a2 && a3 && c1 && c2 && c3 && c4;
    const maxArr = Math.max(...results.filter(r => r.dist >= 0).map(r => r.dist));
    console.log(JSON.stringify({ status: core ? "CORE_ALL_PASS" : "CORE_FAIL", legs: results.length, maxArrival: +maxArr.toFixed(3), results }, null, 2));
    if (!core) process.exitCode = 1;
} finally { agent.close(); }
