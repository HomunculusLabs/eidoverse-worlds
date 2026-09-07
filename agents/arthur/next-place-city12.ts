// next-place-city12.ts — city-12: CITY-PLAN wave-3 farm-prop relocation #1.
// nx-dress-charcoal (34.5,0,34) yaw -2.4785 [off-spoke az44.6 r48.4] ->
// (22.724,-0.04164,27.274) yaw -2.4785 [ring edge az50.2 r35.5, production
// arc completes: woodyard az62.7 -> potter az57 -> kiln az51.5 -> charcoal].
// SAME bytes (content-addressed, ZERO uploads): village_charcoal3.glb — sha
// pinned by LOCAL FILE at runtime (struct-60 law: never hand-transcribe).
// YAW preserved exactly: the stake-bed front + burn mound read kiln-ward
// (az51.5) from the ring-edge approach, same kiln-chain read as the old seat.
// Comps EMPTY before/after (fresh census + /geom both agree — the gate's
// "smoke comp" line pins av-charcoal, a different entity).
// Riders: NONE (b12 rides the kiln host, not this dressing; census-checked).
// Gates (fail-closed, vs the FRESH census this placer fetches):
//  1. local-bytes sha16 == live lib (zero-upload proof)
//  2. live at OLD or NEW tuple exactly (idempotent rerun => zero verbs)
//  3. SAT re-verify: exact yaw-aware rect-OBB (4.161x2.871 c(0.59,0.232)),
//     MIN gap over census solids >= 1.4 (films + concentric riders excluded;
//     riders ride hosts — artwalk law)
//  4. rim law (ring-edge class): all corners [33.0, 55.0] — OUTSIDE the
//     closed r20-33 village ring, inside the band
//  5. mosaic-film margin >= 2.5m (design gate: burn pit off the art's
//     margin; mosaic-0036 diamond runs x-z ~ 1.62 at r33-54) AND lane-002
//     bead walk-line clearance >= 3.0 (else walk-test owed — NOT owed here)
//  6. 2 verbs paced 650ms; post-place deep-verify + census set-diff
// Terrain (next-terrain-city12): 4-corner spread 9.5mm, PY lowest corner
// -0.04164; old-site grade -0.03591 => grade delta -5.7mm (sub-visible).
// Scan: /tmp/city12 scan 194 lawful seats (SAT>=1.4 AND mosaic>=2.5);
// winner az50.2 r35.5 SAT 2.644 vs nx-town-woodyard, mosaic 2.68 vs
// nx-gallery-mosaic-0036, walk 8.19.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const MOVES = [
    { id: "nx-dress-charcoal", file: "village_charcoal3.glb",
      old: [34.5, 0, 34], oldYaw: -2.4784945651581642,
      pos: [22.724, -0.04164, 27.274], yaw: -2.4784945651581642, sx: 4.161, sz: 2.871, cx: 0.59, cz: 0.232 },
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
const GROUND = new Set(["nx-approach-nw-lane-001", "nx-approach-ne-lane-002", "nx-approach-sw-lane-003", "nx-core-paths", "nx-town-roads", "nx-town-streetlamps",
    // ground films by BOTH prongs (nvp law: height test AND explicit id set)
    "nx-gallery-mosaic-0036", "nx-gallery-mosaic-0048", "nx-gallery-mosaic-0052", "nx-gallery-mosaic-0059"]);
const FILMS = ["nx-gallery-mosaic-0036", "nx-gallery-mosaic-0048", "nx-gallery-mosaic-0052", "nx-gallery-mosaic-0059"];
// concentric riders on hosts (artwalk counting-series + trade signs) — ride hosts, not SAT neighbors
const HOSTED = new Set(["nx-artwalk-b31-sheaf-tally", "nx-artwalk-b32-morning-measure", "nx-artwalk-b33-milking-order", "nx-artwalk-b12-kiln-heat-contours", "nx-artwalk-b11-woodyard-heartwood-measure", "nx-sign-kiln-001", "nx-sign-potter-001", "nx-sign-woodyard-001"]);
// lane-002 walking line: decoded bead centers (this tick, node decode of
// village_ne_approach2.glb; beads sweep az46->70, struct-77 corroborated)
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
    // gate 4: rim law — ring-edge class [33, 55]
    const radii = allCorners.map(p => Math.hypot(p[0], p[1]));
    if (Math.min(...radii) < 33.0 || Math.max(...radii) > 55.0) die(`rim law FAIL ${Math.min(...radii).toFixed(2)}..${Math.max(...radii).toFixed(2)} (need 33..55)`);
    // gate 5a: mosaic-film margin >= 2.5 (corner-to-film-edge distance)
    let md = 1e9, mid = "";
    for (const fid of FILMS) {
        const e = before[fid]; if (!e?.bbox?.size) continue;
        const f = obbOf(e.pos[0], e.pos[2], e.yaw ?? 0, e.bbox.size[0], e.bbox.size[2], e.bbox.center?.[0] ?? 0, e.bbox.center?.[2] ?? 0);
        const fc = corners(f);
        for (const c of allCorners) for (let i = 0; i < 4; i++) {
            const d2 = seg(c, fc[i], fc[(i + 1) % 4]);
            if (d2 < md) { md = d2; mid = fid; }
        }
    }
    if (md < 2.5) die(`mosaic-film margin FAIL ${md.toFixed(2)} vs ${mid} (< 2.5 design gate)`);
    // gate 5b: lane-002 bead walk-line clearance >= 3.0
    const wl = Math.min(...allCorners.map(p => Math.min(...BEADS.slice(1).map((b, i) => seg(p, BEADS[i], b)))));
    if (wl < 3.0) die(`lane-002 walk clearance FAIL ${wl.toFixed(2)} < 3.0 (walk-test owed)`);
    // gate 3: SAT vs census solids
    let worst = 1e9, worstId = "";
    for (const [id, e] of Object.entries(before)) {
        if (MOVES.some(m => m.id === id) || GROUND.has(id) || HOSTED.has(id) || id.endsWith("-l")) continue;
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
    console.log(`gates: SAT fresh worst ${worst.toFixed(3)} vs ${worstId}; rim ${Math.min(...radii).toFixed(2)}..${Math.max(...radii).toFixed(2)}; mosaic-margin ${md.toFixed(2)} vs ${mid}; lane-002 walk ${wl.toFixed(2)}m`);
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-city12-relocate", avatar: cfg.avatar, token: cfg.joinToken }));
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
