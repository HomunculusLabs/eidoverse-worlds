// fauna42-walk-hog.ts — MCPL walk-up probe at 18m toward the hedgehog
// (at (-27.5, 0.01474, 26.5)). Approach along the NW gallery-ring lane
// (the honest reader vantage — the plaza line runs through the
// carousel): start 18m out on the gallery line, arrive just short of
// the rootling hog, return. Chassis: fauna38-walk-wrabbit.ts.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const cx = -27.5, cz = 26.5;
// NW gallery-ring direction: from hog toward (-42.2, 35.3)
const dx = -42.2 - cx, dz = 35.3 - cz;
const L = Math.hypot(dx, dz);
const ux = dx / L, uz = dz / L;
const far: [number, number] = [cx + 18 * ux, cz + 18 * uz];    // 18m out on the gallery line
const at18: [number, number] = [cx - 1.2 * ux, cz - 1.2 * uz]; // just short of the hog
const route: [number, number][] = [far, at18, far];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna42-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
try {
  await agent.connect();
  await Bun.sleep(2200);
  agent.stop();
  agent.pos.x = far[0]; agent.pos.z = far[1]; agent.pos.y = agent.heightAt(...far);
  console.log(JSON.stringify({ hog: [cx, cz], startH: agent.pos.y.toFixed(3) }));
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
