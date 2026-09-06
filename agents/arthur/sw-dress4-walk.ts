// sw-dress4-walk.ts — dress-4 two-way MCPL walk-test on the placed gravel path.
// Route: down the SW approach leg onto the gravel path and back (leg centerline
// az 217.25 r66 -> r78 path far end, midpoints keep legs under the walk budget).
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const d2r = (d: number) => (d * Math.PI) / 180;
const a = d2r(217.25);
const pol = (r: number): [number, number] => [r * Math.sin(a), r * Math.cos(a)];

const agent = new WorldAgent({ url: cfg.url, name: "arthur-dress4-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
const results: any[] = [];
try {
    await agent.connect();
    await Bun.sleep(2200);
    agent.stop();
    const S = pol(66);
    agent.pos.x = S[0]; agent.pos.z = S[1];
    agent.pos.y = agent.heightAt(S[0], S[1]);
    const M1 = pol(70), E = pol(78), M2 = pol(74);
    const route: Array<[string, number, number]> = [
        ["leg-r66", ...S], ["leg-r70", ...M1], ["path-center-r74", ...M2], ["path-far-r78", ...E],
        ["path-center-r74", ...M2], ["leg-r70", ...M1], ["leg-r66", ...S],
    ];
    for (let i = 0; i < route.length; i++) {
        const [name, x, z] = route[i];
        const ok = await agent.walkTo(x, z, false, 40_000);
        const distance = Math.hypot(agent.pos.x - x, agent.pos.z - z);
        results.push({ i, name, ok, distance: +distance.toFixed(2) });
        if (!ok || distance > 0.55) throw new Error(`walk failed at leg ${i} (${name}): arrival ${distance.toFixed(2)}`);
    }
    console.log(JSON.stringify({ status: "ALL_PASS", legs: results.length, maxArrival: Math.max(...results.map(r => r.distance)), results }, null, 1));
} finally { agent.close(); }
