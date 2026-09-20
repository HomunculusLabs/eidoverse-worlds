// struct276-walk-trit.ts — struct-276: MCPL ground circuit walk owed by
// the carry contract (folly class — ground circuit walk at placement, no
// door). The trit is a PANELLED SOLID (like the trico/ssd/gsd/gdodec/
// gicosa/dtria/deltoid/triakis/tetrakis): the walk proves the two-way
// village approach on the az305 outbound ray (anti-travel az125), the
// reading-face vantage at 7m on the az155 face normal (anti-travel +
// 30deg east lean), and a full CW standoff circuit at 8m — approach,
// vantage, no phantom collider. Entity nx-struct-trit pos
// (60.225526, -86.010965) yaw 5.148721 rad (295.00deg). Footprint =
// 12-gon dais circumradius 4.45, apothem 4.298 (envelope == dais —
// never overhangs): 7m vantage points clear by >= 2.55m; the 8m-corner
// square circuit's TIGHTEST point is the edge midpoint 8.00 - 4.298 =
// 3.70m (corners sqrt(2)*8 - 4.45 = 6.85m) — above the 1.4 law (family
// disposition: 8m standoff law applies directly, no widening).
// Chassis: struct274-walk-tetrakis.ts (proven).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const EX = 60.225526, EZ = -86.010965, ST = 8;
const results: any[] = [];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct276-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
    // village approach: walker arrives along the az305 outbound ray
    // (anti-travel az125). P0 = 10m village-side on the arrival line;
    // V1 = 7m on the same line from the seat center (outside the 4.45m
    // dais by ~2.55m — the approach stop point). The P0->V1 leg walks
    // the arrival line up TO the solid without entering it.
    const aAT = 125 * Math.PI / 180;
    const p0: [number, number] = [EX + 10 * Math.cos(aAT), EZ + 10 * Math.sin(aAT)];
    const v1: [number, number] = [EX + 7 * Math.cos(aAT), EZ + 7 * Math.sin(aAT)];
    tp(p0[0], p0[1]); await Bun.sleep(250);
    const a1 = await leg("approachIn_arrival", v1);
    const a2 = await leg("approachOut_back", p0);
    // reading-face vantage: 7m out on the az155 face normal (the judged
    // read direction — anti-travel + 30deg east lean). V2 -> V1 is the
    // oblique vantage chord (min 6.76m from center — clear by ~2.3m).
    const aRF = 155 * Math.PI / 180;
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
