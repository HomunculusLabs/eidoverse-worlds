// fauna34-terrain.ts — read-only terrain preflight at the swallow seat
// (49.5, 0) yaw 0 — the yard center. Airborne entity: PY only shifts the
// flight band's world height; still derive it live (the law).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const CX = 49.5, CZ = 0;
const loc: [string, number, number][] = [
  ["c", 0, 0], ["nw", -3, -3], ["ne", 3, -3], ["sw", -3, 3], ["se", 3, 3],
  ["n", 0, -3], ["s", 0, 3], ["w", -3, 0], ["e", 3, 0],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-fauna34-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect(); await Bun.sleep(2500);
  let lowest = Infinity;
  for (const [name, dx, dz] of loc) {
    const x = CX + dx, z = CZ + dz;
    const h = agent.heightAt(x, z);
    if (h < lowest) lowest = h;
    console.log(JSON.stringify({ name, x, z, heightAt: +h.toFixed(5) }));
  }
  console.log(JSON.stringify({ PY: +lowest.toFixed(5) }));
} finally { agent.close(); }
