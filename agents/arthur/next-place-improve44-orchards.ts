// next-place-improve44-orchards.ts — improve-44: ORCHARD family reseat
// (remove+spawn x5, exact standing tuples, five distinct shas -> five
// uploads paced 21s+ for the shared 4/min/IP budget). comps {} on every
// orchard both sides (census-proven; no comp verbs). Gates fail-closed:
// hash gate on local bytes per work, per-id live pose+lib gate (accepts
// baseline prev lib OR the new pin = idempotent rerun), census total
// steady before/after, no riders/no light companions expected.
// Envelope: rotation x4 strict-subset (±6.8 < ±7.25, y 4.17 < 4.52);
// 0033 x/z baseline-adjacent (rng-preserved, aisle/gate byte-stable).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
// exact standing tuples from the fresh pre-place census (improve-44 tick)
const SLOTS = [
    { id: "nx-cultivation-orchard-0020", pos: [-75.073890346, 0.03541361196741313, 43.892251036], yaw: 2.35619449, file: "agents/arthur/mason/glb-retex/work_1640_orchard.glb", prev: "24bcfc6a15d55613" },
    { id: "nx-cultivation-orchard-0046", pos: [-43.205814584, 0.041268072595556725, 82.188872132], yaw: 2.35619449, file: "agents/arthur/mason/glb-retex/work_1666_orchard.glb", prev: "ec93dc09acc0ddfa" },
    { id: "nx-cultivation-orchard-0059", pos: [-30.84178331, -0.0002733106081673675, 91.6224328], yaw: 2.35619449, file: "agents/arthur/mason/glb-retex/work_1679_orchard.glb", prev: "8d3959f01e32c335" },
    { id: "nx-cultivation-orchard-0012", pos: [-88.7346892568504, 0.019921379876134182, 35.79681905684085], yaw: 2.35619449, file: "agents/arthur/mason/glb-retex/work_1692_orchard.glb", prev: "dc4d7059985e47a8" },
    { id: "nx-cultivation-orchard-0033", pos: [-61.87184335382291, 0.02514020801364989, 61.87184335382291], yaw: 2.35619449, file: "agents/arthur/assets/village_cultivation_orchard_0033.glb", prev: "a3bb3487b355bf2d" },
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
    const bytes = new Uint8Array(readFileSync(`${ROOT}/${s.file}`));
    const h = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
    if (h === s.prev) die(`${s.id} still at baseline sha — cure not built`);
    s.new = h;
}
console.log(JSON.stringify({ new_pins: SLOTS.map(s => `${s.id.split("-").pop()}:${s.new}`) }));
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
    console.log(JSON.stringify({ status: "ALREADY_LIVE_NO_VERBS", orchards: SLOTS.length, verbs: 0 }));
    process.exit(0);
}
console.log(JSON.stringify({ seats_needed: needWork.length, sat_preflight: "same-tuple re-place, x/z strict-subset (rotation) / baseline-adjacent (0033, rng-preserved)", exemption: "none needed" }));
// uploads: five DISTINCT shas — paced 20s+ for the shared 4/min/IP budget
const uploaded: string[] = [];
for (const s of needWork) {
    const bytes = new Uint8Array(readFileSync(`${ROOT}/${s.file}`));
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next orchard family improve-44 ${s.id}`);
    u.searchParams.set("by", cfg.id);
    let lib = "";
    for (let a = 1; a <= 5; a++) {
        const r = await fetch(u, { method: "POST", body: bytes });
        if (r.ok) { lib = (await r.json()).path; break; }
        if (r.status === 429 && a < 5) { await sleep(25_000); continue; } // shared budget backoff
        die(`upload ${s.id} ${r.status}`);
    }
    if (lib !== `store/${s.new}.glb`) die(`upload ${s.id} path ${lib} want ${s.new}`);
    uploaded.push(`${s.id}:${lib}`);
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
// post-place verify: fresh census — every orchard at its new pin, tuple exact, comps {}, total steady
await sleep(1500);
const after = await geom();
const totalAfter = Object.keys(after).length;
if (totalAfter !== totalBefore) die(`census drift ${totalBefore} -> ${totalAfter}`);
for (const s of SLOTS) {
    const e = after[s.id];
    if (!e) die(`${s.id} GONE after reseat`);
    if (!e.pos.every((n: number, i: number) => near(n, s.pos[i]))) die(`${s.id} post pos ${e.pos}`);
    if (!near(e.yaw, s.yaw)) die(`${s.id} post yaw ${e.yaw}`);
    if (e.lib !== `store/${s.new}.glb`) die(`${s.id} post lib ${e.lib} want ${s.new}`);
    if (Object.keys(e.comp ?? {}).length !== 0) die(`${s.id} post comp ${JSON.stringify(e.comp)}`);
}
console.log(JSON.stringify({ status: "PLACED_VERIFIED", verbs: sent.length, verb_kinds: [...new Set(sent)], census: totalAfter, slots: SLOTS.length }));
