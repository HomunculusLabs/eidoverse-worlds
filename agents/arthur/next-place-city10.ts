// next-place-city10.ts — city-10: CITY-PLAN wave-1 relocation #9.
// nx-struct-skene (-23.32,0.0447,48.05) yaw pi [off-spoke az116 r53.4,
// performance quarter backdrop] -> (8.258,-0.0026,78.567) yaw 186deg
// [NE craft threshold, az84 r79 register-az, quadrant-strict, rim
// 78.14-79.41]. Seat = threshold clearing fronting the wayfarer rest
// ensemble: bench-001 (14.23,73.13) 8.1m, needlerest (10.273,68.737)
// 10.1m, mile-009 (16.7,68.3) 10.9m — the stage wall gets its audience
// (struct-14's frame-that-makes-a-stage), off the dwelling hems
// (hamlet-0054 18.9m).
// YAW LAW (design invariant, not geometric): old yaw pi aimed the niche/
// stage face (local +z, verified: world -z toward amphi orchestra at old
// seat) at the audience. Destination yaw 186deg = radially-inward tangent
// (psi_in = -az-90 = -174 ≡ 186deg) preserves the read — niched face
// fronts the threshold ensemble + incoming E-spoke walk.
// SAME bytes (content-addressed, ZERO uploads): village_skene3.glb, local
// sha16 df7f7c434c0b87b2 == live lib (runtime-pinned, no hand-typed hash).
// Target = TRUE live bbox (dress-80 law): 9.6604 x 2.07 x 1.2761, local
// center offset (0,+0.373). EXACT rect-OBB SAT vs census solids
// (h>0.5; suspended min-y>2.6 exempt; network lanes excluded by explicit
// id set — nvp-109 two-prong law). Scanner (city10-scan-skene.ts, census
// 282): worst 2.606 vs nx-dress-ne-bench-001 (law 1.4); walk-lines min
// 3.55m >= 3.0 (no walk owed). CONTROL sign-validated at current live
// seat: worst +1.321 vs nx-struct-amphi (struct-43 designed mouth 1.69m
// clear face — fat-bbox 16.02m box vs true kerb; standing exemption
// class, no defect). Terrain (city10-terrain-skene.ts): 7pt spread
// 20.9mm, PY pinned lowest true corner -0.0026; grade -47mm vs old site
// (disclosed, sub-visible). No riders on host (census-checked 14m).
// Gates (fail-closed, vs the FRESH census this placer fetches):
//  1. local-bytes sha16 == live lib (zero-upload proof)
//  2. live at OLD or NEW tuple exactly (idempotent rerun => zero verbs)
//  3. rect SAT: MIN gap over census solids >= 1.4
//  4. rim law: TRUE corners [66,108]; quadrant-strict all corners NE
//  5. walking-line clearances >= 3.0 (NE threshold inner/outer, bench
//     line, E spoke)
//  6. 2 verbs paced 650ms (remove/spawn — artwalk-33 law: spawn never
//     moves); post-place deep-verify + census set-diff. Comps EMPTY
//     (census; re-place wipes none).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const YAW = 186 * Math.PI / 180;
const m = {
    id: "nx-struct-skene", file: "village_skene3.glb",
    old: [-23.32, 0.044719111122435394, 48.05] as const, oldYaw: 3.141592653589793,
    pos: [8.258, -0.0026326227299527005, 78.567] as const, yaw: YAW,
    cx: 0, cz: 0.373, hu: 4.83, hv: 0.638,             // true rect: center offset + halves
    corners: [[-4.83, -0.265], [4.83, -0.265], [-4.83, 1.011], [4.83, 1.011]] as const, // true local corners
};
const NETWORKS = new Set(["nx-town-roads", "nx-core-paths",
    "nx-approach-ne-lane-002", "nx-approach-nw-lane-001", "nx-approach-sw-lane-003"]);
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
const bytes = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/${m.file}`));
const sha = createHash("sha256").update(bytes).digest("hex");
const wantLib = `store/${sha.slice(0, 16)}.glb`;
// local-frame helpers (align-1 convention)
const cO = Math.cos(m.yaw), sO = Math.sin(m.yaw);
const world = (lx: number, lz: number): [number, number] => [m.pos[0] + lx * cO + lz * sO, m.pos[2] - lx * sO + lz * cO];
const rectC = world(m.cx, m.cz);
type O = { u: [number, number]; v: [number, number]; c: [number, number]; hu: number; hv: number };
const target: O = { u: [cO, -sO], v: [sO, cO], c: rectC, hu: m.hu, hv: m.hv };
// exact OBB-vs-OBB SAT gap (max separating axis; positive = separated)
function satGap(A: O, B: O): number {
    let best = -Infinity;
    for (const ax of [A.u, A.v, B.u, B.v]) {
        const dd = Math.abs((B.c[0] - A.c[0]) * ax[0] + (B.c[1] - A.c[1]) * ax[1]);
        const ra = A.hu * Math.abs(A.u[0] * ax[0] + A.u[1] * ax[1]) + A.hv * Math.abs(A.v[0] * ax[0] + A.v[1] * ax[1]);
        const rb = B.hu * Math.abs(B.u[0] * ax[0] + B.u[1] * ax[1]) + B.hv * Math.abs(B.v[0] * ax[0] + B.v[1] * ax[1]);
        best = Math.max(best, dd - ra - rb);
    }
    return best;
}
const seg = (px: number, pz: number, a: [number, number], b: [number, number]) => {
    const dx = b[0] - a[0], dz = b[1] - a[1];
    const t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (pz - a[1]) * dz) / (dx * dx + dz * dz)));
    return Math.hypot(px - (a[0] + t * dx), pz - (a[1] + t * dz));
};
const WALKS: Array<[string, [number, number], [number, number]]> = [
    ["NE-threshold-outer", [40.79, 27.01], [16.7, 68.3]],   // mile-004 -> mile-009
    ["NE-threshold-inner", [20.57, 70.79], [24.3, 84.6]],   // mile-010 -> hamlet-0054
    ["bench-to-interior", [14.23, 73.13], [24.3, 84.6]],
    ["E-spoke", [0, 0], [60, 8]],
];
// ---- fresh census + gates 2-5
const before = await geom();
const beforeIds = new Set(Object.keys(before));
const e = before[m.id];
if (!e) die(`${m.id} absent from census`);
const atOld = e.pos.every((n: number, i: number) => near(n, m.old[i])) && near(e.yaw, m.oldYaw) && e.lib === wantLib;
const atNew = e.pos.every((n: number, i: number) => near(n, m.pos[i])) && near(e.yaw, m.yaw) && e.lib === wantLib;
if (!atOld && !atNew) die(`${m.id} tuple drift vs OLD or NEW (live ${e.pos} yaw ${e.yaw} lib ${e.lib} want ${wantLib})`);
if (!atNew) {
    // gate 4: rim + quadrant-strict on TRUE corners
    const wc = m.corners.map(([lx, lz]) => world(lx, lz));
    const radii = wc.map(p => Math.hypot(p[0], p[1]));
    if (Math.min(...radii) < 66 || Math.max(...radii) > 108) die(`rim law FAIL ${Math.min(...radii).toFixed(2)}..${Math.max(...radii).toFixed(2)}`);
    if (wc.some(p => p[0] <= 1 || p[1] <= 1)) die(`quadrant law FAIL (corner outside NE)`);
    // gate 5: walking lines
    for (const [name, a, b] of WALKS) {
        const d = Math.min(...wc.map(p => seg(p[0], p[1], a, b)));
        if (d < 3.0) die(`walk-line ${name} clearance FAIL ${d.toFixed(2)} < 3.0 (walk-test owed)`);
    }
    // gate 3: exact rect SAT vs census solids
    let worst = 1e9, worstId = "";
    for (const [id, en] of Object.entries(before)) {
        if (id === m.id || NETWORKS.has(id)) continue;
        const bb = en.bbox; if (!bb?.size) continue;
        if (Math.max(Math.abs(bb.size[0]), Math.abs(bb.size[2])) < 0.001) continue; // lights
        if (bb.size[1] <= 0.5) continue;      // ground film
        if ((bb.min?.[1] ?? 0) > 2.6) continue; // suspended above wall top 2.07
        const y = en.yaw ?? 0, cc = bb.center ?? [0, 0, 0];
        const cE = Math.cos(y), sE = Math.sin(y);
        const o: O = { u: [cE, -sE], v: [sE, cE], c: [en.pos[0] + cc[0] * cE + cc[2] * sE, en.pos[2] - cc[0] * sE + cc[2] * cE], hu: bb.size[0] / 2, hv: bb.size[2] / 2 };
        const g = satGap(target, o);
        if (g < worst) { worst = g; worstId = id; }
    }
    if (worst < 1.4) die(`rect SAT re-verify FAIL worst ${worst.toFixed(3)} vs ${worstId} (law 1.4)`);
    const walkMin = Math.min(...WALKS.map(([, a, b]) => Math.min(...wc.map(p => seg(p[0], p[1], a, b)))));
    console.log(`gates: rect SAT fresh worst ${worst.toFixed(3)} vs ${worstId}; rim ${Math.min(...radii).toFixed(2)}..${Math.max(...radii).toFixed(2)}; walk-lines min ${walkMin.toFixed(2)}m`);
}
// ---- verbs
const verbs: Array<[string, any]> = [];
if (atNew) console.log(`${m.id} already at NEW tuple`);
else verbs.push(["remove", { id: m.id }], ["spawn", { id: m.id, lib: wantLib, pos: m.pos, yaw: m.yaw, scale: 1 }]);
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-city10-relocate", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => reject(Error("websocket error"));
    ws.onmessage = (ev: any) => {
        const x = JSON.parse(ev.data);
        if (x.type === "error") reject(Error(`server ${x.error}`));
        else if (x.type === "snapshot") joined = true;
    };
});
// ---- post-verify
const after = await geom();
const e2 = after[m.id];
if (!(e2?.lib === wantLib && e2.pos.every((n: number, j: number) => near(n, m.pos[j])) && near(e2.yaw, m.yaw) && e2.scale === 1 && eq(e2.comp ?? {}, {}))) die(`${m.id} post-place failed`);
const afterIds = new Set(Object.keys(after));
const arrivals = [...afterIds].filter(i => !beforeIds.has(i));
const departures = [...beforeIds].filter(i => !afterIds.has(i));
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: m.id, lib: wantLib, pos: m.pos, yawDeg: 186, verbs: verbs.length, census: afterIds.size, arrivals, departures }));
if (arrivals.length || departures.length) console.log("NOTE: sibling-lane delta during window (classified, not this lane's move)");
