// struct10-walk-amphi.ts — struct-10: MCPL walk gate for the Hillside
// Theater. YAW=0: local == world. Stage disc at local z +5.24; rows at
// z 0..-7.6 (row 0 nearest stage); aisles at local x ±... segments span
// x -6.65..+8.05 hmm — aisles at the three 0.7m gaps. Legs: approach
// from stage side -> stand on stage -> row 0 seat lane -> climb aisle to
// row 2 -> crown mast row 4 -> back out.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -23.32, PZ = 37.31;
const pt = (x: number, z: number): [number, number] => [PX + x, PZ + z];
// aisle centers: segments start at -7 + 0.35; aisle gaps at x ≈ -3.5, 0.35, 4.2 (approx from builder: -LEN/2+aisle/2 + s*(segW+aisle) + segW => gaps between segments at -6.65+3.5=-3.15, 0.35, 3.85)
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct10-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
async function leg(name: string, end: [number, number]) {
    const ok = await agent.walkTo(end[0], end[1], false, 20_000);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    results.push({ name, ok, dist: +dist.toFixed(3) });
    if (!ok || dist > .7) throw Error(`${name} failed ok=${ok} dist=${dist}`);
}
try {
    await agent.connect(); await Bun.sleep(1700); agent.stop();
    const from = pt(0, 9.5);
    agent.pos.x = from[0]; agent.pos.z = from[1]; agent.pos.y = agent.heightAt(...from); await Bun.sleep(250);
    await leg("approach->stage", pt(0, 5.24));
    await leg("stage->row0front", pt(0, 0.9));
    await leg("row0front->aisleR2", pt(0.35, -3.8));
    await leg("aisleR2->crownR4", pt(0.35, -7.4));
    await leg("crownR4->exit", pt(0, -10.5));
    console.log(JSON.stringify({ status: "ALL_PASS", results }, null, 2));
} finally { agent.close(); }
