// struct103-walk-catenoid.ts — two-way MCPL walk through the catenoid's
// door lane (local -z door, chord 2.2m, head 2.22m). RE-PINNED city-109
// (sweep-77 vacated-tool class): seat moved (26.30,-53.93) yaw π/2 ->
// (-14.25, 91.25) yaw 0 [Math Avenue geometry-chapter west flank]. yaw 0:
// local -z -> world (0,-1), lane runs N-S through the tower, door reads
// due S toward the incoming village->N avenue walk (same door-to-walk
// contract as the old seat, re-based to the new bearing). Chassis:
// struct100-walk law.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const px = -14.25, pz = 91.25, yaw = 0, c = Math.cos(yaw), s = Math.sin(yaw);
const world = (x: number, z: number): [number, number] => [px + x * c + z * s, pz - x * s + z * c];
const start = world(0, 6.0), route = [world(0, -6.0), world(0, 6.0)];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct103-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
