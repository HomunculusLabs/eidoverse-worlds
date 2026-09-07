// next-place-city5.ts — city-5: CITY-PLAN wave-1 relocation #4 (COMPANION MOVE).
// nx-struct-reedpool (-17.08,-0.0443,-38.37) yaw -90 [off-spoke az114 r42] ->
// (9.723,-0.0591,-90.982) yaw 0 [az276.1 r91.5, SE wild S-edge seam].
// COMPANION (city-LOOP law 5, sweep-42 E4 standing precedent): nx-struct-angler
// travels WITH the host, same delta (-6.52 x): (-23.6,-0.048,-38.37) yaw -90 ->
// (3.203,-0.0305,-90.982) yaw 0 — deck stays cantilevered over the pool's west
// bank (world-frame; yaw 0), DESIGNED contact preserved by construction.
// SAME bytes both (content-addressed, zero uploads): reedpool village_reedpool3.glb,
// angler village_angler3.glb — sha pinned by LOCAL FILE at runtime (struct-60 law:
// never hand-transcribe hashes).
// Seat: SE interior (az 280-350) proven FULL for the 17m envelope (fine grid
// 0.1deg x 0.25m x 1deg, best near-miss 1.302 vs law 1.4); S-edge seam az276.1
// chosen QUADRANT-STRICT (all envelope corners x>0 z<0), the register-faithful
// SE seat (scanner /tmp/city5-scan-reedpool.ts). Neighbors: forest-0010 az278 r76,
// wayside-0009 az280 r101 — the forest/cairn inter-ring seam, matching dress-84/86
// snagdead precedents in the same seam family.
// Reads (yaw 0 vs old -90): the ensemble's internal reads (angler on west bank,
// bench over water, bridge crossing local z) are YAW-INVARIANT (internal
// arrangement); external water face now presents 10.4m broadside WEST (E-side
// approach from the district interior) instead of north — disclosed, not a
// preserved read (old seat's approach context was W-approach off-spoke).
// Gates (fail-closed, vs the FRESH census this placer fetches):
//  1. local-bytes sha16 == live lib for BOTH entities (zero-upload proof)
//  2. both live at OLD or NEW tuple exactly (idempotent rerun => zero verbs)
//  3. SAT re-verify: exact yaw-aware rect-OBBs (pool 10.374x8 c0,0;
//     angler 4.56x6.08 c(0.58,-1.94)), MIN gap over census solids >= 1.4
//     (scanner said 1.728 vs nx-wild-forest-0010)
//  4. rim law: all corners [66,108]
//  5. S-axis walk law: min |x| over envelope corners >= 1.4 (scanner 1.50;
//     <3 => walk-test owed and DELIVERED this tick: city5-walk legs)
//  6. 4 verbs paced 650ms; post-place deep-verify both + census set-diff
// Terrain (next-terrain-city5): pool 4-corner spread 34.6mm, angler 11.4mm;
// PY pinned lowest corner each (no-float): pool -0.05907, angler -0.03052.
// DISCLOSED: angler sits 28.5mm higher relative to pool than old grade
// (contour, not error; sub-visible on 0.45m deck). Comps EMPTY both (census).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POOL_OLD = [-17.08, -0.04429882912880775, -38.37], POOL_OLD_YAW = -1.5707963267948966;
const POOL_NEW = [9.723, -0.05907, -90.982], POOL_NEW_YAW = 0;
const ANG_OLD = [-23.6, -0.0479815001883968, -38.37], ANG_OLD_YAW = -1.5707963267948966;
const ANG_NEW = [3.203, -0.03465, -90.982], ANG_NEW_YAW = 0;
const MOVES = [
    { id: "nx-struct-reedpool", file: "village_reedpool3.glb", old: POOL_OLD, oldYaw: POOL_OLD_YAW, pos: POOL_NEW, yaw: POOL_NEW_YAW, sx: 10.374, sz: 8, cx: 0, cz: 0 },
    { id: "nx-struct-angler", file: "village_angler3.glb", old: ANG_OLD, oldYaw: ANG_OLD_YAW, pos: ANG_NEW, yaw: ANG_NEW_YAW, sx: 4.56, sz: 6.08, cx: 0.58, cz: -1.94 },
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
    // rim law
    const radii = allCorners.map(p => Math.hypot(p[0], p[1]));
    if (Math.min(...radii) < 66 || Math.max(...radii) > 108) die(`rim law FAIL ${Math.min(...radii).toFixed(2)}..${Math.max(...radii).toFixed(2)}`);
    // S-axis walk law (x=0): min |x| >= 1.4
    const minAbsX = Math.min(...allCorners.map(p => Math.abs(p[0])));
    if (minAbsX < 1.4) die(`S-axis clearance FAIL ${minAbsX.toFixed(2)} < 1.4`);
    // SAT vs census solids
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
    console.log(`gates: SAT fresh worst ${worst.toFixed(3)} vs ${worstId}; rim ${Math.min(...radii).toFixed(2)}..${Math.max(...radii).toFixed(2)}; S-axis |x| clear ${minAbsX.toFixed(2)}m`);
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-city5-relocate", avatar: cfg.avatar, token: cfg.joinToken }));
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
