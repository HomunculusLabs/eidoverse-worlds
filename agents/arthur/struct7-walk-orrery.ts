// struct7-walk-orrery.ts — struct-7: MCPL approach gate for the Orrery.
// Walk to the plinth rim from the plaza side, circle it, verify no phantom
// collider blocks the approach (furniture-scale solid box should stop the
// body AT the rim, not before).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = 9.19, PZ = -36.87;
const pt = (x: number, z: number): [number, number] => [PX + x, PZ + z];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct7-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
async function leg(name: string, end: [number, number], expectArrive = true) {
    const ok = await agent.walkTo(end[0], end[1], false, 20_000);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    const arrived = dist <= 0.9;
    results.push({ name, ok, dist: +dist.toFixed(3), arrived });
    if (!ok) throw Error(`${name} walk failed ok=${ok}`);
    if (expectArrive && !arrived) throw Error(`${name} blocked ${dist}m short — phantom collider?`);
}
try {
    await agent.connect(); await Bun.sleep(1700); agent.stop();
    const from = pt(-6, 8);
    agent.pos.x = from[0]; agent.pos.z = from[1]; agent.pos.y = agent.heightAt(...from); await Bun.sleep(250);
    await leg("plaza->rimS", pt(0, 2.3));          // should arrive at rim
    await leg("rimS->aroundW", pt(-2.3, 0));        // circle to west face
    await leg("aroundW->aroundN", pt(0, -2.3));     // circle to north face
    await leg("aroundN->rimE", pt(2.3, 0));         // to east face
    await leg("rimE->back-to-plaza", pt(-4, 5));    // leave
    console.log(JSON.stringify({ status: "ALL_PASS", results }, null, 2));
} finally { agent.close(); }
