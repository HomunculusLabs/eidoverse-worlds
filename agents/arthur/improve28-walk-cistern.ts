// improve28-walk-cistern.ts — two-way MCPL approach walk for nx-cistern after
// the improve-28 reseat (lib 156b4fc8, water raised; footprint decode-identical
// so no new obstruction is possible — this proves the approach lanes live).
// Legs: west approach (two-way, ends 1.3m from tank center on the open side)
// + bakery-court lane pass at x≈12 (3.7m west of the cistern).
// Chassis: improve23-walk-hamlet.ts (pos-assign + heightAt; hard exit).
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const results: any[] = [];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-improve28-cistern-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
async function leg(name: string, end: [number, number], tmo = 20_000) {
    const ok = await agent.walkTo(end[0], end[1], false, tmo);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    results.push({ name, ok, dist: +dist.toFixed(3) });
    console.log(`leg ${name}: ok=${ok} dist=${dist.toFixed(3)}`);
    if (!ok || dist > 0.55) throw Error(`${name} failed ok=${ok} dist=${dist}`);
}
const legs: Array<[string, number, number]> = [
    ["west-approach-in", 14.90, -15.62],   // 1.3m from tank center, open (lid-less) side
    ["west-approach-out", 11.71, -18.47],  // back out along the approach ray
    ["court-lane-pass", 12.0, -12.0],      // bakery-court lane, 3.7m clear of the cistern
];
let exitCode = 0;
try {
    console.log("connecting...");
    await agent.connect();
    console.log("connected, settling");
    await Bun.sleep(1700);
    agent.stop();
    const [n0, x0, z0] = legs[0];
    agent.pos.x = x0; agent.pos.z = z0; agent.pos.y = agent.heightAt(x0, z0);
    for (const [nm, x, z] of legs) await leg(nm, [x, z]);
    console.log("WALK ALL_PASS", JSON.stringify(results));
} catch (e: any) {
    console.error("WALK FAIL", e.message, JSON.stringify(results));
    exitCode = 1;
} finally {
    try { agent.close(); } catch {}
}
process.exit(exitCode);
