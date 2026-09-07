// next-place-city14.ts — city-14: CITY-PLAN row 51, nx-town-kiln compression.
// Wave-3 register row "nx-town-kiln | r49.8 | village ring (compress inward)".
//
// OLD seat (31,0,39) yaw -2.47849 [az51.5 r49.8, processional band]
// -> NEW seat az49.5 r29.5 host (19.159,-0.02065,22.432) yaw -2.44439 rad
// [-140.0deg]. IN-RING COMPRESSION: r49.8 -> r29.5 inside the closed village
// ring band r20-33 (named ring building relocation per register row 51; plan
// law 3 bars NEW builds only).
//
// YAW LAW (rotation-preservation, register note): NEW_YAW = TH_OLD +
// (AZ_OLD - AZ_NEW) — the city-13-proven idiom; the old fire mouth (+z
// local) pointed ~4deg off dead-center plaza-ward at the old seat and the
// SAME offset carries to the new azimuth (b12 contour field read preserved).
//
// RIDERS travel with host (loop law 5 / row 52 signs-follow-hosts):
//   nx-artwalk-b12-kiln-heat-contours (host-local (0, 1.15), derived IN CODE
//                                   from live old tuples — not transcribed)
//   nx-sign-kiln-001              (host-local (0, 0.86), dy +2.45 — drum
//                                   straps; waysign-10 pin)
//   nx-town-kiln-l                light companion (authored world delta at
//                                   old seat (-0.5, +1.1, +1.4) per
//                                   interior-18; host-local derived IN CODE;
//                                   params 0xffb066 @1.4 r4.5, re-aimed with
//                                   ONE light verb, city-7/8 idiom)
//
// COMPS: kiln bag EMPTY live (census 2026-09-07; gate smoke comp pins
// av-charcoal, a different entity) — no re-apply owed; bags verified EMPTY
// before AND after for all three movers (comp-wipe law still gated).
//
// SEAT PROOF (scanner city14-scan-kiln, az30-75 x r24-32 step .5/.5, true
// local OBBs of host+b12+sign, correct yaw; 102 lawful seats; control
// sign-validated at old seat +7.468 vs milkstand):
//   WINNER az49.5 r29.5: SAT 2.531 vs nx-tower (law 1.4); rim 27.89..30.90
//   in-band; ring-road min corner 27.89 >= 20.7; lane-002 beads 5.71;
//   mosaic-0036 6.8. Composition: ON-AXIS with charcoal (az50.2 r35.5,
//   city-12) completing the production arc woodyard az62.7 -> kiln ->
//   charcoal; kiln = ring's outer working edge (fire at the edge, downdraft
//   off dwellings). Terrain (next-terrain-city14, 12 true OBB corners):
//   spread 15.6mm, PY -0.02065 lowest host corner (old site y=0; -21mm
//   disclosed sub-visible).
//
// OWD same tick (sweep-77 vacated-tool class): artwalk-walk-b12.ts +
// interior-place-kiln.ts re-pinned to the new tuple; interior-walk-potter.ts
// re-pinned to city-13 seat (city-13's recorded OWD).
//
// Gates (fail-closed, all vs FRESH census this placer fetches):
//  1. local-bytes sha16 == live lib for all 3 GLBs (zero-upload proof)
//  2. every id at OLD or NEW tuple exactly (idempotent rerun => zero verbs)
//  3. SAT: exact yaw-aware OBBs, true-bbox centers, MIN over census solids
//     >= 1.4 (ground films + networks + concentric foreign riders + lights
//     excluded)
//  4. rim [20,33] AND ring-road edge: min corner radius >= 20.7
//  5. lane-002 clearance >= 3.0 AND E-axis |z| >= 3.0 (else walk owed —
//     artwalk-walk-b12 re-pin+run delivered separately) AND mosaic >= 2.5
//  6. comp contract: all three bags EMPTY before AND after
//  7. light: at old or new pos (params via history fold, interior-18 idiom)
//  8. verbs paced 650ms; post-place deep-verify + census set-diff
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://", "").replace("/ws", "");
const die = (msg: string): never => { throw Error(msg); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-4; // 0.1mm — sub-visible; rerun roundoff safe
function canon(v: any): any { return Array.isArray(v) ? v.map(canon) : v && typeof v == "object" ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canon(v[k])])) : v; }
const eq = (a: any, b: any) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));

