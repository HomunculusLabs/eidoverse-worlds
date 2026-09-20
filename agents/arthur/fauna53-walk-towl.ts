// fauna53-walk-towl.ts — MCPL walk-up probe for the fauna-53 tawny
// owls at (-49.455, 1.534, 65.953): the dovecote reader approach (the
// orchard-edge stroll runs stile → dovecote → espalier display end;
// the walk runs dovecote stop → 3m discover stop NE of the seat on the
// stroll line → dovecote return). Chassis: fauna52-walk-yham.ts
// (WorldAgent OBJECT-form + agent.pos.x/.z + seeded start).
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const cx = -49.455, cz = 65.953;
// reader line: dovecote stop (-50.5,63.3) → seat; unit vector
const dx = cx - -50.5, dz = cz - 63.3;
const L = Math.hypot(dx, dz);
const ux = dx / L, uz = dz / L;
const far: [number, number] = [cx - 14.5 * ux, cz - 14.5 * uz]; // 14.5m out on the dovecote line
const near: [number, number] = [cx - 3.0 * ux, cz - 3.0 * uz];  // the discover vantage
const route: [number, number][] = [far, near, far];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna53-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
try {
  await agent.connect();
  await Bun.sleep(2200);
  agent.stop();
  agent.pos.x = far[0]; agent.pos.z = far[1]; agent.pos.y = agent.heightAt(...far);
  console.log(JSON.stringify({ towl: [cx, cz], start: far.map(v => +v.toFixed(2)), startH: agent.pos.y.toFixed(3) }));
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
