// fauna63-walk-swan.ts — MCPL walk-up probe at 18m along the swan's real
// visitor lines: the SW-bank meadow approach (the judge's own reader
// vantage) and the bridge-deck N crossing (the pool's cross-reader).
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const cx = 8.123, cz = -92.482;
const far: [number, number] = [-4.6, -104.5];     // 18m SW on the bank-meadow reader line
const near: [number, number] = [4.3, -97.4];      // 5m encounter stop on the same line
const bridge: [number, number] = [9.7, -94.5];    // the S bridge-deck sill lane (N cross-reader)
const route: [number, number][] = [far, near, far, bridge, far];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna63-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
