// struct11-walk-beacon.ts — struct-11: MCPL approach gate for the East
// Beacon. RE-PINNED city-9 (sweep-77 Sev-3): seat moved by city-7 to
// (60.911,-66.764) yaw -30deg [square tower, rotationally symmetric].
// Furniture-solid tower — approach to 2.2m, circle the base. Legs:
// E approach -> base E -> base N -> base W -> leave.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = 60.911, PZ = -66.764, YAW = -30 * Math.PI / 180, c = Math.cos(YAW), s = Math.sin(YAW);
const pt = (x: number, z: number): [number, number] => [PX + x * c + z * s, PZ - x * s + z * c];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct11-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
async function leg(name: string, end: [number, number]) {
    const ok = await agent.walkTo(end[0], end[1], false, 20_000);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    results.push({ name, ok, dist: +dist.toFixed(3) });
    if (!ok || dist > .7) throw Error(`${name} failed ok=${ok} dist=${dist}`);
}
try {
    await agent.connect(); await Bun.sleep(1700); agent.stop();
    const from = pt(7, 3);
    agent.pos.x = from[0]; agent.pos.z = from[1]; agent.pos.y = agent.heightAt(...from); await Bun.sleep(250);
    await leg("approach->baseSE", pt(2.2, 2.2));
    await leg("baseSE->baseN", pt(0, -2.2));
    await leg("baseN->baseW", pt(-2.2, 0));
    await leg("baseW->leave", pt(-6, 4));
    console.log(JSON.stringify({ status: "ALL_PASS", results }, null, 2));
} finally { agent.close(); }
