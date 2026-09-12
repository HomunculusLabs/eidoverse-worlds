// next-place-city108.ts — city-108: CITY-PLAN-V2 Wave A move #5:
// nx-struct-reuleauxrotor, worst remaining off-axis math-family stray
// (brg190.5 r65.6, ~165deg off the Math Avenue axis 356) -> math avenue
// band r55-130.
//
// OLD seat (-12, -0.0373, -64.5) yaw 0 [struct-84 S threshold kinetic pair
// with pendulum E; CITY-PLAN-V2 supersedes: math strays pull INTO the
// avenue band]. -> NEW seat (1.50, PY, 87.50) yaw 0 PRESERVED [spinning
// kinetic form — motion:sails rotates the whole form 2.5 deg/s; no static
// yaw read exists; struct-84 original contract yaw 0].
//
// SEAT = GEOMETRY CHAPTER EAST FLANK: scanner city108-scan.py design-rank
// #1 of 2748 lawful seats (all gates: SAT 1.4 / NN 8 incl. ground-film
// struct forms / band 356+/-10 / rim 55-130 / struct-84 CIRCUIT clearance
// >=0.3 — new gate this tick, see below). Rhythm: sunflowerdial r71 E ->
// sierpinski r80 W -> ROTOR r87.5 E -> kochgarden r90 axis -> hilbert
// r100 W — alternating flank cadence; the rotor is the chapter's KINETIC
// form (reuleaux triangle = constant-width curve in motion).
//
// SCANNER FIX THIS TICK (disclosed): the city107-class scanner counted NN
// against SOLIDS only — its rank-#1 would have planted the rotor 0.53m
// from kochgarden's center (inside the bed, h 0.315 film). Amendment 1's
// letter is "8m from ANY other struct form": NN now counts ALL
// nx-struct-* forms (films included); SAT keeps the film exemption
// (struct-19 law). Also added: the struct-84 standing walk contract
// (3.5m standoff circuit) must clear every solid by >=0.3m walker radius.
//
// SEAT PROOF (scanner on this tick's fresh census 326; placer re-runs
// every gate vs FRESH census before verbs):
//   sierpinski (-1.5,80) yaw pi: SAT 3.828 <- scanner worst (law 1.4)
//   kochgarden (-6.28,89.78): NN 8.08 (Amendment 1 law 8, films counted)
//   circuit 3.5m square: worst clearance 2.08 vs sierpinski (law 0.3)
//   band law: corner brgs dev <= 6.1deg of 356 (law 10)
//   rim 85.75..89.31 (law 55..130)
//   terrain (city108-terrain-rotor, 9 pts): spread 7.2mm, PY 0.0156056
//     lowest corner (c+-); grade +53mm vs old -0.0373 (disclosed)
//   walk-lines: 7.60m lateral of the avenue centerline ray — flank class
//     (> 3m), no network walk owed (city-106 precedent)
//
// COMP CONTRACT (differs from city-107's empty bag): live bag carries
// motion:pwheel_rr (240-pt deltoid path, 0.022935 m/s, loop, face false)
// + motion:sails (spin z 2.5 deg/s) — verified byte-equal to sidecar
// agents/arthur/struct83-rotor-comp.json THIS TICK (no hand
// transcription). Comp-wipe law: spawn wipes -> re-apply BOTH after
// spawn; gate comp equality BEFORE (drift = die, never overwrite) and
// AFTER.
//
// NO riders (census 20m sweep at old seat: zero artwalk ids, nearest
// non-neighbor 10.8m), NO companion light (no rotor-l in census).
//
// OWD: ONE standing walk tool pins the old seat — struct84-walk-rotor.ts
// (3.5m circuit + axis legs) — re-pinned to the live tuple in this same
// tick (sweep-77 class, city-13/14/107 idiom). The catenarygate axis
// legs it carried since city-107 belong to the GATE's seat (22.5m+ away,
// unaffected); replaced by a Math Avenue centerline leg at the rotor's z
// band, matching the tool's original spirit.
//
// Gates (fail-closed, all vs FRESH census this placer fetches):
//  1. local-bytes sha16 == live lib (zero-upload proof, content-addressed)
//  2. id at OLD or NEW tuple exactly (idempotent rerun => zero verbs)
//  3. SAT: exact yaw-aware OBB, true bbox center, MIN over census solids
//     >= 1.4 (ground films + networks + lights excluded)
//  4. band: every corner r in [55,130] AND brg in 356+/-10
//  5. NN floor: center distance >= 8 to every other nx-struct-* form
//     (FILMS INCLUDED — Amendment 1 letter)
//  6. comp contract: bag == sidecar before AND after
//  7. circuit: 3.5m standoff square clears every solid by >= 0.3
//  8. verbs paced 650ms; post-place deep-verify + census set-diff
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const die = (msg: string): never => { throw Error(msg); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-4;
const canon = (v: any): any => Array.isArray(v) ? v.map(canon) : v && typeof v == "object" ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canon(v[k])])) : v;
const eq = (a: any, b: any) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));

