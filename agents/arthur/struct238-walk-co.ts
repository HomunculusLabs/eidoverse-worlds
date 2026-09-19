// struct238-walk-co.ts — struct-238: MCPL ground circuit walk owed by the
// carry contract ("Folly class — ground circuit walk at placement, no
// door"). The open faceted gem (equal-measure checkerboard) is the
// sculpture — the walk proves the approach + full ground circuit + no
// phantom collider.
// Entity nx-struct-co pos (96.320008, -0.029291, 5.891184) yaw 4.127704
// (236.50deg). Footprint = dodecagon R4.05: ground circuit at 6m
// standoff clears by 1.95m min.
// Legs: two-way village approach (P0 10m out on the az3.5 arrival line
// -> reading-face vantage rim at 7m on the az183.5 face normal — the
// judged oblique view) -> 4-leg ground circuit CW.
// Chassis: struct236-walk-rt.ts (proven).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const EX = 96.320008, EZ = 5.891184, ST = 6;
const results: any[] = [];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct238-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
    // village approach: walker arrives along az3.5 (the E-axis procession
    // the seat composes — tower r58 az0, star r66 az9, helix r76 az4,
    // gem r87.5 az359.5, co r96.5 az3.5); P0 = 10m out on the arrival
    // line; rim = reading-face vantage 7m out on the az183.5 face normal
    // (the judged oblique view).
    const az = 3.5 * Math.PI / 180;
    const p0: [number, number] = [EX - 10 * Math.cos(az), EZ - 10 * Math.sin(az)];
    const azR = 183.5 * Math.PI / 180;
    const rim: [number, number] = [EX - 7 * Math.cos(azR), EZ - 7 * Math.sin(azR)];
    tp(p0[0], p0[1]); await Bun.sleep(250);
    const a1 = await leg("approachIn_face183.5", rim);
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
