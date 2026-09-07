// next-place-city4.ts — city-4: CITY-PLAN wave-1 relocation #3.
// nx-struct-millrace moves (-37.59,-0.0453,-13.68) yaw -90deg [off-spoke az200 r40,
// 13.9m S of windmill] -> (-76.707,-0.0256,6.711) yaw 100.3607deg [math az175 r77,
// naming-bearing 275 NW quadrant]. SAME bytes (sha 6e82dd2e1eb8403e..., lib
// store/6e82dd2e1eb8403e.glb already live) — pure move, NO upload (content-addressed).
// Register: CITY-PLAN relocation register row 3 ("millrace r40 -> NW, pairs windmill
// theme"). Dialect: district labels run +z=north (register/naming), entity runs -z=north;
// row anchors resolved PHYSICALLY (city-3 precedent): "NW" = cultivation district
// (nx-cultivation-*/nx-dress-nw-* occupy x<0,z>0, naming bearings 288-345); "pairs
// windmill" = windmill (-40,0) naming-bearing 270 => seat on the district's W shoulder.
// Seat law: interior W shoulder (bearings 288-315) proven FULL (lavender-0006 20m box,
// orchard-0012, dryingracks/compost/logpile, mile pairs); scanner window math az148-180
// r66-95 yields 666 lawful seats, ALL in the 275-281 naming seam — threshold seat class
// (struct-71 soundmirror, city-3 pendulum precedents), disclosed in register annotation.
// Yaw law: head (local +z end, raised launder/sluice) aims at the windmill — water reads
// as descending FROM the mill's direction INTO the district; head end r66.4 (outside
// processional band r33-55), basin end r80.8. Long stepped silhouette runs E-W,
// broadside to the NW approach lane.
// Gates embedded (fail-closed, run against the FRESH census this placer fetches):
//  1. local-bytes sha == pinned sha (content-addressed zero-upload proof)
//  2. live entity at OLD or NEW tuple, lib == wantLib
//  3. SAT re-verify: exact yaw-aware rect-OBB (3.427x14.464, center off (0,3.432)),
//     MIN gap over all non-ground census entities >= 1.4 (scanner preflight said 3.37
//     vs nx-cultivation-lavender-0006 on the tick census; fresh re-check catches any
//     sibling arrival since)
//  4. rim law: corner radii in [66,108]
//  5. >= 3m off W-spoke walking line (z=0 span x -95..-55) => no walk-test owed
//  6. remove+spawn 2 verbs paced 650ms; post-place tuple deep-verify + census set-diff
//  7. idempotent: entity already at NEW => zero verbs
// Terrain (next-terrain-city4): 7pt spread 25.7mm; PY -0.0256 = lowest corner (full base
// contact, max embed 25.6mm on 2m stone; no float). comp bag EMPTY both sides per census.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const OLD = [-37.59, -0.04525692432411782, -13.68] as const;
const OLD_YAW = -1.5707963267948966;
const POS = [-76.707, -0.0256, 6.711] as const;
const YAW = 1.7516247;
const m = {
    id: "nx-struct-millrace",
    file: "village_millrace3.glb",
    sha: "6e82dd2e1eb8403e15a8f1de1a024f4249cdcb41f32d952d57fa2e66b27fee70",
    comp: {},
} as const;
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const die = (msg: string): never => { throw Error(msg); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
function canon(v: any): any { return Array.isArray(v) ? v.map(canon) : v && typeof v == "object" ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canon(v[k])])) : v; }
const eq = (a: any, b: any) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));
async function geom(world = WORLD) {
    const r = await fetch(`${base}/geom?world=${world}`);
    if (!r.ok) die(`geom ${world} ${r.status}`);
    const d: any = await r.json();
    return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}
