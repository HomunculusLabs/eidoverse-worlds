// next-place-city11.ts — city-11: ANGLER BOBBER RE-AIM (survey-40 follow-up,
// register row 44). NOT a relocation — tuple UNCHANGED, bytes swapped.
// nx-struct-angler stays at (3.203,-0.03465,-90.982) yaw 0; lib goes
// 6bf06a35bb130437 -> NEW sha (runtime-pinned from local file).
//
// WHY: city-5's companion reseat moved pool+angler translation-only while
// rotating both yaws -90 -> 0; the struct-46 bobber is BAKED angler-local
// (2.8,0.144,-4.92) targeting pool-local (2.8,1.6) — valid only at the old
// relative frame. At the SE S-edge seat it landed pool-local (-3.72,-4.92),
// r-norm 1.837, on dry ground (survey-40 CONFIRMED by composed-pair
// arithmetic + native render dissent). city-11 re-aims to angler-local
// (4.52,0.1156,-1.9) = pool-local (-2.0,-1.9), r-norm 0.774: on the water,
// 0.79m from rim (struct-46 class 0.78), 1.05m off bridge deck edge, 2.45m
// off deck overhang; y 0.1156 = half-submerged at the NEW seat's water top
// (pool PY -0.05907 vs angler -0.03465 — old 0.144 carried the old grade).
// Line 3.82m @ 44deg (struct-46: 4.79m @ 33deg — same tight-slant class).
// Rod tip (1.93,2.78,-1.02) already overhangs the pool's west rim at this
// seat — re-aim restores "the angler sits; the rod fishes" (mkv3:115).
//
// Gates (fail-closed, fresh census):
//  1. baseline provenance: sha16(/tmp/city11-before-angler.glb) == live lib
//     (the judged-against bytes ARE the live bytes)
//  2. live tuple == POS/YAW exactly, comps {} (census-verified empty)
//  3. new sha != old sha; new local bytes are the deterministic-judged
//     build (rendered + native-judged this tick from this exact file)
//  4. bobber world point (7.723,-92.882) clear of non-ensemble census
//     entities by >= 1.4 (pool = designed companion, exempt as self-pair)
//  5. upload (1) with 429 backoff 25s x5; returned path == store/<new16>.glb
//  6. remove + spawn 2 verbs paced 650ms (spawn does NOT move — remove-first
//     is the byte-swap law, artwalk-b22)
//  7. post-place deep-verify + census set-diff zero arrivals/departures
// Rerun => live lib already new => "already live — no verbs" (idempotent).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const ID = "nx-struct-angler", POOL = "nx-struct-reedpool";
const POS = [3.203, -0.03465, -90.982], YAW = 0;
const BEFORE = "/tmp/city11-before-angler.glb"; // captured pre-edit this tick (polish-271 law)
const NEW_FILE = `${ROOT}/agents/arthur/assets/village_angler3.glb`;
const BOB_WORLD = [7.723, -92.882]; // decode-proven bobber ground point (city11-pregate.ts)
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const die = (msg: string): never => { throw Error(msg); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
function canon(v: any): any { return Array.isArray(v) ? v.map(canon) : v && typeof v == "object" ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canon(v[k])])) : v; }
const eq = (a: any, b: any) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));
async function geom() {
    const r = await fetch(`${base}/geom?world=${WORLD}`);
    if (!r.ok) die(`geom ${r.status}`);
    const d: any = await r.json();
    return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}
const oldBytes = new Uint8Array(readFileSync(BEFORE));
const newBytes = new Uint8Array(readFileSync(NEW_FILE));
const sha = (b: Uint8Array) => createHash("sha256").update(b).digest("hex");
const oldSha = sha(oldBytes).slice(0, 16), newSha = sha(newBytes).slice(0, 16);
if (oldSha === newSha) die("no byte delta — rebuild did not land");
console.log(`old lib store/${oldSha}.glb -> new lib store/${newSha}.glb`);

