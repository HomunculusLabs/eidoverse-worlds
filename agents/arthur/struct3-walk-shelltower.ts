// struct3-walk-shelltower.ts — struct-3: MCPL climb gate for the Shell
// Tower. Legs: approach -> first turn (y~1.8) -> second turn (y~4.4) ->
// crown (y~7.3) -> down. Waypoints from the spiralRamp parametrization:
// phi(t) = t*2.25*2pi, r(t) = 3.4*(0.6/3.4)^t, y(t) = 0.42 + 6.83t.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -2.65, PZ = -37.91, YAW = 0.06978887730267769, c = Math.cos(YAW), s = Math.sin(YAW);
const TURNS = 2.25, R0 = 3.4, R1 = 0.6, Y0 = 0.42, Y1 = 7.25;
const world = (x: number, z: number): [number, number] => [PX + x * c + z * s, PZ - x * s + z * c];
const pt = (t: number, off = 0): [number, number] => {
    const phi = (t * TURNS * 2 * Math.PI) + off;
    const r = R0 * Math.pow(R1 / R0, t);
    return world(r * Math.sin(phi), r * Math.cos(phi));
};
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct3-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
async function leg(name: string, end: [number, number]) {
    const start: [number, number] = [agent.pos.x, agent.pos.z];
    const ok = await agent.walkTo(end[0], end[1], false, 25_000);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    results.push({ name, ok, dist: +dist.toFixed(3), y: +agent.pos.y.toFixed(2), end: end.map(v => +v.toFixed(2)) });
    if (!ok) throw Error(`${name} failed ok=${ok} dist=${dist}`);
}
try {
    await agent.connect(); await Bun.sleep(1700); agent.stop();
    const approach = world(0, 5.5);
    agent.pos.x = approach[0]; agent.pos.z = approach[1]; agent.pos.y = agent.heightAt(...approach); await Bun.sleep(250);
    await leg("approach->t0.25", pt(0.25));
    await leg("t0.25->t0.5", pt(0.5));
    await leg("t0.5->t0.75", pt(0.75));
    await leg("t0.75->crown", pt(0.97));
    console.log(JSON.stringify({ status: "CLIMB_PASS", results }, null, 2));
} finally { agent.close(); }
