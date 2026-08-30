// struct2-walk-observatory.ts — struct-2: real MCPL two-way door gate for
// the Observatory. Legs: outside -> inside (through the door), inside ->
// bench ring, back, inside -> outside. Fail on !ok or arrival > 0.55m.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = 16.48, PZ = -40.8, YAW = -0.3838824615170976, c = Math.cos(YAW), s = Math.sin(YAW);
const world = (x: number, z: number): [number, number] => [PX + x * c + z * s, PZ - x * s + z * c];
// door is local +Z; walk lane: 5m out -> 1m inside -> bench rim (r2.0) ->
// opposite side -> back out through the door.
const pts = { outside: world(0, 5.0), threshold: world(0, 3.3), inside: world(0, 1.0), bench: world(-1.4, -1.4), far: world(0, -2.0) };
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct2-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
async function leg(name: string, end: [number, number]) {
    const start: [number, number] = [agent.pos.x, agent.pos.z];
    const ok = await agent.walkTo(end[0], end[1], false, 25_000);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    results.push({ name, ok, dist: +dist.toFixed(3), start: start.map(v => +v.toFixed(2)), end: end.map(v => +v.toFixed(2)) });
    if (!ok || dist > .55) throw Error(`${name} failed ok=${ok} dist=${dist}`);
}
try {
    await agent.connect(); await Bun.sleep(1700); agent.stop();
    agent.pos.x = pts.outside[0]; agent.pos.z = pts.outside[1]; agent.pos.y = agent.heightAt(...pts.outside); await Bun.sleep(250);
    await leg("outside→inside", pts.inside);
    await leg("inside→bench", pts.bench);
    await leg("bench→far", pts.far);
    await leg("far→inside", pts.inside);
    await leg("inside→outside", pts.outside);
    console.log(JSON.stringify({ status: "ALL_PASS", results }, null, 2));
} finally { agent.close(); }
