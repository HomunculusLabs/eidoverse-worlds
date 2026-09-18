// fauna24-walk-turkey.ts — MCPL walk-up probe along the REAL visitor
// line: the coop-yard lane running W→E past the hutch/cat toward the
// stable yard (the poultry yard's own visitor approach). Start 18m W of
// the seat on the lane, walk E to the turkeys' lane-side vantage,
// return. Chassis: fauna23-walk-donkey.ts.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const fx = 45.25, fz = -6.5;
const far: [number, number] = [40.2, -8.3];      // 18m W on the coop-yard lane
const atTurkeys: [number, number] = [43.3, -6.9]; // lane-side vantage
const route: [number, number][] = [far, atTurkeys, far];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna24-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
