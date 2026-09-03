// ne-approach2-walk.ts — approach-2 two-way MCPL walk-test on the placed lane.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const d2r = (d: number) => (d * Math.PI) / 180;
const pol = (r: number, azd: number): [number, number] => {
  const a = d2r(azd);
  return [r * Math.sin(a), r * Math.cos(a)];
};
const WAYPTS: Array<[number, number]> = [pol(24, 54), pol(48, 54), pol(54, 48), pol(72, 15)];

const agent = new WorldAgent({ url: cfg.url, name: "arthur-approach2-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
try {
  await agent.connect();
  await Bun.sleep(2200);
  agent.stop();
  agent.pos.x = WAYPTS[0][0]; agent.pos.z = WAYPTS[0][1];
  agent.pos.y = agent.heightAt(WAYPTS[0][0], WAYPTS[0][1]);
  const route = [...WAYPTS, ...[...WAYPTS].reverse().slice(1)];
  for (let i = 0; i < route.length; i++) {
    const q = route[i];
    const ok = await agent.walkTo(q[0], q[1], false, 40_000);
    const distance = Math.hypot(agent.pos.x - q[0], agent.pos.z - q[1]);
    results.push({ i, x: +q[0].toFixed(1), z: +q[1].toFixed(1), ok, distance: +distance.toFixed(2) });
    if (!ok || distance > 0.55) throw new Error(`walk failed at leg ${i}: arrival ${distance.toFixed(2)}`);
  }
  console.log(JSON.stringify({ status: "ALL_PASS", legs: results.length, maxArrival: Math.max(...results.map(r => r.distance)), results }, null, 1));
} finally { agent.close(); }
