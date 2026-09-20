// fauna65-terrain-kestrel.ts — read-only terrain preflight at the kestrel
// seat (57.5, -24) yaw -2.4. The post + tufts need ground-true PY (the
// hover band rides at PY+6 regardless; the law: derive it live anyway).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const CX = 57.5, CZ = -24;
const loc: [string, number, number][] = [
  ["c", 0, 0], ["nw", -3, -3], ["ne", 3, -3], ["sw", -3, 3], ["se", 3, 3],
  ["n", 0, -3], ["s", 0, 3], ["w", -3, 0], ["e", 3, 0],
  ["post", -0.28, 0.12], ["tuftA", -0.15, -0.18], ["tuftB", 0.24, 0.30], ["tuftC", 0.05, -0.32],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna65-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  let lowest = Infinity;
  const rows: any[] = [];
  for (const [name, dx, dz] of loc) {
    const x = CX + dx, z = CZ + dz;
    const h = agent.heightAt(x, z);
    if (h < lowest) lowest = h;
    rows.push({ name, x, z, heightAt: +h.toFixed(5) });
  }
  for (const r of rows) console.log(JSON.stringify(r));
  const vals = rows.map(r => r.heightAt);
  const spread = Math.max(...vals) - Math.min(...vals);
  console.log(JSON.stringify({ PY: +lowest.toFixed(5), spread_mm: +(spread * 1000).toFixed(1) }));
} finally { agent.close(); }