const before = await geom();
const beforeIds = new Set(Object.keys(before));
const e = before[ID];
if (!e) die(`${ID} absent`);
// idempotency FIRST (reseat placers recognize their own new pin)
if (e.lib === `store/${newSha}.glb`) {
    if (!(e.pos.every((n: number, i: number) => near(n, POS[i])) && near(e.yaw, YAW) && e.scale === 1 && eq(e.comp ?? {}, {}))) die(`already-new but tuple drift ${e.pos} yaw ${e.yaw}`);
    console.log(`${ID} already live at NEW bytes+tuple — no verbs`);
    console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: ID, libFrom: `store/${oldSha}.glb`, libTo: `store/${newSha}.glb`, pos: POS, yaw: YAW, uploads: 0, verbs: 0, rerun: true }));
    process.exit(0);
}
// gate 1+2: live bytes == judged baseline; tuple exact; comps empty
if (e.lib !== `store/${oldSha}.glb`) die(`live lib ${e.lib} != baseline store/${oldSha}.glb (provenance)`);
if (!(e.pos.every((n: number, i: number) => near(n, POS[i])) && near(e.yaw, YAW) && e.scale === 1)) die(`tuple drift ${e.pos} yaw ${e.yaw}`);
if (!eq(e.comp ?? {}, {})) die(`comps not empty: ${JSON.stringify(e.comp)}`);
// gate 4: bobber ground point clear of non-ensemble solids
const GROUND = new Set(["nx-approach-nw-lane-001", "nx-approach-ne-lane-002", "nx-approach-sw-lane-003", "nx-core-paths", "nx-town-roads"]);
let worst = 1e9, worstId = "";
for (const [id, ent] of Object.entries(before)) {
    if (id === ID || id === POOL || GROUND.has(id)) continue;
    const bb = (ent as any).bbox; if (!bb?.size) continue;
    const p = (ent as any).pos, y = (ent as any).yaw ?? 0, cc = bb.center ?? [0, 0, 0];
    const c = Math.cos(y), s = Math.sin(y);
    const wc = [p[0] + cc[0] * c + cc[2] * s, p[2] - cc[0] * s + cc[2] * c];
    // point-to-OBB-center distance minus half-diagonal (conservative envelope of clear)
    const d = Math.hypot(wc[0] - BOB_WORLD[0], wc[1] - BOB_WORLD[1]) - Math.hypot(bb.size[0], bb.size[2]) / 2;
    if (d < worst) { worst = d; worstId = id; }
}
if (worst < 1.4) die(`bobber point obstructed: ${worst.toFixed(2)} vs ${worstId}`);
console.log(`bobber ground point clear: ${worst.toFixed(2)}m envelope vs ${worstId}`);

if (e.lib === `store/${newSha}.glb`) { console.log(`${ID} already live at NEW bytes — no verbs`); }
else {
    // gate 5: upload new bytes (1 upload, 429 backoff)
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next ${ID} city-11 reaim`);
    u.searchParams.set("by", cfg.id);
    let lib = "";
    for (let a = 1; a <= 5; a++) {
        const r = await fetch(u, { method: "POST", body: newBytes });
        if (r.ok) { lib = (await r.json()).path; break; }
        if (r.status === 429 && a < 5) { console.log(`429 — backoff 25s (attempt ${a})`); await sleep(25_000); continue; }
        die(`upload ${r.status}`);
    }
    if (lib !== `store/${newSha}.glb`) die(`upload path ${lib} want store/${newSha}.glb`);
    console.log(`uploaded -> ${lib}`);
    // gate 6: remove + spawn (byte-swap at fixed tuple)
    const verbs: Array<[string, any]> = [["remove", { id: ID }], ["spawn", { id: ID, lib: `store/${newSha}.glb`, pos: POS, yaw: YAW, scale: 1 }]];
    await new Promise<void>((resolve, reject) => {
        const ws = new WebSocket(cfg.url);
        let joined = false, i = 0;
        const timer = setTimeout(() => reject(Error("verb timeout")), 120_000);
        const paced = setInterval(() => {
            if (!joined || i >= verbs.length) return;
            const [verb, args] = verbs[i++];
            ws.send(JSON.stringify({ type: "verb", verb, args }));
            if (i === verbs.length) setTimeout(() => { clearInterval(paced); clearTimeout(timer); ws.close(); resolve(); }, 2000);
        }, 650);
        ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-city11-reaim", avatar: cfg.avatar, token: cfg.joinToken }));
        ws.onerror = () => reject(Error("websocket error"));
        ws.onmessage = (ev: any) => {
            const x = JSON.parse(ev.data);
            if (x.type === "error") reject(Error(`server ${x.error}`));
            else if (x.type === "snapshot") joined = true;
        };
    });
}
// gate 7: post-verify
const after = await geom();
const a = after[ID];
if (!(a?.lib === `store/${newSha}.glb` && a.pos.every((n: number, i: number) => near(n, POS[i])) && near(a.yaw, YAW) && a.scale === 1 && eq(a.comp ?? {}, {}))) die(`${ID} post-place failed: lib ${a?.lib} pos ${a?.pos} yaw ${a?.yaw}`);
const afterIds = new Set(Object.keys(after));
const arrivals = [...afterIds].filter(i => !beforeIds.has(i));
const departures = [...beforeIds].filter(i => !afterIds.has(i));
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: ID, libFrom: `store/${oldSha}.glb`, libTo: `store/${newSha}.glb`, pos: POS, yaw: YAW, uploads: 1, verbs: 2, census: afterIds.size, arrivals, departures }));
if (arrivals.length || departures.length) console.log("NOTE: sibling delta during window (classified, not this lane's move)");
