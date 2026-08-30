import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const px = -40, pz = 0, yaw = Math.PI / 2, c = Math.cos(yaw), s = Math.sin(yaw);
const world = (x: number, z: number): [number, number] => [px + x * c + z * s, pz - x * s + z * c];
const outside = world(0, 5.0), apron = world(0, 3.2), inside = world(0, 1.4), room = world(0, 0);
const route = [apron, inside, room, inside, apron, outside];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-artwalk-b10-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
try {
  await agent.connect();
  await Bun.sleep(2200);
  agent.stop();
  agent.pos.x = outside[0]; agent.pos.z = outside[1]; agent.pos.y = agent.heightAt(...outside);
  for (let i = 0; i < route.length; i++) {
    const q = route[i];
    const ok = await agent.walkTo(q[0], q[1], false, 25_000);
    const distance = Math.hypot(agent.pos.x - q[0], agent.pos.z - q[1]);
    results.push({ i, ok, distance });
    if (!ok || distance > 0.55) throw new Error(`walk failed at leg ${i}: ${distance}`);
  }
  console.log(JSON.stringify({ status: "ALL_PASS", legs: results.length, maxArrival: Math.max(...results.map(r => r.distance)) }));
} finally {
  agent.close();
}
