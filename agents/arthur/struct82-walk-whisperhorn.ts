// struct82-walk-whisperhorn.ts — circuit MCPL walk around the whisper horn.
// Seat (-64.02, -0.028, -61.82) yaw 0 (azimuthally symmetric). Folly: circuit
// at 4.0m standoff (disc rim 2.05 + 1.95m margin) — 6-corner circuit, well
// clear of the 1.4m law and the skymirror 6.2m out.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const px = -64.02, pz = -61.82;
const S = 4.0;
const start: [number, number] = [px + S, pz];
const route: [number, number][] = [
    [px + S * Math.cos(Math.PI / 3), pz + S * Math.sin(Math.PI / 3)],
    [px - S * Math.cos(Math.PI / 3), pz + S * Math.sin(Math.PI / 3)],
    [px - S, pz],
    [px - S * Math.cos(Math.PI / 3), pz - S * Math.sin(Math.PI / 3)],
    [px + S * Math.cos(Math.PI / 3), pz - S * Math.sin(Math.PI / 3)],
    [px + S, pz],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct82-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
