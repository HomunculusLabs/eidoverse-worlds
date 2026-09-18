// fauna21-walk-cow.ts — MCPL walk-up probe along the REAL visitor line:
// the mosaic-row/lane walk S of the kiln yard (pig law — the same visitor
// line that reads the pannage meadow). Start 18m NE of the seat on the
// visitor line, walk SW to the cows' lane-side vantage, return.
// Chassis: fauna14-walk-pig.ts.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const fx = 24.0, fz = 40.75;
const far: [number, number] = [33.5, 31.4];     // 18m NE on the visitor line
const atCows: [number, number] = [25.1, 39.7];  // lane-side vantage by the cows
const route: [number, number][] = [far, atCows, far];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna21-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
