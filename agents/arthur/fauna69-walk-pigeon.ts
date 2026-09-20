// fauna69-walk-pigeon.ts — MCPL walk-up probe on the market flock's
// reader lines: 18m N-rim vantage (−3.5,17) → SE-oblique encounter
// vantage (−3.28,−0.97, 4.2m) → back. Proves the approach + grain never
// blocks the reader line (lamp-in-path law).
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const cx = -6.25, cz = 2;
const far: [number, number] = [-3.5, 17];
const near: [number, number] = [-3.28, -0.97];
const route: [number, number][] = [far, near, far];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna69-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
