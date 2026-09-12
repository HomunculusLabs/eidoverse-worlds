// struct72-walk-catenarygate.ts — struct-72: MCPL walk gate for the CATENARY
// GATE placement. RE-PINNED city-107 (2026-09-12) after the Wave A relocation
// (0,-0.0274,-60.5) yaw 0 -> (-1.5,-0.025735,115.5) yaw 3.128606 [Math Avenue
// geometry->chaos threshold flank; same lib 0e3b5e5b4d7086ab]. The gate spans
// local x (opening |x|<3.30 air at grade), wall thickness local z ±0.948.
// Two-way passage through the 7m opening + shoulder circuit. The passage is
// honest room gates (14.2m² + 5.8m → exact trimesh) so the walker threads
// the true opening.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -1.5, PZ = 115.5, YAW = 3.1286063706696203;
const cs = Math.cos(YAW), sn = Math.sin(YAW);
const pt = (lx: number, lz: number): [number, number] => [PX + lx * cs + lz * sn, PZ - lx * sn + lz * cs];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct72-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
    // start S of the gate on the meridian, clear of the envelope
    const from = pt(0, 6);
    agent.pos.x = from[0]; agent.pos.z = from[1]; agent.pos.y = agent.heightAt(...from); await Bun.sleep(250);
    // S approach -> into the opening from the S face
    await leg("approach->openingS", pt(0, 1.0));          // S face of the gate wall
    await leg("openingS->throughN", pt(0, -1.6));         // THROUGH the opening, N side
    await leg("throughN->clearN", pt(0, -4.0));           // clear of the gate on the N meridian
    // return S through the same opening (two-way proof)
    await leg("clearN->openingN", pt(0, -1.6));
    await leg("openingN->throughS", pt(0, 1.0));
    await leg("throughS->clearS", pt(0, 4.0));
    // shoulder circuit: E shoulder outside the wall, around, W shoulder
    await leg("clearS->eastShoulder", pt(5.8, 0.2));      // outside the E flank
    await leg("eastShoulder->eastN", pt(5.8, -2.0));
    await leg("eastN->northSpan", pt(0, -3.2));           // behind the N face mid-span
    await leg("northSpan->westN", pt(-5.8, -2.0));
    await leg("westN->westShoulder", pt(-5.8, 0.2));      // outside the W flank
    await leg("westShoulder->meridianS", pt(0, 3.0));     // back to the S approach line
    console.log(JSON.stringify({ status: "ALL_PASS", results }, null, 2));
} finally { agent.close(); }
