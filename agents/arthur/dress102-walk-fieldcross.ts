// dress102-walk-fieldcross.ts — two-way MCPL walk through the fieldcross
// corridor + into the lavender bed's center trench. Crossing-local walk
// line x +0.2336 (mown gap center): field side z -8.5 -> corridor mid
// -3.3 -> inner end -0.7 -> +1.5 INTO the bed trench (through the flush
// face) -> back out to the field. Chassis: struct77-walk-ogeegate.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const px = -17.845, pz = 84.294, yaw = -2.356194490192345, c = Math.cos(yaw), s = Math.sin(yaw);
const world = (x: number, z: number): [number, number] => [px + x * c + z * s, pz - x * s + z * c];
const start = world(0.2336, -8.5);
const route = [world(0.2336, -3.3), world(0.2336, -0.7), world(0.2336, 1.5), world(0.2336, -8.5)];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-dress102-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
try {
    await agent.connect(); await Bun.sleep(2200);
    agent.stop(); agent.pos.x = start[0]; agent.pos.z = start[1]; agent.pos.y = agent.heightAt(start[0], start[1]);
    for (let i = 0; i < route.length; i++) {
        const q = route[i], ok = await agent.walkTo(q[0], q[1], false, 25_000);
        const distance = Math.hypot(agent.pos.x - q[0], agent.pos.z - q[1]);
        results.push({ i, ok, distance: +distance.toFixed(3) });
        if (!ok || distance > .55) throw Error(`walk failed ${i}: ${distance}`);
    }
    console.log(JSON.stringify({ status: "ALL_PASS", legs: results.length, maxArrival: Math.max(...results.map(r => r.distance)) }));
} finally { agent.close(); }
