// fauna34-walk-swallows.ts — MCPL walk-up probe at 18m toward the livery
// yard (the horses' own proven visitor line: road-end (66,−8.5) → yard
// vantage (51.2,−1.4) — fauna19's exact route). The swallows fly above;
// the walk proves the approach stays clear (airborne riders, nothing
// ground-new).
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const cx = 49.5, cz = 0;
const far: [number, number] = [66.0, -8.5];    // 18m ENE on the road line (fauna19)
const atYard: [number, number] = [51.2, -1.4]; // yard vantage past the SE corner (fauna19)
const route: [number, number][] = [far, atYard, far];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna34-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
