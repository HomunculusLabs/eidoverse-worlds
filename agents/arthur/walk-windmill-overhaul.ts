// Fresh post-place approach check. This is an MCPL route observation, NOT a
// browser avatar/collision proof: agent.ts deliberately abstains from support
// boxes for an entity carrying any part motion. The independent triangle-box
// verifier establishes the static doorway/aisle; this test reports its real limits.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { WorldAgent } from "../../mcpl/agent.ts";
const ROOT = resolve(import.meta.dir, "../.."), WORLD = "commons-next", ID = "nx-town-windmill";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace(/^wss:/, "https:").replace(/^ws:/, "http:").replace(/\/ws$/, "");
const r = await fetch(`${base}/geom?world=${WORLD}`);
if (!r.ok) throw Error(`geom HTTP ${r.status}`);
const all: any = await r.json(), e = all.entities.find((x: any) => x.id === ID);
if (!e || e.lib !== "store/a557d918b2c14f1a.glb" || e.pos[0] !== -40 || e.pos[1] !== 0 || e.pos[2] !== 0 || e.yaw !== Math.PI / 2 || e.scale !== 1) throw Error("post-overhaul tuple drift");
process.env.WORLD_TOKEN = cfg.joinToken;
const c = Math.cos(e.yaw), s = Math.sin(e.yaw);
const world = (x: number, z: number): [number, number] => [e.pos[0] + x * c + z * s, e.pos[2] - x * s + z * c];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-windmill-overhaul-walk", world: WORLD, avatar: cfg.avatar, agentToken: cfg.agentToken });
const route = [[0, 3.2], [0, 2.45], [0, 1.35], [0, -.5], [.65, -.5], [0, 1.35], [0, 2.45], [0, 4.5]];
const results: any[] = [];
try {
    await agent.connect(); await Bun.sleep(2200); agent.stop();
    const start = world(0, 4.5);
    const height = agent.heightAt(...start);
    agent.pos.x = start[0]; agent.pos.z = start[1]; agent.pos.y = height;
    for (const [i, local] of route.entries()) {
        const q = world(local[0], local[1]);
        const ok = await agent.walkTo(q[0], q[1], false, 20000);
        const arrival = Math.hypot(agent.pos.x - q[0], agent.pos.z - q[1]);
        results.push({ i, local, world: q, ok, arrival, actualY: agent.pos.y });
        if (!ok || arrival > .55) throw Error(`walk leg ${i} failed, arrival=${arrival}`);
    }
    const report = { status: "MCPL_ROUTE_ALL_PASS", id: ID, lib: e.lib, legs: results.length, maxArrival: Math.max(...results.map(x => x.arrival)), approachTerrainHeight: height, evidenceBoundary: "MCPL route only; moving-part entity support abstains. Static doorway separately triangle-tested, no browser-avatar claim.", results };
    writeFileSync(`${ROOT}/agents/arthur/reviews/windmill-overhaul/walk.json`, JSON.stringify(report, null, 2) + "\n");
    console.log(JSON.stringify(report, null, 2));
} finally { agent.close(); }
