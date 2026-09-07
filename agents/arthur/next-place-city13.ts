// next-place-city13.ts — city-13: CITY-PLAN row 50, nx-town-potter compression.
// Wave-3 register row "nx-town-potter | r48.1 | village ring (compress inward)".
//
// OLD seat (26,0,40.5) yaw -2.58346 [off-spoke az57.3 r48.1, processional band]
// -> NEW seat az18.0 r25.0 host (23.776,-0.00402,7.725) yaw -1.89748 rad
// [-108.72deg]. IN-RING COMPRESSION: r48.1 -> r25.0 inside the closed village
// ring band r20-33 (named ring building relocation per register row 50; plan
// law 3 bars NEW builds only).
//
// YAW LAW (rotation-preservation, register note): old yaw was EXACTLY
// radial-inward (atan2(40.5,26) + pi = 2.1417; yaw -2.5835 == 2.1417 - 2pi
// within 0.0025rad — plaza-facing apron/porch read). Destination yaw =
// TH_OLD + (AZ_OLD - AZ_NEW) preserves local-+z-radial-in: apron, porch and
// sign face the plaza across the ring road. SELF-CATCHES this tick (banked):
// first scan rotation used the wrong sign (-183.8 tangent); second preserved
// WORLD deltas of host-local riders (swing-apart). Both discarded pre-place.
//
// RIDERS travel with host (loop law 5 / row 52 signs-follow-hosts):
//   nx-artwalk-b3-ruled-porch  (host-local (1.55, 0.35), derived IN CODE from
//                               live old tuples — not transcribed)
//   nx-sign-potter-001         (host-local (1.50, 3.10) == waysign-2 pin)
//   nx-town-potter-l           light companion (+dLX,+1.4,+dLZ, params
//                               0xffb066 @1.3 r4.5, interior-5 provenance;
//                               re-aimed with ONE light verb, city-7/8 idiom)
//
// COMPS: potter carries motion:pwheel spin {axis(0,1,0), pivot 0, 9deg/s} —
// spawn WIPES it (comp-wipe law): captured before, re-applied after
// (improve-37 idiom). Porch + sign comps EMPTY before/after (verified).
//
// SEAT PROOF (scanner az15-29.5 x r24-28 step .5/.5, host-local riders,
// correct yaw; control sign-validated at old seat):
//   61 lawful seats; az18/17-19 r25 block best. WINNER az18.0 r25.0:
//   SAT 4.231 vs nx-dress-goats (law 1.4); ring-road outer-edge (r20.7,
//   mkroads3 ring r20 + paver half-width) +0.48; lane-002 bead line 3.84;
//   E-axis z=0 5.87; mosaic film 10.59 (gate 2.5); rim 20.5..28.0.
//   Composition: near-mirror of forge (az-20.2 r23.4) across the E craft
//   spoke — heat-craft flankers at the E gate; yard read yaw-invariant.
//   Terrain (next-terrain-city13, 12 true OBB corners): spread 6.4mm,
//   PY -0.00402 lowest host corner (old site y=0; -4mm sub-visible).
//
// Gates (fail-closed, all vs FRESH census this placer fetches):
//  1. local-bytes sha16 == live lib for all 3 GLBs (zero-upload proof)
//  2. every id at OLD or NEW tuple exactly (idempotent rerun => zero verbs)
//  3. SAT: exact yaw-aware OBBs, true-bbox centers, MIN over census solids
//     >= 1.4 (ground films + concentric riders + lights excluded)
//  4. rim [20,33] AND ring-road edge: min corner radius >= 20.7
//  5. lane-002 clearance >= 3.0 AND E-axis |z| >= 3.0 (else walk owed —
//     walk delivered separately at city13-walk-potter.ts) AND mosaic >= 2.5
//  6. comp contract: potter bag == {motion:pwheel} exact before AND after;
//     porch/sign bags empty before and after
//  7. light: at old or new pos (params via history fold, interior-5 idiom)
//  8. verbs paced 650ms; post-place deep-verify + census set-diff
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const die = (msg: string): never => { throw Error(msg); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-4; // 0.1mm — sub-visible; rerun roundoff safe
function canon(v: any): any { return Array.isArray(v) ? v.map(canon) : v && typeof v == "object" ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canon(v[k])])) : v; }
const eq = (a: any, b: any) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));

