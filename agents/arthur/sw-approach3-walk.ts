// sw-approach3-walk.ts — approach-3 two-way MCPL walk-test on the placed lane.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const d2r = (d: number) => (d * Math.PI) / 180;
const a = d2r(217.25);
const START: [number, number] = [24 * Math.sin(a), 24 * Math.cos(a)];
const END: [number, number] = [71 * Math.sin(a), 71 * Math.cos(a)];

const agent = new WorldAgent({ url: cfg.url, name: "arthur-approach3-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
try {
  await agent.connect();
  await Bun.sleep(2200);
  agent.stop();
  agent.pos.x = START[0]; agent.pos.z = START[1];
  agent.pos.y = agent.heightAt(START[0], START[1]);
  // midpoint waypoint keeps long straight legs under the walkTo distance budget
  const MID: [number, number] = [(START[0] + END[0]) / 2, (START[1] + END[1]) / 2];
  const route = [START, MID, END, MID, START];
  for (let i = 0; i < route.length; i++) {
    const q = route[i];
    const ok = await agent.walkTo(q[0], q[1], false, 40_000);
    const distance = Math.hypot(agent.pos.x - q[0], agent.pos.z - q[1]);
    results.push({ i, x: +q[0].toFixed(1), z: +q[1].toFixed(1), ok, distance: +distance.toFixed(2) });
    if (!ok || distance > 0.55) throw new Error(`walk failed at leg ${i}: arrival ${distance.toFixed(2)}`);
  }
  console.log(JSON.stringify({ status: "ALL_PASS", legs: results.length, maxArrival: Math.max(...results.map(r => r.distance)), results }, null, 1));
} finally { agent.close(); }
