// fauna40-walk-deer.ts — MCPL walk-up probe at 18m toward the roe deer
// (pair at (51.25, -0.02328, -38.25)). Approach along the TRUE reader
// line (the plaza->seat spoke the sweep's yaw faces along — direction
// (−0.801, +0.598)): start 18m out on that line, arrive just short of
// the pair, return. Chassis: fauna38-walk-wrabbit.ts.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const cx = 51.25, cz = -38.25;
const dx = -0.801, dz = 0.598; // plaza -> seat direction (unit)
const far: [number, number] = [cx + 18 * dx, cz + 18 * dz];    // 18m out on the reader line
const at18: [number, number] = [cx - 1.5 * dx, cz - 1.5 * dz]; // just short of the pair
const route: [number, number][] = [far, at18, far];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna40-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
try {
  await agent.connect();
  await Bun.sleep(2200);
  agent.stop();
  agent.pos.x = far[0]; agent.pos.z = far[1]; agent.pos.y = agent.heightAt(...far);
  console.log(JSON.stringify({ pair: [cx, cz], startH: agent.pos.y.toFixed(3) }));
  for (let i = 0; i < route.length; i++) {
    const q = route[i];
    const ok = await agent.walkTo(q[0], q[1], false, 25_000);
    const distance = Math.hypot(agent.pos.x - q[0], agent.pos.z - q[1]);
    results.push({ i, ok, distance: distance.toFixed(2) });
    if (!ok || distance > 0.55) throw new Error(`walk failed at leg ${i}: ${distance}`);
  }
  console.log(JSON.stringify({ status: "ALL_PASS", legs: results }));
} finally {
  agent.close();
}
