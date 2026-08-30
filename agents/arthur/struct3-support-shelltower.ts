// struct3-support-shelltower.ts — struct-3: physics support probe. Place the
// avatar ABOVE the ramp at three parametric points and observe settle height.
// Settling ON the ribbon (y ≈ ramp y + body half) proves the trimesh surface
// supports a body; falling to grade proves the ramp is not standable.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -2.65, PZ = -37.91, YAW = 0.06978887730267769, c = Math.cos(YAW), s = Math.sin(YAW);
const TURNS = 2.25, R0 = 3.4, R1 = 0.6, Y0 = 0.42, Y1 = 7.25;
const rampY = (t: number) => Y0 + (Y1 - Y0) * t;
const pt = (t: number): [number, number, number] => {
    const phi = t * TURNS * 2 * Math.PI;
    const r = R0 * Math.pow(R1 / R0, t);
    const lx = r * Math.sin(phi), lz = r * Math.cos(phi);
    return [PX + lx * c + lz * s, rampY(t), PZ - lx * s + lz * c];
};
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct3-support", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
try {
    await agent.connect(); await Bun.sleep(1700); agent.stop();
    for (const t of [0.2, 0.5, 0.8]) {
        const [x, ry, z] = pt(t);
        agent.pos.x = x; agent.pos.z = z; agent.pos.y = ry + 1.0; // drop from 1m above ramp
        await Bun.sleep(1200); // let physics settle
        const settled = +agent.pos.y.toFixed(2);
        results.push({ t, rampY: +ry.toFixed(2), settledY: settled, supported: settled > ry - 0.3 && settled < ry + 1.2, pos: [+x.toFixed(2), +z.toFixed(2)] });
    }
    console.log(JSON.stringify({ status: results.every(r => r.supported) ? "SUPPORT_PASS" : "SUPPORT_FAIL", results }, null, 2));
} finally { agent.close(); }
