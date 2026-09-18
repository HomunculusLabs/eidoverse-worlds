// fauna16-walk-dovecote.ts — MCPL walk-up probe along the REAL visitor line:
// the stile/lane approach SE of the dovecote. Start 18m SE on the visitor
// line, walk NW to the dovecote's lane-side vantage, return.
// Chassis: fauna14-walk-pig.ts.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const fx = -50.5, fz = 62.55;
const far: [number, number] = [-40.87, 47.34];   // 18m SE on the stile visitor line
const atCote: [number, number] = [-48.36, 59.17]; // lane-side vantage 4m from the post
const route: [number, number][] = [far, atCote, far];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna16-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
try {
  await agent.connect();
  await Bun.sleep(2200);
  agent.stop();
  agent.pos.x = far[0]; agent.pos.z = far[1]; agent.pos.y = agent.heightAt(...far);
  console.log(JSON.stringify({ cote: [fx, fz], startH: agent.pos.y.toFixed(3) }));
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
