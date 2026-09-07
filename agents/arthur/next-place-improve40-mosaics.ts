// next-place-improve40-mosaics.ts — improve-40: MOSAIC FAMILY reseat
// (remove+spawn x4, exact standing tuples, FOUR uploads — distinct shas).
// Gates fail-closed: local hash gate per work, per-id live pose+lib gate
// (accepts the live baseline lib OR the new pin = idempotent rerun),
// census total steady before/after, comps {} x4 both sides (census-proven;
// no comp verbs), no riders/no light companions expected.
// Envelope: footprint strict-subset (outerR 10.49 < baseline 10.50,
// decode-proven) -> SAT-neutral same-tuple re-place x4; vertical growth only
// (y 0..2.60). The mosaics are 21m discs at gallery row r=45 — nearest
// neighbors are other mosaic discs 40m+ apart (fresh census preflight
// verifies zero neighbors within 15m of any slot before verbs).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
// work -> (entity id, new sha, baseline live sha)
const SLOTS = [
    { id: "nx-gallery-mosaic-0036", work: 1643, sha: "f2faa018fdc4ab88", prev: "1655ae806c3b8fe3" },
    { id: "nx-gallery-mosaic-0048", work: 1656, sha: "751485c71195a8dc", prev: "b6491515b25ef439" },
    { id: "nx-gallery-mosaic-0052", work: 1669, sha: "68be6c5a1958a733", prev: "83c4817f73507493" },
    { id: "nx-gallery-mosaic-0059", work: 1682, sha: "c237715d0ae8ad12", prev: "505bec0b589f786f" },
];
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const die = (m: string): never => { throw Error(m); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
async function geom() {
    const r = await fetch(`${base}/geom?world=${WORLD}`, { signal: AbortSignal.timeout(20_000) });
    if (!r.ok) die(`geom ${r.status}`);
    const d: any = await r.json();
    return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}
// gate 1: local bytes hash per work
const bytesByWork = new Map<number, Uint8Array>();
for (const s of SLOTS) {
    const bytes = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/mason/glb-retex/work_${String(s.work).padStart(4, "0")}_mosaic.glb`));
    const h = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
    if (h !== s.sha) die(`work ${s.work} local bytes hash drift ${h}`);
    bytesByWork.set(s.work, bytes);
}
console.log(JSON.stringify({ local_hash_gate: "PASS x4" }));
const before = await geom();
const totalBefore = Object.keys(before).length;
console.log(JSON.stringify({ census_before: totalBefore }));
// gate 2: per-slot live pose + lib + comps; capture exact tuples; neighbor check
const needWork: typeof SLOTS = [];
for (const s of SLOTS) {
    const e = before[s.id];
    if (!e) die(`${s.id} not standing — this placer only reseats`);
    const bag = e.comp ?? {};
    if (Object.keys(bag).length !== 0) die(`${s.id} comp bag unexpected ${JSON.stringify(bag)}`);
    if (e.lib === `store/${s.sha}.glb`) continue; // already flipped
    if (e.lib !== `store/${s.prev}.glb`) die(`${s.id} live lib drift ${e.lib}`);
    s.pos = e.pos; s.yaw = e.yaw; // exact standing tuple from the LIVE census
    if (e.scale !== 1) die(`${s.id} scale ${e.scale}`);
    needWork.push(s);
}
// neighbor preflight: no other entity center within 15m of any slot center
for (const s of SLOTS) {
    for (const [oid, oe] of Object.entries(before)) {
        if (!SLOTS.some(t => t.id === oid)) {
            const [ox, , oz] = oe.pos;
            const d = Math.hypot(ox - s.pos[0], oz - s.pos[2]);
            if (d < 15) die(`neighbor ${oid} within ${d.toFixed(2)}m of ${s.id}`);
        }
    }
}
console.log(JSON.stringify({ neighbor_preflight: "clear >=15m", seats_needed: needWork.length }));
if (needWork.length === 0) {
    console.log(JSON.stringify({ status: "ALREADY_LIVE_NO_VERBS", mosaics: SLOTS.length, verbs: 0 }));
    process.exit(0);
}
// FOUR uploads, paced 20s+ (shared 4/min budget), 429 backoff
const uploaded: string[] = [];
for (const s of needWork) {
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next gallery-mosaic improve-40 work ${s.work}`);
    u.searchParams.set("by", cfg.id);
    let lib = "";
    for (let a = 1; a <= 5; a++) {
        const r = await fetch(u, { method: "POST", body: bytesByWork.get(s.work) });
        if (r.ok) { lib = (await r.json()).path; break; }
        if (r.status === 429 && a < 5) { await sleep(25_000); continue; } // shared budget backoff
        die(`upload work ${s.work} ${r.status}`);
    }
    if (lib !== `store/${s.sha}.glb`) die(`upload path work ${s.work}: ${lib} want ${s.sha}`);
    uploaded.push(lib);
    console.log(JSON.stringify({ uploaded: lib }));
    if (s !== needWork[needWork.length - 1]) await sleep(21_000);
}
// verbs: remove+spawn per slot, paced 600ms+ (shared 12/4s)
const verbs: Array<[string, any]> = [];
for (const s of needWork) {
    verbs.push(["remove", { id: s.id }]);
    verbs.push(["spawn", { id: s.id, lib: `store/${s.sha}.glb`, pos: s.pos, yaw: s.yaw, scale: 1 }]);
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
// post-place verify: fresh census — every mosaic at its new pin, tuple exact, comps {}, total steady
await sleep(1500);
const after = await geom();
const totalAfter = Object.keys(after).length;
if (totalAfter !== totalBefore) die(`census total drift ${totalBefore} -> ${totalAfter}`);
for (const s of SLOTS) {
    const e = after[s.id];
    if (!e) die(`${s.id} gone after reseat`);
    if (e.lib !== `store/${s.sha}.glb`) die(`${s.id} post-place lib ${e.lib}`);
    if (!e.pos.every((n: number, i: number) => near(n, s.pos[i]))) die(`${s.id} post-place pos ${e.pos} want ${s.pos}`);
    if (!near(e.yaw, s.yaw)) die(`${s.id} post-place yaw ${e.yaw}`);
    const bag = e.comp ?? {};
    if (Object.keys(bag).length !== 0) die(`${s.id} post-place comp bag ${JSON.stringify(bag)}`);
}
console.log(JSON.stringify({ status: "PLACED_VERIFIED", mosaics: SLOTS.length, verbs: sent.length, verbList: sent, census: totalAfter }));
