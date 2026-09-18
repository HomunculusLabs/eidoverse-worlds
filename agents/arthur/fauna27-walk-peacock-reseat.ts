// fauna27-walk-peacock-reseat.ts — MCPL walk-up probe along the REAL
// visitor line for the re-seated peacock: stile-side approach ~16.5m SE,
// walk the stroll line to the rows-side encounter vantage (4.5m, the
// reader's own closest approach on the dovecote→rows leg), return.
// Chassis: fauna25-walk-peacock.ts.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const fx = -43.3, fz = 69.7;
const far: [number, number] = [-44.4, 53.2];     // ~16.5m on the stile-side approach
const atBird: [number, number] = [-46.9, 67.0];  // rows-side vantage on the stroll line (4.5m encounter)
const route: [number, number][] = [far, atBird, far];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna27-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
try {
  await agent.connect();
  await Bun.sleep(2200);
  agent.stop();
  agent.pos.x = far[0]; agent.pos.z = far[1]; agent.pos.y = agent.heightAt(...far);
  console.log(JSON.stringify({ seat: [fx, fz], startH: agent.pos.y.toFixed(3) }));
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
