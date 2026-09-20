// fauna67-walk-guinea.ts — MCPL walk-up probe on the plaza-spoke reader
// line toward the guinea flock seat: 18m vantage (28.2,−7.9) → encounter
// vantage (44.0,−13.4) (~1.9m from the flock's near edge, clear) → back.
// Proves the approach + tufts never block the reader line.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const cx = 45.25, cz = -14;
const far: [number, number] = [28.2, -7.9];
const near: [number, number] = [44.0, -13.4];
const route: [number, number][] = [far, near, far];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna67-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
