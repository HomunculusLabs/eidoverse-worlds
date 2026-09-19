// fauna48-walk-sparrow.ts — MCPL walk-up probe for the fauna-48 house
// sparrows at (−34.9, −0.03347, −1.45) yaw −2.616: the 18m road reader
// approach (the gate-w road walks W toward the mill door; vantage due E
// of the seat on its line), a discover stop ~2.6m (the encounter
// vantage the judge passed), and return. Chassis: fauna45-walk-hmou.ts
// (WorldAgent OBJECT-form + agent.pos.x/.z + seeded start).
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const cx = -34.9, cz = -1.45;
// reader-line direction: due E (the road runs W→E at z ≈ −1.45; the
// 18m vantage stands at (−16.9, −1.45))
const ux = 1, uz = 0;
const far: [number, number] = [cx + 18 * ux, cz + 18 * uz];   // 18m out on the road line
const near: [number, number] = [cx + 2.6 * ux, cz + 2.6 * uz]; // the discover vantage
const route: [number, number][] = [far, near, far];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna48-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
try {
  await agent.connect();
  await Bun.sleep(2200);
  agent.stop();
  agent.pos.x = far[0]; agent.pos.z = far[1]; agent.pos.y = agent.heightAt(...far);
  console.log(JSON.stringify({ sparrow: [cx, cz], startH: agent.pos.y.toFixed(3) }));
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
