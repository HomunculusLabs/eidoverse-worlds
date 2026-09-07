// next-place-improve38-seeds.ts — improve-38: SEED FAMILY reseat
// (remove+spawn x4, exact standing tuples, ONE upload). All four temple
// seeds are degenerate (one shared sha 710ec3e5 live) -> one new lib
// 699387ab re-pins the whole family (artwalk-d set-completion class).
// comps {} on every seed both sides (census-proven; no comp verbs).
// Gates fail-closed: hash gate on local bytes, per-id live pose+lib gate
// (accepts baseline 710ec3e5 OR the new pin = idempotent rerun), census
// total steady before/after, no riders/no light companions expected.
// Envelope: footprint +-3.275 BYTE-IDENTICAL to baseline (decode-proven
// same-tuple re-place, SAT-neutral); vertical growth only.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const SHA = "699387abdef0b16f";
const PREV = "710ec3e5c66a0378";
// exact standing tuples from the fresh pre-place census (this tick)
const SLOTS = [
    { id: "nx-temple-seed-0003", pos: [-68.890997, -0.006158492639495652, -17.176455], yaw: -2.35619449 },
    { id: "nx-temple-seed-0013", pos: [-60.211415, -0.016528677980768906, -37.624268], yaw: -2.35619449 },
    { id: "nx-temple-seed-0021", pos: [-45.63792, -0.05444576041354715, -54.389155], yaw: -2.35619449 },
    { id: "nx-temple-seed-0034", pos: [-26.597068, -0.04801350921268022, -65.830054], yaw: -2.35619449 },
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
const bytes = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/mason/glb-retex/work_1644_seed.glb`));
const h = createHash("sha256").update(bytes).digest("hex");
if (h.slice(0, 16) !== SHA) die(`local bytes hash drift ${h.slice(0, 16)}`);
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
    if (e.lib === `store/${SHA}.glb`) continue; // already flipped
    if (e.lib !== `store/${PREV}.glb`) die(`${s.id} live lib drift ${e.lib}`);
    needWork.push(s);
}
if (needWork.length === 0) {
    console.log(JSON.stringify({ status: "ALREADY_LIVE_NO_VERBS", seeds: SLOTS.length, lib: `store/${SHA}.glb`, verbs: 0 }));
    process.exit(0);
}
console.log(JSON.stringify({ seats_needed: needWork.length, sat_preflight: "same-tuple re-place, footprint byte-identical (decode-proven)", exemption: "none needed" }));
// ONE upload for the whole family (shared sha)
const u = new URL(`${base}/upload`);
u.searchParams.set("token", cfg.agentToken);
u.searchParams.set("name", `commons-next temple-seed family improve-38`);
u.searchParams.set("by", cfg.id);
let lib = "";
for (let a = 1; a <= 5; a++) {
    const r = await fetch(u, { method: "POST", body: bytes });
    if (r.ok) { lib = (await r.json()).path; break; }
    if (r.status === 429 && a < 5) { await sleep(25_000); continue; } // shared budget backoff
    die(`upload ${r.status}`);
}
if (lib !== `store/${SHA}.glb`) die(`upload path ${lib} want ${SHA}`);
console.log(JSON.stringify({ uploaded: lib }));
// verbs: remove+spawn per slot, paced 600ms+ (shared 12/4s)
const verbs: Array<[string, any]> = [];
for (const s of needWork) {
    verbs.push(["remove", { id: s.id }]);
    verbs.push(["spawn", { id: s.id, lib: `store/${SHA}.glb`, pos: s.pos, yaw: s.yaw, scale: 1 }]);
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
// post-place verify: fresh census — every seed at the new pin, tuple exact, comps {}, total steady
await sleep(1500);
const after = await geom();
const totalAfter = Object.keys(after).length;
if (totalAfter !== totalBefore) die(`census total drift ${totalBefore} -> ${totalAfter}`);
for (const s of SLOTS) {
    const e = after[s.id];
    if (!e) die(`${s.id} gone after reseat`);
    if (e.lib !== `store/${SHA}.glb`) die(`${s.id} post-place lib ${e.lib}`);
    if (!e.pos.every((n: number, i: number) => near(n, s.pos[i]))) die(`${s.id} post-place pos ${e.pos}`);
    if (!near(e.yaw, s.yaw)) die(`${s.id} post-place yaw ${e.yaw}`);
    const bag = e.comp ?? {};
    if (Object.keys(bag).length !== 0) die(`${s.id} post-place comp bag ${JSON.stringify(bag)}`);
}
console.log(JSON.stringify({ status: "PLACED_VERIFIED", seeds: SLOTS.length, lib: `store/${SHA}.glb`, verbs: sent.length, verbList: sent, census: totalAfter }));
