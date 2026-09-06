// struct39-walk-spiralfolly.ts — struct-39: MCPL circuit-walk gate for
// the rebuilt Spiral Stair Folly. YAW=0: world == local. The folly is
// circled, not entered (solid core by design — the struct-20 interior
// walk is superseded by this perimeter circuit). Legs: approach from the
// pendulum path (SW of the folly), full circuit at r~4.6 through all
// four compass points, return to the approach.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = 46.11396867937201, PZ = 33.50375938067097, R = 4.6;
const pts: Record<string, [number, number]> = {
    approach: [PX - R, PZ - R],        // from the pendulum path side (SW)
    south:   [PX, PZ + R],
    east:    [PX + R, PZ],
    north:   [PX, PZ - R],
    west:    [PX - R, PZ],
    back:    [PX - R, PZ - R],         // return toward the path
};
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct39-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
async function leg(name: string, end: [number, number]) {
    const ok = await agent.walkTo(end[0], end[1], false, 20_000);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    results.push({ name, ok, dist: +dist.toFixed(3) });
    if (!ok || dist > .55) throw Error(`${name} failed ok=${ok} dist=${dist}`);
}
try {
    await agent.connect(); await Bun.sleep(1700); agent.stop();
    agent.pos.x = pts.approach[0]; agent.pos.z = pts.approach[1]; agent.pos.y = agent.heightAt(...pts.approach); await Bun.sleep(250);
    await leg("approach->south", pts.south);
    await leg("south->east", pts.east);
    await leg("east->north", pts.north);
    await leg("north->west", pts.west);
    await leg("west->back", pts.back);
    console.log(JSON.stringify({ status: "ALL_PASS", results }, null, 2));
} finally { agent.close(); }
