// struct16-walk-waterstair.ts — struct-16: MCPL approach gate. YAW=0:
// local == world. Stair treads descend z 0..2.1 toward the shelf at z~2.85.
// The engine's non-standable trimesh class applies to the DESCENT (treads
// may not support a body below grade) — so the walk gate is the APPROACH
// and circumnavigation (the cheeks are solid furniture), not the descent.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = 0, PZ = -32;
const pt = (x: number, z: number): [number, number] => [PX + x, PZ + z];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct16-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
async function leg(name: string, end: [number, number]) {
    const ok = await agent.walkTo(end[0], end[1], false, 20_000);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    results.push({ name, ok, dist: +dist.toFixed(3) });
    if (!ok || dist > .7) throw Error(`${name} failed ok=${ok} dist=${dist}`);
}
try {
    await agent.connect(); await Bun.sleep(1700); agent.stop();
    const from = pt(0, -6);
    agent.pos.x = from[0]; agent.pos.z = from[1]; agent.pos.y = agent.heightAt(...from); await Bun.sleep(250);
    await leg("Nwalk->topSideE", pt(2.4, 0.6));
    await leg("topSideE->shelfSide", pt(2.4, 3.4));
    await leg("shelfSide->westSide", pt(-2.4, 1.8));
    await leg("westSide->back-to-walk", pt(-2.5, -4));
    console.log(JSON.stringify({ status: "ALL_PASS", results }, null, 2));
} finally { agent.close(); }
