// next-place-city3.ts — city-3: CITY-PLAN wave-1 relocation #2.
// nx-struct-pendulum moves (25.01,-0.0406,25.9) yaw 0 [off-spoke az46 r36]
// -> meridian threshold pocket (13.16,-0.0479,-60.59) [az282.25, r62.0]
// yaw -12.25deg. SAME bytes (sha c32a35a8..., lib store/c32a35a8cc1a433d.glb
// already live) — pure move, NO upload (content-addressed).
// Register: CITY-PLAN relocation register row 2 ("pendulum r36 -> NW edge
// near meridian spoke"). Dialect note: live world runs two compass dialects
// (entity -z=north; district/approach names +z=north) — row anchors resolved
// PHYSICALLY: "meridian spoke" = meridianstair az275.9 r55; "NW edge" =
// wild-district edge nearest that spoke (row-1 precedent soundmirror az302.5
// r66, same dialect class).
// Siting proof (city3 scanner, fresh 278 census, MIN-over-neighbors SAT —
// corrected from a max-over-neighbors first draft that phantom-passed 4458):
//  - EXACT rect-OBB SAT, yaw-aware self 8.295x2.732 (this piece is a
//    RECTANGLE, not a disc — struct-19 law exact, no square proxy).
//  - Register window r66-80 az279-318 holds ZERO lawful seats for this
//    footprint (district interior + forest-0010/0018 + soundmirror's unique
//    disc seat consume it) — disclosed in the register annotation.
//  - Lawful threshold pocket az279-285 r62-70: winner (13.16,-60.59)
//    az282.25 r62.0, worst-neighbor gap 2.37 vs nx-struct-meridianstair
//    (1.4 law), row-ends 2.63m off the az276 spoke ray, 9.1m off the gate
//    walking axis x=0 (no leg within 3m), broadside faces the village.
//  - Yaw law: yaw = 270deg - az => row tangent, broadside (sine-wave read
//    plane) faces village; piece is front/back symmetric (struct-9 record:
//    phases n*2pi/9, one clean sine) so yaw preserves the read.
// Terrain (next-terrain-city3): 7pt spread 12.4mm, PY -0.0479 center-pinned
// (standing convention: local bbox min-y -0.015 embeds ~1.5cm, same as the
// standing seat's -0.0406 with min-y -0.015).
// Chassis: remove+spawn reseat (struct-71 proven; comp bag EMPTY per census,
// nothing to re-apply), post-place tuple verify + census id-set diff, then
// idempotent 0-verb rerun on second run.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const OLD = [25.01, -0.04056606885178893, 25.9] as const;
const OLD_YAW = 0;
const POS = [13.16, -0.0479, -60.59] as const;
const YAW = -12.25 * Math.PI / 180;
const m = {
    id: "nx-struct-pendulum",
    file: "village_pendulum3.glb",
    sha: "c32a35a8cc1a433d2543f46c16061cfed63164adb5c6cad71fd393a365039397",
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
const bytes = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/${m.file}`));
const h = createHash("sha256").update(bytes).digest("hex");
if (h !== m.sha) die(`${m.id} hash drift ${h}`);
const wantLib = () => `store/${m.sha.slice(0, 16)}.glb`;
const before = await geom();
const beforeIds = new Set(Object.keys(before));
const exist = before[m.id];
if (!exist) die(`${m.id} expected standing at OLD or NEW tuple — census says absent`);
// accept the entity at the OLD tuple+OLD yaw (first run migrates) or NEW (idempotent rerun)
const atOld = exist.pos.every((n: number, i: number) => near(n, OLD[i])) && near(exist.yaw, OLD_YAW) && exist.lib === wantLib();
const atNew = exist.pos.every((n: number, i: number) => near(n, POS[i])) && near(exist.yaw, YAW) && exist.lib === wantLib();
if (!atOld && !atNew) die(`${m.id} live tuple drift vs expected OLD ${OLD.join(",")} yaw ${OLD_YAW} or NEW ${POS.join(",")} yaw ${YAW}`);
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-city3-relocate", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => reject(Error("websocket error"));
    ws.onmessage = (ev: any) => {
        const x = JSON.parse(ev.data);
        if (x.type === "error") reject(Error(`server ${x.error}`));
        else if (x.type === "snapshot") joined = true;
    };
});
const after = await geom();
const e = after[m.id];
if (!(e?.lib === wantLib() && e.pos.every((n: number, i: number) => near(n, POS[i])) && near(e.yaw, YAW) && e.scale === 1 && eq(e.comp ?? {}, m.comp))) die(`${m.id} post-place failed`);
// census diff: exactly this id moved; any other delta = sibling lane (classify, do not fight)
const afterIds = new Set(Object.keys(after));
const arrivals = [...afterIds].filter(i => !beforeIds.has(i));
const departures = [...beforeIds].filter(i => !afterIds.has(i));
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: m.id, lib: wantLib(), pos: POS, yaw: YAW, verbs: verbs.length, census: afterIds.size, arrivals, departures }));
if (arrivals.length || departures.length) console.log("NOTE: sibling-lane delta during window (classified, not this lane's move)");
