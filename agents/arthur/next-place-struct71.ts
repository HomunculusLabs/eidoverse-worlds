// next-place-struct71.ts — struct-71: CITY-PLAN wave-1 relocation #1.
// nx-struct-soundmirror moves (28.7,-0.026,-18) yaw 0 [off-spoke r33.9]
// -> SE wild edge (35.46,-0.0331,-55.66) [az -57.5, r 66.0] yaw 0.
// SAME bytes (sha f313e59a..., lib store/f313e59a69bff540.glb already live)
// — pure translation, NO upload (content-addressed).
// Register: CITY-PLAN relocation register row 1 ("soundmirror r33.9
// off-spoke -> SE wild edge"), worst off-spoke-ness first (struct-71 law).
// Siting proof (struct71-scan-soundmirror-relocate.ts, fresh 277 census):
//  - EXACT disc r2.30 vs census world AABBs (rings are FULL CIRCLES — the
//    bbox half-extent IS the true footprint; struct-19 law exact, no proxy).
//  - The register-faithful window (az -65..-35, r 66..80) holds exactly ONE
//    lawful seat: this one, gap=Infinity (no solid within disc+1.4m).
//  - Composition: 8.6m clear on the same radial before nx-dress-se-
//    funguslogs-001 (40,-63) r74.6 — threshold-instrument read, does not
//    crowd; az -45 water corridor (mossbowls r82.5 / cairn-001 r83) stays
//    free for the register's reedpool+angler SE arrivals.
//  - Yaw: piece is azimuthally symmetric (bowl opens UP, central stand) —
//    no read dependence; CITY-PLAN yaw law satisfied at yaw 0.
// Terrain (next-terrain-struct71.ts): 7pt spread 5.2mm, PY -0.0331; local
// bbox min-y -0.032 reproduces the standing seat's base embed.
// Chassis: remove+spawn reseat (comp wipe law; comp bag EMPTY per census),
// post-place tuple verify, idempotent 0-verb rerun expected on second run.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const OLD = [28.7, -0.02608747345868291, -18] as const;
const POS = [35.46, -0.0331, -55.66] as const;
const YAW = 0;
const m = {
    id: "nx-struct-soundmirror",
    file: "village_soundmirror3.glb",
    sha: "f313e59a69bff540c95769561c7978f9c8c9443bfa9e4ce2e55a0ec7519dcaf7",
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
const exist = before[m.id];
if (!exist) die(`${m.id} expected standing at OLD or NEW tuple — census says absent`);
// accept the entity at the OLD tuple (first run migrates) or NEW (idempotent rerun)
const atOld = exist.pos.every((n: number, i: number) => near(n, OLD[i])) && near(exist.yaw, YAW) && exist.lib === wantLib();
const atNew = exist.pos.every((n: number, i: number) => near(n, POS[i])) && near(exist.yaw, YAW) && exist.lib === wantLib();
if (!atOld && !atNew) die(`${m.id} live tuple drift vs expected OLD ${OLD.join(",")} or NEW ${POS.join(",")}`);
let verbs: Array<[string, any]>;
if (exist.pos.every((n: number, i: number) => near(n, POS[i]))) {
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct71-relocate", avatar: cfg.avatar, token: cfg.joinToken }));
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
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: m.id, lib: wantLib(), pos: POS, yaw: YAW, verbs: verbs.length }));
