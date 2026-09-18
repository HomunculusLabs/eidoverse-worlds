// fauna25-walk-peacock.ts — MCPL walk-up probe along the REAL visitor
// line: the orchard-edge stroll from the stile toward the dovecote (the
// peacock's own visitor approach — show birds belong where visitors
// stroll). Start 18m from the seat on the approach, walk to the
// lane-side vantage beside the display, return. Chassis:
// fauna24-walk-turkey.ts.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const fx = -47.5, fz = 60.0;
const far: [number, number] = [-40.2, 54.6];      // 18m SE on the stile approach line
const atBird: [number, number] = [-46.0, 59.2];   // approach-side vantage (the display faces +z = toward the stroll line)
const route: [number, number][] = [far, atBird, far];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna25-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
