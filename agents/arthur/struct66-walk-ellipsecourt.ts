// struct64-walk-ellipsecourt.ts — struct-66: MCPL walk gate for the ELLIPSE
// COURT placement. Entity center (0, −0.0476, −47), yaw π/2 (major axis =
// world Z). THROUGH-AXIS both ways (waterstair side → S end bay → foci line
// → N end bay → now-shelltower side), interior circuit touching both foci.
// Bay widths 2.074–2.168m ≥ 1.4 lane law (asserted in-source at build).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -3.75, PZ = -50.75, YAW = Math.PI / 2;
const cs = Math.cos(YAW), sn = Math.sin(YAW);
const pt = (lx: number, lz: number): [number, number] => [PX + lx * cs + lz * sn, PZ - lx * sn + lz * cs];
// local x = major axis (walk-through), local z = minor.
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct66-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
    // start S of the court on the N walk (waterstair side), clear of envelope
    const from = pt(0, 11);
    agent.pos.x = from[0]; agent.pos.z = from[1]; agent.pos.y = agent.heightAt(...from); await Bun.sleep(250);
    // through-axis south → north: apron → S end bay → center → N end bay → far apron
    await leg("southApron->sBayMouth", pt(0, 8.2));      // at the S entrance bay
    await leg("sBayMouth->focusS", pt(0, 5.6));           // south focus pin
    await leg("focusS->center", pt(0, 0));                // ellipse center
    await leg("center->focusN", pt(0, -5.6));             // north focus pin
    await leg("focusN->nBayMouth", pt(0, -8.2));          // N entrance bay
    await leg("nBayMouth->northApron", pt(0, -11));       // out (now-shelltower side)
    // reverse: north → through → south
    await leg("northApron->backNbay", pt(0, -8.2));
    await leg("backNbay->backCenter", pt(0, 0));
    await leg("backCenter->southApronClose", pt(0, 11));
    // interior circuit: east minor extreme inside the ring
    await leg("reEnter->interiorEast", pt(4.2, 0));
    await leg("interiorEast->interiorWest", pt(-4.2, 0));
    console.log(JSON.stringify({ status: "ALL_PASS", results }, null, 2));
} finally { agent.close(); }
