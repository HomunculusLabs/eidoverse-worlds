// next-place-city104.ts — city-104: CITY-PLAN-V2 Wave A move #1:
// nx-struct-sierpinski, the worst off-axis math-family stray (r74 brg186,
// ANTIPODAL to the math avenue axis 356) -> math avenue band r55-130.
//
// OLD seat (-7.74,-0.0301,-73.59) yaw 0 [brg186.0 r74.0 — S district ring,
// struct-100's R10 seat; CITY-PLAN-V2 supersedes ring geometry for math
// family: strays pull INTO the avenue band].
// -> NEW seat (-1.5, 0.0213, 80.0) yaw pi [brg358.9 r80.0 — the r71-90
// rhythm gap, matching sunflowerdial r71 / kochgarden r90 / hilbert r100;
// fills the largest rhythm hole with the third fractal (sierpinski -> koch
// -> hilbert) in simple->complex order].
//
// SEAT HISTORY (city-104, rejected-trial law): first candidate
// (-1.0, 0.0205, 79.81) from the interrupted prior window REJECTED by this
// placer's own fresh-census SAT gate pre-verb (worst 1.074 vs nx-struct-
// skene, law 1.4 — the dead window's hand-derivation omitted skene).
// Scanner-re-derived seat (-1.5, 80.0): SAT 1.574 vs skene, NN 9.86
// (sunflowerdial), design-rank #1 of 535 lawful band seats.
//
// YAW LAW: old yaw 0 at brg186 = local +z (base vertex, open gate lane)
// faced the village (north). New seat brg357 has the village SOUTH —
// yaw pi maps local +z to world -z, preserving the toward-village read
// (matches sunflowerdial pi / hilbert pi convention on this stretch).
//
// NO riders (census 16m sweep: nearest entity 9.4m, none concentric), NO
// companion light (id -l absent), comp bag EMPTY (census live) — nothing
// else travels, nothing to re-apply (comp-wipe law gated anyway).
//
// SEAT PROOF (hand-derived SAT with TRUE yaw-aware OBBs, exact bboxes,
// true centers; placer re-runs every gate vs FRESH census before verbs):
//   bridge nx-struct-ninesbridge (24.3 x 3.1 c(0,0), yaw -1.6755 — rotated,
//   NOT axis-aligned; first candidate x=-2.5 computed only +0.62 -> REJECTED
//   this same derivation): x=-1.0 -> +2.12
//   sunflowerdial (7.52 x 3.30 c(0.086,-0.232), yaw pi): +3.20
//   kochgarden: ground film h=0.315 (exempt, height prong)
//   hilbert (8.42 x 8.42, r100): +9.0+ by center distance
//   NN floor (Amendment 1, >= 8m center): sunflowerdial 9.53, koch 11.31,
//   bridge 12.03, hilbert 20.77 — ALL PASS
//   band law: corners brg 355.0-359.5 (356+/-10 PASS), rim 76.2-81.8
//   (avenue r55-130 PASS); rhythm ~9-10m (r71 -> r80 -> r90)
//   terrain (city104-terrain-sierpinski, 9 true-frame pts): spread 5.8mm,
//   PY +0.0205 lowest corner (+51mm grade vs old -0.0301, disclosed)
//
// OWD same tick (sweep-77 vacated-tool class): struct100-walk-sierpinski.ts
// re-pinned to the new tuple (walk lane = the form's own open base lane,
// now running S-N toward the village).
//
// Gates (fail-closed, all vs FRESH census this placer fetches):
//  1. local-bytes sha16 == live lib (zero-upload proof, content-addressed)
//  2. id at OLD or NEW tuple exactly (idempotent rerun => zero verbs)
//  3. SAT: exact yaw-aware OBB, true bbox center, MIN over census solids
//     >= 1.4 (ground films + networks + lights excluded)
//  4. band: every corner r in [55,130] AND brg in 356+/-10
//  5. NN floor: center distance >= 8 to every other nx-struct-* form
//  6. comp contract: bag EMPTY before AND after
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
const SELF = "nx-struct-sierpinski";
const FILE = "village_sierpinski3.glb";
const OLD: [number, number, number] = [-7.74, -0.0301, -73.59];
const OLD_YAW = 0;
const NEW: [number, number, number] = [-1.5, 0.0213, 80.0];
const NEW_YAW = Math.PI;

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
if (Object.keys(e.comp ?? {}).length) die(`${SELF} comp bag not empty before: ${JSON.stringify(e.comp)}`);
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
    if (ob.size[1] <= 0.5) continue; // ground film (height prong)
    const y = o.yaw ?? 0, oc = ob.center ?? [0, 0, 0];
    const other = obbOf(o.pos[0], o.pos[2], y, ob.size[0], ob.size[2], oc[0], oc[2]);
    const g = gap(self, other);
    if (g < worst) { worst = g; worstId = id; }
    if (id.startsWith("nx-struct-")) { const d = Math.hypot(o.pos[0] - NEW[0], o.pos[2] - NEW[2]); if (d < nnMin) { nnMin = d; nnId = id; } }
}
if (worst < 1.4) die(`SAT FAIL worst ${worst.toFixed(3)} vs ${worstId} (law 1.4)`);
if (nnMin < 8) die(`NN floor FAIL ${nnMin.toFixed(2)} vs ${nnId} (Amendment 1 law 8)`);
console.log(`gates: SAT fresh worst ${worst.toFixed(3)} vs ${worstId}; NN ${nnMin.toFixed(2)} vs ${nnId}; rim ${Math.min(...radii).toFixed(2)}..${Math.max(...radii).toFixed(2)}; band corners ${Math.min(...brgs.map(b => Math.min(Math.abs(b - 356), 360 - Math.abs(b - 356)))).toFixed(1)}deg max dev`);

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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-city104-relocate", avatar: cfg.avatar, token: cfg.joinToken }));
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
if (!(a?.lib === wantLib && a.pos.every((n: number, j: number) => near(n, NEW[j])) && near(a.yaw, NEW_YAW) && a.scale === 1 && eq(a.comp ?? {}, {}))) die(`${SELF} post-place failed (pos ${a?.pos} yaw ${a?.yaw} comp ${JSON.stringify(a?.comp)})`);
const afterIds = new Set(Object.keys(after));
const arrivals = [...afterIds].filter(i => !beforeIds.has(i));
const departures = [...beforeIds].filter(i => !afterIds.has(i));
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: SELF, from: OLD, to: NEW.map(n => +n.toFixed(5)), yawRad: NEW_YAW, lib: wantLib, verbs: verbs.length, census: afterIds.size, arrivals, departures }));
if (arrivals.length || departures.length) console.log("NOTE: sibling-lane delta during window (classified, not this lane's move)");
