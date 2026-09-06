// struct43-walk-amphi.ts — struct-43: MCPL walk circuit for the stepped
// bowl. YAW=0 so local == world. 10 legs: mouth->stage, stage->east
// outside the bowl, swing NE (outside tier-5 face r8.01), to the grand
// flight toe, UP the 16-tread flight (0.165 rises), DOWN the channel
// quarter-treads (0.11 rises), sideways onto the tier-1 ring, ring->
// orchestra over the kerb, out the south mouth.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -23.32, PZ = 37.31;
const pt = (x: number, z: number): [number, number] => [PX + x, PZ + z];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct43-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
async function leg(name: string, end: [number, number]) {
    const ok = await agent.walkTo(end[0], end[1], false, 20_000);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    results.push({ name, ok, dist: +dist.toFixed(3) });
    if (!ok || dist > .7) throw Error(`${name} failed ok=${ok} dist=${dist}`);
}
try {
    await agent.connect(); await Bun.sleep(1700); agent.stop();
    const from = pt(0, 9.0);
    agent.pos.x = from[0]; agent.pos.z = from[1]; agent.pos.y = agent.heightAt(...from); await Bun.sleep(250);
    await leg("mouth->stage", pt(0, 5.24));
    await leg("stage->east", pt(4.6, 7.6));
    await leg("east->swingout", pt(8.6, 4.6));
    await leg("swingout->NE", pt(6.8, -1.5));
    await leg("NE->flightToe", pt(0, -6.95));
    await leg("flightToe->crown", pt(0, -3.05));
    await leg("crown->channelT1", pt(0, 2.0));
    await leg("channelT1->tier1ring", pt(1.7, 2.6));
    await leg("tier1ring->orchestra", pt(0, 4.0));
    await leg("orchestra->out", pt(0, 8.6));
    console.log(JSON.stringify({ status: "ALL_PASS", results }, null, 2));
} finally { agent.close(); }
