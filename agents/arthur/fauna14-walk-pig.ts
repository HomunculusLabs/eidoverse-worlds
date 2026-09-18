// fauna14-walk-pig.ts — MCPL walk-up probe along the REAL visitor line:
// the mosaic-row/lane walk S of the kiln yard. Start 18m NE of the sty on
// the visitor line, walk SW to the sty's lane-side vantage, return.
// Chassis: fauna13-walk-sheep.ts.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const fx = 15.0, fz = 40.2;
const far: [number, number] = [25.0, 29.6];      // 18m NE on the visitor line
const atSty: [number, number] = [16.3, 39.0];    // lane-side vantage by the sty
const route: [number, number][] = [far, atSty, far];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna14-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
try {
  await agent.connect();
  await Bun.sleep(2200);
  agent.stop();
  agent.pos.x = far[0]; agent.pos.z = far[1]; agent.pos.y = agent.heightAt(...far);
  console.log(JSON.stringify({ sty: [fx, fz], startH: agent.pos.y.toFixed(3) }));
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
