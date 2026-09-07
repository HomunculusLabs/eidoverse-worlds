// next-place-struct66.ts — struct-66: R-122 reseat of ELLIPSE COURT.
// SAME bytes (sha 2aa37e9d, lib store/2aa37e9d29ba43f2.glb already live on
// the standing entity) — pure translation, NO upload (content-addressed).
// Move: (0,-47) -> (-3.75,-50.75), yaw stays π/2. Source-true vertex-cloud
// SAT this tick: margins shelltower 1.835m / meridianstair 1.773m (>=1.4
// law with margin; sweep-66's 2.5-3m-south suggestion FAILED source-true —
// dz=-2.5 drops court-meridianstair to 0.109m; the lawful zone is the SW
// diagonal, proven by fine scan). Full-census cloud-vs-bbox conservative:
// nearest other neighbor 5.57m (nx-approach-sw-lane-003, fat-network exempt
// class — and clear by 5.57m anyway). Terrain 7pt spread 17.3mm, PY -0.0403.
// Chassis: remove+spawn reseat (comp wipe law; comp bag EMPTY by design),
// post-place tuple verify, idempotent 0-verb rerun expected on second run.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const OLD = [0, -0.0476, -47] as const;
const POS = [-3.75, -0.0403, -50.75] as const;
const YAW = Math.PI / 2;
const m = {
    id: "nx-struct-ellipsecourt",
    file: "village_ellipsecourt3.glb",
    sha: "2aa37e9d29ba43f27d9f02f8872d9de4326d194860e45ef777172a4247c27bc1",
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct66-court", avatar: cfg.avatar, token: cfg.joinToken }));
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
