// struct8-walk-millrace.ts — struct-8: MCPL bank-walk gate for the
// Millrace. YAW=-pi/2: world = [PX + z, PZ - x]. Race descends local +z
// (head at z0, basin at z~10.3). Legs: from the windmill road to the head,
// along the north bank past all seven steps, around the basin, back along
// the south bank. Banks are local x ±2.4.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -37.59, PZ = -13.68, YAW = -Math.PI / 2, c = Math.cos(YAW), s = Math.sin(YAW);
const world = (x: number, z: number): [number, number] => [PX + x * c + z * s, PZ - x * s + z * c];
const pts = {
    road: world(0, -3.5),          // approach from windmill side (uphill of head)
    headN: world(2.4, 0.5),        // north bank at the head
    midN: world(2.4, 5.0),         // north bank mid-race
    basin: world(2.6, 10.6),       // east of the basin
    midS: world(-2.4, 5.0),        // south bank mid-race
    headS: world(-2.4, 0.5),       // south bank at the head
};
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct8-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
async function leg(name: string, end: [number, number]) {
    const ok = await agent.walkTo(end[0], end[1], false, 20_000);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    results.push({ name, ok, dist: +dist.toFixed(3) });
    if (!ok || dist > .55) throw Error(`${name} failed ok=${ok} dist=${dist}`);
}
try {
    await agent.connect(); await Bun.sleep(1700); agent.stop();
    agent.pos.x = pts.road[0]; agent.pos.z = pts.road[1]; agent.pos.y = agent.heightAt(...pts.road); await Bun.sleep(250);
    await leg("road->headN", pts.headN);
    await leg("headN->midN", pts.midN);
    await leg("midN->basin", pts.basin);
    await leg("basin->midS", pts.midS);
    await leg("midS->headS", pts.headS);
    console.log(JSON.stringify({ status: "ALL_PASS", results }, null, 2));
} finally { agent.close(); }
