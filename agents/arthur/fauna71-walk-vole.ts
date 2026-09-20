// fauna71-walk-vole.ts — MCPL walk-up probe for the fauna-71 field vole
// at (53.75, -0.04276, -25.5) yaw -1.863: the 18m plaza-spoke reader
// approach (the kestrel's own vantage line), an encounter stop ~2.6m (the
// discover vantage the judge SHIPped), and return. Chassis:
// fauna45-walk-hmou.ts (WorldAgent OBJECT-form + agent.pos.x/.z).
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const cx = 53.75, cz = -25.5;
// plaza-spoke direction: seat->plaza unit (facing = (cos,−sin) yaw −1.863)
const ux = -0.837, uz = 0.547;
const far: [number, number] = [cx + 18 * ux, cz + 18 * uz];   // 18m out on the spoke
const near: [number, number] = [cx + 2.6 * ux, cz + 2.6 * uz]; // the discover vantage
const route: [number, number][] = [far, near, far];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna71-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
try {
  await agent.connect();
  await Bun.sleep(2200);
  agent.stop();
  agent.pos.x = far[0]; agent.pos.z = far[1]; agent.pos.y = agent.heightAt(...far);
  console.log(JSON.stringify({ vole: [cx, cz], startH: agent.pos.y.toFixed(3) }));
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
