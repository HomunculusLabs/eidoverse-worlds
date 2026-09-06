// struct45-walk-soundmirror.ts — struct-45: MCPL walk circuit for the
// true-bowl rebuild at the EXACT standing tuple (28.7, -18) yaw 0 —
// local == world axes. Six legs around the instrument: approach from
// the NW walk, three rim-adjacent points, the listening position just
// off the plinth edge facing the crown, and the far-side exits. The
// bowl is furniture-solid (fixed instrument) — the circuit proves the
// seat stays walkable all around, as in struct-31.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = 28.7, PZ = -18;
const pt = (x: number, z: number): [number, number] => [PX + x, PZ + z];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct45-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
async function leg(name: string, end: [number, number]) {
    const ok = await agent.walkTo(end[0], end[1], false, 20_000);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    results.push({ name, ok, dist: +dist.toFixed(3) });
    if (!ok || dist > .7) throw Error(`${name} failed ok=${ok} dist=${dist}`);
}
try {
    await agent.connect(); await Bun.sleep(1700); agent.stop();
    const from = pt(-4.5, 1.5); // NW walk approach
    agent.pos.x = from[0]; agent.pos.z = from[1]; agent.pos.y = agent.heightAt(...from); await Bun.sleep(250);
    await leg("nw->west", pt(-2.75, 0));
    await leg("west->north", pt(0, -2.75));
    await leg("north->east", pt(2.75, 0));
    await leg("east->listen", pt(0, 2.6)); // listening position at the rim, face the crown
    await leg("listen->south", pt(0, 2.75));
    await leg("south->out", pt(4.5, 4.0));
    console.log(JSON.stringify({ status: "ALL_PASS", results }, null, 2));
} finally { agent.close(); }
