// fauna61-walk-stork.ts — MCPL walk-up probe at 18m along the stork's
// real visitor line: the plaza-spoke approach due E of the seat (the
// reader vantage the seat yaw was corrected FOR — true profile), plus an
// N-return leg along the channel margin.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const cx = -74.777, cz = 4.478;
const far: [number, number] = [-56.8, 4.5];      // 18m E on the plaza-spoke line (the reader vantage)
const near: [number, number] = [-69.3, 4.5];     // 5m encounter stop on the same line
const margin: [number, number] = [-74.8, 2.0];   // the N channel-margin lane beside the pair
const route: [number, number][] = [far, near, far, margin, far];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna61-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
try {
  await agent.connect();
  await Bun.sleep(2200);
  agent.stop();
  agent.pos.x = far[0]; agent.pos.z = far[1]; agent.pos.y = agent.heightAt(...far);
  console.log(JSON.stringify({ target: [cx, cz], startH: agent.pos.y.toFixed(3) }));
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
