// fauna57-terrain-magpi.ts — terrain preflight for the fauna-57 magpie
// at (29.45, 2.05) yaw -π/2 (fauna57-seat-sweep best). 9pt over the
// magpie OBB footprint: decoded half (0.3641, 0.0889) at yaw −π/2 →
// world half-x 0.0889, half-z 0.3641.
// Chassis: fauna55-terrain-pheas.ts (WorldAgent OBJECT-form law).
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna57-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect();
  await Bun.sleep(2000);
  agent.stop();
  const CX = 29.45, CZ = 2.05, YAW = -Math.PI / 2, HW = 0.0889, HD = 0.3641;
  const cos = Math.cos(YAW), sin = Math.sin(YAW);
  const pts: [number, number][] = [[CX, CZ]];
  for (const sx of [-1, 0, 1]) for (const sz of [-1, 0, 1]) {
    if (!sx && !sz) continue;
    pts.push([CX + sx * HW * cos + sz * HD * sin, CZ - sx * HW * sin + sz * HD * cos]);
  }
  const hs = pts.map(([x, z]) => agent.heightAt(x, z));
  const cy = agent.heightAt(CX, CZ);
  const spread = Math.max(...hs) - Math.min(...hs);
  console.log(JSON.stringify({
    center: [CX, CZ], yaw: YAW,
    heightAtCenter: +cy.toFixed(5),
    ninePts: hs.map((h: number) => +h.toFixed(5)),
    spreadMm: +(spread * 1000).toFixed(1),
  }));
} finally {
  agent.close();
}
