// fauna45-walk-hmou.ts — MCPL walk-up probe for the fauna-45 harvest
// mouse at (11, -0.02474, 31.5) yaw -1.41: the 18m NNE-spoke reader
// approach (the mosaic-row visitor line past the cart down to the
// vignette), an encounter stop ~2.6m (the discover vantage the judge
// passed), and return. Chassis: fauna42-walk-hog.ts (WorldAgent
// OBJECT-form + agent.pos.x/.z + seeded start).
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const cx = 11, cz = 31.5;
// NNE-spoke direction: from the mouse toward the mosaic-row reader
// point (facing (cos,−sin) yaw −1.41 = (0.160, 0.987))
const ux = 0.160, uz = 0.987;
const far: [number, number] = [cx + 18 * ux, cz + 18 * uz];   // 18m out on the spoke
const near: [number, number] = [cx + 2.6 * ux, cz + 2.6 * uz]; // the discover vantage
const route: [number, number][] = [far, near, far];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna45-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
try {
  await agent.connect();
  await Bun.sleep(2200);
  agent.stop();
  agent.pos.x = far[0]; agent.pos.z = far[1]; agent.pos.y = agent.heightAt(...far);
  console.log(JSON.stringify({ hmou: [cx, cz], startH: agent.pos.y.toFixed(3) }));
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
