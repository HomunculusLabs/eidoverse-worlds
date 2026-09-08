// struct105-terrain-hilbert.ts — 9-point terrain preflight for the HILBERT
// LABYRINTH seat az184 r100 (-6.98, 99.76), footprint ±4.21. PY = lowest
// corner (walls must seat into grade; floor is terrain itself).
// Constructor law: new WorldAgent({url, name, world, avatar, agentToken})
// from config.json (object form — string arg silently never joins).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -6.98, PZ = 99.76, H = 4.21;
const pts: Array<[number, number, string]> = [
    [PX, PZ, "center"],
    [PX - H, PZ - H, "rim-nw"], [PX + H, PZ - H, "rim-ne"], [PX - H, PZ + H, "rim-sw"], [PX + H, PZ + H, "rim-se"],
    [PX, PZ - H, "rim-n"], [PX, PZ + H, "rim-s"], [PX - H, PZ, "rim-w"], [PX + H, PZ, "rim-e"],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct105-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
    await agent.connect(); await Bun.sleep(1700); agent.stop();
    let lo = Infinity, hi = -Infinity, loName = "";
    for (const [x, z, name] of pts) {
        const y = agent.heightAt(x, z);
        console.log(`${name}: ${y.toFixed(5)}`);
        if (y < lo) { lo = y; loName = name; }
        hi = Math.max(hi, y);
    }
    console.log(`spread ${(hi - lo).toFixed(4)}m | lowest ${loName} ${lo.toFixed(5)} = PY`);
} finally { agent.close(); }
