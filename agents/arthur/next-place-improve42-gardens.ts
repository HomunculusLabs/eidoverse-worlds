// next-place-improve42-gardens.ts — improve-42: GARDEN FAMILY reseat
// (remove+spawn x5, exact standing tuples, five distinct shas -> five
// uploads paced 20s+ for the shared 4/min/IP budget). comps {} on every
// garden both sides (census-proven; no comp verbs). Gates fail-closed:
// hash gate on local bytes per work, per-id live pose+lib gate (accepts
// baseline prev lib OR the new pin = idempotent rerun), census total
// steady before/after, no riders/no light companions expected.
// Envelope: footprint strict-subset of baseline bbox on every axis
// (decode-proven same-tuple re-place, SAT-neutral).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
// exact standing tuples from the fresh pre-place census (improve-42 tick)
const SLOTS = [
    { id: "nx-cultivation-garden-0019", pos: [-79.354255867, 0.03701553556368211, 63.545330212], yaw: 2.35619449, work: 1639, prev: "d916f37355701255" },
    { id: "nx-cultivation-garden-0032", pos: [-70.894119993, 0.0276505409363984, 72.469434032], yaw: 2.35619449, work: 1652, prev: "38e4718c5efd1374" },
    { id: "nx-cultivation-garden-0045", pos: [-61.502777956, 0.027529785945452547, 80.922243372], yaw: 2.35619449, work: 1665, prev: "856d56746e3a42a3" },
    { id: "nx-cultivation-garden-0058", pos: [-53.224217316, 0.03137989008033212, 72.691689056], yaw: 2.35619449, work: 1678, prev: "e54ee386f08a7c21" },
    { id: "nx-cultivation-garden-0011", pos: [-86.104625929, 0.0456712809132166, 52.696406703], yaw: 2.35619449, work: 1691, prev: "01a4e80c02f03de7" },
];
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const die = (m: string): never => { throw Error(m); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
async function geom() {
    const r = await fetch(`${base}/geom?world=${WORLD}`);
    if (!r.ok) die(`geom ${r.status}`);
    const d: any = await r.json();
    return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}
// hash gate on local bytes per slot FIRST (fail-closed before any network)
for (const s of SLOTS) {
    const bytes = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/mason/glb-retex/work_${s.work}_garden.glb`));
    const h = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
    if (h === s.prev) die(`work ${s.work} still at baseline sha — cure not built`);
    s.new = h;
}
console.log(JSON.stringify({ new_pins: SLOTS.map(s => `${s.work}:${s.new}`) }));
const before = await geom();
const totalBefore = Object.keys(before).length;
console.log(JSON.stringify({ census_before: totalBefore }));
// per-slot gates
const needWork: typeof SLOTS = [];
for (const s of SLOTS) {
    const e = before[s.id];
    if (!e) die(`${s.id} not standing — this placer only reseats`);
    if (!e.pos.every((n: number, i: number) => near(n, s.pos[i]))) die(`${s.id} live pos drift ${e.pos} want ${s.pos}`);
    if (!near(e.yaw, s.yaw)) die(`${s.id} live yaw drift ${e.yaw}`);
    if (e.scale !== 1) die(`${s.id} scale ${e.scale}`);
    const bag = e.comp ?? {};
    if (Object.keys(bag).length !== 0) die(`${s.id} comp bag unexpected ${JSON.stringify(bag)}`);
    if (e.lib === `store/${s.new}.glb`) continue; // already flipped
    if (e.lib !== `store/${s.prev}.glb`) die(`${s.id} live lib drift ${e.lib}`);
    needWork.push(s);
}
if (needWork.length === 0) {
    console.log(JSON.stringify({ status: "ALREADY_LIVE_NO_VERBS", gardens: SLOTS.length, verbs: 0 }));
    process.exit(0);
}
console.log(JSON.stringify({ seats_needed: needWork.length, sat_preflight: "same-tuple re-place, footprint strict-subset (decode-proven)", exemption: "none needed" }));
// uploads: five DISTINCT shas — paced 20s+ for the shared 4/min/IP budget
const uploaded: string[] = [];
for (const s of needWork) {
    const bytes = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/mason/glb-retex/work_${s.work}_garden.glb`));
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next cultivation-garden family improve-42 work ${s.work}`);
    u.searchParams.set("by", cfg.id);
    let lib = "";
    for (let a = 1; a <= 5; a++) {
        const r = await fetch(u, { method: "POST", body: bytes });
        if (r.ok) { lib = (await r.json()).path; break; }
        if (r.status === 429 && a < 5) { await sleep(25_000); continue; } // shared budget backoff
        die(`upload ${s.work} ${r.status}`);
    }
    if (lib !== `store/${s.new}.glb`) die(`upload ${s.work} path ${lib} want ${s.new}`);
    uploaded.push(`${s.work}:${lib}`);
    console.log(JSON.stringify({ uploaded: lib }));
    await sleep(21_000); // shared 4/min budget pace
}
// verbs: remove+spawn per slot, paced 600ms+ (shared 12/4s)
const verbs: Array<[string, any]> = [];
for (const s of needWork) {
    verbs.push(["remove", { id: s.id }]);
    verbs.push(["spawn", { id: s.id, lib: `store/${s.new}.glb`, pos: s.pos, yaw: s.yaw, scale: 1 }]);
}
const WebSocket = (await import("ws")).default;
const ws = new WebSocket(cfg.url, { headers: { Authorization: `Bearer ${cfg.agentToken}` } });
const sent: string[] = [];
await new Promise<void>((res, rej) => {
    const to = setTimeout(() => rej(Error("ws timeout")), 30_000 + 600 * verbs.length);
    ws.on("open", () => {
        ws.send(JSON.stringify({ type: "join", world: WORLD, token: cfg.joinToken ?? cfg.agentToken }));
        verbs.forEach(([v, args], i) => setTimeout(() => { ws.send(JSON.stringify({ type: "verb", verb: v, args })); sent.push(v); }, 600 * (i + 1)));
        setTimeout(() => { clearTimeout(to); ws.close(); res(); }, 600 * verbs.length + 1500);
    });
    ws.on("error", e => { clearTimeout(to); rej(e); });
});
// post-place verify: fresh census — every garden at its new pin, tuple exact, comps {}, total steady
await sleep(1500);
const after = await geom();
const totalAfter = Object.keys(after).length;
if (totalAfter !== totalBefore) die(`census total drift ${totalBefore} -> ${totalAfter}`);
for (const s of SLOTS) {
    const e = after[s.id];
    if (!e) die(`${s.id} gone after reseat`);
    if (e.lib !== `store/${s.new}.glb`) die(`${s.id} post-place lib ${e.lib}`);
    if (!e.pos.every((n: number, i: number) => near(n, s.pos[i]))) die(`${s.id} post-place pos ${e.pos}`);
    if (!near(e.yaw, s.yaw)) die(`${s.id} post-place yaw ${e.yaw}`);
    const bag = e.comp ?? {};
    if (Object.keys(bag).length !== 0) die(`${s.id} post-place comp bag ${JSON.stringify(bag)}`);
}
console.log(JSON.stringify({ status: "PLACED_VERIFIED", gardens: SLOTS.length, verbs: sent.length, verbList: sent, census: totalAfter }));
