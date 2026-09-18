// struct232-walk-ssd.ts — struct-232: MCPL ground circuit walk owed by the
// carry contract ("Folly class — no walk owed beyond a ground circuit at
// placement"). The open star cage is the sculpture — the walk proves the
// approach + full ground circuit + no phantom collider.
// Entity nx-struct-ssd pos (65.187430, -0.031675, 10.324675) yaw 4.039190
// (231.43deg). Footprint = dodecagon R2.75: ground circuit at 6m standoff
// clears by 3.25m min.
// Legs: two-way village approach (P0 10m out on the az9 arrival line ->
// reading-face vantage rim at 7m on the az219 face normal — the judged
// oblique view) -> 4-leg ground circuit CW.
// Chassis: struct228-walk-csaszar.ts (proven).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const EX = 65.187430, EZ = 10.324675, ST = 6;
const results: any[] = [];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct232-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
    // village approach: walker arrives along az9 (the E-axis arrival line the
    // seat composes — tower r58 az0 + star r66 az9); P0 = 10m out on the
    // arrival line; rim = reading-face vantage 7m out on the az219 face
    // normal (the judged oblique view).
    const p0: [number, number] = [55.31, 8.76];
    const rim: [number, number] = [59.75, 5.92];
    tp(p0[0], p0[1]); await Bun.sleep(250);
    const a1 = await leg("approachIn_face219", rim);
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
