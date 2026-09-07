// struct80-walk-screwwell.ts — circuit MCPL walk around the screw well.
// Seat (-88, 0.017, 0) yaw π. The work is an open machine: circuit at 5.2m
// standoff (rim of the true envelope + 1.4m law margin) with a mid-face
// probe point on each long side. Chassis: struct77-walk-ogeegate law.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const px = -88, pz = 0, yaw = Math.PI, c = Math.cos(yaw), s = Math.sin(yaw);
const world = (x: number, z: number): [number, number] => [px + x * c + z * s, pz - x * s + z * c];
// circuit corners in local frame (standoff 0.9 beyond true envelope) + two face probes
const start = world(2.96, -3.7);
const route = [world(6.95, -3.7), world(6.95, 2.45), world(2.96, 2.45), world(-1.0, 2.45), world(-1.0, -3.7), world(2.96, -3.7)];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct80-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
