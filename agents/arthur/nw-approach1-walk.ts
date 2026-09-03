// nw-approach1-walk.ts — approach-1 two-way MCPL walk-test on the placed lane.
// Out-and-back along the winding lane centerline: r37 -> r58 (az306), bend,
// r58 -> r71 (az315), then reverse. Verifies the placed thin film is genuinely
// walkable end to end in both directions (core-paths discipline).
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const d2r = (d: number) => (d * Math.PI) / 180;
const A1 = d2r(306), A2 = d2r(315);
const START = [37 * Math.sin(A1), 37 * Math.cos(A1)];
const BEND = [58 * Math.sin(A1), 58 * Math.cos(A1)];
const END = [71 * Math.sin(A2), 71 * Math.cos(A2)];
const WAYPTS: Array<[number, number]> = [START, BEND, END];

const agent = new WorldAgent({ url: cfg.url, name: "arthur-approach1-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
try {
  await agent.connect();
  await Bun.sleep(2200);
  agent.stop();
  agent.pos.x = START[0]; agent.pos.z = START[1];
  agent.pos.y = agent.heightAt(START[0], START[1]);
  const route = [...WAYPTS, ...[...WAYPTS].reverse().slice(1)];
  for (let i = 0; i < route.length; i++) {
    const q = route[i];
    const ok = await agent.walkTo(q[0], q[1], false, 30_000);
    const distance = Math.hypot(agent.pos.x - q[0], agent.pos.z - q[1]);
    results.push({ i, x: +q[0].toFixed(1), z: +q[1].toFixed(1), ok, distance: +distance.toFixed(2) });
    if (!ok || distance > 0.55) throw new Error(`walk failed at leg ${i}: arrival ${distance.toFixed(2)}`);
  }
  console.log(JSON.stringify({ status: "ALL_PASS", legs: results.length, maxArrival: Math.max(...results.map(r => r.distance)), results }, null, 1));
} finally { agent.close(); }
