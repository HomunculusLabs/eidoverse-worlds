// struct47-walk-meridianstair.ts — struct-47: MCPL walk gate for the
// Meridian Stair portal. yaw 3.037 ≈ local +Z along the outward radial.
// Transform: wx = px + lx·cos(yaw) + lz·sin(yaw), wz = pz − lx·sin(yaw) + lz·cos(yaw).
// Legs: village-side approach → near lane mouth → mid-lane (UNDER panel 0,
// the lowest) → far mouth → out; then re-enter far→near (two-way).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = 5.7, PZ = -54.7, YAW = 3.037;
const cs = Math.cos(YAW), sn = Math.sin(YAW);
const pt = (lx: number, lz: number): [number, number] => [PX + lx * cs + lz * sn, PZ - lx * sn + lz * cs];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct47-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
async function leg(name: string, end: [number, number]) {
    const ok = await agent.walkTo(end[0], end[1], false, 20_000);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    results.push({ name, ok, dist: +dist.toFixed(3) });
    if (!ok || dist > .6) throw Error(`${name} failed ok=${ok} dist=${dist}`);
}
try {
    await agent.connect(); await Bun.sleep(1700); agent.stop();
    // village-side approach: local -Z direction from the portal, ~8m out
    const from = pt(0, -8);
    agent.pos.x = from[0]; agent.pos.z = from[1]; agent.pos.y = agent.heightAt(...from); await Bun.sleep(250);
    await leg("approach->nearMouth", pt(0, -2.6));
    await leg("nearMouth->midLane", pt(0, 0));        // under lowest panel
    await leg("midLane->farMouth", pt(0, 2.6));
    await leg("farMouth->outFar", pt(0, 5.0));
    await leg("outFar->farMouth", pt(0, 2.6));        // re-enter (two-way)
    await leg("farMouth->nearMouth", pt(0, -2.6));
    console.log(JSON.stringify({ status: "ALL_PASS", results }, null, 2));
} finally { agent.close(); }
