// improve12-walk-stable.ts — two-way MCPL walk through the stable's NEW
// road-side livery door (improve-11 contract falsification 3): outside
// stoop → door → interior center → open-front yard, and back. Proves the
// new door lane + aisle are walkable at the exact live pose after the
// improve-12 re-place.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = 43, PZ = 0, YAW = -1.5707963267948966;
const c = Math.cos(YAW), s = Math.sin(YAW);
const w = (x: number, z: number): [number, number] => [PX + x * c + z * s, PZ - x * s + z * c];
const results: any[] = [];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-improve12-stable-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
async function leg(name: string, end: [number, number], tmo = 25_000) {
    const ok = await agent.walkTo(end[0], end[1], false, tmo);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    results.push({ name, ok, dist, end, arrived: [round(agent.pos.x), round(agent.pos.z)] });
    if (!ok || dist > 0.55) throw Error(`${name} failed ok=${ok} dist=${dist}`);
}
const round = (n: number) => Math.round(n * 1000) / 1000;
// local coords: door at x -1.35 (aisle x -2.0..-0.7), stoop z 2.5, open front z -2.1
const outS = w(-1.35, 3.6), door = w(-1.35, 2.5), mid = w(-1.35, 0.8), yard = w(-1.35, -2.9);
try {
    console.log("connecting...");
    await agent.connect();
    console.log("connected, settling");
    await Bun.sleep(1700);
    agent.stop();
    agent.pos.x = outS[0]; agent.pos.z = outS[1]; agent.pos.y = agent.heightAt(...outS);
    await Bun.sleep(250);
    await leg("outside->door", door);
    console.log("leg1 ok");
    await leg("door->center", mid);
    console.log("leg2 ok");
    await leg("center->yard", yard);
    console.log("leg3 ok");
    await leg("yard->center", mid);
    await leg("center->door", door);
    await leg("door->outside", outS);
    console.log(JSON.stringify({ status: "ALL_PASS", legs: results.length, maxArrival: Math.max(...results.map(r => r.dist)) }));
} catch (e: any) {
    console.log(JSON.stringify({ status: "FAIL", legs: results, error: String(e.message ?? e) }));    process.exitCode = 1;
} finally {
    try { await agent.disconnect(); } catch {}
}
