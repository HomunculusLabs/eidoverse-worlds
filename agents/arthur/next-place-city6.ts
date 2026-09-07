// next-place-city6.ts — city-6: CITY-PLAN wave-1 relocation #5.
// nx-struct-skymirror (24,-0.05395918,-35.5) yaw 0 [off-spoke az55.6 r42.9] ->
// (-59.89,-0.02887,-66.51) yaw 0 [SW contemplative, az-132 r89.5 quadrant-strict].
// SAME bytes (content-addressed, ZERO uploads): village_skymirror3.glb — sha
// pinned by LOCAL FILE at runtime (struct-60 law: never hand-transcribe).
// Seat: SW devotional ensemble east flank — 6.6m from the (bellpost/incense/
// seats @ ~(-55,-71)) cluster centroid, next station before labyrinth-0038
// (18.4m). Thematic read: seats watch -> mirror stills -> labyrinth waits.
// Scan: /tmp/city6 scan 1904 legal seats; winner clear 3.88 vs nx-dress-sw-
// bellpost-001 (law 1.4); corridor clearance 4.15 (>=3 => no walk owed);
// moongate walk-axis |x+43.84| = 14.79. dress98 (labyrinth rider) 18.4m —
// no pocket conflict.
// Reads: yaw 0 == OLD yaw 0 (preserved exactly; near-square 2.52x2.68 cup,
// water face reads radially at any yaw).
// Gates (fail-closed, vs the FRESH census this placer fetches):
//  1. local-bytes sha16 == live lib (zero-upload proof)
//  2. live at OLD or NEW tuple exactly (idempotent rerun => zero verbs)
//  3. SAT re-verify: exact yaw-aware rect-OBB (2.52x2.68 c(0,0)), MIN gap
//     over census solids >= 1.4
//  4. rim law: all corners [66,108]
//  5. walking lines: devotional corridor (plaza->seats) >= 3.0 AND moongate
//     axis |x+43.84| >= 3.0 (else walk-test owed — NOT owed at this tuple)
//  6. 2 verbs paced 650ms; post-place deep-verify + census set-diff
// Terrain (next-terrain-city6): 4-corner spread 4.6mm, PY lowest corner
// -0.02887. DISCLOSED: new grade 27mm above old (contour, sub-visible on a
// 0.96m cup). Comps EMPTY by design (census; struct-37 placement).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const MOVES = [
    { id: "nx-struct-skymirror", file: "village_skymirror3.glb",
      old: [24, -0.05395918022037476, -35.5], oldYaw: 0,
      pos: [-59.89, -0.02887, -66.51], yaw: 0, sx: 2.52, sz: 2.68, cx: 0, cz: 0 },
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
const GROUND = new Set(["nx-approach-nw-lane-001", "nx-approach-ne-lane-002", "nx-approach-sw-lane-003", "nx-core-paths", "nx-town-roads"]);
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
        const pa = a.h[0] * Math.abs(ax[0] * a.ax[0][0] + ax[1] * a.ax[1][0]) + a.h[1] * Math.abs(ax[0] * a.ax[0][1] + ax[1] * a.ax[1][1]);
        const pb = b.h[0] * Math.abs(ax[0] * b.ax[0][0] + ax[1] * b.ax[1][0]) + b.h[1] * Math.abs(ax[0] * b.ax[0][1] + ax[1] * b.ax[1][1]);
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
}
const allNew = MOVES.every(m => atNewMap[m.id]);
if (!allNew) {
    const selfObbs = MOVES.map(m => ({ id: m.id, o: obbOf(m.pos[0], m.pos[2], m.yaw, m.sx, m.sz, m.cx, m.cz) }));
    const allCorners = selfObbs.flatMap(s => corners(s.o));
    // gate 4: rim law
    const radii = allCorners.map(p => Math.hypot(p[0], p[1]));
    if (Math.min(...radii) < 66 || Math.max(...radii) > 108) die(`rim law FAIL ${Math.min(...radii).toFixed(2)}..${Math.max(...radii).toFixed(2)}`);
    // gate 5: walking lines — devotional corridor (plaza->seats) + moongate axis
    const seg = (p: [number, number], a: [number, number], b: [number, number]) => {
        const dx = b[0] - a[0], dz = b[1] - a[1];
        const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / (dx * dx + dz * dz)));
        return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dz));
    };
    const dcorr = Math.min(...allCorners.map(p => seg(p, [0, 0], [-57.0, -72.5])));
    const dgate = Math.min(...allCorners.map(p => Math.abs(p[0] - -43.84)));
    if (dcorr < 3.0) die(`devotional corridor clearance FAIL ${dcorr.toFixed(2)} < 3.0 (walk-test owed)`);
    if (dgate < 3.0) die(`moongate axis clearance FAIL ${dgate.toFixed(2)} < 3.0 (walk-test owed)`);
    // gate 3: SAT vs census solids
    let worst = 1e9, worstId = "";
    for (const [id, e] of Object.entries(before)) {
        if (MOVES.some(m => m.id === id) || GROUND.has(id)) continue;
        const bb = e.bbox; if (!bb?.size) continue;
        if (Math.max(Math.abs(bb.size[0]), Math.abs(bb.size[2])) < 0.001) continue;
        const y = e.yaw ?? 0, cc = bb.center ?? [0, 0, 0];
        const o = obbOf(e.pos[0], e.pos[2], y, bb.size[0], bb.size[2], cc[0], cc[2]);
        for (const s of selfObbs) {
            const g = gap(s.o, o);
            if (g < worst) { worst = g; worstId = id; }
        }
    }
    if (worst < 1.4) die(`SAT re-verify FAIL worst ${worst.toFixed(3)} vs ${worstId} (law 1.4)`);
    console.log(`gates: SAT fresh worst ${worst.toFixed(3)} vs ${worstId}; rim ${Math.min(...radii).toFixed(2)}..${Math.max(...radii).toFixed(2)}; corridor ${dcorr.toFixed(2)}m; gate-axis ${dgate.toFixed(2)}m`);
}
// ---- verbs
let verbs: Array<[string, any]> = [];
for (const m of MOVES) {
    if (atNewMap[m.id]) { console.log(`${m.id} already at NEW tuple`); continue; }
    verbs.push(["remove", { id: m.id }], ["spawn", { id: m.id, lib: m.wantLib, pos: m.pos, yaw: m.yaw, scale: 1 }]);
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-city6-relocate", avatar: cfg.avatar, token: cfg.joinToken }));
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
}
const afterIds = new Set(Object.keys(after));
const arrivals = [...afterIds].filter(i => !beforeIds.has(i));
const departures = [...beforeIds].filter(i => !afterIds.has(i));
console.log(JSON.stringify({ status: "PLACED_VERIFIED", moves: MOVES.map(m => ({ id: m.id, lib: m.wantLib, pos: m.pos, yaw: m.yaw })), verbs: verbs.length, census: afterIds.size, arrivals, departures }));
if (arrivals.length || departures.length) console.log("NOTE: sibling-lane delta during window (classified, not this lane's move)");
