// fauna73-walk-hare.ts — MCPL walk-up probe at 18m toward the brown
// hare pair (at (-24, -0.04237, -42)). Approach along the SW-lane
// reader line (bearing 60.3° to plaza — fauna-72's own discover line):
// start 18m out on that line, arrive just short of the pair, return.
// Chassis: fauna38-walk-wrabbit.ts.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const cx = -24, cz = -42;
// U = unit vector seat->plaza (the facing axis): (0.4957, 0.8685)
const far: [number, number] = [cx + 18 * 0.4957, cz + 18 * 0.8685];   // 18m out on the plaza line
const at18: [number, number] = [cx + 1.5 * 0.4957, cz + 1.5 * 0.8685]; // just short of the pair
const route: [number, number][] = [far, at18, far];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna73-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
