// struct14-walk-skene.ts — struct-14: MCPL stage->skene gate.
// RE-PINNED city-10 (2026-09-07): skene relocated to (8.258,78.567) yaw
// 186deg (CITY-PLAN register row EXECUTED, SWEEP-77 vacated-tool class).
// Old seat (-23.32,48.05) yaw pi is VACATED — a run there passes vacuously.
// New circuit = audience clearing -> niche face -> along wall front ->
// behind wall -> back. Transform yaw 186deg: wx=PX+lx*cos+lz*sin,
// wz=PZ-lx*sin+lz*cos; niche/stage face at local +z (radially inward).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = 8.258, PZ = 78.567, YAW = 186 * Math.PI / 180;
const C = Math.cos(YAW), S = Math.sin(YAW);
const pt = (x: number, z: number): [number, number] => [PX + x * C + z * S, PZ - x * S + z * C];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct14-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
async function leg(name: string, end: [number, number]) {
    const ok = await agent.walkTo(end[0], end[1], false, 20_000);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    results.push({ name, ok, dist: +dist.toFixed(3) });
    if (!ok || dist > .7) throw Error(`${name} failed ok=${ok} dist=${dist}`);
}
try {
    await agent.connect(); await Bun.sleep(1700); agent.stop();
    // start in the audience clearing ~6m in front of the niche face (local +z)
    const from = pt(0, 7.3);
    agent.pos.x = from[0]; agent.pos.z = from[1]; agent.pos.y = agent.heightAt(...from); await Bun.sleep(250);
    await leg("clearing->wallFront", pt(0, 1.3));   // 1.3m in front of the niche face
    await leg("wallFront->westEnd", pt(4.2, 1.6));  // along the wall front (local -x at yaw 186 is world +x/west-ward)
    await leg("westEnd->behindWall", pt(0, -1.3));  // 1.3m behind the back face
    await leg("behindWall->back-to-clearing", from);
    console.log(JSON.stringify({ status: "ALL_PASS", results }, null, 2));
} finally { agent.close(); }
