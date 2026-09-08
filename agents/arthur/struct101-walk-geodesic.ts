// struct101-walk-geodesic.ts — two-way MCPL walk through the pavilion's
// entry lane. Seat (16.54, 57.68) yaw 0. The -z entry (two cut equator
// sectors, chord 3.762m) faces the village; walk the N-S lane through the
// open interior, both directions. Chassis: struct100-walk-sierpinski law.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const px = 16.54, pz = 57.68, yaw = 0, c = Math.cos(yaw), s = Math.sin(yaw);
const world = (x: number, z: number): [number, number] => [px + x * c + z * s, pz - x * s + z * c];
const start = world(0, 6.0), route = [world(0, -6.0), world(0, 6.0)];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct101-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
