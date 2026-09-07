// struct49-walk-ninesbridge.ts — struct-49: MCPL walk gate for the Bridge
// of Nines. Center (-7.28, 69.62), yaw -1.67552 — span along local X
// (village-side stair is local -X / south end).
// Transform: wx = px + lx·cos(yaw) + lz·sin(yaw), wz = pz − lx·sin(yaw) + lz·cos(yaw).
// Deck Y 1.92 via stairs (9 treads x 0.2133). Legs: field-side approach →
// south stair foot → stair top → deck mid → deck far (north) → north stair
// descent → village-side out; then re-cross north→south (two-way), plus
// a flank walk along the south face (perimeter clear).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -7.28, PZ = 69.62, YAW = -1.67552;
const cs = Math.cos(YAW), sn = Math.sin(YAW);
const pt = (lx: number, lz: number): [number, number] => [PX + lx * cs + lz * sn, PZ - lx * sn + lz * cs];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct49-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
async function leg(name: string, end: [number, number]) {
    const ok = await agent.walkTo(end[0], end[1], false, 20_000);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    results.push({ name, ok, dist: +dist.toFixed(3) });
    if (!ok || dist > .6) throw Error(`${name} failed ok=${ok} dist=${dist}`);
}
try {
    await agent.connect(); await Bun.sleep(1700); agent.stop();
    // field-side (south) approach from outside the stair foot
    const from = pt(-15.5, 0);
    agent.pos.x = from[0]; agent.pos.z = from[1]; agent.pos.y = agent.heightAt(...from); await Bun.sleep(250);
    await leg("approach->southFoot", pt(-14.6, 0));   // stair foot pad (local -X end)
    await leg("southFoot->stairTop", pt(-12.0, 0));   // up the nine treads to deck start
    await leg("stairTop->deckMid", pt(0, 0));          // across the deck center
    await leg("deckMid->deckFar", pt(11.5, 0));        // toward the north end
    await leg("deckFar->northStairDescent", pt(14.6, 0)); // down and out
    await leg("out->re-enter", pt(11.5, 0));           // re-cross (two-way)
    await leg("re-enter->deckMid2", pt(0, 0));
    await leg("flankSouth", pt(0, -3.2));              // around the south face at grade
    await leg("flankNorth", pt(0, 3.2));               // around the north face at grade
    console.log(JSON.stringify({ status: "ALL_PASS", results }, null, 2));
} finally { agent.close(); }
