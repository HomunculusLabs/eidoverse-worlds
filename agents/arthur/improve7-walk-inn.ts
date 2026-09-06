// improve7-walk-inn.ts — two-way MCPL walk through the inn: outside front →
// door → interior center → interior back, and back. Proves the door lane is
// walkable at the exact live pose after the improve-7 re-place.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = 36, PZ = 0, YAW = -1.5707963267948966;
const c = Math.cos(YAW), s = Math.sin(YAW);
const w = (x: number, z: number): [number, number] => [PX + x * c + z * s, PZ - x * s + z * c];
const results: any[] = [];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-improve7-inn-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
async function leg(name: string, end: [number, number], tmo = 25_000) {
    const ok = await agent.walkTo(end[0], end[1], false, tmo);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    results.push({ name, ok, dist, end, arrived: [round(agent.pos.x), round(agent.pos.z)] });
    if (!ok || dist > 0.55) throw Error(`${name} failed ok=${ok} dist=${dist}`);
}
const round = (n: number) => Math.round(n * 1000) / 1000;
const outF = w(0, 4.5), door = w(0, 2.9), mid = w(0, 0), back = w(0, -2);
try {
    await agent.connect();
    await Bun.sleep(1700);
    agent.stop();
    agent.pos.x = outF[0]; agent.pos.z = outF[1]; agent.pos.y = agent.heightAt(...outF);
    await Bun.sleep(250);
    await leg("outside->door", door);
    await leg("door->center", mid);
    await leg("center->back", back);
    await leg("back->center", mid);
    await leg("center->door", door);
    await leg("door->outside", outF);
    console.log(JSON.stringify({ status: "ALL_PASS", legs: results.length, maxArrival: Math.max(...results.map(r => r.dist)) }));
} catch (e: any) {
    console.log(JSON.stringify({ status: "FAIL", legs: results, error: String(e.message ?? e) }));
    process.exitCode = 1;
} finally {
    try { await agent.disconnect(); } catch {}
}
