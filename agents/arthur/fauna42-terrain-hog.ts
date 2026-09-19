// fauna42-terrain-hog.ts — terrain preflight for the fauna-42 hedgehog
// at (-27.5, 26.5) yaw 0.767 (the fauna42-seat-sweep best lawful seat).
// Prints live heightAt over the hog's OBB footprint (9pt: center + 8 rim
// points at half 0.21/0.145 rotated by yaw); PY = center heightAt.
// Chassis: fauna38-terrain-wrabbit.ts (WorldAgent OBJECT-form law).
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna42-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect();
  await Bun.sleep(2000);
  agent.stop();
  const CX = -27.5, CZ = 26.5, YAW = 0.767, HW = 0.21, HD = 0.145;
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
