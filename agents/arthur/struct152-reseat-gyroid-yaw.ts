// struct152-reseat-gyroid-yaw.ts — YAW-ONLY RE-SEAT: nx-struct-gyroid v2
// (bytes 31364ba4, LIVE since struct-151) yaw pi -> pi + 2*pi/9 (40deg),
// SAME pos, SAME lib, NO upload. Struct-104 class (slidingladder face-on
// siting cure): the S-walk approach (village -> kiss r230 -> gyroid r240)
// reads the two-circles +z face DEAD-ON at yaw pi — the struct-150 judged
// caveat ("the two front circles are the weakest element") + s176 lineage.
// v3 class recorded at struct-150 ("oblique yaw re-seat same bytes, judge's
// own decoded 45deg recommendation; falsify-by-render at candidate yaw
// BEFORE any mutation") and executed here.
//
// FALSIFICATION (this tick, exact live bytes, struct104-render-yaw.ts rig):
// - CONTROL rig-yaw 0 (reproduces live dead-on read): native 18m judge read
//   "wavy panel with two punched circular holes", interior depth FAIL at the
//   two eye-level circles, "thick carved shell, not a two-network labyrinth"
//   — the standing defect reproduced on fresh renders.
// - CANDIDATE rig-yaw 40 (= live yaw pi+2pi/9): native 18m judge read
//   openwork/layered-fins porous volume, through-gap visible, "the oblique
//   view sells porous volume", legibility 5/10 vs 3/10 dead-on (+2), the
//   two faces' opening sets separate in depth with parallax.
// - NIGHT at candidate: native PASS — one amber bead, zero bloom, silhouette
//   traceable (no regression; bead is rotation-invariant).
// Rig yaw math: rig camera at +z reads local -z; live yaw pi means rig-yaw 0
// = live read. Candidate live yaw = pi + 2pi/9 = 3.8397249666755436 rad.
//
// SAT (fresh census 323 this tick, self excluded, ground/film exemptions per
// struct-151): world-AABB half-extents at yaw 40deg 3.240x3.240 (vs 2.300
// axis-aligned); worst neighbor nx-struct-enneper +2.485m (law 1.4); zero
// collisions <1.4. PASS.
//
// Chassis: struct151-replace-gyroid.ts verbatim (verify live contract FIRST,
// fresh SAT self-excluded, remove+spawn 1200ms over one WS, post-place tuple
// verify, idempotent ALREADY_SEATED zero verbs). Comp bag {} — comp-wipe law
// n/a (empty). One pair of verbs total; shared budget respected.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const OLD_YAW = Math.PI;
const NEW_YAW = Math.PI + (2 * Math.PI) / 9; // 3.5779249666755436
const POS = [-16.741554, -0.019981, 239.415372] as const; // exact standing tuple (struct-151 REPLACED_VERIFIED; re-verified fresh this tick)
const m = {
    id: "nx-struct-gyroid",
    file: "village_gyroid3.glb",
    sha: "31364ba46af040d538b4bf1faf9992378118c59c0c428123fde9c73ad6c1d776",
    bbox: { min: [-2.3, 0, -2.3], max: [2.3, 4.19, 2.3] }, // decode envelope, origin-centered x/z
    comp: {} as Record<string, never>,
} as const;
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const die = (msg: string): never => { throw Error(msg); };
const near = (a: number, b: number, eps = 1e-4) => Math.abs(a - b) < eps;
async function geom(world = WORLD) {
    const r = await fetch(`${base}/geom?world=${world}`);
    if (!r.ok) die(`geom ${world} ${r.status}`);
    const d: any = await r.json();
    return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}
