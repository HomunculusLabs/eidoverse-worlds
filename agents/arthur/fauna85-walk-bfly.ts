// fauna85-walk-bfly.ts — MCPL walk-up probe along the butterflies' real
// reader line: the stile → dovecote stroll that borders the lavender
// field (the walk the proposal names — "the reader walks past the blooms
// by construction"). Chassis: fauna79-walk-bats.ts.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const cx = -39.58, cz = 62.89; // field center (target for proximity math only)
const far: [number, number] = [-45.25, 54.45];   // the stile approach (18m S of field center)
const mid: [number, number] = [-47.5, 60.0];     // stroll midpoint along the field's W edge
const stop: [number, number] = [-50.0, 62.0];    // the dovecote-side stop (encounter vantage)
const route: [number, number][] = [far, mid, stop, far];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna85-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
