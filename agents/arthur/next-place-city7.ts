// next-place-city7.ts — city-7: CITY-PLAN wave-1 relocation #6.
// nx-struct-beacon (40.8,-0.04397,-16.48) yaw 0 [off-spoke az-22 r44, E
// approach clutter] -> (60.910953,0.006833,-66.764485) yaw -30deg
// [SE wild, az312.375 r90.375 math, quadrant-strict x>0 z<0, rim 88.5-92.2].
// COMPANION LIGHT travels with host (loop law 5, struct-11 light-verb
// idiom): nx-struct-beacon-l (40.8,7.3,-16.48) -> same dX/dZ, +7.343973
// above pos = 7.350807; params unchanged 0xffc98a @ 1.5 range 9.
// SAME bytes (content-addressed, ZERO uploads): village_beacon3.glb — sha
// pinned by LOCAL FILE at runtime (struct-60 law: never hand-transcribe).
// Seat: SE wild forest<->cairn inter-ring clearing (design window
// 305-340deg r80-92; 10,600 lawful seats scanned). Winner worst-gap 5.30
// vs nx-dress-se-cairn-001 (law 1.4); 8.7m tower + light crests the 6.3-6.6
// forest canopy — fire-marker read for the district's deep half. Yaw -30
// breaks axis alignment with the ring grid (rotationally-symmetric square
// tower; read preserved at any yaw — struct-11 disclosure class).
// Terrain (next-terrain-city7): 4-corner spread 6.2mm, PY pinned lowest
// corner +0.00683; grade 54mm above old site (disclosed, sub-visible).
// Gates (fail-closed, vs the FRESH census this placer fetches):
//  1. local-bytes sha16 == live lib (zero-upload proof)
//  2. live at OLD or NEW tuple exactly (idempotent rerun => zero verbs)
//  3. SAT re-verify: exact yaw-aware OBB (3.1x3.1 c(0,0)), MIN gap over
//     census solids >= 1.4 (ground films h<=0.5 and suspended min-y>8.5
//     exempt — struct-11/52 exemption set)
//  4. rim law: all corners [66,108]
//  5. walking-line clearance: city-5 pool-line >= 3.0 (else walk owed —
//     measured ~51m, NOT owed at this tuple)
//  6. 3 verbs paced 650ms (remove/spawn/light); post-place deep-verify +
//     census set-diff. Comps EMPTY (census; struct-52 reseat class).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const MOVES: any[] = [
    { id: "nx-struct-beacon", file: "village_beacon3.glb",
      old: [40.8, -0.04397324965628428, -16.48], oldYaw: 0,
      pos: [60.910952574851137, 0.006833337382809504, -66.764485180552654], yaw: -0.5235987755982988, sx: 3.1, sz: 3.1, cx: 0, cz: 0,
      lightId: "nx-struct-beacon-l", lightOld: [40.8, 7.3, -16.48],
      lightPos: [60.910952574851137, 7.350806587039094, -66.764485180552654],
      lightColor: 0xffc98a, lightIntensity: 1.5, lightRange: 9.0 },
];
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const die = (msg: string): never => { throw Error(msg); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
function canon(v: any): any { return Array.isArray(v) ? v.map(canon) : v && typeof v == "object" ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canon(v[k])])) : v; }
const eq = (a: any, b: any) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));
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
// ---- fresh census + gates 2-5
const before = await geom();
const beforeIds = new Set(Object.keys(before));
const atNewMap: Record<string, boolean> = {};
for (const m of MOVES) {
    const e = before[m.id];
    if (!e) die(`${m.id} absent from census`);
    const atOld = e.pos.every((n: number, i: number) => near(n, m.old[i])) && near(e.yaw, m.oldYaw) && e.lib === m.wantLib;
    const atNew = e.pos.every((n: number, i: number) => near(n, m.pos[i])) && near(e.yaw, m.yaw) && e.lib === m.wantLib;
    if (!atOld && !atNew) die(`${m.id} tuple drift vs OLD or NEW (live ${e.pos} yaw ${e.yaw} lib ${e.lib})`);
    atNewMap[m.id] = atNew;
    const l = before[m.lightId];
    if (!l || l.kind !== "light") die(`${m.lightId} absent/not-light`);
    const lightOK = l.pos.every((n: number, i: number) => near(n, m.lightPos[i]));
    const lightOld = l.pos.every((n: number, i: number) => near(n, m.lightOld[i]));
    if (!lightOK && !lightOld) die(`${m.lightId} drift (live ${l.pos})`);
    m.lightDone = lightOK && atNew;
}
const allNew = MOVES.every(m => atNewMap[m.id] && m.lightDone);
if (!allNew) {
    const selfObbs = MOVES.map(m => ({ id: m.id, o: obbOf(m.pos[0], m.pos[2], m.yaw, m.sx, m.sz, m.cx, m.cz) }));
    const allCorners = selfObbs.flatMap(s => corners(s.o));
    // gate 4: rim law
    const radii = allCorners.map(p => Math.hypot(p[0], p[1]));
    if (Math.min(...radii) < 66 || Math.max(...radii) > 108) die(`rim law FAIL ${Math.min(...radii).toFixed(2)}..${Math.max(...radii).toFixed(2)}`);
    // gate 5: walking lines — city-5 ensemble line (plaza -> reedpool)
    const seg = (p: [number, number], a: [number, number], b: [number, number]) => {
        const dx = b[0] - a[0], dz = b[1] - a[1];
        const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / (dx * dx + dz * dz)));
        return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dz));
    };
    const dpool = Math.min(...allCorners.map(p => seg(p, [0, 0], [9.723, -90.982])));
    if (dpool < 3.0) die(`pool-line clearance FAIL ${dpool.toFixed(2)} < 3.0 (walk-test owed)`);
    // gate 3: SAT vs census solids
    let worst = 1e9, worstId = "";
    for (const [id, e] of Object.entries(before)) {
        if (MOVES.some(m => m.id === id || m.lightId === id)) continue;
        const bb = e.bbox; if (!bb?.size) continue;
        if (Math.max(Math.abs(bb.size[0]), Math.abs(bb.size[2])) < 0.001) continue;
        if (bb.size[1] <= 0.5) continue;      // ground film
        if (bb.min[1] > 8.5) continue;        // suspended above our 8.7 top
        const y = e.yaw ?? 0, cc = bb.center ?? [0, 0, 0];
        const o = obbOf(e.pos[0], e.pos[2], y, bb.size[0], bb.size[2], cc[0], cc[2]);
        for (const s of selfObbs) {
            const g = gap(s.o, o);
            if (g < worst) { worst = g; worstId = id; }
        }
    }
    if (worst < 1.4) die(`SAT re-verify FAIL worst ${worst.toFixed(3)} vs ${worstId} (law 1.4)`);
    console.log(`gates: SAT fresh worst ${worst.toFixed(3)} vs ${worstId}; rim ${Math.min(...radii).toFixed(2)}..${Math.max(...radii).toFixed(2)}; pool-line ${dpool.toFixed(2)}m`);
}
// ---- verbs
let verbs: Array<[string, any]> = [];
for (const m of MOVES) {
    if (atNewMap[m.id] && m.lightDone) { console.log(`${m.id} already at NEW tuple`); continue; }
    verbs.push(["remove", { id: m.id }], ["spawn", { id: m.id, lib: m.wantLib, pos: m.pos, yaw: m.yaw, scale: 1 }]);
    if (!m.lightDone) verbs.push(["light", { id: m.lightId, pos: m.lightPos, color: m.lightColor, intensity: m.lightIntensity, range: m.lightRange }]);
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-city7-relocate", avatar: cfg.avatar, token: cfg.joinToken }));
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
    if (!(e?.lib === m.wantLib && e.pos.every((n: number, j: number) => near(n, m.pos[j])) && near(e.yaw, m.yaw) && e.scale === 1 && eq(e.comp ?? {}, {}))) die(`${m.id} post-place failed`);
    const l2 = after[m.lightId];
    if (!(!!l2 && l2.kind === "light" && l2.pos.every((n: number, j: number) => near(n, m.lightPos[j])))) die(`${m.lightId} post-place light failed`);
}
const afterIds = new Set(Object.keys(after));
const arrivals = [...afterIds].filter(i => !beforeIds.has(i));
const departures = [...beforeIds].filter(i => !afterIds.has(i));
console.log(JSON.stringify({ status: "PLACED_VERIFIED", moves: MOVES.map(m => ({ id: m.id, lib: m.wantLib, pos: m.pos, yaw: m.yaw, light: m.lightPos })), verbs: verbs.length, census: afterIds.size, arrivals, departures }));
if (arrivals.length || departures.length) console.log("NOTE: sibling-lane delta during window (classified, not this lane's move)");
