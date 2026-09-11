// struct100-walk-sierpinski.ts — two-way MCPL walk through the spire's open
// base lane. RE-PINNED city-104: seat (-1.5,80.0) yaw pi (Math Avenue band
// r80, city-104 Wave A move). The +z base vertex opens the gate lane toward
// the village; yaw pi maps local +z to world -z (south). Walk the N-S lane
// through the central void, both directions. Chassis: struct77-walk-ogeegate law.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const px = -1.5, pz = 80.0, yaw = Math.PI, c = Math.cos(yaw), s = Math.sin(yaw);
const world = (x: number, z: number): [number, number] => [px + x * c + z * s, pz - x * s + z * c];
const start = world(0, 6.0), route = [world(0, -6.0), world(0, 6.0)];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct100-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