const bytes = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/${m.file}`));
const h = createHash("sha256").update(bytes).digest("hex");
if (h !== m.sha) die(`${m.id} local hash drift ${h}`);
const wantLib = `store/${m.sha.slice(0, 16)}.glb`;
const before = await geom();
const live = before[m.id] ?? die(`${m.id} ABSENT — this placer re-seats a standing entity only (fresh ${Object.keys(before).length})`);
// idempotent form: already at new yaw + exact tuple + v2 lib -> zero verbs
if (live.lib === wantLib && near(live.pos[0], POS[0]) && near(live.pos[2], POS[2], 1e-4) && near(live.yaw, NEW_YAW, 1e-6)) {
    console.log(`ALREADY_SEATED ${m.id} yaw ${NEW_YAW.toFixed(4)} ${wantLib} — no verbs`);
    process.exit(0);
}
// the contract being retired: exact v2 tuple (x/z/yaw-pi; lib 31364ba4)
if (!(near(live.pos[0], POS[0], 1e-4) && near(live.pos[2], POS[2], 1e-4) && near(live.yaw, OLD_YAW, 1e-6) && live.lib === wantLib))
    die(`live tuple is not the expected v2 contract: ${JSON.stringify({ pos: live.pos, yaw: live.yaw, lib: live.lib })}`);
console.log(`live v2 contract verified: ${live.lib} pos [${live.pos.map((n: number) => n.toFixed(4)).join(", ")}] yaw ${live.yaw.toFixed(4)} comp ${JSON.stringify(live.comp ?? {})}`);
// ---- SAT preflight vs FRESH live set, EXCLUDING self (the site is ours) ----
const GROUND = /nx-town-roads|nx-town-paths|nx-approach-(?!.*lamp)|nx-dress-sw-moss/;
const FILM = /nx-struct-(kochgarden|penrose|hydro|hygro|pyth|ptolemy|hypoth|crossing|penrose2|sierpinski|geodesic|apollon|tensegrity|sundial|watershed)/;
const LAW = 1.4;
const CX = (m.bbox.min[0] + m.bbox.max[0]) / 2, CZ = (m.bbox.min[2] + m.bbox.max[2]) / 2;
const HX = (m.bbox.max[0] - m.bbox.min[0]) / 2, HZ = (m.bbox.max[2] - m.bbox.min[2]) / 2;
const cs = Math.cos(NEW_YAW), sn = Math.sin(NEW_YAW);
const WCX = POS[0] + CX * cs + CZ * sn, WCZ = POS[2] - CX * sn + CZ * cs;
const EW = HX * Math.abs(cs) + HZ * Math.abs(sn), ED = HX * Math.abs(sn) + HZ * Math.abs(cs);
let worstGap = Infinity, worstId = "";
const collisions: string[] = [];
for (const e of Object.values(before)) {
    if (e.id === m.id) continue; // our own entity
    const bb = e.bbox;
    if (!bb) continue;
    if (bb.max && (bb.max[1] - bb.min[1]) <= 0.5) continue;
    if (GROUND.test(e.id) || FILM.test(e.id)) continue;
    const ecx = bb.center ? bb.center[0] : 0, ecz = bb.center ? bb.center[2] : 0;
    const hx = bb.size[0] / 2, hz = bb.size[2] / 2;
    const ey = e.yaw ?? 0;
    const cy = Math.cos(ey), sy = Math.sin(ey);
    const ecxW = e.pos[0] + ecx * cy + ecz * sy, eczW = e.pos[2] - ecx * sy + ecz * cy;
    const ew = hx * Math.abs(cy) + hz * Math.abs(sy), ed = hx * Math.abs(sy) + hz * Math.abs(cy);
    const g = Math.max(Math.abs(WCX - ecxW) - (EW + ew), Math.abs(WCZ - eczW) - (ED + ed));
    if (g < worstGap) { worstGap = g; worstId = e.id; }
    if (g < LAW) collisions.push(`${e.id}(${g.toFixed(2)})`);
}
if (collisions.length) die(`${m.id} re-seat blocked (<1.4m clear): ${collisions.join(", ")}`);
console.log(`SAT preflight (yaw40 ${EW.toFixed(2)}x${ED.toFixed(2)} footprint) worst: ${worstId} ${worstGap.toFixed(2)} — fresh ${Object.keys(before).length}-entity set, self excluded`);
// ---- remove then spawn over one WS (paced; NO upload — same bytes) ----
const verbs: Array<[string, any]> = [
    ["remove", { id: m.id }],
    ["spawn", { id: m.id, lib: wantLib, pos: [...POS], yaw: NEW_YAW, scale: 1, comp: m.comp }],
];
await new Promise<void>((resolve, reject) => {
    const { WebSocket } = require("ws") as typeof import("ws");
    const ws = new WebSocket(cfg.url);
    let joined = false, i = 0;
    const timer = setTimeout(() => reject(Error("verb timeout")), 90_000);
    const paced = setInterval(() => {
        if (!joined || i >= verbs.length) return;
        const [verb, args] = verbs[i++];
        ws.send(JSON.stringify({ type: "verb", verb, args }));
        console.log(`verb: ${verb}`);
    }, 1200); // remove->spawn needs real spacing (artwalk-33; 1200ms shared-burst margin)
    ws.on("open", () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct152-reseat", avatar: cfg.avatar, token: cfg.joinToken })));
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
// ---- post-place verify ----
const after = await geom();
const now = after[m.id] ?? die(`${m.id} absent after verbs`);
if (!(near(now.pos[0], POS[0], 1e-4) && near(now.pos[2], POS[2], 1e-4) && near(now.pos[1], POS[1], 1e-4) && near(now.yaw, NEW_YAW, 1e-6) && now.scale === 1 && now.lib === wantLib))
    die(`tuple verify failed: ${JSON.stringify({ pos: now.pos, yaw: now.yaw, lib: now.lib })}`);
console.log(`RESEATED_VERIFIED ${m.id} pos [${now.pos.map((n: number) => n.toFixed(4)).join(", ")}] yaw ${now.yaw.toFixed(4)} lib ${now.lib} comp ${JSON.stringify(now.comp ?? {})} (census ${Object.keys(after).length})`);
process.exit(0);
