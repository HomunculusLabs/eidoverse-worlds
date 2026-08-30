// struct4-walk-hypar.ts — struct-4: MCPL walk gate for the Hypar Pavilion.
// YAW = pi/2 rotates local +X (crest axis) to world -Z... verify: world =
// [PX + x*cos + z*sin, PZ - x*sin + z*cos]; with yaw=pi/2: world x = PX + z,
// world z = PZ - x. So local +X -> world -Z (toward plaza/gate road), and
// local +Z (crest side) -> world +X. Legs: road approach -> center ->
// across deck along road axis -> back out both crest sides.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -27.57, PZ = 4.86, YAW = Math.PI / 2, c = Math.cos(YAW), s = Math.sin(YAW);
const world = (x: number, z: number): [number, number] => [PX + x * c + z * s, PZ - x * s + z * c];
const pts = {
    roadIn: world(4.5, 0),      // 4.5m along local +X = 4.5m world -Z (from road side)
    center: world(0, 0),
    crestE: world(0, 4.0),      // crest side +Z -> world +X
    crestW: world(0, -4.0),
    deckFar: world(-4.0, 0),
};
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct4-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
async function leg(name: string, end: [number, number]) {
    const ok = await agent.walkTo(end[0], end[1], false, 25_000);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    results.push({ name, ok, dist: +dist.toFixed(3), y: +agent.pos.y.toFixed(2), end: end.map(v => +v.toFixed(2)) });
    if (!ok || dist > .55) throw Error(`${name} failed ok=${ok} dist=${dist}`);
}
try {
    await agent.connect(); await Bun.sleep(1700); agent.stop();
    agent.pos.x = pts.roadIn[0]; agent.pos.z = pts.roadIn[1]; agent.pos.y = agent.heightAt(...pts.roadIn); await Bun.sleep(250);
    await leg("roadIn->center", pts.center);
    await leg("center->crestE", pts.crestE);
    await leg("crestE->crestW", pts.crestW);
    await leg("crestW->deckFar", pts.deckFar);
    await leg("deckFar->roadIn", pts.roadIn);
    console.log(JSON.stringify({ status: "ALL_PASS", results }, null, 2));
} finally { agent.close(); }
