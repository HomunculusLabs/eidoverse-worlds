// struct9-walk-pendulum.ts — struct-9: MCPL approach gate for the Pendulum
// Wave. YAW=0: local == world. Row spans x -4..+4; swing plane is Z.
// Legs: plaza approach -> front of frame -> step under the cross-arc
// between posts? NO — solid collider expected: walk to 1.5m front, sweep
// along the front, around the east post, along the back.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = 25.01, PZ = 25.9;
const pt = (x: number, z: number): [number, number] => [PX + x, PZ + z];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct9-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
async function leg(name: string, end: [number, number]) {
    const ok = await agent.walkTo(end[0], end[1], false, 20_000);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    results.push({ name, ok, dist: +dist.toFixed(3) });
    if (!ok || dist > .6) throw Error(`${name} failed ok=${ok} dist=${dist}`);
}
try {
    await agent.connect(); await Bun.sleep(1700); agent.stop();
    const from = pt(-3, -8);
    agent.pos.x = from[0]; agent.pos.z = from[1]; agent.pos.y = agent.heightAt(...from); await Bun.sleep(250);
    await leg("approach->frontW", pt(-2.5, -2.6));
    await leg("frontW->frontMid", pt(0, -2.6));
    await leg("frontMid->frontE", pt(2.5, -2.6));
    await leg("frontE->aroundE", pt(5.6, 0));
    await leg("aroundE->backMid", pt(0, 2.6));
    console.log(JSON.stringify({ status: "ALL_PASS", results }, null, 2));
} finally { agent.close(); }
