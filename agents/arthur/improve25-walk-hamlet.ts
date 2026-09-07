// improve25-walk-hamlet.ts — two-way MCPL approach walk for nx-craft-hamlet-0028
// after the improve-25 reseat (lib 44d78463, fixed wall heights). The 3-cottage
// green has gaps between cottages; approach legs target the green center and
// three inter-cottage gaps derived from the actual 0028 floor centers
// (4.037,2.205) / (-3.928,2.393) / (-0.109,-4.599), each walked IN then back
// OUT (two-way). Proves the approach lanes stay walkable at the exact live
// pose with the corrected walls. Chassis: improve24-walk-hamlet.ts.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = 65.396745, PZ = 58.883493, YAW = -2.35619449;
const c = Math.cos(YAW), s = Math.sin(YAW);
const w = (x: number, z: number): [number, number] => [PX + x * c + z * s, PZ - x * s + z * c];
const results: any[] = [];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-improve25-hamlet-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
async function leg(name: string, end: [number, number], tmo = 20_000) {
    const ok = await agent.walkTo(end[0], end[1], false, tmo);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    results.push({ name, ok, dist: +dist.toFixed(3) });
    console.log(`leg ${name}: ok=${ok} dist=${dist.toFixed(3)}`);
    if (!ok || dist > 0.55) throw Error(`${name} failed ok=${ok} dist=${dist}`);
}
// local-frame targets: green center (well/firepit) + three inter-cottage gaps
const rays: Array<[string, number, number]> = [
    ["green-center", 0, 0],
    ["gap-n", 0.06, 2.3],     // between cottages 0 and 1
    ["gap-sw", -2.02, -1.11], // between cottages 1 and 2
    ["gap-s", -0.11, -6.0],   // south of cottage 2
];
let exitCode = 0;
try {
    console.log("connecting...");
    await agent.connect();
    console.log("connected, settling");
    await Bun.sleep(1700);
    agent.stop();
    for (const [nm, lx, lz] of rays) {
        const near = w(lx, lz), far = w(lx * 2.2, lz * 2.2); // far = ~2.2x radius, outside the footprint
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
