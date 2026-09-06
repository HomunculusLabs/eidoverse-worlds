// improve17-walk-belltower.ts — improve-17 verification walk: approach the
// new ladder foot from the plaza side, both directions (2 legs x 2).
// Ladder foot world coords: entity (6.5, 6.5) yaw −3π/4, foot local
// (−0.75, 0.4, 1.10) → wx = 6.5 + (−0.75)(−√2/2) + 1.10(−√2/2) ≈ 6.253,
//// wz = 6.5 + 0.75(−√2/2)... — derived numerically below from the census
// transform (wx = px + lx·cos + lz·sin, wz = pz − lx·sin + lz·cos).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const POS = [6.5, 6.5] as const, YAW = -2.356194490192345;
const toWorld = (lx: number, lz: number): [number, number] => [
    POS[0] + lx * Math.cos(YAW) + lz * Math.sin(YAW),
    POS[1] - lx * Math.sin(YAW) + lz * Math.cos(YAW),
];
// ladder foot (stringer mid-base, on the climb plane)
const [fx, fz] = toWorld(-0.75, 1.10);
// approach waypoint on the plaza side of the ladder (3.5m out along the
// outward climb normal = local +z rotated)
const [ax, az] = toWorld(-0.75, 4.6);
const routes = [
    { name: "ladder-approach", pts: [[ax, az], [fx, fz]] as Array<[number, number]> },
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-improve17-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
async function leg(route: string, dir: string, i: number, end: [number, number]) {
    const ok = await agent.walkTo(end[0], end[1], false, 25_000);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    results.push({ route, dir, leg: i, ok, dist, end, arrived: [agent.pos.x, agent.pos.z] });
    if (!ok || dist > .55) throw Error(`${route} ${dir} leg${i} failed ok=${ok} dist=${dist}`);
}
try {
    await agent.connect(); await Bun.sleep(1700);
    console.log(JSON.stringify({ ladderFoot: [fx, fz], approachWaypoint: [ax, az] }));
    for (const r of routes) {
        agent.stop(); const start = r.pts[0];
        agent.pos.x = start[0]; agent.pos.z = start[1]; agent.pos.y = agent.heightAt(start[0], start[1]);
        await Bun.sleep(180);
        for (let i = 1; i < r.pts.length; i++) await leg(r.name, "out", i, r.pts[i]);
        for (let i = r.pts.length - 2; i >= 0; i--) await leg(r.name, "back", i, r.pts[i]);
    }
    console.log(JSON.stringify({ status: "ALL_PASS", routes: routes.map(r => r.name), legs: results.length, maxArrival: Math.max(...results.map(x => x.dist)), results }, null, 1));
} finally { agent.close(); }
