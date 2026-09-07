// city5-walk-reedpool.ts — city-5 walk circuit at the new reedpool+angler seat
// (9.723,-90.982) yaw 0 (local == world axes). Legs: S-axis transit BOTH
// directions (x=0, r56->r70 past the pool — walkX 1.50 < 3 owed this test),
// pool circuit at 3m stand-off, bridge crossing local z (deck runs along z),
// angler approach from open west.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = 9.723, PZ = -90.982;
const pt = (x: number, z: number): [number, number] => [PX + x, PZ + z];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-city5-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
async function leg(name: string, end: [number, number]) {
    const ok = await agent.walkTo(end[0], end[1], false, 20_000);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    results.push({ name, ok, dist: +dist.toFixed(3) });
    if (!ok || dist > .7) throw Error(`${name} failed ok=${ok} dist=${dist}`);
}
try {
    await agent.connect(); await Bun.sleep(1700); agent.stop();
    // start off the S axis r60 (clear ground S of the band)
    agent.pos.x = 0; agent.pos.z = -60; agent.pos.y = agent.heightAt(0, -60); await Bun.sleep(250);
    await leg("s-axis r60->r70 (N->S past pool)", [0, -70]);   // transit along x=0
    await leg("s-axis r70->r60 (S->N return)", [0, -60]);
    // pool circuit at ~3m stand-off (corners of the 10.374x8 rect + 3)
    await agent.pos.x !== undefined && Bun.sleep(100);
    agent.pos.x = PX - 8; agent.pos.z = PZ - 7; agent.pos.y = agent.heightAt(PX - 8, PZ - 7); await Bun.sleep(250);
    await leg("circuit sw->se", pt(8, -7));
    await leg("circuit se->ne", pt(8, 7));
    await leg("circuit ne->nw", pt(-8, 7));
    await leg("circuit nw->sw", pt(-8, -7));
    // bridge crossing (deck runs local z -3.5..3.5 at local x 0)
    await leg("onto bridge s-end", pt(0, -5));
    await leg("cross bridge -> n-end", pt(0, 5));
    await leg("recross bridge -> s-end", pt(0, -5));
    // angler approach from open west (deck at local x -6.5..-2.5 area)
    await leg("angler bench", pt(-5.5, 0));
    console.log(JSON.stringify({ status: "ALL_PASS", legs: results.length, results }, null, 1));
} finally { agent.close(); }