// ---- contract constants (exact; az/r exact values, atan2-derived yaw) ----
const AZ_NEW = 18.0 * Math.PI / 180, R_NEW = 25.0;
const HOST_OLD: [number, number, number] = [26, 0, 40.5];
const TH_OLD = -2.5834592128923776;
const AZ_OLD = Math.atan2(HOST_OLD[2], HOST_OLD[0]);
const NEW_PX = R_NEW * Math.cos(AZ_NEW), NEW_PZ = R_NEW * Math.sin(AZ_NEW);
const NEW_YAW = TH_OLD + (AZ_OLD - AZ_NEW);           // -1.8974752013 rad
const NEW_PY = -0.00402;                               // terrain lowest host corner
const MOTION = { type: "spin", axis: [0, 1, 0], pivot: [0, 0, 0], degPerSec: 9 };
const LIGHT = { color: 0xffb066, intensity: 1.3, range: 4.5 };

type Move = { id: string; file: string; py: number; sha?: string; wantLib?: string; lx?: number; lz?: number; pos?: number[]; atNew?: boolean };
const MOVES: Move[] = [
    { id: "nx-town-potter", file: "village_potter3.glb", py: NEW_PY },
    { id: "nx-artwalk-b3-ruled-porch", file: "village_artwalk_b3.glb", py: -0.00588 }, // own lowest corner
    { id: "nx-sign-potter-001", file: "village_sign_potter3.glb", py: 0 },
];
const LID = "nx-town-potter-l";

async function geom() {
    const r = await fetch(`${base}/geom?world=${WORLD}`);
    if (!r.ok) die(`geom ${r.status}`);
    const d: any = await r.json();
    return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}
