// fauna35-walk-heron.ts — MCPL walk-up probe at 18m along the pool's real
// visitor lines: the W village-side bank approach (the heron's reader
// vantage) + the bridge-deck reader leg. The heron stands IN the water
// (water-rider class — no ground obstruction by construction); the walk
// proves the approaches stay clear.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const cx = 12.92, cz = -91.38;
const far: [number, number] = [-5.0, -91.0];      // 18m W on the village-side bank line (the reader vantage)
const bridge: [number, number] = [9.7, -91.6];    // the bridge-deck reader position (mid-span W end)
const route: [number, number][] = [far, bridge, far];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna35-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