// ---- contract constants (exact; az/r exact, atan2-derived yaw) ----
const AZ_NEW = 49.5 * Math.PI / 180, R_NEW = 29.5;
const HOST_OLD: [number, number, number] = [31, 0, 39];
const TH_OLD = -2.4784945651581642;
const AZ_OLD = Math.atan2(HOST_OLD[2], HOST_OLD[0]);
const NEW_PX = R_NEW * Math.cos(AZ_NEW), NEW_PZ = R_NEW * Math.sin(AZ_NEW);
const NEW_YAW = TH_OLD + (AZ_OLD - AZ_NEW);           // -2.444393 rad
const NEW_PY = -0.02065;                               // terrain lowest host corner
const LIGHT = { color: 0xffb066, intensity: 1.4, range: 4.5 };

type Move = { id: string; file: string; py: number; sha?: string; wantLib?: string; lx?: number; lz?: number; dy: number; pos?: number[]; atNew?: boolean };
const MOVES: Move[] = [
    { id: "nx-town-kiln", file: "village_kiln3.glb", py: NEW_PY, dy: 0 },
    { id: "nx-artwalk-b12-kiln-heat-contours", file: "village_artwalk_b12.glb", py: NEW_PY + 0, dy: 0 },      // face film, dy 0
    { id: "nx-sign-kiln-001", file: "village_sign_kiln3.glb", py: NEW_PY + 2.45, dy: 2.45 },                   // drum straps
];
const LID = "nx-town-kiln-l";

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
const NETWORKS = new Set(["nx-town-roads", "nx-core-paths", "nx-approach-nw-lane-001", "nx-approach-ne-lane-002", "nx-approach-sw-lane-003"]);
const GROUND = new Set(["nx-town-streetlamps", "nx-gallery-mosaic-0036", "nx-gallery-mosaic-0048", "nx-gallery-mosaic-0052", "nx-gallery-mosaic-0059", ...NETWORKS]);
const MOVING = new Set([...MOVES.map(m => m.id), LID]);
// concentric riders of OTHER (non-moving) hosts — exempt from collision set
// (city-13 HOSTED class: their bboxes bury into their own hosts by design)
const HOSTED = new Set(["nx-artwalk-b31-sheaf-tally", "nx-artwalk-b32-morning-measure", "nx-artwalk-b33-milking-order", "nx-artwalk-b11-woodyard-heartwood-measure", "nx-sign-woodyard-001"]);
const BEADS: Array<[number, number]> = [[23.88, 15.73], [31.46, 21.09], [38.88, 26.57], [40.96, 32.95], [38.76, 40.75], [33.84, 48.56], [28.78, 56.29], [23.79, 64.07]];
const MOSAIC36 = { c: [38.971, 22.5], h: 10.51 };
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
// rider host-local pins (verified live-derived this chassis: b12 (0,1.15),
// sign (0,0.86) — artwalk-22 / waysign-10 authored pins)
const RIDER_LOCALS: Record<string, [number, number]> = {
    "nx-artwalk-b12-kiln-heat-contours": [0.0, 1.15],
    "nx-sign-kiln-001": [0.0, 0.86],
};
const hostE = before["nx-town-kiln"];
const firstRun = near(hostE.pos[0], 31) && near(hostE.pos[2], 39) && near(hostE.yaw, TH_OLD);
for (const m of MOVES) {
    const e = before[m.id];
    if (!e) die(`${m.id} absent from census`);
    if (m.id === "nx-town-kiln") { m.lx = 0; m.lz = 0; }
    else if (firstRun) {
        // derive rider host-local offset from LIVE old tuples (inverse transform)
        const dx = e.pos[0] - HOST_OLD[0], dz = e.pos[2] - HOST_OLD[2];
        m.lx = dx * co - dz * so; m.lz = dx * so + dz * co;
        if (Math.abs(e.pos[1] - HOST_OLD[1] - m.dy) > 1e-4) die(`${m.id} dy drift: live ${e.pos[1] - HOST_OLD[1]} vs pin ${m.dy}`);
    } else {
        [m.lx, m.lz] = RIDER_LOCALS[m.id];
    }
    const cn = Math.cos(NEW_YAW), sn = Math.sin(NEW_YAW);
    m.pos = [NEW_PX + m.lx * cn + m.lz * sn, m.py, NEW_PZ - m.lx * sn + m.lz * cn];
    const atOldExplicit = near(e.yaw, TH_OLD) && e.lib === m.wantLib && (m.id === "nx-town-kiln"
        ? (near(e.pos[0], 31) && near(e.pos[1], 0) && near(e.pos[2], 39))
        : true); // riders verified vs derived NEW below (old ref is live-captured)
    const atNew = e.pos.every((n: number, i: number) => near(n, m.pos![i])) && near(e.yaw, NEW_YAW) && e.lib === m.wantLib;
    if (!atOldExplicit && !atNew) {
        die(`${m.id} tuple drift (live ${e.pos} yaw ${e.yaw} lib ${e.lib}; want old-yaw ${TH_OLD} lib ${m.wantLib} or NEW ${m.pos})`);
    }
    m.atNew = atNew;
}
if (firstRun && !(near(hostE.pos[0], 31) && near(hostE.pos[2], 39) && near(hostE.yaw, TH_OLD))) die(`host not at documented old seat: ${hostE.pos} yaw ${hostE.yaw}`);
// gate 6a: comp contract BEFORE — all three bags EMPTY
for (const m of MOVES) {
    const bag = before[m.id].comp ?? {};
    if (Object.keys(bag).length) die(`${m.id} comp bag not empty before: ${JSON.stringify(bag)}`);
}
// gate 7a: light BEFORE (rerun-safe: constants verified on run 1 vs live)
const LIGHT_DELTA_WORLD: [number, number, number] = [-0.5, 1.1, 1.4]; // authored world delta at old seat (interior-18)
const LIGHT_LOCAL: [number, number, number] = [1.255889, 1.1, -0.795408]; // host-local, run-1 live-derived (inverse transform)
{
    if (!(before[LID]?.kind === "light")) die(`${LID} not light`);
    if (firstRun) {
        const dWx = before[LID].pos[0] - 31, dWy = before[LID].pos[1] - 0, dWz = before[LID].pos[2] - 39;
        if (!(near(dWx, LIGHT_DELTA_WORLD[0]) && near(dWy, LIGHT_DELTA_WORLD[1]) && near(dWz, LIGHT_DELTA_WORLD[2]))) die(`${LID} companion world-delta unexpected (${dWx},${dWy},${dWz})`);
    }
}
const cnl = Math.cos(NEW_YAW), snl = Math.sin(NEW_YAW);
const lightNew = [NEW_PX + LIGHT_LOCAL[0] * cnl + LIGHT_LOCAL[2] * snl, NEW_PY + LIGHT_LOCAL[1], NEW_PZ - LIGHT_LOCAL[0] * snl + LIGHT_LOCAL[2] * cnl];
const lightAtNew = before[LID].pos.every((n: number, i: number) => near(n, lightNew[i]));
// history fold for authored light params (interior-18 idiom)
const auth = await new Promise<any>((resolve, reject) => {
    const ws = new WebSocket(cfg.url), o: any = {}, t = setTimeout(() => reject(Error("history timeout")), 30_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-city14-lightread", avatar: cfg.avatar, token: cfg.joinToken, spectate: true }));
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
    return { id: m.id, o: obbOf(m.pos![0], m.pos![2], NEW_YAW, bb.size[0], bb.size[2], cc[0], cc[2]) };
});
const allCorners = selfObbs.flatMap(s => corners(s.o));
const radii = allCorners.map(p => Math.hypot(p[0], p[1]));
if (Math.min(...radii) < 20.0 || Math.max(...radii) > 33.0) die(`rim law FAIL ${Math.min(...radii).toFixed(2)}..${Math.max(...radii).toFixed(2)} (need 20..33)`);
if (Math.min(...radii) < 20.7) die(`ring-road overlap: min corner r ${Math.min(...radii).toFixed(2)} < 20.7 (mkroads3 ring r20 + paver half-width)`);
const md = Math.min(...allCorners.map(p => Math.max(Math.abs(p[0] - MOSAIC36.c[0]), Math.abs(p[1] - MOSAIC36.c[1])) - MOSAIC36.h));
if (md < 2.5) die(`mosaic-film margin FAIL ${md.toFixed(2)} (< 2.5)`);
const wl = Math.min(...allCorners.map(p => Math.min(...BEADS.slice(1).map((b, i) => seg(p, BEADS[i], b)))));
if (wl < 3.0) die(`lane-002 walk clearance FAIL ${wl.toFixed(2)} < 3.0 (walk-test owed, not waived)`);
const zax = Math.min(...allCorners.map(p => Math.abs(p[1])));
if (zax < 3.0) die(`E-axis clearance FAIL ${zax.toFixed(2)} < 3.0`);
let worst = 1e9, worstId = "";
for (const [id, e] of Object.entries(before)) {
    if (MOVING.has(id) || GROUND.has(id) || HOSTED.has(id) || id.endsWith("-l")) continue;
    const bb = e.bbox; if (!bb?.size) continue;
    if (Math.max(Math.abs(bb.size[0]), Math.abs(bb.size[2])) < 0.001) continue;
    if (bb.size[1] <= 0.5) continue;
    const y = e.yaw ?? 0, cc = bb.center ?? [0, 0, 0];
    const o = obbOf(e.pos[0], e.pos[2], y, bb.size[0], bb.size[2], cc[0], cc[2]);
    for (const s of selfObbs) { const g = gap(s.o, o); if (g < worst) { worst = g; worstId = id; } }
}
if (worst < 1.4) die(`SAT FAIL worst ${worst.toFixed(3)} vs ${worstId} (law 1.4)`);
console.log(`gates: SAT fresh worst ${worst.toFixed(3)} vs ${worstId}; rim ${Math.min(...radii).toFixed(2)}..${Math.max(...radii).toFixed(2)} (road>=20.7); mosaic ${md.toFixed(2)}; lane-002 ${wl.toFixed(2)}m; E-axis ${zax.toFixed(2)}m`);

// ---- verbs ----
const verbs: Array<[string, any]> = [];
for (const m of MOVES) {
    if (m.atNew) { console.log(`${m.id} already at NEW tuple`); continue; }
    verbs.push(["remove", { id: m.id }], ["spawn", { id: m.id, lib: m.wantLib, pos: m.pos!, yaw: NEW_YAW, scale: 1 }]);
}
if (!lightAtNew) verbs.push(["light", { id: LID, pos: lightNew, color: LIGHT.color, intensity: LIGHT.intensity, range: LIGHT.range }]);
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-city14-relocate", avatar: cfg.avatar, token: cfg.joinToken }));
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
    if (!(e?.lib === m.wantLib && e.pos.every((n: number, j: number) => near(n, m.pos![j])) && near(e.yaw, NEW_YAW) && e.scale === 1 && eq(e.comp ?? {}, {}))) die(`${m.id} post-place failed (pos ${e?.pos} comp ${JSON.stringify(e?.comp)})`);
}
const l2 = after[LID];
if (!(l2?.kind === "light" && l2.pos.every((n: number, j: number) => near(n, lightNew[j])))) die(`${LID} post-place light failed (${l2?.pos})`);
const afterIds = new Set(Object.keys(after));
const arrivals = [...afterIds].filter(i => !beforeIds.has(i));
const departures = [...beforeIds].filter(i => !afterIds.has(i));
console.log(JSON.stringify({ status: "PLACED_VERIFIED", yawRad: NEW_YAW, moves: MOVES.map(m => ({ id: m.id, hostLocal: [+m.lx!.toFixed(4), +m.lz!.toFixed(4)], lib: m.wantLib, pos: m.pos!.map((n: number) => +n.toFixed(5)) })), light: { id: LID, pos: lightNew.map(n => +n.toFixed(5)), params: LIGHT }, verbs: verbs.length, census: afterIds.size, arrivals, departures }));
if (arrivals.length || departures.length) console.log("NOTE: sibling-lane delta during window (classified, not this lane's move)");
