// struct60-walk-stillwind.ts — struct-60: MCPL walk gate for the Stillwind
// Wall placement. Entity center (−52, −0.031, 0), yaw 0 (local == world).
// PASSAGE AXIS = source-truth nrm(0) = (0.830, 0.558) (local +X normal of
// the ribbon at the gate; the gate turns you ~34° as you cross). Walk line:
// local −X(east-of-gate) → through the arch → +X, both directions, then a
// flank circuit at the bows. Passage half-width clearance: ring clear 1.66m
// ≥ 1.4 lane law; impost bottom 1.41 ≥ 1.4 head law.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -52, PZ = 0, YAW = 0;
const cs = Math.cos(YAW), sn = Math.sin(YAW);
const pt = (lx: number, lz: number): [number, number] => [PX + lx * cs + lz * sn, PZ - lx * sn + lz * cs];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct60-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
    // start east of the gate, clear of the east bow (bow face reaches
    // local x ≈ +1.8; start at +5.5 on the passage normal)
    const from = pt(5.5, 0);
    agent.pos.x = from[0]; agent.pos.z = from[1]; agent.pos.y = agent.heightAt(...from); await Bun.sleep(250);
    await leg("eastApron->gateLine", pt(2.2, 0));     // approach to the arch mouth
    await leg("gateLine->gateCenter", pt(0, 0));      // under the arch
    await leg("gateCenter->westApron", pt(-2.2, 0));  // through and out
    await leg("westApron->farWest", pt(-5.5, 0));     // clear of the west bow
    // reverse: west -> through the arch -> east
    await leg("farWest->backWestApron", pt(-2.2, 0));
    await leg("backWestApron->backGateCenter", pt(0, 0));
    await leg("backGateCenter->eastApronClose", pt(5.5, 0));
    // flank circuit at grade: north end -> east bow -> south end
    await leg("toNorthEnd", pt(1.8, 10.5));
    await leg("northEnd->eastBowMid", pt(3.4, 0));    // outside the east bow face
    await leg("eastBowMid->southEnd", pt(1.8, -10.5));
    console.log(JSON.stringify({ status: "ALL_PASS", results }, null, 2));
} finally { agent.close(); }
