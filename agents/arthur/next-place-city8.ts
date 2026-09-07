// next-place-city8.ts — city-8: CITY-PLAN wave-1 relocation #7.
// nx-struct-observatory (16.48,-0.05244,-40.8) yaw -22deg [off-spoke az158
// r44, E-of-S clutter] -> (-39.811,-0.03087,-87.356) yaw +24.47deg
// [SW contemplative, az245.5 r96 register-az, quadrant-strict, rim
// 92.06-99.38]. Seat = devotional deep-arc terminus: bellpost ->
// skymirror/seats -> labyrinth-0038 -> observatory sky-station capping
// the ensemble's walk line (door/oculus read from the walk, dome beyond
// the labyrinth rim). Yaw law: OLD yaw -0.3839 == atan2(-16.48,40.8)
// EXACTLY = radial-inward door faces plaza; destination yaw =
// atan2(39.811,87.356) = +24.47deg preserves the same read (door + lit
// E/W slit panes face the incoming devotional walk).
// COMPANION LIGHT travels with host (loop law 5, city-7 beacon idiom):
// nx-struct-observatory-l (16.48,1.5,-40.8) -> same dX/dZ, +1.55244
// above host PY = 1.521570; params unchanged 0xffc98a @ 1.1 range 7
// (struct-12 provenance, struct-54 verified standing).
// SAME bytes (content-addressed, ZERO uploads): village_observatory3.glb —
// sha pinned by LOCAL FILE at runtime (struct-60 law: never hand-transcribe).
// SAT: EXACT disc-vs-OBB (struct-19 law: round drum R3.37, true center
// offset c(0,0.34); square-SAT would inflate ~2.4m dead corners). Scanner
// (city8-scan-observatory.ts, census 282): worst 1.947 vs
// nx-temple-labyrinth-0038 (law 1.4); walk-lines min 9.67m (no walk owed).
// Terrain (next-terrain-city8): 4-corner spread 6.4mm, PY pinned lowest
// corner -0.03087; grade +21.6mm above old site (disclosed, sub-visible).
// Gates (fail-closed, vs the FRESH census this placer fetches):
//  1. local-bytes sha16 == live lib (zero-upload proof)
//  2. live at OLD or NEW tuple exactly (idempotent rerun => zero verbs)
//  3. disc SAT: MIN gap over census solids >= 1.4 (ground films h<=0.5
//     and suspended min-y>4.5 exempt)
//  4. rim law: TRUE corners [66,108]; quadrant-strict all corners SW
//  5. walking-line clearances >= 3.0 (devotional corridor, labyrinth
//     approaches, W spoke, moongate axis)
//  6. 3 verbs paced 650ms (remove/spawn/light); post-place deep-verify +
//     census set-diff. Comps EMPTY (census; struct-54 reseat class).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const RADIAL_INWARD_YAW = Math.atan2(39.811, 87.356);
const m = {
    id: "nx-struct-observatory", file: "village_observatory3.glb",
    old: [16.48, -0.052440113834802064, -40.8] as const, oldYaw: -0.3838824615170976,
    pos: [-39.811, -0.03086984857485886, -87.356] as const, yaw: RADIAL_INWARD_YAW,
    discR: 3.37, cx: 0, cz: 0.34,             // exact disc: R + true center offset
    corners: [[-3.37, -3.32], [3.37, -3.32], [-3.37, 4.0], [3.37, 4.0]] as const, // true local corners
    lightId: "nx-struct-observatory-l", lightOld: [16.48, 1.5, -40.8] as const,
    lightPos: [-39.811, 1.5215702652599433, -87.356] as const,
    lightColor: 0xffc98a, lightIntensity: 1.1, lightRange: 7.0,
};
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
const discC = world(m.cx, m.cz);
// exact disc-vs-OBB signed clearance (struct-19 law)
function discGap(discX: number, discZ: number, o: { u: [number, number]; v: [number, number]; c: [number, number]; hu: number; hv: number }): number {
    const dx = discX - o.c[0], dz = discZ - o.c[1];
    const du = Math.abs(dx * o.u[0] + dz * o.u[1]) - o.hu;
    const dv = Math.abs(dx * o.v[0] + dz * o.v[1]) - o.hv;
    if (du <= 0 && dv <= 0) return -Math.min(du, dv) - m.discR;
    const dist = Math.hypot(Math.max(du, 0), Math.max(dv, 0));
    return dist - m.discR;
}
const seg = (px: number, pz: number, a: [number, number], b: [number, number]) => {
    const dx = b[0] - a[0], dz = b[1] - a[1];
    const t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (pz - a[1]) * dz) / (dx * dx + dz * dz)));
    return Math.hypot(px - (a[0] + t * dx), pz - (a[1] + t * dz));
};
const WALKS: Array<[string, [number, number], [number, number]]> = [
    ["devotional-corridor", [-45.638, -54.4], [-57, -72.5]],
    ["labyrinth0038-approach", [-57, -72.5], [-51.932, -83.1]],
    ["labyrinth0025-approach", [-45.638, -54.4], [-79.284, -57.6]],
    ["W-spoke", [0, 0], [-95, 0]],
    ["moongate-axis", [0, 0], [-43.84, -43.8]],
];
// ---- fresh census + gates 2-5
const before = await geom();
const beforeIds = new Set(Object.keys(before));
const e = before[m.id];
if (!e) die(`${m.id} absent from census`);
const atOld = e.pos.every((n: number, i: number) => near(n, m.old[i])) && near(e.yaw, m.oldYaw) && e.lib === wantLib;
const atNew = e.pos.every((n: number, i: number) => near(n, m.pos[i])) && near(e.yaw, m.yaw) && e.lib === wantLib;
if (!atOld && !atNew) die(`${m.id} tuple drift vs OLD or NEW (live ${e.pos} yaw ${e.yaw} lib ${e.lib} want ${wantLib})`);
const l = before[m.lightId];
if (!l || l.kind !== "light") die(`${m.lightId} absent/not-light`);
const lightOK = l.pos.every((n: number, i: number) => near(n, m.lightPos[i]));
const lightOld = l.pos.every((n: number, i: number) => near(n, m.lightOld[i]));
if (!lightOK && !lightOld) die(`${m.lightId} drift (live ${l.pos})`);
const lightDone = lightOK && atNew;
if (!(atNew && lightDone)) {
    // gate 4: rim + quadrant-strict on TRUE corners
    const wc = m.corners.map(([lx, lz]) => world(lx, lz));
    const radii = wc.map(p => Math.hypot(p[0], p[1]));
    if (Math.min(...radii) < 66 || Math.max(...radii) > 108) die(`rim law FAIL ${Math.min(...radii).toFixed(2)}..${Math.max(...radii).toFixed(2)}`);
    if (wc.some(p => p[0] >= 0 || p[1] >= 0)) die(`quadrant law FAIL (corner outside SW)`);
    // gate 5: walking lines
    for (const [name, a, b] of WALKS) {
        const d = Math.min(...wc.map(p => seg(p[0], p[1], a, b)));
        if (d < 3.0) die(`walk-line ${name} clearance FAIL ${d.toFixed(2)} < 3.0 (walk-test owed)`);
    }
    // gate 3: exact disc SAT vs census solids
    let worst = 1e9, worstId = "";
    for (const [id, en] of Object.entries(before)) {
        if (id === m.id || id === m.lightId) continue;
        const bb = en.bbox; if (!bb?.size) continue;
        if (Math.max(Math.abs(bb.size[0]), Math.abs(bb.size[2])) < 0.001) continue;
        if (bb.size[1] <= 0.5) continue;      // ground film
        if (bb.min[1] > 4.5) continue;        // suspended above our 4.47 top
        const y = en.yaw ?? 0, cc = bb.center ?? [0, 0, 0];
        const cE = Math.cos(y), sE = Math.sin(y);
        const o = { u: [cE, -sE] as [number, number], v: [sE, cE] as [number, number], c: [en.pos[0] + cc[0] * cE + cc[2] * sE, en.pos[2] - cc[0] * sE + cc[2] * cE] as [number, number], hu: bb.size[0] / 2, hv: bb.size[2] / 2 };
        const g = discGap(discC[0], discC[1], o);
        if (g < worst) { worst = g; worstId = id; }
    }
    if (worst < 1.4) die(`disc SAT re-verify FAIL worst ${worst.toFixed(3)} vs ${worstId} (law 1.4)`);
    const walkMin = Math.min(...WALKS.map(([, a, b]) => Math.min(...wc.map(p => seg(p[0], p[1], a, b)))));
    console.log(`gates: disc SAT fresh worst ${worst.toFixed(3)} vs ${worstId}; rim ${Math.min(...radii).toFixed(2)}..${Math.max(...radii).toFixed(2)}; walk-lines min ${walkMin.toFixed(2)}m`);
}
// ---- verbs
const verbs: Array<[string, any]> = [];
if (atNew && lightDone) console.log(`${m.id} already at NEW tuple`);
else {
    verbs.push(["remove", { id: m.id }], ["spawn", { id: m.id, lib: wantLib, pos: m.pos, yaw: m.yaw, scale: 1 }]);
    if (!lightDone) verbs.push(["light", { id: m.lightId, pos: m.lightPos, color: m.lightColor, intensity: m.lightIntensity, range: m.lightRange }]);
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-city8-relocate", avatar: cfg.avatar, token: cfg.joinToken }));
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
const l2 = after[m.lightId];
if (!(!!l2 && l2.kind === "light" && l2.pos.every((n: number, j: number) => near(n, m.lightPos[j])))) die(`${m.lightId} post-place light failed`);
const afterIds = new Set(Object.keys(after));
const arrivals = [...afterIds].filter(i => !beforeIds.has(i));
const departures = [...beforeIds].filter(i => !afterIds.has(i));
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: m.id, lib: wantLib, pos: m.pos, yaw: m.yaw, light: m.lightPos, verbs: verbs.length, census: afterIds.size, arrivals, departures }));
if (arrivals.length || departures.length) console.log("NOTE: sibling-lane delta during window (classified, not this lane's move)");
