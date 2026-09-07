// struct68-walk-meridiandial.ts — struct-68: MCPL walk gate for the MERIDIAN
// DIAL placement. Entity center (0, −0.0065, −27), yaw 0 (meridian on world
// N-S; blade runs z −2.375..0 at x ±0.10, apex N). Circuit per the deferred
// contract: S approach → pad S edge → onto the face → around the blade BOTH
// sides (E lane x 1.5, W lane x −1.5) → N edge → off W and E (never through
// the solid blade). The face is standable roomScale (46.7m² + 2.51m honest).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = 0, PZ = -27, YAW = 0;
const cs = Math.cos(YAW), sn = Math.sin(YAW);
const pt = (lx: number, lz: number): [number, number] => [PX + lx * cs + lz * sn, PZ - lx * sn + lz * cs];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct68-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
    // start S of the dial on the village meridian walk, clear of the envelope
    const from = pt(0, 8);
    agent.pos.x = from[0]; agent.pos.z = from[1]; agent.pos.y = agent.heightAt(...from); await Bun.sleep(250);
    // S approach → onto the face via the S flat (meridian_s runs here — walk the line)
    await leg("approach->padSedge", pt(0, 4.2));          // at the S apothem
    await leg("padSedge->faceS", pt(0, 3.0));             // onto the dial face (S half)
    // around the blade, E side: cross z 0..−2.375 on the x 1.5 lane
    await leg("faceS->eastLane", pt(1.5, 0.6));
    await leg("eastLane->eastN", pt(1.5, -2.0));          // N of blade foot, E lane
    await leg("eastN->faceN", pt(0.8, -3.0));             // onto the N face (hour fan zone)
    await leg("faceN->noonStone", pt(0, -3.1));           // the noon stone / noon pin
    // back around the blade, W side
    await leg("noonStone->westLaneN", pt(-1.5, -2.0));
    await leg("westLaneN->westS", pt(-1.5, 0.6));         // S of blade again, W lane
    await leg("westS->faceCenter", pt(-0.8, 0.4));        // blade foot W flank
    // off the face W then E
    await leg("faceCenter->offW", pt(-5.2, 1.5));         // off the W flat
    await leg("offW->faceEedge", pt(3.0, 1.0));           // re-enter via S-E
    await leg("faceEedge->offE", pt(5.2, -1.0));          // off the E flat
    console.log(JSON.stringify({ status: "ALL_PASS", results }, null, 2));
} finally { agent.close(); }
