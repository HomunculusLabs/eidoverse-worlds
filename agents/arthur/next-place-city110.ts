// next-place-city110.ts — city-110: CITY-PLAN-V2 Wave A move #7:
// nx-struct-lemniscateseat (the ∞ seat), next-worst off-axis math-family
// stray (brg263.3 r60.4, ~97deg off the Math Avenue axis 356) -> math
// avenue band r55-130.
//
// OLD seat (-60, -0.0237, -7) yaw pi/2 [struct-90 W-spoke wayside station;
// CITY-PLAN-V2 supersedes: math strays pull INTO the avenue band].
// -> NEW seat (1.50, -0.02079, 107.75) yaw pi.
//
// YAW LAW (loop law 3, read depends on it): struct-90 contract = the ∞
// reads FACE-ON to the approaching walker. Build local x = long axis,
// local +z = face normal (lobes read from local +z). Old yaw pi/2 mapped
// local +z -> world +x (E), toward the W-ward walker on the W spoke.
// New yaw pi maps local +z -> world -z (S) — face normal aims back down
// the avenue at the INCOMING village->N walk (same re-based idiom as
// city-109 catenoid door); long axis local +x -> world -x (E-W), both
// lobes readable from the walking line.
//
// SEAT = GEOMETRY CHAPTER DEEP WINDOW, EAST FLANK REST: scanner
// city110-scan.py (replicating placer gates exactly, 0.25m grid) found 800
// lawful band seats; window distribution disclosed (city110-window-dist.py):
// avenue mouth (r55-63) ZERO lawful seats — echoarch (brg342 r60, W pocket
// behind ninesbridge) + ninesbridge (r70 NN) + sunflowerdial (r71 NN) own
// it; bridge/bay (r63-78) ZERO. Design-rank family = chapter deep window
// E flank (540 seats). Chosen (1.50,107.75) over scanner row #1 (1.00,
// 107.25) for DOUBLE SAT margin (2.011/2.130 vs 1.511/1.630 — rank
// preference disclosed, city-109 precedent): composition hilbert r100 W ->
// INFINITY SEAT r107.5 E -> dodecahedron r110 W — the wayside rest INSIDE
// the geometry chapter between the labyrinth and its climax solid; the
// chapter walk threads E of hilbert with 2.01m walker-thread clearance
// past the seat's W face.
//
// SEAT PROOF (scanner on this tick's fresh census 326; placer re-runs
// every gate vs FRESH census before verbs):
//   dodecahedron (-7.67,109.73): SAT 2.011 <- scanner worst (law 1.4)
//   hilbertlabyrinth (-6.98,99.76): SAT 2.130 (next-worst)
//   catenarygate (-1.50,115.50): NN 8.31 (Amendment 1 law 8, films counted)
//   band law: corner brgs dev <= 7.1deg of 356 (law 10)
//   rim 106.13..109.55 (law 55..130)
//   terrain (city110-terrain-lemniscate, 9 pts): spread 6.5mm,
//     PY -0.02079 lowest corner (corner-nw; +2.9mm grade vs old -0.0237)
//   walk-lines: lateral 9.01m of the avenue axis ray — deep flank class
//     (>> 3m), no network walk owed (city-106 precedent); struct-90
//     beside-not-on law satisfied (seat sits BESIDE the chapter, not on
//     the axis ray)
//
// COMP CONTRACT: bag EMPTY before and after (census-verified this tick);
// no comp verbs; comp-wipe law satisfied trivially — gate still enforced.
// (struct-90: node bead is emissive material, glow_ln KEEP — no comps.)
//
// NO riders (census: parent None, zero artwalk ids within 20m of old
// seat — nearest are stillwind 10.6m, temple seeds 13.5m+, standalone),
// NO companion light (no lemniscateseat-l in census).
// NO standing walk tools pinned to the old seat (grep verified this tick).
//
// Gates (fail-closed, all vs FRESH census this placer fetches):
//  1. local-bytes sha16 == live lib (zero-upload proof, content-addressed)
//  2. id at OLD or NEW tuple exactly (idempotent rerun => zero verbs)
//  3. SAT: exact yaw-aware OBB, true bbox center, MIN over census solids
//     >= 1.4 (ground films + networks + lights excluded)
//  4. band: every corner r in [55,130] AND brg in 356+/-10
//  5. NN floor: center distance >= 8 to every other nx-struct-* form
//     (FILMS INCLUDED — Amendment 1 letter)
//  6. comp contract: bag == {} before AND after
//  (no door-lane gate: the bench has no door chord — city-109 gate 7 was
//   catenoid-specific)
//  7. verbs paced 650ms; post-place deep-verify + census set-diff
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const die = (msg: string): never => { throw Error(msg); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-4;
const canon = (v: any): any => Array.isArray(v) ? v.map(canon) : v && typeof v == "object" ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canon(v[k])])) : v;
const eq = (a: any, b: any) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));

// ---- contract constants ----
const SELF = "nx-struct-lemniscateseat";
const FILE = "village_lemniscateseat3.glb";
const OLD: [number, number, number] = [-60, -0.0237, -7];
const OLD_YAW = Math.PI / 2;
const NEW: [number, number, number] = [1.5, -0.02079, 107.75];
const NEW_YAW = Math.PI; // face normal (local +z) reads due S, toward the incoming walk
const CX = 0, CZ = 0; // true bbox local center (x,z) — symmetric, no offset

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

