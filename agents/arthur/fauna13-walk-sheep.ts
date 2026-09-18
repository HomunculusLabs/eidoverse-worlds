// fauna13-walk-sheep.ts — MCPL walk-up probe along the REAL visitor line:
// the SW approach lane (the fold sits 2.82m NW of the centerline). Start at
// the gate mouth P0 (−14.53,−19.1) = 18.0m along-lane from the fold's
// nearest lane point, walk SW down the lane to the fold vantage
// (−25.22,−33.18), return. Chassis: fauna11-walk-geese.ts.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const fx = -27.5, fz = -31.5;
const far: [number, number] = [-14.53, -19.1];     // gate mouth (18m along-lane)
const atFold: [number, number] = [-25.22, -33.18]; // lane-side vantage by the fold
const route: [number, number][] = [far, atFold, far];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna13-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
try {
  await agent.connect();
  await Bun.sleep(2200);
  agent.stop();
  agent.pos.x = far[0]; agent.pos.z = far[1]; agent.pos.y = agent.heightAt(...far);
  console.log(JSON.stringify({ fold: [fx, fz], startH: agent.pos.y.toFixed(3) }));
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
