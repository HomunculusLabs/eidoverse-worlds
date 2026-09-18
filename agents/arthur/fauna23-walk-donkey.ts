// fauna23-walk-donkey.ts — MCPL walk-up probe along the REAL visitor
// line: the SW lane from the gate mouth toward the fold/dye yard (the
// sheep lane — the guardian's own visitor approach). Start 18m NE of the
// seat on the lane, walk SW to the donkeys' lane-side vantage, return.
// Chassis: fauna21-walk-cow.ts.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const fx = -22.5, fz = -34;
const far: [number, number] = [-14.6, -26.2];    // 18m NE on the SW lane
const atDonkeys: [number, number] = [-21.3, -32.9]; // lane-side vantage
const route: [number, number][] = [far, atDonkeys, far];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna23-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
