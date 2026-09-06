// improve14-walk-shrine.ts — 8-leg MCPL approach walk for nx-town-shrine
// after the improve-14 re-place: four compass approach rays, each walked
// IN to the altar ring and back OUT (two-way). Proves the approach lanes
// stay walkable at the exact live pose (falsification clause 5).
// NOTE: chassis uses close() (kills auto-reconnect); disconnect() does not
// exist — improve13's finally-catch silently swallowed that. Hard exit so a
// lingering socket can never hang the tick.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -25, PZ = -4, YAW = 1.4118119548622732;
const c = Math.cos(YAW), s = Math.sin(YAW);
const w = (x: number, z: number): [number, number] => [PX + x * c + z * s, PZ - x * s + z * c];
const results: any[] = [];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-improve14-shrine-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
async function leg(name: string, end: [number, number], tmo = 20_000) {
    const ok = await agent.walkTo(end[0], end[1], false, tmo);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    results.push({ name, ok, dist });
    console.log(`leg ${name}: ok=${ok} dist=${dist.toFixed(3)}`);
    if (!ok || dist > 0.55) throw Error(`${name} failed ok=${ok} dist=${dist}`);
}
const rays: Array<[string, number, number]> = [
    ["bench-side", 0, 3.5], ["west", -3.5, 0], ["east", 3.5, 0], ["back", 0, -3.5],
];
let exitCode = 0;
try {
    console.log("connecting...");
    await agent.connect();
    console.log("connected, settling");
    await Bun.sleep(1700);
    agent.stop();
    for (const [nm, lx, lz] of rays) {
        const near = w(lx, lz), far = w(lx * 1.9, lz * 1.9);
        agent.pos.x = far[0]; agent.pos.z = far[1]; agent.pos.y = agent.heightAt(...far);
        await Bun.sleep(250);
        await leg(`${nm}-in`, near);
        await leg(`${nm}-out`, far);
    }
    console.log(JSON.stringify({ status: "ALL_PASS", legs: results.length, maxArrival: Math.max(...results.map(r => r.dist)) }));
} catch (e: any) {
    console.log(JSON.stringify({ status: "FAIL", legs: results, error: String(e.message ?? e) }));
    exitCode = 1;
} finally {
    agent.close();
    process.exit(exitCode);
}
