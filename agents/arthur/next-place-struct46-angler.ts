// next-place-struct46-angler.ts — struct-46: ANGLER'S REST identity fix
// re-place (shard row 10, improve round-1). commons-next only, entity
// nx-struct-angler (structures lane — sharded by improve-5y routing).
//
// Row 10 recovery class: sibling improve window started this row pre-
// sharding (candidate 8c1a5047 12:04), then the 5-10x sharding directive
// routed nx-struct-* to this lane; sibling ledger provably moved to
// nx-town-* (improve-9..18), draft 6h dead, live UNTOUCHED at struct-13
// bytes — artwalk-32/struct-9 interrupted-window class: recover, don't
// redo. This tick: material lanes fixed (struct-38 law) + line/bobber
// re-aimed onto the pool water (decode-proven).
//
// Contract: same exact tuple as struct-13. Remove+spawn reseat (spawn
// does NOT move a standing entity). Empty comp bag both sides.
// SAT exemption: nx-struct-reedpool — this seat is DESIGNED on the pool's
// west bank (struct-13 commission; the pool is a film h<=0.16 ground
// layer + rim <=0.28: the auto ground-layer exemption covers it in BOTH
// directions; kept explicit here for the 1.4m law audit trail).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [-23.6, -0.0479815001883968, -38.37] as const;
const YAW = -Math.PI / 2;
const m = {
    id: "nx-struct-angler",
    file: "village_angler3.glb",
    sha: "6bf06a35bb13043755083666510c56351075ac5af211619160e085f212de003c",
    bbox: { min: [-1.7, 0.0, -4.98], max: [2.86, 2.7898, 1.1] },
    comp: {},
} as const;
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const die = (msg: string): never => { throw Error(msg); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const canon = (v: any): any => Array.isArray(v) ? v.map(canon) : v && typeof v == "object" ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canon(v[k])])) : v;
const eq = (a: any, b: any) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));
async function geom(world = WORLD) {
    const r = await fetch(`${base}/geom?world=${world}`);
    if (!r.ok) die(`geom ${world} ${r.status}`);
    const d: any = await r.json();
    return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}
