// fauna50-walk-kfish.ts — MCPL walk-up probe for the fauna-50
// kingfisher at (-70.05, -0.02224, 4.48) yaw 4.8932: the bank reader
// approach (walking the SSW bank WSW→ENE along the race — the reader
// line the rig cameras derive from), a profile discover stop ~2.6m
// (the judged vantage), and return. Chassis: fauna48-walk-sparrow.ts
// (WorldAgent OBJECT-form + seeded start).
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const cx = -70.05, cz = 4.48;
// reader-line direction: along the bank WSW→ENE — the 18m vantage
// stands WSW of the seat on the bank line (unit ≈ (+0.9205, +0.3908),
// the race axis); the discover stop ~2.6m along the same line
const ux = 0.9205, uz = 0.3908;
const far: [number, number] = [cx - 18 * ux, cz - 18 * uz];   // 18m out on the bank line (WSW)
const near: [number, number] = [cx - 2.6 * ux, cz - 2.6 * uz]; // the profile discover vantage
const route: [number, number][] = [far, near, far];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna50-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
try {
  await agent.connect();
  await Bun.sleep(2200);
  agent.stop();
  agent.pos.x = far[0]; agent.pos.z = far[1]; agent.pos.y = agent.heightAt(...far);
  console.log(JSON.stringify({ kfish: [cx, cz], startH: agent.pos.y.toFixed(3) }));
  for (let i = 0; i < route.length; i++) {
    const q = route[i];
    const ok = await agent.walkTo(q[0], q[1], false, 25_000);
    const distance = Math.hypot(agent.pos.x - q[0], agent.pos.z - q[1]);
    results.push({ i, ok, distance: distance.toFixed(2) });
    if (!ok || distance > 0.55) throw new Error(`walk failed at leg ${i}: ${distance}`);
  }
  console.log(JSON.stringify({ status: "ALL_PASS", legs: results }));
} finally {
  agent.close();
}
