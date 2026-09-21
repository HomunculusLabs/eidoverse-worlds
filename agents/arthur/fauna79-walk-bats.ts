// fauna79-walk-bats.ts — MCPL walk-up probe along the bats' real reader
// lines: the N-bank 18m approach and the FULL bridge-deck crossing (the
// contract vantage — the deck-walker the ring-3/4/5 crossings pass
// 0.6-1.0m above). Chassis: fauna75-walk-carp.ts.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const cx = 9.723, cz = -90.682; // the swarm ring center (target for proximity math only)
const far: [number, number] = [9.7, -72.9];       // 18m N-bank approach
const deckN: [number, number] = [9.723, -87.3];   // the bridge N sill
const deckS: [number, number] = [9.723, -94.66];  // the bridge S sill (full deck crossing)
const route: [number, number][] = [far, deckN, deckS, far];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna79-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
