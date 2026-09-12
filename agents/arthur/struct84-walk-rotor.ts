// struct84-walk-rotor.ts — struct-84: MCPL walk gate for the REULEAUX
// ROTOR. Entity center (-12, -0.0373, -64.5) yaw 0, TRUE envelope x/z ±1.75
// (exact trimesh: slab 12.25m^2 + height 3.29 -> room gates). Folly — nothing
// folly — nothing enterable; circuit at 3.5m standoff (2x envelope, > 1.4m pinch law) both
// ways, PLUS the catenarygate axis leg proving the S walking line is unobstructed by the
// rotor 12m west. Gate-axis legs RE-PINNED city-107 (2026-09-12) after the Wave A
// relocation (0,-0.0274,-60.5) yaw 0 -> (-1.5,-0.025735,115.5) yaw 3.128606 — legs
// re-based in the gate's local frame: village-side local z +5.5 = (-1.43,110.00),
// outward local z -5.5 = (-1.57,121.00), threading the 7m opening on the radial).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const CX = -12, CZ = -64.5, ST = 3.5;
const results: any[] = [];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct84-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
async function leg(name: string, end: [number, number], expect: "PASS" | "BLOCKED" = "PASS") {
    const ok = await agent.walkTo(end[0], end[1], false, 20_000);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    const pass = expect === "PASS" ? (ok && dist <= .6) : (!ok || dist > 1.0);
    results.push({ name, ok, dist: +dist.toFixed(3), expect, pass });
    if (!pass) throw Error(`${name} failed ok=${ok} dist=${dist} expect=${expect}`);
}
try {
    await agent.connect(); await Bun.sleep(1700); agent.stop();
    // start N of the rotor on its axis, clear of the envelope
    let sx = CX, sz = CZ - ST;
    agent.pos.x = sx; agent.pos.z = sz; agent.pos.y = agent.heightAt(sx, sz); await Bun.sleep(250);
    // full circuit CW: N -> E -> S -> W -> N
    await leg("n->e", [CX + ST, CZ]);
    await leg("e->s", [CX, CZ + ST]);
    await leg("s->w", [CX - ST, CZ]);
    await leg("w->n", [CX, CZ - ST]);
    // full circuit CCW (reverse)
    await leg("n->w", [CX - ST, CZ]);
    await leg("w->s", [CX, CZ + ST]);
    await leg("s->e", [CX + ST, CZ]);
    await leg("e->n", [CX, CZ - ST]);
    // gate axis proof: teleport to village-side approach of catenarygate, walk the axis outward
    sx = -1.43; sz = 110.00;
    agent.stop(); agent.pos.x = sx; agent.pos.z = sz; agent.pos.y = agent.heightAt(sx, sz); await Bun.sleep(250);
    await leg("gateaxis-n->through", [-1.57, 121.00]);
    await leg("gateaxis-s->back", [-1.43, 110.00]);
    const maxArr = Math.max(...results.map(r => r.dist));
    console.log(JSON.stringify({ status: "ALL_PASS", legs: results.length, maxArrival: +maxArr.toFixed(3), results }, null, 2));
} finally { agent.close(); }
