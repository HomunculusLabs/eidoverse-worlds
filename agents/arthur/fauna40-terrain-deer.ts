// fauna40-terrain-deer.ts — terrain preflight for the fauna-40 roe deer
// at (51.25, -38.25) yaw -2.5. Prints live heightAt over the pair's OBB
// footprint (9pt: center + 8 rim points at half 1.1895/1.1805 rotated
// by yaw); PY = center heightAt.
// Chassis: fauna38-terrain-wrabbit.ts (WorldAgent OBJECT-form constructor law).
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna40-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect();
  await Bun.sleep(2000);
  agent.stop();
  const CX = 51.25, CZ = -38.25, YAW = -2.5, HW = 1.1895, HD = 1.1805;
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
