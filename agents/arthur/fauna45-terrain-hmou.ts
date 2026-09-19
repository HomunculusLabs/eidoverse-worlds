// fauna45-terrain-hmou.ts — terrain preflight for the fauna-45 harvest
// mouse at (11, 31.5) yaw -1.41 (the fauna45-seat-sweep r4 re-seat,
// 4.61m from the cart). Prints live heightAt over the mouse's OBB
// footprint (9pt: center + 8 rim points at half 0.125/0.082 rotated by
// yaw). Chassis: fauna42-terrain-hog.ts (WorldAgent OBJECT-form law).
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna45-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect();
  await Bun.sleep(2000);
  agent.stop();
  const CX = 11, CZ = 31.5, YAW = -1.41, HW = 0.125, HD = 0.082;
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
