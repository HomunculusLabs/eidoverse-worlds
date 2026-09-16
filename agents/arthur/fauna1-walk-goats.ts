// fauna1-walk-goats.ts — MCPL walk-up probe at 18m toward the goat pen
// (gate faces S: world gate center ~(31.0, 14.2) at yaw -1.2). Two legs:
// approach from 18m south, arrive, return. Chassis: artwalk-walk-b10.ts.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
// gate center world (derived): local (0, +3.2) at pos (34,13) yaw -1.2
const gx = 34 + 3.2 * Math.sin(-1.2), gz = 13 + 3.2 * Math.cos(-1.2);
const far: [number, number] = [gx, gz + 18];   // 18m south of the gate
const at18: [number, number] = [gx, gz + 2];   // just outside the gate
const route: [number, number][] = [far, at18, far];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna1-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
try {
  await agent.connect();
  await Bun.sleep(2200);
  agent.stop();
  agent.pos.x = far[0]; agent.pos.z = far[1]; agent.pos.y = agent.heightAt(...far);
  console.log(JSON.stringify({ gate: [gx.toFixed(2), gz.toFixed(2)], startH: agent.pos.y.toFixed(3) }));
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
