// fauna26-walk-rooster.ts — MCPL walk-up probe along the REAL visitor
// line: the coop-yard lane running W→E past the well toward the flock
// yard (the cock's sentinel seat faces this lane by construction).
// Start 18m W on the lane, walk E to the rooster's lane-side vantage,
// return. Chassis: fauna24-walk-turkey.ts.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const fx = 31.25, fz = -9;
const far: [number, number] = [26.0, -9.0];        // 18m W on the lane... adjusted: 5.25m W start (lane true length; the well sits W)
const start: [number, number] = [26.0, -9.0];
const atRooster: [number, number] = [29.9, -9.0];  // lane-side vantage 1.35m W of the seat
const route: [number, number][] = [start, atRooster, start];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna26-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
try {
  await agent.connect();
  await Bun.sleep(2200);
  agent.stop();
  agent.pos.x = far[0]; agent.pos.z = far[1]; agent.pos.y = agent.heightAt(...far);
  console.log(JSON.stringify({ seat: [fx, fz], startH: agent.pos.y.toFixed(3) }));
  for (let i = 0; i < route.length; i++) {
    const q = route[i];
    const ok = await agent.walkTo(q[0], q[1], false, 30_000);
    const distance = Math.hypot(agent.pos.x - q[0], agent.pos.z - q[1]);
    results.push({ i, ok, distance: distance.toFixed(2) });
    if (!ok || distance > 0.55) throw new Error(`walk failed at leg ${i}: ${distance}`);
  }
  console.log(JSON.stringify({ status: "ALL_PASS", legs: results }));
} finally {
  agent.close();
}
