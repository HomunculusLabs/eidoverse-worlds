// fauna57-walk-magpi.ts — MCPL walk-up probe for the fauna-57 magpie
// at (29.45, -0.02109, 2.05) yaw -π/2: the plaza reader line (E→W
// along the spoke U=(-0.994,-0.110) — the bird faces the approaching
// reader), an 18m vantage stop, a 3.2m discover stop, and return.
// Chassis: fauna55-walk-pheas.ts (WorldAgent OBJECT-form + seeded start).
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const cx = 29.45, cz = 2.05;
// reader-line direction: W toward the plaza — U = (-0.994, -0.110);
// the 18m vantage + 3.2m discover stop stand plaza-side (W) of the seat
const ux = -0.994, uz = -0.110;
const far: [number, number] = [cx + 18 * ux, cz + 18 * uz];     // 18m out W
const near: [number, number] = [cx + 3.2 * ux, cz + 3.2 * uz];  // the discover stop
const route: [number, number][] = [far, near, far];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna57-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
try {
  await agent.connect();
  await Bun.sleep(2200);
  agent.stop();
  agent.pos.x = far[0]; agent.pos.z = far[1]; agent.pos.y = agent.heightAt(...far);
  console.log(JSON.stringify({ magpi: [cx, cz], startH: agent.pos.y.toFixed(3) }));
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
