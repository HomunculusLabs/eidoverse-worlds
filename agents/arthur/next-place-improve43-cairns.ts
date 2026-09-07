// next-place-improve43-cairns.ts — improve-43: WILD-CAIRN family reseat
// (remove+spawn x5, exact standing tuples, five distinct shas -> five
// uploads paced 21s+ for the shared 4/min/IP budget). comps {} on every
// cairn both sides (census-proven; no comp verbs). Gates fail-closed:
// hash gate on local bytes per work, per-id live pose+lib gate (accepts
// baseline prev lib OR the new pin = idempotent rerun), census total
// steady before/after, no riders/no light companions expected.
// Envelope: y strict-subset (1.51 < 1.73), x/z byte-aligned ring rng
// (SAT-neutral same-tuple re-place, contact-audit-proven).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
// exact standing tuples from the fresh pre-place census (improve-43 tick)
const SLOTS = [
    { id: "nx-wild-cairn-0022", pos: [28.73858, -0.07426829800275718, -88.448256], yaw: -2.35619449, work: 1642, prev: "a4450b4094f75297" },
    { id: "nx-wild-cairn-0048", pos: [52.00494, -0.0345969160626097, -77.100494], yaw: -2.35619449, work: 1655, prev: "09ed84ef059f3bc7" },
    { id: "nx-wild-cairn-0043", pos: [71.242133, 0.007238005337997962, -59.779248], yaw: -2.35619449, work: 1668, prev: "5d6c3edda71cc228" },
    { id: "nx-wild-cairn-0047", pos: [84.959728, -0.02598558885747508, -37.826508], yaw: -2.35619449, work: 1681, prev: "109e5bc57c5f7cb0" },
    { id: "nx-wild-cairn-0050", pos: [92.09493, -0.028882407863270138, -12.943098], yaw: -2.35619449, work: 1694, prev: "efedd3614fe4ae88" },
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
    const bytes = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/mason/glb-retex/work_${s.work}_cairnfield.glb`));
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
    console.log(JSON.stringify({ status: "ALREADY_LIVE_NO_VERBS", cairns: SLOTS.length, verbs: 0 }));
    process.exit(0);
}
console.log(JSON.stringify({ seats_needed: needWork.length, sat_preflight: "same-tuple re-place, y strict-subset + x/z byte-aligned rings (contact-audit-proven)", exemption: "none needed" }));
// uploads: five DISTINCT shas — paced 20s+ for the shared 4/min/IP budget
const uploaded: string[] = [];
for (const s of needWork) {
    const bytes = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/mason/glb-retex/work_${s.work}_cairnfield.glb`));
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next wild-cairn family improve-43 work ${s.work}`);
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
// post-place verify: fresh census — every cairn at its new pin, tuple exact, comps {}, total steady
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
