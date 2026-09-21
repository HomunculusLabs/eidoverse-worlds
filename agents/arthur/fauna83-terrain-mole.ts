// fauna83-terrain-mole.ts — terrain preflight for the fauna-83 European
// mole at the FINAL swept seat. Entity anchor (-24.5, 26.5) yaw 2.2004;
// mole solid OBB center CX -0.138, HW 0.327 / HD 0.101 (v4 94fce52e
// decoded envelope), rotated to yaw. Chassis: fauna81-terrain-rat.ts
// (WorldAgent OBJECT-form law).
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna83-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect();
  await Bun.sleep(2000);
  agent.stop();
  const AX = -24.5, AZ = 26.5, YAW = 2.2004, CX = -0.138, HW = 0.327, HD = 0.101;
  const cos = Math.cos(YAW), sin = Math.sin(YAW);
  const W = AX + CX * cos, WZ = AZ - CX * sin;   // OBB center in world
  const pts: [number, number][] = [[W, WZ]];
  for (const sx of [-1, 0, 1]) for (const sz of [-1, 0, 1]) {
    if (!sx && !sz) continue;
    pts.push([W + sx * HW * cos + sz * HD * sin, WZ - sx * HW * sin + sz * HD * cos]);
  }
  const hs = pts.map(([x, z]) => agent.heightAt(x, z));
  const spread = Math.max(...hs) - Math.min(...hs);
  console.log(JSON.stringify({
    anchor: [AX, AZ], yaw: YAW, obbCenter: [+W.toFixed(3), +WZ.toFixed(3)],
    heightAtCenter: +hs[0].toFixed(5),
    ninePts: hs.map((h: number) => +h.toFixed(5)),
    spreadMm: +(spread * 1000).toFixed(1),
  }));
} finally {
  agent.close();
}