// ---- fresh census + gate 2 (tuple) + gate 6a (comp before) ----
const before = await geom();
const beforeIds = new Set(Object.keys(before));
const e = before[SELF];
if (!e) die(`${SELF} absent from census`);
const atOld = e.pos.every((n: number, i: number) => near(n, OLD[i])) && near(e.yaw, OLD_YAW);
const atNew = e.pos.every((n: number, i: number) => near(n, NEW[i])) && near(e.yaw, NEW_YAW);
if (!atOld && !atNew) die(`${SELF} tuple drift (live ${e.pos} yaw ${e.yaw} lib ${e.lib}; want old ${OLD} yaw ${OLD_YAW} or new ${NEW} yaw ${NEW_YAW})`);
if (e.lib !== wantLib) die(`${SELF} live lib ${e.lib} != local-bytes wantLib ${wantLib} (content-address contract broken)`);
if (!eq(e.comp ?? {}, {})) die(`${SELF} comp drift before move: live bag ${JSON.stringify(Object.keys(e.comp))} != expected {}`);
if (atNew) { console.log(JSON.stringify({ status: "PLACED_VERIFIED", note: "already at NEW tuple — zero verbs (idempotent)", id: SELF, pos: NEW, yaw: NEW_YAW, lib: wantLib })); process.exit(0); }

// ---- gates 3-5 (SAT/band/NN) on fresh census, at the NEW tuple ----
const bb = e.bbox, cc = bb.center ?? [0, 0, 0];
const self = obbOf(NEW[0], NEW[2], NEW_YAW, bb.size[0], bb.size[2], cc[0], cc[2]);
const cs = corners(self);
const radii = cs.map(p => Math.hypot(p[0], p[1]));
const brgs = cs.map(p => (Math.atan2(p[0], p[1]) * 180 / Math.PI + 360) % 360);
if (Math.min(...radii) < 55 || Math.max(...radii) > 130) die(`avenue rim law FAIL ${Math.min(...radii).toFixed(2)}..${Math.max(...radii).toFixed(2)} (need 55..130)`);
for (const b of brgs) { const d = Math.min(Math.abs(b - 356), 360 - Math.abs(b - 356)); if (d > 10) die(`band law FAIL corner brg ${b.toFixed(1)} (356+/-10)`); }
let worst = 1e9, worstId = "";
let nnMin = 1e9, nnId = "";
for (const [id, o] of Object.entries(before)) {
    if (id === SELF || NETWORKS.has(id) || id.endsWith("-l")) continue;
    const ob = o.bbox; if (!ob?.size) continue;
    if (Math.max(Math.abs(ob.size[0]), Math.abs(ob.size[2])) < 0.001) continue; // lights
    const y = o.yaw ?? 0, oc = ob.center ?? [0, 0, 0];
    const other = obbOf(o.pos[0], o.pos[2], y, ob.size[0], ob.size[2], oc[0], oc[2]);
    if (ob.size[1] > 0.5) { // solid: SAT (films exempt — struct-19 law)
        const g = gap(self, other);
        if (g < worst) { worst = g; worstId = id; }
    }
    if (id.startsWith("nx-struct-")) { const d = Math.hypot(o.pos[0] - NEW[0], o.pos[2] - NEW[2]); if (d < nnMin) { nnMin = d; nnId = id; } } // NN counts FILMS (Amendment 1 letter)
}
if (worst < 1.4) die(`SAT FAIL worst ${worst.toFixed(3)} vs ${worstId} (law 1.4)`);
if (nnMin < 8) die(`NN floor FAIL ${nnMin.toFixed(2)} vs ${nnId} (Amendment 1 law 8, films counted)`);
console.log(`gates: SAT fresh worst ${worst.toFixed(3)} vs ${worstId}; NN ${nnMin.toFixed(2)} vs ${nnId} (films counted); rim ${Math.min(...radii).toFixed(2)}..${Math.max(...radii).toFixed(2)}; band corners ${Math.min(...brgs.map(b => Math.min(Math.abs(b - 356), 360 - Math.abs(b - 356)))).toFixed(1)}deg max dev`);

// ---- verbs (remove + spawn; paced 650ms; join-then-schedule-all law) ----
const verbs: Array<[string, any]> = [
    ["remove", { id: SELF }],
    ["spawn", { id: SELF, lib: wantLib, pos: [...NEW], yaw: NEW_YAW, scale: 1 }],
];
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-city110-relocate", avatar: cfg.avatar, token: cfg.joinToken }));
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
if (!(a?.lib === wantLib && a.pos.every((n: number, j: number) => near(n, NEW[j])) && near(a.yaw, NEW_YAW) && a.scale === 1 && eq(a.comp ?? {}, {}))) die(`${SELF} post-place failed (pos ${a?.pos} yaw ${a?.yaw} comp ${Object.keys(a?.comp ?? {})})`);
const afterIds = new Set(Object.keys(after));
const arrivals = [...afterIds].filter(i => !beforeIds.has(i));
const departures = [...beforeIds].filter(i => !afterIds.has(i));
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: SELF, from: OLD, to: NEW.map(n => +n.toFixed(5)), yawRad: NEW_YAW, lib: wantLib, verbs: verbs.length, census: afterIds.size, arrivals, departures }));
if (arrivals.length || departures.length) console.log("NOTE: sibling-lane delta during window (classified, not this lane's move)");
