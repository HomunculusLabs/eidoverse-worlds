// fauna67-terrain-guinea.ts — read-only terrain preflight at the guinea
// flock seat (45.5, -12.75) yaw -1.22. 9pt spread + the flock's member
// points (three bird origins at final baked offsets).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const CX = 45.25, CZ = -14;
const loc: [string, number, number][] = [
  ["c", 0, 0], ["nw", -2, -2], ["ne", 2, -2], ["sw", -2, 2], ["se", 2, 2],
  ["n", 0, -2], ["s", 0, 2], ["w", -2, 0], ["e", 2, 0],
  // flock members (entity-local, rotated by yaw -1.22): a(-0.476,0.42) b(0.14,-0.196) c(0.56,0.336)
  ["bird_a", -0.476, 0.42], ["bird_b", 0.14, -0.196], ["bird_c", 0.56, 0.336],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna67-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  let lowest = Infinity;
  const rows: any[] = [];
  const YAW = -1.22;
  for (const [name, lx, lz] of loc) {
    const x = CX + lx * Math.cos(YAW) + lz * Math.sin(YAW);
    const z = CZ - lx * Math.sin(YAW) + lz * Math.cos(YAW);
    const h = agent.heightAt(x, z);
    if (h < lowest) lowest = h;
    rows.push({ name, x: +x.toFixed(3), z: +z.toFixed(3), heightAt: +h.toFixed(5) });
  }
  for (const r of rows) console.log(JSON.stringify(r));
  const vals = rows.map(r => r.heightAt);
  const spread = Math.max(...vals) - Math.min(...vals);
  console.log(JSON.stringify({ PY: +lowest.toFixed(5), spread_mm: +(spread * 1000).toFixed(1) }));
} finally { agent.close(); }
