// next-place-struct122.ts — struct-122: THE GALTON BOARD (probability/
// statistics family debut) placement — the deferred contract from
// struct-121 executed.
// Judged NATIVE this tick (front + gameplay 18m + night, flap law honored —
// provider up): front PASS (device read, pegs + bell legible, grounded;
// margins: temple-ish tympanum borderline per judge, apex ball reads seated
// — that is the designed hopper throat ball, brachistochrone-crest
// precedent); gameplay 18m PASS (monument not shed/temple, bell rhythm
// clear, amber core deliberate, zero floats); night PASS (exactly 7 warm
// points, center column only, zero leak, silhouette faintly readable).
// Decode ALL PASS 13 checks (struct122-decode-galtonboard, from bytes,
// independent replica): binomial bell matrix 63 cells exact B(8,1/2)
// [0,1,3,6,7,6,3,1,0], 63-peg staggered lattice, glow column == center
// bin, envelope 4.70x4.46x0.97.
// NEW entity nx-struct-galtonboard (scan verified absent, fresh 316).
// Seat: az184 r210, CAND_A yaw pi (S-axis planar-exhibit family precedent,
// census-verified: zeno r180 yaw pi, borromean r190 yaw pi — board face
// toward the village approach; walker from the village reads lattice +
// bell). Form-CENTER seats on the axis point (center-corrected, CZ +0.385
// decode-derived — pitfall-10; the struct-121 plan note "z 0..0.97" was
// decode-corrected to z[-0.10..0.87]): entity POS (-14.648859, PY, 209.873451).
// The S mathematics axis extends past brachistochrone r200: dial r71 ->
// koch r90 -> hilbert r100 -> dodeca r110 -> wall r120 -> tesseract r130
// -> lorenz r140 -> chladni r150 -> voronoi r160 -> zeno r180 -> borromean
// r190 -> brachistochrone r200 -> GALTON r210: order out of chaos at the
// axis end.
// TRUE decoded envelope local x[-2.35..2.35] z[-0.10..0.87] y[0..4.460]
// (4.70x4.46x0.97, NOT origin-centered on z). Scan SAT worst
// nx-struct-brachistochrone +5.12 (law 1.4, fresh 316-entity census,
// center-corrected, film-guarded), film +116.03 (kochgarden), walk
// +138.20 (ne-lane-002), rim 210.0. Terrain 9pt spread 6.9mm, lowest
// +0.0020799 (grade slightly above 0 here); PY = lowest (base on grade).
// Folly class: no entry advertised — no walk owed (zeno/voronoi/chladni/
// borromean/brachistochrone precedent). Comps: NONE (glow is KEEP glow_ga
// material inside the GLB, struct-82 lineage; comp bag {}).
// Two-pass chassis (struct-88..120 proven); fresh-only placer — rerun
// dies zero-verbs (struct-107/108/115/118/120 idempotency form).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [-14.648859486266313, 0.0020799348551429732, 209.87345055456308] as const;
const YAW = Math.PI;
const m = {
    id: "nx-struct-galtonboard",
    file: "village_galtonboard3.glb",
    sha: "3d9f7c9cdf81d64ce497b2c1aa6684b98f1330b3c1c0af56fa9512d9fd1d807b",
    bbox: { min: [-2.35, 0, -0.10], max: [2.35, 4.46, 0.87] },
    comp: {} as Record<string, never>,
} as const;
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const die = (msg: string): never => { throw Error(msg); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
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
// ---- SAT preflight vs FRESH live set (films exempt by height + film-guard id) ----
const GROUND = /nx-town-roads|nx-town-paths|nx-approach-(?!.*lamp)|nx-dress-sw-moss/;
const FILM = /nx-struct-(kochgarden|penrose|hydro|hygro|pyth|ptolemy|hypoth|crossing|penrose2|sierpinski|geodesic|apollon|tensegrity|sundial|watershed)/;
const LAW = 1.4;
const CX = (m.bbox.min[0] + m.bbox.max[0]) / 2, CZ = (m.bbox.min[2] + m.bbox.max[2]) / 2;
const HX = (m.bbox.max[0] - m.bbox.min[0]) / 2, HZ = (m.bbox.max[2] - m.bbox.min[2]) / 2;
const cs = Math.cos(YAW), sn = Math.sin(YAW);
const WCX = POS[0] + CX * cs + CZ * sn;
const WCZ = POS[2] - CX * sn + CZ * cs;
const EW = HX * Math.abs(cs) + HZ * Math.abs(sn), ED = HX * Math.abs(sn) + HZ * Math.abs(cs);
console.log(`center-corrected SAT basis: world center (${WCX.toFixed(3)}, ${WCZ.toFixed(3)}) grown half ${EW.toFixed(3)}x${ED.toFixed(3)}`);
const before = await geom();
if (before[m.id]) die(`${m.id} already live — this placer places fresh only`);
let worstGap = Infinity, worstId = "";
const collisions: string[] = [];
for (const e of Object.values(before)) {
    if (e.id === m.id) continue;
    const bb = e.bbox;
    if (!bb) continue;                       // lights carry no bbox
    if (bb.max && (bb.max[1] - bb.min[1]) <= 0.5) continue; // ground films
    if (GROUND.test(e.id) || FILM.test(e.id)) continue;
    const ecx = bb.center ? bb.center[0] : 0, ecz = bb.center ? bb.center[2] : 0;
    const hx = bb.size[0] / 2, hz = bb.size[2] / 2;
    const ey = e.yaw ?? 0;
    const cy = Math.cos(ey), sy = Math.sin(ey);
    const ecxW = e.pos[0] + ecx * cy + ecz * sy;
    const eczW = e.pos[2] - ecx * sy + ecz * cy;
    const ew = hx * Math.abs(cy) + hz * Math.abs(sy), ed = hx * Math.abs(sy) + hz * Math.abs(cy);
    const dx = Math.abs(WCX - ecxW), dz = Math.abs(WCZ - eczW);
    const g = Math.max(dx - (EW + ew), dz - (ED + ed));   // max separating axis
    if (g < worstGap) { worstGap = g; worstId = e.id; }
    if (g < LAW) collisions.push(`${e.id}(${g.toFixed(2)})`);
}
if (collisions.length) die(`${m.id} seat blocked (<1.4m clear): ${collisions.join(", ")}`);
console.log(`SAT preflight worst: ${worstId} ${worstGap.toFixed(2)} (fresh ${Object.keys(before).length}-entity set, center-corrected)`);
const verbs: Array<[string, any]> = [];
{
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next ${m.id} struct-122`);
    u.searchParams.set("by", cfg.id);
    let lib = "";
    for (let a = 1; a <= 5; a++) {
        const r = await fetch(u, { method: "POST", body: bytes });
        if (r.ok) { lib = ((await r.json()) as any).path; break; }
        if (r.status === 429 && a < 5) { console.log(`429 upload, backoff ${a * 30}s`); await sleep(a * 30000); continue; }
        die(`upload ${r.status}`);
    }
    if (lib !== wantLib) die(`upload path ${lib}`);
    console.log(`upload OK ${lib}`);
    verbs.push(["spawn", { id: m.id, lib: wantLib, pos: [...POS], yaw: YAW, scale: 1, comp: m.comp }]);
}
if (verbs.length) await new Promise<void>((resolve, reject) => {
    const { WebSocket } = require("ws") as typeof import("ws");
    const ws = new WebSocket(cfg.url);
    let joined = false, i = 0;
    const timer = setTimeout(() => reject(Error("verb timeout")), 90_000);
    const paced = setInterval(() => {
        if (!joined || i >= verbs.length) return;
        const [verb, args] = verbs[i++];
        ws.send(JSON.stringify({ type: "verb", verb, args }));
        console.log(`verb: ${verb}`);
    }, 600);
    ws.on("open", () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct122-galtonboard", avatar: cfg.avatar, token: cfg.joinToken })));
    ws.on("message", (raw: any) => {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "snapshot" && !joined) { joined = true; console.log(`joined ${WORLD} (${Object.keys(msg.entities ?? {}).length} entities)`); }
    });
    ws.on("error", reject);
    const closer = setInterval(() => {
        if (i >= verbs.length) { clearInterval(paced); clearInterval(closer); clearTimeout(timer); ws.close(); resolve(); }
    }, 500);
});
await sleep(1500);
const after = await geom();
const live = after[m.id] ?? die(`${m.id} absent after verbs`);
if (!(live.pos.every((n: number, i2: number) => near(n, POS[i2])) && near(live.yaw, YAW) && live.scale === 1 && live.lib === wantLib)) die(`tuple verify failed: ${JSON.stringify({ pos: live.pos, yaw: live.yaw, lib: live.lib })}`);
console.log(`PLACED_VERIFIED ${m.id} pos [${live.pos.map((n: number) => n.toFixed(4)).join(", ")}] yaw ${live.yaw.toFixed(4)} lib ${live.lib} comp ${JSON.stringify(live.comp ?? {})} (census ${Object.keys(after).length})`);
process.exit(0);
