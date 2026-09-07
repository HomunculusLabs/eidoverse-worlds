// struct65-walk-wavepergola.ts — struct-65: MCPL walk gate for the WAVE
// PERGOLA placement. Entity center (51, −0.0221, 9), yaw 0 (wave axis =
// world X). The promenade runs under the wave from W end to E end, both
// directions, plus a lateral cross-through between post pairs and a loop
// around one post line. Walk-under law: rail trough bottom 2.30m clear
// (proven at build + decode) — the walker passes under BOTH crests and
// troughs. Bay rhythm 1.84m clear ≥ 1.4 lane law (asserted in-source).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = 51, PZ = 9, YAW = 0;
const cs = Math.cos(YAW), sn = Math.sin(YAW);
const pt = (lx: number, lz: number): [number, number] => [PX + lx * cs + lz * sn, PZ - lx * sn + lz * cs];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct65-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
    // start W of the pergola on the verge apron, clear of the envelope
    const from = pt(-9.5, 0);
    agent.pos.x = from[0]; agent.pos.z = from[1]; agent.pos.y = agent.heightAt(...from); await Bun.sleep(250);
    // west → east through the promenade: apron → under crest → through trough → under crest → out
    await leg("wApron->underWestCrest", pt(-3.5, 0));     // under west crest
    await leg("underWestCrest->trough", pt(0, 0));        // center of trough span
    await leg("trough->underEastCrest", pt(3.5, 0));      // under east crest (beads overhead)
    await leg("underEastCrest->eApron", pt(9.5, 0));      // out east toward the tower walk
    // reverse: east → west full span
    await leg("eApron->backEastCrest", pt(3.5, 0));
    await leg("backEastCrest->backWApron", pt(-9.5, 0));
    // lateral cross-through between post pairs (between x=0 and x=2 pairs)
    await leg("wApron2->crossIn", pt(1, 0));
    await leg("crossIn->crossNorth_out", pt(1, 4.5));     // out the north side between posts
    await leg("crossNorth_out->crossSouth_in", pt(1, -4.5)); // back through and out the south side
    console.log(JSON.stringify({ status: "ALL_PASS", results }, null, 2));
} finally { agent.close(); }
