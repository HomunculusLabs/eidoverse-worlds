// Windmill overhaul: explicit --apply or --rollback, otherwise READ-ONLY preflight.
// User's direct commission; commons-next only. No other entity receives a verb.
// Run from repository root. Never prints credentials. Preserve object-shaped comps.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { resolve } from "node:path";
const ROOT = resolve(import.meta.dir, "../.."), WORLD = "commons-next", ID = "nx-town-windmill";
const REVIEW = `${ROOT}/agents/arthur/reviews/windmill-overhaul`;
const FILE = `${ROOT}/agents/arthur/assets/village_windmill_overhaul.glb`;
const OLD = "store/369c572480b0e786.glb";
const SHA = "a557d918b2c14f1ab5f0e0e066f2720d4f16b3364c9ce854971a68310fa6f296";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const RIDS = ["nx-artwalk-b10-windmill-four-wind-crown", "nx-sign-mill-001"];
const POS = [-40, 0, 0], YAW = Math.PI / 2;
const motion = (axis: number[], rpm: number) => ({ type: "spin", axis, pivot: [0, 0, 0], rpm, phase: 0, t0: Date.parse("2026-09-08T00:26:01Z") });
const BAG = { "motion:sails": motion([0, 0, 1], 1.25), "motion:well_millstone": motion([0, 1, 0], 5) };
const apply = process.argv.includes("--apply"), rollback = process.argv.includes("--rollback");
if (apply && rollback) throw Error("choose apply or rollback, not both");
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace(/^wss:/, "https:").replace(/^ws:/, "http:").replace(/\/ws$/, "");
if (new URL(base).hostname !== "eidoverse.billding.dev") throw Error("unexpected world endpoint: refusing mutation");
const bytes = readFileSync(FILE);
if (createHash("sha256").update(bytes).digest("hex") !== SHA) throw Error("reviewed source bytes changed");
const baseline = JSON.parse(readFileSync(`${REVIEW}/before/census.json`, "utf8"));
const baselineMap = Object.fromEntries(baseline.entities.map((e: any) => [e.id, e]));
const tuple = (e: any) => e && ({ id: e.id, lib: e.lib, pos: e.pos, yaw: e.yaw, scale: e.scale, parent: e.parent ?? null, comp: e.comp });
const expected = (lib: string, comp: any) => ({ id: ID, lib, pos: POS, yaw: YAW, scale: 1, parent: null, comp });
if (!isDeepStrictEqual(tuple(baselineMap[ID]), expected(OLD, {}))) throw Error("baseline contract drift");
async function census() {
    const r = await fetch(`${base}/geom?world=${WORLD}`, { signal: AbortSignal.timeout(25000) });
    if (!r.ok) throw Error(`census HTTP ${r.status}`);
    const data: any = await r.json();
    if (!Array.isArray(data.entities) || !data.entities.length) throw Error("invalid census");
    const map = Object.fromEntries(data.entities.map((e: any) => [e.id, e]));
    if (Object.keys(map).length !== data.entities.length) throw Error("duplicate census IDs");
    return { data, map };
}
function assertRiders(map: any) {
    for (const id of RIDS) if (!isDeepStrictEqual(map[id], baselineMap[id])) throw Error(`rider drift: ${id}`);
}
async function gate() {
    // Full geometry/door/rotor/site verifier owns spatial truth, against a fresh census.
    const p = Bun.spawn(["bun", "agents/arthur/verify-windmill-overhaul.ts"], { cwd: ROOT, stdout: "inherit", stderr: "inherit" });
    if (await p.exited !== 0) throw Error("geometry/site preflight FAILED — zero mutations");
}
const before = await census(); assertRiders(before.map);
const live = tuple(before.map[ID]);
if (!isDeepStrictEqual(live, expected(OLD, {})) && !isDeepStrictEqual(live, expected(LIB, BAG))) throw Error("windmill drift or partial application; inspect explicitly before continuing");
const target = rollback ? expected(OLD, {}) : expected(LIB, BAG);
if (isDeepStrictEqual(live, target)) {
    console.log(JSON.stringify({ status: "ALREADY_LIVE_NO_VERBS", id: ID, tuple: live, uploads: 0, verbs: 0, ridersUnchanged: RIDS }));
    process.exit(0);
}
await gate();
if (!apply && !rollback) {
    console.log(JSON.stringify({ status: "PREFLIGHT_PASS_NO_MUTATION", previous: live, target, uploads: 0, verbs: 0 }));
    process.exit(0);
}
mkdirSync(REVIEW, { recursive: true });
writeFileSync(`${REVIEW}/${rollback ? "rollback" : "apply"}-preflight.json`, JSON.stringify(before.data, null, 2) + "\n");
let uploads = 0;
if (!rollback) {
    // One upload. A server-side optimizer may later serve different compressed
    // bytes under this source address; capture/review served bytes after placement.
    const url = new URL(`${base}/upload`);
    url.searchParams.set("token", cfg.agentToken); url.searchParams.set("by", cfg.id);
    url.searchParams.set("name", "Windmill overhaul — tapered smock and canvas sails");
    for (let attempt = 0; attempt < 4; attempt++) {
        const r = await fetch(url, { method: "POST", body: bytes, signal: AbortSignal.timeout(45000) });
        uploads++;
        if (r.status === 429 && attempt < 3) { await Bun.sleep(30000); continue; }
        if (!r.ok) throw Error(`upload HTTP ${r.status}; no verbs sent`);
        const out: any = await r.json(); if (out.path !== LIB) throw Error("uploaded path mismatch");
        break;
    }
}
// Recheck after upload; no replacement if another lane touched the host/riders.
const last = await census(); assertRiders(last.map);
if (!isDeepStrictEqual(tuple(last.map[ID]), live)) throw Error("world changed during preflight; no verbs sent");
await gate();
const verbs: Array<[string, any]> = [
    ["remove", { id: ID }],
    ["spawn", { id: ID, lib: target.lib, pos: POS, yaw: YAW, scale: 1 }],
    ...Object.entries(target.comp).map(([type, data]) => ["comp", { id: ID, type, data }] as [string, any]),
];
await new Promise<void>((resolveDone, reject) => {
    const ws = new WebSocket(cfg.url); let joined = false, next = 0, finished = false;
    const finish = (error?: Error) => {
        if (finished) return; finished = true; clearTimeout(deadline); clearInterval(pace); ws.close();
        if (error) reject(error); else resolveDone();
    };
    const deadline = setTimeout(() => finish(Error(`verb timeout after ${next}/${verbs.length}; inspect partial live state`)), 35000);
    const pace = setInterval(() => {
        if (!joined || finished || next >= verbs.length) return;
        const [verb, args] = verbs[next++]; ws.send(JSON.stringify({ type: "verb", verb, args }));
        if (next === verbs.length) setTimeout(() => finish(), 1800);
    }, 750);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-windmill-overhaul-builder", avatar: cfg.avatar, token: cfg.joinToken, agentToken: cfg.agentToken }));
    ws.onerror = () => finish(Error("websocket error"));
    ws.onmessage = ev => {
        try { const msg = JSON.parse(String(ev.data)); if (msg.type === "error") finish(Error(`server refused: ${msg.error}`)); else if (msg.type === "snapshot") joined = true; }
        catch { finish(Error("invalid websocket JSON")); }
    };
    ws.onclose = () => { if (!finished) finish(Error(`early socket close after ${next}/${verbs.length}`)); };
});
const after = await census(); assertRiders(after.map);
if (!isDeepStrictEqual(tuple(after.map[ID]), target)) throw Error("post-place exact tuple/component verification FAILED");
const foreignChanged = Object.keys(before.map).filter(id => id !== ID && !isDeepStrictEqual(after.map[id], before.map[id]));
writeFileSync(`${REVIEW}/${rollback ? "rollback" : "live"}-census.json`, JSON.stringify(after.data, null, 2) + "\n");
const report = { status: rollback ? "ROLLBACK_VERIFIED" : "PLACED_VERIFIED", sourceSha256: SHA, tuple: target, uploads, verbs: verbs.length, ridersUnchanged: RIDS, foreignChangesDuringRun: foreignChanged };
writeFileSync(`${REVIEW}/deployment.json`, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
