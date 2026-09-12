// next-place-city107.ts — city-107: CITY-PLAN-V2 Wave A move #4:
// nx-struct-catenarygate, worst remaining off-axis math-family stray
// (brg180 r60.5, 176deg off the Math Avenue axis 356) -> math avenue
// band r55-130.
//
// OLD seat (0, -0.0274, -60.5) yaw 0 [struct-72 S meridian threshold,
// pre-V2 E-ring scan seat; CITY-PLAN-V2 supersedes ring geometry for the
// math family: strays pull INTO the avenue band].
// -> NEW seat (-1.50, -0.025735, 115.50) yaw (brg-180)deg = 179.2559deg
// = 3.128606 rad [struct-72 radial opening law re-based to the seat
// bearing: opening axis (local z) points toward the village along the
// radial; the 9m catenary silhouette reads BROADSIDE to the avenue walk
// (city-105 tangent/broadside precedent — the deep axis r110..120 is a
// dead-straight 10m rhythm that admits no on-axis insert under the NN-8
// law, proven empty by city107-scan.py)].
//
// SEAT = GEOMETRY->CHAOS THRESHOLD FLANK: scanner city107-scan.py
// design-rank #1 of 3558 lawful band seats — dodecahedron r110 + boy
// r111.8 close the geometry chapter, rule30wall r120 opens chaos; the
// arch stands in the chapter seam r115.5, 6.56m east of the axis line,
// reading as the threshold marker between chapters. The costa/unduloid
// surfaces gate (r~128) and the processional mouth (r55-78) stay
// unduplicated.
//
// SEAT PROOF (scanner on this tick's fresh census 326; placer re-runs
// every gate vs FRESH census before verbs):
//   dodecahedron (axis r110 brg356): SAT 1.536 <- scanner worst
//   rule30wall (axis r120 brg356): NN 8.06 (Amendment 1 law 8)
//   band law: corners brg max dev within 356+/-10 (scanner-enforced
//     at grid seat)
//   terrain (city107-terrain-catenarygate, 9 true-frame pts): spread
//     8.1mm, PY -0.025735 lowest corner (c++), grade +1.7mm vs old
//     -0.0274 (disclosed)
//   walk-lines: seat is 6.56m lateral of the axis centerline ray —
//     flank class (> 3m), no network walk owed; the opening itself is
//     7m clear air at grade (struct-72 walk contract 12/12)
//
// NO riders (census 20m sweep at old seat: nearest non-neighbor 8.1m,
// all sibling struct forms), NO companion light (no catenarygate-l in
// census), comp bag EMPTY (census live) — nothing else travels,
// nothing to re-apply (comp-wipe law gated anyway).
//
// OWD: TWO standing walk tools pin the old seat (grep verified this
// tick) — struct72-walk-catenarygate.ts (full passage circuit) and
// struct84-walk-rotor.ts (gateaxis legs (0,-56)->(0,-68)); both
// re-pinned to the live tuple in this same tick (sweep-77 class,
// city-13/14 idiom).
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
const SELF = "nx-struct-catenarygate";
const FILE = "village_catenarygate3.glb";
const OLD: [number, number, number] = [0, -0.0274, -60.5];
const OLD_YAW = 0;
const NEW: [number, number, number] = [-1.5, -0.0257346838847956, 115.5];
// committed opening law, computed not typed: yaw = (brg-180)deg (struct-72)
const NEW_YAW = (((Math.atan2(NEW[0], NEW[2]) * 180 / Math.PI + 360) % 360) - 180) * Math.PI / 180;
const CX = 0, CZ = 0.078; // true bbox local center (x,z) — live census

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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-city107-relocate", avatar: cfg.avatar, token: cfg.joinToken }));
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
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: SELF, from: OLD, to: NEW.map(n => +n.toFixed(5)), yawRad: +NEW_YAW.toFixed(6), lib: wantLib, verbs: verbs.length, census: afterIds.size, arrivals, departures }));
if (arrivals.length || departures.length) console.log("NOTE: sibling-lane delta during window (classified, not this lane's move)");
