// improve29-walk-welcome.ts — two-way MCPL approach walk for nx-welcome after
// the improve-29 reseat (lib 7d1bd0c9, arms re-radiated from the post + name
// bar; envelope strict-subset of live bbox so no new obstruction is possible —
// this proves the approach lanes live). The sign stands 3m SSW of plaza spawn
// facing the hearth; legs walk the spawn-side approach both ways + a plaza-rim
// pass. Chassis: improve28-walk-cistern.ts (pos-assign + heightAt; hard exit).
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const results: any[] = [];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-improve29-welcome-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
async function leg(name: string, end: [number, number], tmo = 20_000) {
    const ok = await agent.walkTo(end[0], end[1], false, tmo);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    results.push({ name, ok, dist: +dist.toFixed(3) });
    console.log(`leg ${name}: ok=${ok} dist=${dist.toFixed(3)}`);
    if (!ok || dist > 0.55) throw Error(`${name} failed ok=${ok} dist=${dist}`);
}
// nx-welcome at (-3, 0, -4.3) yaw 0.6092 (board faces +z-ish toward plaza).
// Approach from plaza spawn side (NE of the sign).
const legs: Array<[string, number, number]> = [
    ["spawn-approach-in", -2.0, -2.0],    // 2.4m NE of the sign, spawn-side
    ["spawn-approach-out", -0.5, 0.5],    // back toward plaza center
    ["rim-pass-east", 1.5, -4.3],         // plaza S-rim lane, 4.5m east of the sign
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
