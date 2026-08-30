// struct6-walk-reedpool.ts — struct-6: MCPL two-way bridge crossing gate.
// YAW=-pi/2: world x = PX + z, world z = PZ - x. Bridge spans local z
// (deck along local Z => world X). Legs: N bank -> across -> S bank, back.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -17.08, PZ = -38.37, YAW = -Math.PI / 2, c = Math.cos(YAW), s = Math.sin(YAW);
const world = (x: number, z: number): [number, number] => [PX + x * c + z * s, PZ - x * s + z * c];
// local: bridge deck runs along z -3.85..3.85; masts at x=1.25.
const pts = { bankN: world(0, -5.5), deckN: world(0, -3.3), mid: world(0, 0), deckS: world(0, 3.3), bankS: world(0, 5.5) };
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct6-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
async function leg(name: string, end: [number, number]) {
    const ok = await agent.walkTo(end[0], end[1], false, 25_000);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    results.push({ name, ok, dist: +dist.toFixed(3), end: end.map(v => +v.toFixed(2)) });
    if (!ok || dist > .55) throw Error(`${name} failed ok=${ok} dist=${dist}`);
}
try {
    await agent.connect(); await Bun.sleep(1700); agent.stop();
    agent.pos.x = pts.bankN[0]; agent.pos.z = pts.bankN[1]; agent.pos.y = agent.heightAt(...pts.bankN); await Bun.sleep(250);
    await leg("bankN->deckN", pts.deckN);
    await leg("deckN->mid", pts.mid);
    await leg("mid->deckS", pts.deckS);
    await leg("deckS->bankS", pts.bankS);
    await leg("bankS->bankN (full re-cross)", pts.bankN);
    console.log(JSON.stringify({ status: "ALL_PASS", results }, null, 2));
} finally { agent.close(); }
