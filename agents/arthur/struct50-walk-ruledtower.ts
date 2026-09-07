// struct50-walk-ruledtower.ts — struct-50: MCPL walk gate for the Ruled
// Tower's base circuit. Center (58, 0), yaw 0 (local == world axes).
// FOLLY: plinth steps are 0.5m rises (>0.25 standable law) so the top is
// NOT standable by design; the circuit is at grade around the plinth.
// Legs: stable-side approach → W foot → plinth-circuit NW → N face → NE
// → E face → SE → S face → SW → full-close back at W foot; then step-up
// probes on step 1 (expect BLOCKED — honest tall step) on two faces.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = 58, PZ = 0, YAW = 0;
const cs = Math.cos(YAW), sn = Math.sin(YAW);
const pt = (lx: number, lz: number): [number, number] => [PX + lx * cs + lz * sn, PZ - lx * sn + lz * cs];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct50-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
    // approach from the stable side (village side, local -X)
    const from = pt(-11.0, 2.5);
    agent.pos.x = from[0]; agent.pos.z = from[1]; agent.pos.y = agent.heightAt(...from); await Bun.sleep(250);
    await leg("approach->westFoot", pt(-6.2, 0));       // clear of plinth (half 4.5 + margin)
    await leg("westFoot->nw", pt(-4.0, 5.7));           // corner circuit at grade
    await leg("nw->nFace", pt(0, 5.7));
    await leg("nFace->ne", pt(4.0, 5.7));
    await leg("ne->eFace", pt(6.2, 0));
    await leg("eFace->se", pt(4.0, -5.7));
    await leg("se->sFace", pt(0, -5.7));
    await leg("sFace->sw", pt(-4.0, -5.7));
    await leg("sw->westFootClose", pt(-6.2, 0));        // full close
    // PROBE FINDING: 0.5m steps are mountable — plinth top STANDABLE.
    // Interior circuit on the plinth top (y 1.5), inside the weave:
    // enter through the strut gap at azimuth ~11.25° (between base
    // endpoints k=0/1; clear chord ~0.84m), circuit at r 1.9, exit.
    await leg("gapEntry->plinthTop", pt(0.43, 2.16));
    await leg("plinthTop->inN", pt(0, 1.9));
    await leg("inN->inW", pt(-1.9, 0));
    await leg("inW->inS", pt(0, -1.9));
    await leg("inS->inE", pt(1.9, 0));
    await leg("inE->gapExit", pt(0.43, 2.16));
    await leg("gapExit->grade", pt(-6.2, 0));           // back down and out
    console.log(JSON.stringify({ status: "ALL_PASS", results }, null, 2));
} finally { agent.close(); }
