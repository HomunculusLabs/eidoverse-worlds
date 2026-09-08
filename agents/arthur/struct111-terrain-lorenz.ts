// struct111-terrain-lorenz.ts — read-only terrain preflight for the R10-12
// Lorenz seat az184 r140 (-9.77, 139.66). Dais footprint r 2.50: 9pt =
// center + 8 rim points at r 2.4 (just inside the rim).
// PY = lowest sample (dais base at local y=0 sits on grade; decode law
// grade-at-0).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const CX = -9.77, CZ = 139.66, R = 2.4;
const pts: [string, number, number][] = [["center", CX, CZ]];
for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    pts.push([`rim-${i}`, CX + R * Math.cos(a), CZ + R * Math.sin(a)]);
}
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct111-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
    await agent.connect(); await Bun.sleep(2500);
    const hs: number[] = [];
    for (const [name, x, z] of pts) { const h = agent.heightAt(x, z); hs.push(h); console.log(JSON.stringify({ name, x: +x.toFixed(2), z: +z.toFixed(2), heightAt: h })); }
    const spread = Math.max(...hs) - Math.min(...hs);
    console.log(JSON.stringify({ spread, lowest: Math.min(...hs), PY: Math.min(...hs) }));
} finally { agent.close(); }
