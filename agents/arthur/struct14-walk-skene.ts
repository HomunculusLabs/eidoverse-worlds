// struct14-walk-skene.ts — struct-14: MCPL stage->skene gate. YAW=pi at
// (-23.32,48.05): world = [PX - x... compute: wx=PX+x*cos+z*sin=PX-x? cos(pi)=-1,sin=0 => wx=PX-x, wz=PZ-z]. Stage face at local z 0..-0.26 (wall). Legs: from stage disc -> front of wall -> along wall front -> back.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const PX = -23.32, PZ = 48.05;
const pt = (x: number, z: number): [number, number] => [PX - x, PZ - z]; // yaw pi
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct14-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
async function leg(name: string, end: [number, number]) {
    const ok = await agent.walkTo(end[0], end[1], false, 20_000);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    results.push({ name, ok, dist: +dist.toFixed(3) });
    if (!ok || dist > .7) throw Error(`${name} failed ok=${ok} dist=${dist}`);
}
try {
    await agent.connect(); await Bun.sleep(1700); agent.stop();
    // start on the stage disc (world 42.55 z)
    const from = [-23.32, 42.55] as [number, number];
    agent.pos.x = from[0]; agent.pos.z = from[1]; agent.pos.y = agent.heightAt(...from); await Bun.sleep(250);
    await leg("stage->wallFront", pt(0, 1.3));      // 1.3m in front of the wall face
    await leg("wallFront->eastCheek", pt(4.2, 1.6));
    await leg("eastCheek->behindWall", pt(0, -1.3));
    await leg("behindWall->back-to-stage", from);
    console.log(JSON.stringify({ status: "ALL_PASS", results }, null, 2));
} finally { agent.close(); }
