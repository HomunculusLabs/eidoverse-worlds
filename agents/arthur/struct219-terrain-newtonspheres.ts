// struct219-terrain-newtonspheres.ts — read-only terrain preflight at the
// FINAL seat from struct219-scan: az94.0 r430.0, pos x = 430·cos94° =
// -29.995283, z = 430·sin94° = 428.952541. Newtonspheres envelope
// (struct218-decode ALL PASS 9/9, re-run this tick): 10.000x5.519x10.000 DISC,
// dais r 5.0 exact, min y 0. The footprint is a DISC — yaw-independent — so
// sample center + 8 rim points at r 5.0 (carry contract: 5pt + center
// minimum). PY = lowest (morley/lunes/oloid/sphericon class: cradle embed
// absorbs the spread).
// Chassis: struct217-terrain-sphericon.ts (proven) — WorldAgent OBJECT form.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -29.995283, PZ = 428.952541; // az94.0 r430.0 (struct219-scan corridor)
const R = 5.0;                          // dais radius (decode D2 exact)
const pts: [string, number, number][] = [["center", PX, PZ]];
for (let k = 0; k < 8; k++) {
    const a = (k / 8) * 2 * Math.PI;
    pts.push([`rim${k * 45}`, PX + R * Math.cos(a), PZ + R * Math.sin(a)]);
}
const agent = new WorldAgent({
    url: cfg.url, name: cfg.name, world: "commons-next",
    avatar: cfg.avatar ?? "explorer", agentToken: cfg.agentToken,
});
await agent.connect();
let lo = Infinity, hi = -Infinity;
for (const [n, wx, wz] of pts) {
    const h = await agent.heightAt(wx, wz);
    lo = Math.min(lo, h); hi = Math.max(hi, h);
    console.log(`${n.padEnd(8)} (${wx.toFixed(4)},${wz.toFixed(4)}) heightAt ${h.toFixed(6)}`);
}
console.log(`\n9pt spread ${((hi - lo) * 1000).toFixed(1)}mm | PY = lowest = ${lo.toFixed(6)}`);
process.exit(0);
