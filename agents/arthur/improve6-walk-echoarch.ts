// improve6-walk-echoarch.ts — two-way MCPL walk through the echoarch
// throat: outside N → focus0 (local z=1) → mid-channel (z=4) → focus1
// (z=7) → outside S, and back. Proves the trimesh channel between the
// rebuilt fins is walkable at the exact live pose.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -18.5, PZ = 57.1, YAW = 5.027;
const c = Math.cos(YAW), s = Math.sin(YAW);
const w = (x: number, z: number): [number, number] => [PX + x * c + z * s, PZ - x * s + z * c];
const results: any[] = [];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-improve6-echoarch-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
async function leg(name: string, end: [number, number], tmo = 25_000) {
    const ok = await agent.walkTo(end[0], end[1], false, tmo);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    results.push({ name, ok, dist, end, arrived: [round(agent.pos.x), round(agent.pos.z)] });
    if (!ok || dist > 0.55) throw Error(`${name} failed ok=${ok} dist=${dist}`);
}
const round = (n: number) => Math.round(n * 1000) / 1000;
const outN = w(0, -2.5), f0 = w(0, 1), mid = w(0, 4), f1 = w(0, 7), outS = w(0, 10.5);
try {
    await agent.connect();
    await Bun.sleep(1700);
    agent.stop();
    agent.pos.x = outN[0]; agent.pos.z = outN[1]; agent.pos.y = agent.heightAt(...outN);
    await Bun.sleep(250);
    await leg("outsideN->focus0", f0);
await leg("focus0->mid", mid);
await leg("mid->focus1", f1);
await leg("focus1->outsideS", outS);
await leg("outsideS->focus1", f1);
await leg("focus1->mid", mid);
await leg("mid->focus0", f0);
await leg("focus0->outsideN", outN);
console.log(JSON.stringify({ walk: "ECHOARCH_THROAT_ALL_PASS", legs: results.length, maxArrival: Math.max(...results.map(r => r.dist)) }));
} finally { agent.close(); }
process.exit(0);