// ---- gate 1: bytes
const bytes = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/${m.file}`));
const h = createHash("sha256").update(bytes).digest("hex");
if (h !== m.sha) die(`${m.id} hash drift ${h}`);
const wantLib = () => `store/${m.sha.slice(0, 16)}.glb`;
// ---- fresh census + gate 2/3/4/5
const before = await geom();
const beforeIds = new Set(Object.keys(before));
const exist = before[m.id];
if (!exist) die(`${m.id} expected standing at OLD or NEW tuple — census says absent`);
const atOld = exist.pos.every((n: number, i: number) => near(n, OLD[i])) && near(exist.yaw, OLD_YAW) && exist.lib === wantLib();
const atNew = exist.pos.every((n: number, i: number) => near(n, POS[i])) && near(exist.yaw, YAW) && exist.lib === wantLib();
if (!atOld && !atNew) die(`${m.id} live tuple drift vs expected OLD ${OLD.join(",")} yaw ${OLD_YAW} or NEW ${POS.join(",")} yaw ${YAW}`);
// SAT re-verify on FRESH census (skip on idempotent rerun — already verified standing)
if (!atNew) {
    const SZ_X = 3.427, SZ_Z = 14.464, CX = 0.0, CZ = 3.432;
    const c0 = Math.cos(YAW), s0 = Math.sin(YAW);
    const self = [[POS[0] + CX * c0 + CZ * s0, POS[2] - CX * s0 + CZ * c0], [[c0, -s0], [s0, c0]], [SZ_X / 2, SZ_Z / 2]] as any;
    const GROUND = new Set(["nx-approach-nw-lane-001", "nx-approach-ne-lane-002", "nx-approach-sw-lane-003", "nx-core-paths", "nx-town-roads"]);
    const gap = (a: any, b: any) => {
        const dx = b[0][0] - a[0][0], dy = b[0][1] - a[0][1];
        let best = -1e9;
        for (const ax of [a[1][0], a[1][1], b[1][0], b[1][1]]) {
            const pa = a[2][0] * Math.abs(ax[0] * a[1][0][0] + ax[1] * a[1][1][0]) + a[2][1] * Math.abs(ax[0] * a[1][0][1] + ax[1] * a[1][1][1]);
            const pb = b[2][0] * Math.abs(ax[0] * b[1][0][0] + ax[1] * b[1][1][0]) + b[2][1] * Math.abs(ax[0] * b[1][0][1] + ax[1] * b[1][1][1]);
            best = Math.max(best, Math.abs(dx * ax[0] + dy * ax[1]) - pa - pb);
        }
        return best;
    };
    let worst = 1e9, worstId = "";
    for (const [id, e] of Object.entries(before)) {
        if (id === m.id || GROUND.has(id)) continue;
        const bb = e.bbox; if (!bb?.size) continue;
        if (Math.max(Math.abs(bb.size[0]), Math.abs(bb.size[2])) < 0.001) continue;
        const y = e.yaw ?? 0, cy = Math.cos(y), sy = Math.sin(y), p = e.pos, cc = bb.center ?? [0, 0, 0];
        const o = [[p[0] + cc[0] * cy + cc[2] * sy, p[2] - cc[0] * sy + cc[2] * cy], [[cy, -sy], [sy, cy]], [bb.size[0] / 2, bb.size[2] / 2]] as any;
        const g = gap(self, o);
        if (g < worst) { worst = g; worstId = id; }
    }
    if (worst < 1.4) die(`SAT re-verify FAIL on fresh census: worst gap ${worst.toFixed(3)} vs ${worstId} (law 1.4)`);
    // rim law
    const crs: number[] = [];
    for (const lx of [-SZ_X / 2, SZ_X / 2]) for (const lz of [-SZ_Z / 2, SZ_Z / 2]) {
        const gx = CX + lx, gz = CZ + lz;
        crs.push(Math.hypot(POS[0] + gx * c0 + gz * s0, POS[2] - gx * s0 + gz * c0));
    }
    if (Math.min(...crs) < 66 || Math.max(...crs) > 108) die(`rim law FAIL corners ${Math.min(...crs).toFixed(2)}..${Math.max(...crs).toFixed(2)}`);
    // walking line: W-spoke z=0 span x -95..-55, corner clearance >= 3
    let wmin = 1e9;
    for (const lx of [-SZ_X / 2, SZ_X / 2]) for (const lz of [-SZ_Z / 2, SZ_Z / 2]) {
        const gx = CX + lx, gz = CZ + lz;
        const wx = POS[0] + gx * c0 + gz * s0, wz = POS[2] - gx * s0 + gz * c0;
        if (wx >= -95 && wx <= -55) wmin = Math.min(wmin, Math.abs(wz));
    }
    if (wmin < 3.0) die(`walking-line clearance FAIL ${wmin.toFixed(2)}m < 3 (walk-test owed but not run)`);
    console.log(`gates: SAT fresh worst ${worst.toFixed(3)} vs ${worstId}; rim ${Math.min(...crs).toFixed(2)}..${Math.max(...crs).toFixed(2)}; spoke-line clear ${wmin.toFixed(2)}m`);
}
// ---- verbs
let verbs: Array<[string, any]>;
if (atNew) {
    verbs = [];
    console.log(`${m.id} already at NEW tuple — no verbs`);
} else {
    verbs = [["remove", { id: m.id }], ["spawn", { id: m.id, lib: wantLib(), pos: POS, yaw: YAW, scale: 1 }]];
}
if (verbs.length) await new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(cfg.url);
    let joined = false, i = 0;
    const timer = setTimeout(() => reject(Error("verb timeout")), 90_000);
    const paced = setInterval(() => {
        if (!joined || i >= verbs.length) return;
        const [verb, args] = verbs[i++];
        ws.send(JSON.stringify({ type: "verb", verb, args }));
        if (i === verbs.length) setTimeout(() => { clearInterval(paced); clearTimeout(timer); ws.close(); resolve(); }, 1600);
    }, 650);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-city4-relocate", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => reject(Error("websocket error"));
    ws.onmessage = (ev: any) => {
        const x = JSON.parse(ev.data);
        if (x.type === "error") reject(Error(`server ${x.error}`));
        else if (x.type === "snapshot") joined = true;
    };
});
// ---- post-verify
const after = await geom();
const e = after[m.id];
if (!(e?.lib === wantLib() && e.pos.every((n: number, i: number) => near(n, POS[i])) && near(e.yaw, YAW) && e.scale === 1 && eq(e.comp ?? {}, m.comp))) die(`${m.id} post-place failed`);
const afterIds = new Set(Object.keys(after));
const arrivals = [...afterIds].filter(i => !beforeIds.has(i));
const departures = [...beforeIds].filter(i => !afterIds.has(i));
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: m.id, lib: wantLib(), pos: POS, yaw: YAW, verbs: verbs.length, census: afterIds.size, arrivals, departures }));
if (arrivals.length || departures.length) console.log("NOTE: sibling-lane delta during window (classified, not this lane's move)");
