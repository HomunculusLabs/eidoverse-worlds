// struct73-walk-moongate.ts — struct-73: MCPL walk gate for the MOON GATE
// placement. Entity center (-43.84, -0.0533, -43.84), yaw 0 — the ring
// stands in the XY plane, opening spans local x (walk line = local z).
// Envelope x ±2.90, z ±0.710; the honest room gates (8.24m² + 5.8m → exact
// trimesh) leave the opening truly open — the walker threads the ring.
// Two-way passage through the 4.7m opening + outer circuit.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -43.84, PZ = -43.84, YAW = 0;
const cs = Math.cos(YAW), sn = Math.sin(YAW);
const pt = (lx: number, lz: number): [number, number] => [PX + lx * cs + lz * sn, PZ - lx * sn + lz * cs];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct73-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
async function leg(name: string, end: [number, number], expect: "PASS" | "BLOCKED" = "PASS") {
    const ok = await agent.walkTo(end[0], end[1], false, 20_000);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    const pass = expect === "PASS" ? (ok && dist <= .6) : (!ok || dist > 1.0);
    results.push({ name, ok, dist: +dist.toFixed(3), expect, pass });
    if (!pass) throw Error(`${name} failed ok=${ok} dist=${dist} expect=${expect}`);
}
try {
    await agent.connect(); await Bun.sleep(1700); agent.stop();
    // start N of the gate on the az-135 spoke (walking SW from the village)
    const from = pt(0, -5.5);
    agent.pos.x = from[0]; agent.pos.z = from[1]; agent.pos.y = agent.heightAt(...from); await Bun.sleep(250);
    // N approach -> through the opening (S-heading), clear S
    await leg("approachN->openingN", pt(0, -1.1));        // N face of the ring
    await leg("openingN->throughS", pt(0, 1.1));          // THROUGH the opening, S side
    await leg("throughS->clearS", pt(0, 4.0));            // clear of the ring on the spoke
    // return N through the same opening (two-way proof)
    await leg("clearS->openingS", pt(0, 1.1));
    await leg("openingS->throughN", pt(0, -1.1));
    await leg("throughN->clearN", pt(0, -4.0));
    // outer circuit: around the ring's outside, both flanks
    await leg("clearN->eastFlank", pt(3.8, 0));           // outside the E flank
    await leg("eastFlank->eastS", pt(3.8, 2.4));
    await leg("eastS->southSpan", pt(0, 4.2));            // S of the ring
    await leg("southSpan->westS", pt(-3.8, 2.4));
    await leg("westS->westFlank", pt(-3.8, 0));
    await leg("westFlank->spokeN", pt(0, -3.0));          // back to the N approach line
    console.log(JSON.stringify({ status: "ALL_PASS", legs: results.length, worst: Math.max(...results.map(r => r.dist)) }, null, 2));
} finally { agent.close(); }
