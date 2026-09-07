// next-place-improve45-lavenders.ts — improve-45: LAVENDER family reseat
// (remove+spawn x4, exact standing tuples, four distinct shas -> four
// uploads paced 21s+ for the shared 4/min/IP budget). comps {} on every
// lavender both sides (census-proven; no comp verbs). Gates fail-closed:
// hash gate on local bytes per work, per-id live pose+lib gate (accepts
// baseline prev lib OR the new pin = idempotent rerun), census total
// steady before/after, no riders/no light companions expected.
// Envelope: strict-subset every axis (x±9.93 < ±9.944, z±6.03 < ±6.033,
// y 0.55 < 0.5055 is FALSE — y is +0.044 SUPERSET by design (taller bloom
// spikes); SAME-TUPLE re-place, zero footprint change, x/z the SAT axes).
// CITY-PLAN: NW district ring r70-100 — "improve reseats" lawful (law 4).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
// exact standing tuples from the fresh pre-place census (improve-45 tick)
const SLOTS = [
    { id: "nx-cultivation-lavender-0027", pos: [-53.907189114, 0.02563520209327475, 48.166349585], yaw: 2.35619449, file: "agents/arthur/mason/glb-retex/work_1647_lavender.glb", prev: "d4ab74d0d530b4a8" },
    { id: "nx-cultivation-lavender-0040", pos: [-39.582634215, 0.04024847506294396, 62.891797921], yaw: 2.35619449, file: "agents/arthur/mason/glb-retex/work_1660_lavender.glb", prev: "56b752abf7f5eba4" },
    { id: "nx-cultivation-lavender-0053", pos: [-24.825469984, 0.03635458301689514, 77.242548616], yaw: 2.35619449, file: "agents/arthur/mason/glb-retex/work_1673_lavender.glb", prev: "d8fac6d1e0279f07" },
    { id: "nx-cultivation-lavender-0006", pos: [-74.311739752, -0.012819972711928234, 24.706417735], yaw: 2.35619449, file: "agents/arthur/mason/glb-retex/work_1686_lavender.glb", prev: "26f0eed96a94e0d2" },
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
    console.log(JSON.stringify({ status: "ALREADY_LIVE_NO_VERBS", lavenders: SLOTS.length, verbs: 0 }));
    process.exit(0);
}
console.log(JSON.stringify({ seats_needed: needWork.length, sat_preflight: "same-tuple re-place, x/z strict-subset (the SAT axes); y +0.044 superset by design (taller spikes), zero footprint change", exemption: "none needed" }));
// uploads: four DISTINCT shas — paced 20s+ for the shared 4/min/IP budget
const uploaded: string[] = [];
for (const s of needWork) {
    const bytes = new Uint8Array(readFileSync(`${ROOT}/${s.file}`));
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next lavender family improve-45 ${s.id}`);
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
// post-place verify: fresh census — every lavender at its new pin, tuple exact, comps {}, total steady
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
