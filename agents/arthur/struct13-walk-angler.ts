// struct13-walk-angler.ts — struct-13: MCPL approach gate for the
// Angler's Rest. YAW=-pi/2: world = [PX - z, PZ + x]. Cantilever/rail at
// local -Z -> world +X (toward pool). Legs: bank approach -> deck land
// side -> bench front -> rail side -> back to bank.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -23.6, PZ = -38.37, YAW = -Math.PI / 2, c = Math.cos(YAW), s = Math.sin(YAW);
const world = (x: number, z: number): [number, number] => [PX + x * c + z * s, PZ - x * s + z * c];
const pts = {
    bank: world(0, 3.0),
    deckLand: world(0, 1.0),
    bench: world(0, 0.3),
    rail: world(0, -1.6),
    bankAgain: world(2.5, 2.5),
};
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct13-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
async function leg(name: string, end: [number, number]) {
    const ok = await agent.walkTo(end[0], end[1], false, 20_000);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    results.push({ name, ok, dist: +dist.toFixed(3) });
    if (!ok || dist > .7) throw Error(`${name} failed ok=${ok} dist=${dist}`);
}
try {
    await agent.connect(); await Bun.sleep(1700); agent.stop();
    agent.pos.x = pts.bank[0]; agent.pos.z = pts.bank[1]; agent.pos.y = agent.heightAt(...pts.bank); await Bun.sleep(250);
    await leg("bank->deckLand", pts.deckLand);
    await leg("deckLand->bench", pts.bench);
    await leg("bench->rail", pts.rail);
    await leg("rail->bankAgain", pts.bankAgain);
    console.log(JSON.stringify({ status: "ALL_PASS", results }, null, 2));
} finally { agent.close(); }
