// fauna52-walk-yham.ts — MCPL walk-up probe for the fauna-52
// yellowhammers at (-34.603, 1.48, 60.539): the stile reader approach
// (the NW lane's nearest stop is the stile (-45.25,54.45); the walk runs
// stile → 3m discover stop NW of the seat → stile return). Chassis:
// fauna48-walk-sparrow.ts (WorldAgent OBJECT-form + agent.pos.x/.z +
// seeded start).
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const cx = -34.603, cz = 60.539;
// reader line: stile (-45.25,54.45) → seat; unit vector
const dx = cx - -45.25, dz = cz - 54.45;
const L = Math.hypot(dx, dz);
const ux = dx / L, uz = dz / L;
const far: [number, number] = [cx - 15.5 * ux, cz - 15.5 * uz];  // 15.5m out on the stile line
const near: [number, number] = [cx - 3.0 * ux, cz - 3.0 * uz];   // the discover vantage
const route: [number, number][] = [far, near, far];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna52-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
try {
  await agent.connect();
  await Bun.sleep(2200);
  agent.stop();
  agent.pos.x = far[0]; agent.pos.z = far[1]; agent.pos.y = agent.heightAt(...far);
  console.log(JSON.stringify({ yham: [cx, cz], start: far.map(v => +v.toFixed(2)), startH: agent.pos.y.toFixed(3) }));
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
