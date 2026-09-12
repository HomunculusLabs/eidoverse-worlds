// struct84-walk-rotor.ts — struct-84: MCPL walk gate for the REULEAUX
// ROTOR. Entity center (1.5, 0.01561, 87.5) yaw 0, TRUE envelope x/z ±1.75
// (exact trimesh: slab 12.25m^2 + height 3.29 -> room gates). Folly — nothing
// enterable; circuit at 3.5m standoff (2x envelope, > 1.4m pinch law) both
// ways, PLUS the Math Avenue centerline leg proving the avenue walking line
// passes the rotor's band unobstructed (rotor 7.6m east of the brg-356 axis
// ray, geometry-chapter east flank, city-108).
// RE-PINNED city-108 (2026-09-12) after the Wave A relocation
// (-12,-0.0373,-64.5) yaw 0 -> (1.5,0.01561,87.5) yaw 0: circuit re-based at
// the new seat; the city-107 catenarygate axis legs belong to the gate's seat
// 25m+ away and were replaced by the avenue centerline legs (same spirit:
// the walking line near the form stays unobstructed) along the brg-356 ray
// (-5.65,80.80) -> (-6.63,94.77), abeam the rotor at ~7.6m lateral.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const CX = 1.5, CZ = 87.5, ST = 3.5;
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
    // avenue axis proof: teleport to the brg-356 ray at r81, walk outbound to r95
    // (passes abeam the rotor ~7.6m east; kochgarden on-axis station is a
    // walkable ground film, struct-19 law)
    sx = -5.65; sz = 80.80;
    agent.stop(); agent.pos.x = sx; agent.pos.z = sz; agent.pos.y = agent.heightAt(sx, sz); await Bun.sleep(250);
    await leg("axis-n->through", [-6.63, 94.77]);
    await leg("axis-s->back", [-5.65, 80.80]);
    const maxArr = Math.max(...results.map(r => r.dist));
    console.log(JSON.stringify({ status: "ALL_PASS", legs: results.length, maxArrival: +maxArr.toFixed(3), results }, null, 2));
} finally { agent.close(); }
