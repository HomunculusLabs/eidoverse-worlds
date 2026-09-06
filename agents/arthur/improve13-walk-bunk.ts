// improve13-walk-bunk.ts — two-way MCPL walk through the bunkhouse's
// centered entry door (improve-13 falsification): outside stoop → door →
// interior center → west bunk row approach, and back out. Proves the door
// lane + interior aisle are walkable at the exact live pose after the
// improve-13 re-place. Bunks sit on the WEST wall (local x −2.88) — the
// x=0 door aisle is clear of them by design.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -9, PZ = -26, YAW = 0.31322457341772525;
const c = Math.cos(YAW), s = Math.sin(YAW);
const w = (x: number, z: number): [number, number] => [PX + x * c + z * s, PZ - x * s + z * c];
const results: any[] = [];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-improve13-bunk-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
async function leg(name: string, end: [number, number], tmo = 25_000) {
    const ok = await agent.walkTo(end[0], end[1], false, tmo);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    results.push({ name, ok, dist, end, arrived: [round(agent.pos.x), round(agent.pos.z)] });
    if (!ok || dist > 0.55) throw Error(`${name} failed ok=${ok} dist=${dist}`);
}
const round = (n: number) => Math.round(n * 1000) / 1000;
// local coords: door centered x 0, opening z 1.9; interior center (0, 0);
// bunk-row approach x −1.6 (clear of beds at x −2.88 by 0.5m)
const outS = w(0, 3.6), door = w(0, 2.5), mid = w(0, 0.8), bunks = w(-1.6, 0.2);
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
    await leg("center->bunkrow", bunks);
    console.log("leg3 ok");
    await leg("bunkrow->center", mid);
    await leg("center->door", door);
    await leg("door->outside", outS);
    console.log(JSON.stringify({ status: "ALL_PASS", legs: results.length, maxArrival: Math.max(...results.map(r => r.dist)) }));
} catch (e: any) {
    console.log(JSON.stringify({ status: "FAIL", legs: results, error: String(e.message ?? e) }));    process.exitCode = 1;
} finally {
    try { await agent.disconnect(); } catch {}
}
