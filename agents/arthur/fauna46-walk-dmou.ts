// fauna46-walk-dmou.ts — MCPL walk-up probe for the fauna-46 dormouse
// at (-51.5, 0.03391, 64.25) yaw 0.744: the 18m stile-approach stroll
// reader line (the corridor the dovecote already faces), a discover
// stop ~2.3m (the re-derived encounter vantage), and return. Chassis:
// fauna45-walk-hmou.ts (WorldAgent OBJECT-form + agent.pos.x/.z).
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const cx = -51.5, cz = 64.25;
// stile-approach direction: from the nest toward the reader line —
// facing (cos,−sin) yaw 0.744 = (0.735, −0.678), so the 18m approach
// stands out along the facing line
const ux = 0.735, uz = -0.678;
const far: [number, number] = [cx + 18 * ux, cz + 18 * uz];   // 18m out on the spoke
const near: [number, number] = [cx + 2.3 * ux, cz + 2.3 * uz]; // the discover vantage
const route: [number, number][] = [far, near, far];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna46-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
try {
  await agent.connect();
  await Bun.sleep(2200);
  agent.stop();
  agent.pos.x = far[0]; agent.pos.z = far[1]; agent.pos.y = agent.heightAt(...far);
  console.log(JSON.stringify({ dmou: [cx, cz], startH: agent.pos.y.toFixed(3) }));
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
