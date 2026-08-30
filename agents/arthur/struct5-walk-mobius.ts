// struct5-walk-mobius.ts — struct-5: MCPL walk gate for the Möbius
// Bandstand. YAW=0, so local == world. Legs: N approach -> stage rim ->
// stage center -> opposite rim -> out S. All inside the post ring (r5.5);
// stage disc r3.5.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -4.18, PZ = 39.78;
const pt = (x: number, z: number): [number, number] => [PX + x, PZ + z];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct5-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
async function leg(name: string, end: [number, number]) {
    const ok = await agent.walkTo(end[0], end[1], false, 25_000);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    results.push({ name, ok, dist: +dist.toFixed(3), y: +agent.pos.y.toFixed(2), end: end.map(v => +v.toFixed(2)) });
    if (!ok || dist > .55) throw Error(`${name} failed ok=${ok} dist=${dist}`);
}
try {
    await agent.connect(); await Bun.sleep(1700); agent.stop();
    const outside = pt(0, -7.5);
    agent.pos.x = outside[0]; agent.pos.z = outside[1]; agent.pos.y = agent.heightAt(...outside); await Bun.sleep(250);
    await leg("approach->stageRim", pt(0, -3.3));
    await leg("stageRim->center", pt(0, 0));
    await leg("center->oppositeRim", pt(0, 3.3));
    await leg("oppositeRim->outSouth", pt(0, 7.5));
    await leg("outSouth->stageRimW", pt(-3.3, 0));
    console.log(JSON.stringify({ status: "ALL_PASS", results }, null, 2));
} finally { agent.close(); }