// ---- contract constants ----
const SELF = "nx-struct-reuleauxrotor";
const FILE = "village_reuleauxrotor3.glb";
const OLD: [number, number, number] = [-12, -0.0373, -64.5];
const OLD_YAW = 0;
const NEW: [number, number, number] = [1.5, 0.015605613090784481, 87.5];
const NEW_YAW = 0; // spinning kinetic form — yaw read is motion, not static
const CX = 0, CZ = 0; // true bbox local center (x,z) — origin-centered
const COMP = JSON.parse(readFileSync(`${ROOT}/agents/arthur/struct83-rotor-comp.json`, "utf8")) as Record<string, any>;
if (Object.keys(COMP).length !== 2) die(`sidecar comp count ${Object.keys(COMP).length}`);
if (COMP["motion:pwheel_rr"]?.type !== "path" || COMP["motion:pwheel_rr"]?.points?.length !== 240) die("sidecar path bad");
if (COMP["motion:sails"]?.type !== "spin" || COMP["motion:sails"]?.axis !== "z") die("sidecar spin bad");

async function geom() {
    const r = await fetch(`https://eidoverse.billding.dev/geom?world=${WORLD}`);
    if (!r.ok) die(`geom ${r.status}`);
    const d: any = await r.json();
    return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}

// gate 1: bytes -> sha -> wantLib (content-addressed; no hand-typed hashes)
const bytes = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/${FILE}`));
const sha = createHash("sha256").update(bytes).digest("hex");
const wantLib = `store/${sha.slice(0, 16)}.glb`;

const NETWORKS = new Set(["nx-town-roads", "nx-core-paths", "nx-approach-nw-lane-001", "nx-approach-ne-lane-002", "nx-approach-sw-lane-003"]);

function obbOf(px: number, pz: number, yaw: number, sx: number, sz: number, cx: number, cz: number) {
    const c = Math.cos(yaw), s = Math.sin(yaw);
    return { c: [px + cx * c + cz * s, pz - cx * s + cz * c], ax: [[c, -s], [s, c]], h: [sx / 2, sz / 2] };
}
function corners(o: any): Array<[number, number]> {
    const out: Array<[number, number]> = [];
    for (const lx of [-o.h[0], o.h[0]]) for (const lz of [-o.h[1], o.h[1]]) out.push([o.c[0] + lx * o.ax[0][0] + lz * o.ax[1][0], o.c[1] + lx * o.ax[0][1] + lz * o.ax[1][1]]);
    return out;
}
function gap(a: any, b: any) {
    const dx = b.c[0] - a.c[0], dy = b.c[1] - a.c[1];
    let best = -1e9;
    for (const ax of [a.ax[0], a.ax[1], b.ax[0], b.ax[1]]) {
        const pa = a.h[0] * Math.abs(ax[0] * a.ax[0][0] + ax[1] * a.ax[0][1]) + a.h[1] * Math.abs(ax[0] * a.ax[1][0] + ax[1] * a.ax[1][1]);
        const pb = b.h[0] * Math.abs(ax[0] * b.ax[0][0] + ax[1] * b.ax[0][1]) + b.h[1] * Math.abs(ax[0] * b.ax[1][0] + ax[1] * b.ax[1][1]);
        best = Math.max(best, Math.abs(dx * ax[0] + dy * ax[1]) - pa - pb);
    }
    return best;
}
function pointObbDist(p: Array<number>, o: any) {
    const dx = p[0] - o.c[0], dz = p[1] - o.c[1];
    const lx = dx * o.ax[0][0] + dz * o.ax[0][1], lz = dx * o.ax[1][0] + dz * o.ax[1][1];
    return Math.hypot(Math.max(Math.abs(lx) - o.h[0], 0), Math.max(Math.abs(lz) - o.h[1], 0));
}

// ---- fresh census + gate 2 (tuple) + gate 6a (comp before) ----
const before = await geom();
const beforeIds = new Set(Object.keys(before));
const e = before[SELF];
if (!e) die(`${SELF} absent from census`);
const atOld = e.pos.every((n: number, i: number) => near(n, OLD[i])) && near(e.yaw, OLD_YAW);
const atNew = e.pos.every((n: number, i: number) => near(n, NEW[i])) && near(e.yaw, NEW_YAW);
if (!atOld && !atNew) die(`${SELF} tuple drift (live ${e.pos} yaw ${e.yaw} lib ${e.lib}; want old ${OLD} yaw ${OLD_YAW} or new ${NEW} yaw ${NEW_YAW})`);
if (e.lib !== wantLib) die(`${SELF} live lib ${e.lib} != local-bytes wantLib ${wantLib} (content-address contract broken)`);
if (!eq(e.comp ?? {}, COMP)) die(`${SELF} comp drift before move: live ${JSON.stringify(Object.keys(e.comp))} != sidecar ${JSON.stringify(Object.keys(COMP))}`);
if (atNew) { console.log(JSON.stringify({ status: "PLACED_VERIFIED", note: "already at NEW tuple — zero verbs (idempotent)", id: SELF, pos: NEW, yaw: NEW_YAW, lib: wantLib })); process.exit(0); }

// ---- gates 3-5+7 (SAT/band/NN/circuit) on fresh census, at the NEW tuple ----
const bb = e.bbox, cc = bb.center ?? [0, 0, 0];
const self = obbOf(NEW[0], NEW[2], NEW_YAW, bb.size[0], bb.size[2], cc[0], cc[2]);
const cs = corners(self);
const radii = cs.map(p => Math.hypot(p[0], p[1]));
const brgs = cs.map(p => (Math.atan2(p[0], p[1]) * 180 / Math.PI + 360) % 360);
if (Math.min(...radii) < 55 || Math.max(...radii) > 130) die(`avenue rim law FAIL ${Math.min(...radii).toFixed(2)}..${Math.max(...radii).toFixed(2)} (need 55..130)`);
for (const b of brgs) { const d = Math.min(Math.abs(b - 356), 360 - Math.abs(b - 356)); if (d > 10) die(`band law FAIL corner brg ${b.toFixed(1)} (356+/-10)`); }
// circuit points (struct-84 standing walk contract, 3.5m standoff square)
const circPts: Array<[number, number]> = [];
for (let t = 0; t < 4; t++) for (const u of [-1, -0.5, 0, 0.5, 1]) {
    const k = 3.5;
    if (t === 0) circPts.push([NEW[0] + u * k, NEW[2] + k]);
    else if (t === 1) circPts.push([NEW[0] + k, NEW[2] - u * k]);
    else if (t === 2) circPts.push([NEW[0] - u * k, NEW[2] - k]);
    else circPts.push([NEW[0] - k, NEW[2] + u * k]);
}
let worst = 1e9, worstId = "";
let nnMin = 1e9, nnId = "";
let circWorst = 1e9, circId = "";
for (const [id, o] of Object.entries(before)) {
    if (id === SELF || NETWORKS.has(id) || id.endsWith("-l")) continue;
    const ob = o.bbox; if (!ob?.size) continue;
    if (Math.max(Math.abs(ob.size[0]), Math.abs(ob.size[2])) < 0.001) continue; // lights
    const y = o.yaw ?? 0, oc = ob.center ?? [0, 0, 0];
    const other = obbOf(o.pos[0], o.pos[2], y, ob.size[0], ob.size[2], oc[0], oc[2]);
    if (ob.size[1] > 0.5) { // solid: SAT + circuit (films exempt — struct-19 law)
        const g = gap(self, other);
        if (g < worst) { worst = g; worstId = id; }
        const cd = Math.min(...circPts.map(p => pointObbDist(p as Array<number>, other)));
        if (cd < circWorst) { circWorst = cd; circId = id; }
    }
    if (id.startsWith("nx-struct-")) { const d = Math.hypot(o.pos[0] - NEW[0], o.pos[2] - NEW[2]); if (d < nnMin) { nnMin = d; nnId = id; } } // NN counts FILMS (Amendment 1 letter)
}
if (worst < 1.4) die(`SAT FAIL worst ${worst.toFixed(3)} vs ${worstId} (law 1.4)`);
if (nnMin < 8) die(`NN floor FAIL ${nnMin.toFixed(2)} vs ${nnId} (Amendment 1 law 8, films counted)`);
if (circWorst < 0.3) die(`CIRCUIT FAIL ${circWorst.toFixed(2)} vs ${circId} (law 0.3 walker radius)`);
console.log(`gates: SAT fresh worst ${worst.toFixed(3)} vs ${worstId}; NN ${nnMin.toFixed(2)} vs ${nnId} (films counted); circuit ${circWorst.toFixed(2)} vs ${circId}; rim ${Math.min(...radii).toFixed(2)}..${Math.max(...radii).toFixed(2)}; band corners ${Math.min(...brgs.map(b => Math.min(Math.abs(b - 356), 360 - Math.abs(b - 356)))).toFixed(1)}deg max dev`);

// ---- verbs (remove + spawn + comp x2; paced 650ms; join-then-schedule-all law) ----
const verbs: Array<[string, any]> = [
    ["remove", { id: SELF }],
    ["spawn", { id: SELF, lib: wantLib, pos: [...NEW], yaw: NEW_YAW, scale: 1 }],
];
for (const [type, data] of Object.entries(COMP)) verbs.push(["comp", { id: SELF, type, data }]);
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-city108-relocate", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => reject(Error("websocket error"));
    ws.onmessage = (ev: any) => {
        const x = JSON.parse(ev.data);
        if (x.type === "error") reject(Error(`server ${x.error}`));
        else if (x.type === "snapshot") joined = true;
    };
});

// ---- post-verify (tuple + comp + set-diff) ----
const after = await geom();
const a = after[SELF];
if (!(a?.lib === wantLib && a.pos.every((n: number, j: number) => near(n, NEW[j])) && near(a.yaw, NEW_YAW) && a.scale === 1 && eq(a.comp ?? {}, COMP))) die(`${SELF} post-place failed (pos ${a?.pos} yaw ${a?.yaw} comp ${Object.keys(a?.comp ?? {})})`);
const afterIds = new Set(Object.keys(after));
const arrivals = [...afterIds].filter(i => !beforeIds.has(i));
const departures = [...beforeIds].filter(i => !afterIds.has(i));
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: SELF, from: OLD, to: NEW.map(n => +n.toFixed(5)), yawRad: NEW_YAW, lib: wantLib, verbs: verbs.length, comps: Object.keys(COMP), census: afterIds.size, arrivals, departures }));
if (arrivals.length || departures.length) console.log("NOTE: sibling-lane delta during window (classified, not this lane's move)");