const bytes = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/${m.file}`));
const h = createHash("sha256").update(bytes).digest("hex");
if (h !== m.sha) die(`${m.id} reviewed hash drift ${h}`);
const wantLib = `store/${m.sha.slice(0, 16)}.glb`;
type O = { c: [number, number]; u: [number, number]; v: [number, number]; hu: number; hv: number };
function obb(pos: number[], yaw: number, bb: any): O {
    const c = Math.cos(yaw), s = Math.sin(yaw), lx = (bb.min[0] + bb.max[0]) / 2, lz = (bb.min[2] + bb.max[2]) / 2;
    return { c: [pos[0] + lx * c + lz * s, pos[2] - lx * s + lz * c], u: [c, -s], v: [s, c], hu: (bb.max[0] - bb.min[0]) / 2, hv: (bb.max[2] - bb.min[2]) / 2 };
}
function gap(A: O, B: O) {
    let best = -Infinity;
    for (const ax of [A.u, A.v, B.u, B.v]) {
        const dd = Math.abs((B.c[0] - A.c[0]) * ax[0] + (B.c[1] - A.c[1]) * ax[1]);
        const ra = A.hu * Math.abs(A.u[0] * ax[0] + A.u[1] * ax[1]) + A.hv * Math.abs(A.v[0] * ax[0] + A.v[1] * ax[1]);
        const rb = B.hu * Math.abs(B.u[0] * ax[0] + B.u[1] * ax[1]) + B.hv * Math.abs(B.v[0] * ax[0] + B.v[1] * ax[1]);
        best = Math.max(best, dd - ra - rb);
    }
    return best;
}
const before = await geom();
const T = obb([...POS], YAW, m.bbox);
const collisions: string[] = [];
for (const e of Object.values(before)) {
    if (!e.bbox || e.id === m.id) continue;
    if (e.id === "nx-struct-reedpool") continue; // DESIGNED contact: seat commissioned on the pool's W bank (struct-13); pool is a ground-layer film + rim, auto-exempt both directions
    if (e.id === "nx-approach-sw-lane-003") {
        // GAP-BOUNDED EXEMPTION (class-0b network-bbox artifact; committed
        // source mkv3-sw-approach3.ts): centerline az 217.25 r24->71,
        // P0=(-14.530,-19.104) P1=(-42.976,-56.514), unit n=(0.796,-0.605).
        // ANGLER-SIDE (+n) lane solids reach <=1.70m (verge+companions) and
        // are ALL ground-class <=0.42m tall; lamps stand on the FAR side
        // (perp -1.5, reach <=-1.1). The fat shared-bbox corner (2.86,+1.1)
        // at perp 1.83 is EMPTY box (no angler geometry: bench max x 1.7,
        // bobber z -4.92). REAL geometry perps: rod tip 4.09 (nearest new),
        // bobber 6.67, old solids 2.54 (approach-3's proven 2.50m standing).
        // Live re-proof on the REAL geometry points (not box corners):
        // require >= 3.10 (1.4 pinch + 1.70 worst +side solid reach) for
        // new points, and old-solid perp within [2.2,2.9] (drift bound).
        // Any REAL drift hard-fails.
        const A = [-14.530, -19.104], B = [-42.976, -56.514];
        const cy = Math.cos(YAW), sy = Math.sin(YAW);
        const ux = B[0] - A[0], uz = B[1] - A[1], LL = Math.hypot(ux, uz);
        const nx2 = -uz / LL, nz2 = ux / LL;
        const perpOf = (lx: number, lz: number) => {
            const wx = POS[0] + lx * cy + lz * sy, wz = POS[2] - lx * sy + lz * cy;
            const ax = wx - A[0], az = wz - A[1];
            const along = ax * (ux / LL) + az * (uz / LL);
            if (along < -2 || along > LL + 2) return Infinity; // beyond walk ends
            return Math.abs(ax * nx2 + az * nz2);
        };
        // analytic struct-46 geometry (mkv3-angler.ts source constants)
        const rodTipP = perpOf(1.93, -1.02), bobP = perpOf(2.8, -4.92), rodButtP = perpOf(1.18, -0.76);
        const oldCornerP = perpOf(1.7, 1.1); // proven standing footprint corner
        if (Math.min(rodTipP, bobP, rodButtP) < 3.10) die(`angler new geometry real drift vs sw-lane (perp ${Math.min(rodTipP, bobP, rodButtP).toFixed(2)}m < 3.10m)`);
        if (oldCornerP < 2.2 || oldCornerP > 2.9) die(`angler seat drift vs sw-lane (old-corner perp ${oldCornerP.toFixed(2)}m outside [2.2,2.9])`);
        continue;
    }
    const bb = e.bbox;
    if (bb.max[1] - bb.min[1] <= 0.5) continue;       // ground layer
    if (bb.min[1] > 1.45) continue;                   // suspended decor (above our top)
    if (gap(T, obb(e.pos, e.yaw ?? 0, bb)) < 1.4) collisions.push(e.id);
}
if (collisions.length) die(`angler seat blocked (<1.4m clear): ${collisions}`);
const exist = before[m.id];
if (!exist) die(`${m.id} missing from live world — reseat contract violated`);
if (!(exist.pos.every((n: number, i: number) => near(n, POS[i])) && near(exist.yaw, YAW) && exist.scale === 1 && eq(exist.comp ?? {}, m.comp))) die(`${m.id} live tuple drift — reseat requires exact standing pose`);
// remove + spawn (artwalk-33 law: spawn does NOT move a standing entity);
// idempotent: if live is ALREADY at want lib + exact tuple, zero verbs.
const atTarget = exist.lib === wantLib;
const verbs: Array<[string, any]> = atTarget ? [] : [
    ["remove", { id: m.id }],
    ["spawn", { id: m.id, lib: wantLib, pos: POS, yaw: YAW, scale: 1 }],
];
if (verbs.length) {
    let lib = "";
    {
        const u = new URL(`${base}/upload`);
        u.searchParams.set("token", cfg.agentToken);
        u.searchParams.set("name", `commons-next ${m.id} struct-46`);
        u.searchParams.set("by", cfg.id);
        for (let a = 1; a <= 5; a++) {
            const r = await fetch(u, { method: "POST", body: bytes });
            if (r.ok) { lib = (await r.json()).path; break; }
            if (r.status === 429 && a < 5) { await sleep(25_000); continue; }
            die(`${m.id} upload ${r.status}`);
        }
        if (lib !== wantLib) die(`${m.id} upload path ${lib}`);
    }
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
    }, 800);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct46-angler", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => reject(Error("websocket error"));
    ws.onmessage = (ev: any) => {
        const x = JSON.parse(ev.data);
        if (x.type === "error") reject(Error(`server ${x.error}`));
        else if (x.type === "snapshot") joined = true;
    };
});
const after = await geom();
const e = after[m.id];
if (!(e?.lib === wantLib && e.pos.every((n: number, i: number) => near(n, POS[i])) && near(e.yaw, YAW) && e.scale === 1 && eq(e.comp ?? {}, m.comp))) die(`${m.id} post-place failed: lib=${e?.lib} pos=${JSON.stringify(e?.pos)}`);
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: m.id, lib: wantLib, pos: POS, yaw: YAW, verbs: verbs.length, bbox: e.bbox?.size }));
