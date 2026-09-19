// struct246-walk-toct.ts — struct-246: MCPL ground circuit walk owed by
// the carry contract ("Folly class — ground circuit walk at placement,
// no door"). The toct is a PANELLED SOLID (like the tico, unlike the
// open ico cage): the walk proves the two-way village approach on the
// az348.5 arrival line, the reading-face vantage at 7m on the az198.5
// face normal, and a full CW standoff circuit at 8m — approach, vantage,
// no phantom collider. Entity nx-struct-toct pos (64.675031, -13.158284)
// yaw 4.389503 rad (251.50deg). Footprint = 14-gon dais R3.85 (reach+rod
// 3.739 <= apothem 3.753 — never overhangs): 7m vantage points clear by
// 3.15m; the 8m-corner square circuit clears by 1.81m at chord midpoints
// (5.66 - 3.85) — honest margin vs the 1.4 law.
// Chassis: struct244-walk-tico.ts (proven).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const EX = 64.675031, EZ = -13.158284, ST = 8;
const results: any[] = [];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct246-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
    // village approach: walker arrives along the az348.5 arrival ray
    // (anti-travel az168.5). P0 = 10m village-side on the arrival line;
    // V1 = 7m on the same line from the seat center (outside the 3.85m
    // dais by 3.15m — the approach stop point). The P0->V1 leg walks the
    // arrival line up TO the cell without entering it.
    const aAT = 168.5 * Math.PI / 180;
    const p0: [number, number] = [EX + 10 * Math.cos(aAT), EZ + 10 * Math.sin(aAT)];
    const v1: [number, number] = [EX + 7 * Math.cos(aAT), EZ + 7 * Math.sin(aAT)];
    tp(p0[0], p0[1]); await Bun.sleep(250);
    const a1 = await leg("approachIn_arrival", v1);
    const a2 = await leg("approachOut_back", p0);
    // reading-face vantage: 7m out on the az198.5 face normal (the judged
    // read direction — anti-travel + 30deg east lean). V2 -> V1 is the
    // oblique vantage chord (min 6.76m from center — clear).
    const aRF = 198.5 * Math.PI / 180;
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
