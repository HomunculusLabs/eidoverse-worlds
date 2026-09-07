// struct86-walk-chainvault.ts — struct-86: MCPL walk gate for THE CHAIN
// VAULT (owed by struct-85 queue-law FIRST). Entity center (52.6, -0.0478,
// -19.2) yaw -1.2217 rad, TRUE envelope x ±3.80 z ±3.62, mouths open BOTH
// ends along local z. World mouth axis = (sin(yaw), cos(yaw)) = (-0.9394,
// +0.3428): mouth A (plaza-side) center (49.20, -17.96), mouth B (outbound)
// center (56.00, -20.44). Enterable: through-passage both mouths BOTH
// directions (a-out -> center -> b-out, then back), PLUS one CW outside
// circuit at 6.5m world-axis standoff (grown half-extents 4.70x4.81 ->
// axis-point clearance 1.8m > 1.4 pinch law).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const CX = 52.6, CZ = -19.2, ST = 6.5;
const results: any[] = [];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct86-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
async function leg(name: string, end: [number, number], expect: "PASS" | "BLOCKED" = "PASS") {
    const ok = await agent.walkTo(end[0], end[1], false, 20_000);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    const pass = expect === "PASS" ? (ok && dist <= .6) : (!ok || dist > 1.0);
    results.push({ name, ok, dist: +dist.toFixed(3), expect, pass });
    if (!pass) throw Error(`${name} failed ok=${ok} dist=${dist} expect=${expect}`);
}
try {
    await agent.connect(); await Bun.sleep(1700); agent.stop();
    const AX = -0.9394, AZ = 0.3428;            // world mouth axis (unit)
    const aOut: [number, number] = [CX + AX * 7, CZ + AZ * 7];   // (46.02, -16.80)
    const bOut: [number, number] = [CX - AX * 7, CZ - AZ * 7];   // (59.18, -21.60)
    const ctr: [number, number] = [CX, CZ];
    // start outside mouth A, clear of the envelope
    agent.pos.x = aOut[0]; agent.pos.z = aOut[1]; agent.pos.y = agent.heightAt(aOut[0], aOut[1]); await Bun.sleep(250);
    // through-passage: A -> center -> B (mouth A in, mouth B out)
    await leg("aIn_center", ctr);
    await leg("center_bOut", bOut);
    // reverse: B -> center -> A (mouth B in, mouth A out)
    await leg("bIn_center", ctr);
    await leg("center_aOut", aOut);
    // outside circuit CW at standoff (envelope obstruction check)
    agent.stop(); agent.pos.x = CX; agent.pos.z = CZ - ST; agent.pos.y = agent.heightAt(CX, CZ - ST); await Bun.sleep(250);
    await leg("n->e", [CX + ST, CZ]);
    await leg("e->s", [CX, CZ + ST]);
    await leg("s->w", [CX - ST, CZ]);
    await leg("w->n", [CX, CZ - ST]);
    const maxArr = Math.max(...results.map(r => r.dist));
    console.log(JSON.stringify({ status: "ALL_PASS", legs: results.length, maxArrival: +maxArr.toFixed(3), results }, null, 2));
} finally { agent.close(); }
