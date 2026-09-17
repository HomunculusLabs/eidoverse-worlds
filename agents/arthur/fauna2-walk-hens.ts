// fauna2-walk-hens.ts — MCPL walk-up probe at 18m toward the hen flock
// (flock at (34, -0.0335, -8) yaw -1.8, coop behind it E). Approach from
// the plaza/W side: start 18m west in open meadow, arrive just outside the
// flock's W edge, return. Chassis: fauna1-walk-goats.ts.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const fx = 34, fz = -8;
const far: [number, number] = [fx - 18, fz];   // 18m west of the flock
const at18: [number, number] = [fx - 1.5, fz]; // just outside the flock's W edge
const route: [number, number][] = [far, at18, far];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna2-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
try {
  await agent.connect();
  await Bun.sleep(2200);
  agent.stop();
  agent.pos.x = far[0]; agent.pos.z = far[1]; agent.pos.y = agent.heightAt(...far);
  console.log(JSON.stringify({ flock: [fx, fz], startH: agent.pos.y.toFixed(3) }));
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