// gate 1: bytes -> sha -> wantLib (content-addressed; no hand-typed hashes)
for (const m of MOVES) {
    const bytes = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/${m.file}`));
    m.sha = createHash("sha256").update(bytes).digest("hex");
    m.wantLib = `store/${m.sha.slice(0, 16)}.glb`;
}
const GROUND = new Set(["nx-approach-nw-lane-001", "nx-approach-ne-lane-002", "nx-approach-sw-lane-003", "nx-core-paths", "nx-town-roads", "nx-town-streetlamps",
    "nx-gallery-mosaic-0036", "nx-gallery-mosaic-0048", "nx-gallery-mosaic-0052", "nx-gallery-mosaic-0059"]);
const FILMS = ["nx-gallery-mosaic-0036", "nx-gallery-mosaic-0048", "nx-gallery-mosaic-0052", "nx-gallery-mosaic-0059"];
const HOSTED = new Set(["nx-artwalk-b31-sheaf-tally", "nx-artwalk-b32-morning-measure", "nx-artwalk-b33-milking-order", "nx-artwalk-b12-kiln-heat-contours", "nx-artwalk-b11-woodyard-heartwood-measure", "nx-sign-kiln-001", "nx-sign-woodyard-001"]);
const BEADS: Array<[number, number]> = [[23.88, 15.73], [31.46, 21.09], [38.88, 26.57], [40.96, 32.95], [38.76, 40.75], [33.84, 48.56], [28.78, 56.29], [23.79, 64.07]];
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
const seg = (p: [number, number], a: [number, number], b: [number, number]) => {
    const dx = b[0] - a[0], dz = b[1] - a[1];
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / (dx * dx + dz * dz)));
    return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dz));
};

// ---- fresh census + gate 2 (tuples) + rider host-local derivation ----
const before = await geom();
const beforeIds = new Set(Object.keys(before));
const co = Math.cos(TH_OLD), so = Math.sin(TH_OLD);
// rider host-local constants (verified: live-delta derivation runs 1+2, run-1
// PLACED_VERIFIED output, waysign-2 pin (1.5,3.1) within 2e-6)
const RIDER_LOCALS: Record<string, [number, number]> = {
    "nx-artwalk-b3-ruled-porch": [1.5500000000000498, 0.34999999999978143],
    "nx-sign-potter-001": [1.499997939920861, 3.09999755378259],
};
// first run iff host still at OLD seat
const hostE = before["nx-town-potter"];
const firstRun = near(hostE.pos[0], 26) && near(hostE.pos[2], 40.5) && near(hostE.yaw, TH_OLD);
for (const m of MOVES) {
    const e = before[m.id];
    if (!e) die(`${m.id} absent from census`);
    if (m.id === "nx-town-potter") { m.lx = 0; m.lz = 0; }
    else if (firstRun) {
        // derive rider host-local offset from LIVE old tuples (inverse transform)
        const dx = e.pos[0] - HOST_OLD[0], dz = e.pos[2] - HOST_OLD[2];
        m.lx = dx * co - dz * so; m.lz = dx * so + dz * co;
    } else {
        [m.lx, m.lz] = RIDER_LOCALS[m.id];
    }
    // NEW world pos: forward transform at new host + new yaw
    const cn = Math.cos(NEW_YAW), sn = Math.sin(NEW_YAW);
    m.pos = [NEW_PX + m.lx * cn + m.lz * sn, m.py, NEW_PZ - m.lx * sn + m.lz * cn];
    // first run: every entity sits at old yaw with the pinned lib; rerun: at NEW
    const atOldExplicit = near(e.yaw, TH_OLD) && e.lib === m.wantLib && (m.id === "nx-town-potter"
        ? (near(e.pos[0], 26) && near(e.pos[1], 0) && near(e.pos[2], 40.5))
        : true); // riders verified vs derived NEW below (old ref is live-captured)
    const atNew = e.pos.every((n: number, i: number) => near(n, m.pos![i])) && near(e.yaw, NEW_YAW) && e.lib === m.wantLib;
    if (!atOldExplicit && !atNew) {
        die(`${m.id} tuple drift (live ${e.pos} yaw ${e.yaw} lib ${e.lib}; want old-yaw ${TH_OLD} lib ${m.wantLib} or NEW ${m.pos})`);
    }
    m.atNew = atNew;
}
// host must be exactly at the documented old seat (26,0,40.5) on first run
if (firstRun && !(near(hostE.pos[0], 26) && near(hostE.pos[2], 40.5) && near(hostE.yaw, TH_OLD))) die(`host not at documented old seat: ${hostE.pos} yaw ${hostE.yaw}`);
// gate 6a: comp contract BEFORE
{
    const bag = before["nx-town-potter"].comp ?? {};
    if (!eq(bag, { "motion:pwheel": MOTION })) die(`potter comp bag drift before: ${JSON.stringify(bag)}`);
    for (const rid of ["nx-artwalk-b3-ruled-porch", "nx-sign-potter-001"]) {
        const b = before[rid]?.comp ?? {};
        if (Object.keys(b).length) die(`${rid} comp bag not empty: ${JSON.stringify(b)}`);
    }
}
// gate 7a: light BEFORE (rerun-safe: constants verified on run 1 vs live)
const LIGHT_LOCAL: [number, number, number] = [-0.317762296955507, 1.4, -0.508947075024174]; // host-local, run-1 live-derived
{
    if (!(before[LID]?.kind === "light")) die(`${LID} not light`);
    if (firstRun) {
        const dLx = before[LID].pos[0] - 26, dLy = before[LID].pos[1] - 0, dLz = before[LID].pos[2] - 40.5;
        if (!(near(dLy, 1.4) && Math.abs(dLx - LIGHT_LOCAL[0]) < 1e-4 && Math.abs(dLz - LIGHT_LOCAL[2]) < 1e-4)) die(`${LID} companion delta unexpected (${dLx},${dLy},${dLz})`);
    }
}
const cnl = Math.cos(NEW_YAW), snl = Math.sin(NEW_YAW);
const lightNew = [NEW_PX + LIGHT_LOCAL[0] * cnl + LIGHT_LOCAL[2] * snl, NEW_PY + LIGHT_LOCAL[1], NEW_PZ - LIGHT_LOCAL[0] * snl + LIGHT_LOCAL[2] * cnl];
const lightAtNew = before[LID].pos.every((n: number, i: number) => near(n, lightNew[i]));
// history fold for authored light params (interior-5 idiom)
const auth = await new Promise<any>((resolve, reject) => {
    const ws = new WebSocket(cfg.url), o: any = {}, t = setTimeout(() => reject(Error("history timeout")), 30_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-city13-lightread", avatar: cfg.avatar, token: cfg.joinToken, spectate: true }));
    ws.onerror = () => reject(Error("history ws"));
    ws.onmessage = (ev: any) => {
        const m = JSON.parse(ev.data);
        if (m.type === "snapshot") ws.send(JSON.stringify({ type: "history", verbs: ["light"], limit: 300 }));
        else if (m.type === "history") {
            for (const z of m.entries ?? []) { const x = z.args ?? z; if (x.id !== LID) continue; for (const k of ["pos", "color", "intensity", "range"]) if (x[k] !== undefined) o[k] = x[k]; }
            clearTimeout(t); ws.close(); resolve(o);
        }
    };
});
if (!(auth.color === LIGHT.color && near(auth.intensity, LIGHT.intensity) && near(auth.range, LIGHT.range))) die(`light authored params drift: ${JSON.stringify(auth)}`);

// ---- gates 3-5 (SAT/rim/road/walk/mosaic) on fresh census ----
const selfObbs = MOVES.map(m => {
    const e = before[m.id], bb = e.bbox, cc = bb.center ?? [0, 0, 0];
    return { id: m.id, o: obbOf(m.pos[0], m.pos[2], NEW_YAW, bb.size[0], bb.size[2], cc[0], cc[2]) };
});
const allCorners = selfObbs.flatMap(s => corners(s.o));
const radii = allCorners.map(p => Math.hypot(p[0], p[1]));
if (Math.min(...radii) < 20.0 || Math.max(...radii) > 33.0) die(`rim law FAIL ${Math.min(...radii).toFixed(2)}..${Math.max(...radii).toFixed(2)} (need 20..33)`);
if (Math.min(...radii) < 20.7) die(`ring-road overlap: min corner r ${Math.min(...radii).toFixed(2)} < 20.7 (mkroads3 ring r20 + paver half-width)`);
let md = 1e9, mid = "";
for (const fid of FILMS) {
    const e = before[fid]; if (!e?.bbox?.size) continue;
    const cc = e.bbox.center ?? [0, 0, 0];
    const f = obbOf(e.pos[0], e.pos[2], e.yaw ?? 0, e.bbox.size[0], e.bbox.size[2], cc[0], cc[2]);
    const fc = corners(f);
    for (const c of allCorners) for (let i = 0; i < 4; i++) { const d2 = seg(c, fc[i], fc[(i + 1) % 4]); if (d2 < md) { md = d2; mid = fid; } }
}
if (md < 2.5) die(`mosaic-film margin FAIL ${md.toFixed(2)} vs ${mid} (< 2.5)`);
const wl = Math.min(...allCorners.map(p => Math.min(...BEADS.slice(1).map((b, i) => seg(p, BEADS[i], b)))));
if (wl < 3.0) die(`lane-002 walk clearance FAIL ${wl.toFixed(2)} < 3.0 (walk-test owed, not waived)`);
const zax = Math.min(...allCorners.map(p => Math.abs(p[1])));
if (zax < 3.0) die(`E-axis clearance FAIL ${zax.toFixed(2)} < 3.0`);
let worst = 1e9, worstId = "";
for (const [id, e] of Object.entries(before)) {
    if (MOVES.some(m => m.id === id) || id === LID || GROUND.has(id) || HOSTED.has(id) || id.endsWith("-l")) continue;
    const bb = e.bbox; if (!bb?.size) continue;
    if (Math.max(Math.abs(bb.size[0]), Math.abs(bb.size[2])) < 0.001) continue;
    const y = e.yaw ?? 0, cc = bb.center ?? [0, 0, 0];
    const o = obbOf(e.pos[0], e.pos[2], y, bb.size[0], bb.size[2], cc[0], cc[2]);
    for (const s of selfObbs) { const g = gap(s.o, o); if (g < worst) { worst = g; worstId = id; } }
}
if (worst < 1.4) die(`SAT FAIL worst ${worst.toFixed(3)} vs ${worstId} (law 1.4)`);
console.log(`gates: SAT fresh worst ${worst.toFixed(3)} vs ${worstId}; rim ${Math.min(...radii).toFixed(2)}..${Math.max(...radii).toFixed(2)} (road>=20.7); mosaic ${md.toFixed(2)} vs ${mid}; lane-002 ${wl.toFixed(2)}m; E-axis ${zax.toFixed(2)}m`);

// ---- verbs ----
const verbs: Array<[string, any]> = [];
for (const m of MOVES) {
    if (m.atNew) { console.log(`${m.id} already at NEW tuple`); continue; }
    verbs.push(["remove", { id: m.id }], ["spawn", { id: m.id, lib: m.wantLib, pos: m.pos!, yaw: NEW_YAW, scale: 1 }]);
}
{
    const bag = before["nx-town-potter"].comp ?? {};
    const atNew = MOVES[0].atNew;
    if (!(atNew && bag["motion:pwheel"])) verbs.push(["comp", { id: "nx-town-potter", type: "motion:pwheel", data: MOTION }]);
    if (!lightAtNew) verbs.push(["light", { id: LID, pos: lightNew, color: LIGHT.color, intensity: LIGHT.intensity, range: LIGHT.range }]);
}
if (verbs.length) await new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(cfg.url);
    let joined = false, i = 0;
    const timer = setTimeout(() => reject(Error("verb timeout")), 120_000);
    const paced = setInterval(() => {
        if (!joined || i >= verbs.length) return;
        const [verb, args] = verbs[i++];
        ws.send(JSON.stringify({ type: "verb", verb, args }));
        if (i === verbs.length) setTimeout(() => { clearInterval(paced); clearTimeout(timer); ws.close(); resolve(); }, 2000);
    }, 650);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-city13-relocate", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => reject(Error("websocket error"));
    ws.onmessage = (ev: any) => {
        const x = JSON.parse(ev.data);
        if (x.type === "error") reject(Error(`server ${x.error}`));
        else if (x.type === "snapshot") joined = true;
    };
});
// ---- post-verify
const after = await geom();
for (const m of MOVES) {
    const e = after[m.id];
    if (!(e?.lib === m.wantLib && e.pos.every((n: number, j: number) => near(n, m.pos![j])) && near(e.yaw, NEW_YAW) && e.scale === 1 && eq(e.comp ?? {}, m.id === "nx-town-potter" ? { "motion:pwheel": MOTION } : {}))) die(`${m.id} post-place failed (pos ${e?.pos} comp ${JSON.stringify(e?.comp)})`);
}
const l2 = after[LID];
if (!(l2?.kind === "light" && l2.pos.every((n: number, j: number) => near(n, lightNew[j])))) die(`${LID} post-place light failed (${l2?.pos})`);
const afterIds = new Set(Object.keys(after));
const arrivals = [...afterIds].filter(i => !beforeIds.has(i));
const departures = [...beforeIds].filter(i => !afterIds.has(i));
console.log(JSON.stringify({ status: "PLACED_VERIFIED", yawRad: NEW_YAW, moves: MOVES.map(m => ({ id: m.id, hostLocal: [+m.lx!.toFixed(4), +m.lz!.toFixed(4)], lib: m.wantLib, pos: m.pos!.map((n: number) => +n.toFixed(5)) })), light: { id: LID, pos: lightNew.map(n => +n.toFixed(5)), params: LIGHT }, verbs: verbs.length, census: afterIds.size, arrivals, departures }));
if (arrivals.length || departures.length) console.log("NOTE: sibling-lane delta during window (classified, not this lane's move)");
