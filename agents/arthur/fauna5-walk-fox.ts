// fauna5-walk-fox.ts — MCPL walk-up probe at 18m toward the den fox
// (fox at (72.62, -0.041, -9.66); den mouth faces the meadow on the world
// -z side, den-local +x = world -z). Approach from the meadow: start 18m
// south of the fox, arrive just outside the den's mouth apron, return.
// Chassis: fauna2-walk-hens.ts.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const fx = 72.62, fz = -9.66;
const far: [number, number] = [fx, fz - 18];     // 18m out on the meadow side
const at18: [number, number] = [fx, fz - 1.7];   // just outside the fox/den apron
const route: [number, number][] = [far, at18, far];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna5-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
try {
  await agent.connect();
  await Bun.sleep(2200);
  agent.stop();
  agent.pos.x = far[0]; agent.pos.z = far[1]; agent.pos.y = agent.heightAt(...far);
  console.log(JSON.stringify({ fox: [fx, fz], startH: agent.pos.y.toFixed(3) }));
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
