// improve33-walk-windmill.ts — improve-33 falsification (4): two-way MCPL
// door walk (enterable mill room), per the committed contract. The mill room
// door is host-local +Z (doorGapWall "rfront" at z 2.5, gap |x|<0.7); host at
// (-40,0,0) yaw π/2. Chassis: improve32-walk-woodyard.ts.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const px = -40, pz = 0, yaw = Math.PI / 2, c = Math.cos(yaw), s = Math.sin(yaw);
const world = (x: number, z: number): [number, number] => [px + x * c + z * s, pz - x * s + z * c];
// outside → door → inside → out the door → outside (two-way; walk the aisle |x|<0.7)
const start = world(0, 4.5);
const route = [
    world(0, 2.8),   // door threshold
    world(0, 1.4),   // inside the mill room (aisle)
    world(-1.0, 1.4),// across the room (west side, clear of door lane)
    world(0, 2.8),   // back to threshold
    world(0, 4.5),   // outside
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-improve33-windmill-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
try {
    await agent.connect();
    await Bun.sleep(2200);
    agent.stop();
    agent.pos.x = start[0]; agent.pos.z = start[1]; agent.pos.y = agent.heightAt(...start);
    for (let i = 0; i < route.length; i++) {
        const q = route[i];
        const ok = await agent.walkTo(q[0], q[1], false, 25_000);
        const distance = Math.hypot(agent.pos.x - q[0], agent.pos.z - q[1]);
        results.push({ i, ok, distance });
        if (!ok || distance > 0.55) throw new Error(`walk failed at leg ${i}: ${distance}`);
    }
    console.log(JSON.stringify({ status: "ALL_PASS", legs: results.length, maxArrival: Math.max(...results.map(r => r.distance)).toFixed(3) }));
} finally {
    agent.close();
}
